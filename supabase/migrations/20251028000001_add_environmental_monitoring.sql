/*
  # Add Environmental Monitoring System

  1. New Tables
    - `environmental_data`
      - `id` (uuid, primary key)
      - `lote_id` (uuid, foreign key)
      - `date` (date)
      - `temperature_c` (decimal) - Temperature in Celsius
      - `humidity_percent` (decimal) - Relative humidity percentage
      - `ventilation_rate` (decimal) - Air changes per hour
      - `ventilation_status` (text) - excellent, good, fair, poor, critical
      - `co2_level` (decimal, optional) - CO2 level in ppm
      - `ammonia_level` (decimal, optional) - Ammonia level in ppm
      - `notes` (text, optional)
      - `created_at` (timestamptz)

    - `environmental_alerts`
      - `id` (uuid, primary key)
      - `lote_id` (uuid, foreign key)
      - `date` (date)
      - `alert_type` (text) - temperature, humidity, ventilation, air_quality
      - `message` (text)
      - `severity` (text) - info, warning, critical, emergency
      - `recommended_action` (text)
      - `auto_resolved` (boolean)
      - `resolved_at` (timestamptz, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Table for environmental data
CREATE TABLE IF NOT EXISTS environmental_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  date date NOT NULL,
  temperature_c decimal(5,2) NOT NULL,
  humidity_percent decimal(5,2) NOT NULL CHECK (humidity_percent >= 0 AND humidity_percent <= 100),
  ventilation_rate decimal(5,2) NOT NULL CHECK (ventilation_rate >= 0),
  ventilation_status text NOT NULL CHECK (ventilation_status IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  co2_level decimal(7,2) CHECK (co2_level >= 0),
  ammonia_level decimal(6,2) CHECK (ammonia_level >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lote_id, date)
);

-- Table for environmental alerts
CREATE TABLE IF NOT EXISTS environmental_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  date date NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('temperature', 'humidity', 'ventilation', 'air_quality')),
  message text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  recommended_action text NOT NULL,
  auto_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_environmental_data_lote_date ON environmental_data(lote_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_environmental_alerts_lote_date ON environmental_alerts(lote_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_environmental_alerts_severity ON environmental_alerts(severity) WHERE auto_resolved = false;

-- Enable RLS
ALTER TABLE environmental_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for environmental_data
CREATE POLICY "Permitir lectura de datos ambientales"
  ON environmental_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción de datos ambientales"
  ON environmental_data FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de datos ambientales"
  ON environmental_data FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for environmental_alerts
CREATE POLICY "Permitir lectura de alertas ambientales"
  ON environmental_alerts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción de alertas ambientales"
  ON environmental_alerts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de alertas ambientales"
  ON environmental_alerts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Function to automatically create alerts when environmental data is inserted
CREATE OR REPLACE FUNCTION check_and_create_environmental_alerts()
RETURNS TRIGGER AS $$
DECLARE
  age_in_days integer;
  temp_min decimal;
  temp_max decimal;
  humidity_min decimal;
  humidity_max decimal;
  production_type text;
BEGIN
  -- Get production type and age
  SELECT tipo_produccion,
         EXTRACT(DAY FROM (NEW.date - fecha_inicio))
  INTO production_type, age_in_days
  FROM lotes
  WHERE id = NEW.lote_id;

  -- Set thresholds based on production type and age
  IF production_type = 'ENGORDE' THEN
    IF age_in_days <= 7 THEN
      temp_min := 30; temp_max := 34;
      humidity_min := 50; humidity_max := 70;
    ELSIF age_in_days <= 14 THEN
      temp_min := 27; temp_max := 30;
      humidity_min := 50; humidity_max := 70;
    ELSIF age_in_days <= 21 THEN
      temp_min := 24; temp_max := 27;
      humidity_min := 50; humidity_max := 70;
    ELSE
      temp_min := 18; temp_max := 24;
      humidity_min := 50; humidity_max := 70;
    END IF;
  ELSE -- POSTURA
    temp_min := 18; temp_max := 24;
    humidity_min := 40; humidity_max := 70;
  END IF;

  -- Check temperature
  IF NEW.temperature_c < temp_min - 3 THEN
    INSERT INTO environmental_alerts (lote_id, date, alert_type, message, severity, recommended_action)
    VALUES (NEW.lote_id, NEW.date, 'temperature',
            'EMERGENCY: Temperature critically low (' || NEW.temperature_c || '°C)',
            'emergency',
            'Activate heating systems immediately. Check for equipment failure.');
  ELSIF NEW.temperature_c > temp_max + 3 THEN
    INSERT INTO environmental_alerts (lote_id, date, alert_type, message, severity, recommended_action)
    VALUES (NEW.lote_id, NEW.date, 'temperature',
            'EMERGENCY: Temperature critically high (' || NEW.temperature_c || '°C)',
            'emergency',
            'Increase ventilation immediately. Check cooling systems. Monitor for heat stress.');
  END IF;

  -- Check humidity
  IF NEW.humidity_percent > humidity_max + 10 THEN
    INSERT INTO environmental_alerts (lote_id, date, alert_type, message, severity, recommended_action)
    VALUES (NEW.lote_id, NEW.date, 'humidity',
            'Humidity very high (' || NEW.humidity_percent || '%). Risk of disease.',
            'critical',
            'Increase ventilation immediately. Check for water leaks.');
  END IF;

  -- Check ventilation
  IF NEW.ventilation_status = 'critical' OR NEW.ventilation_status = 'poor' THEN
    INSERT INTO environmental_alerts (lote_id, date, alert_type, message, severity, recommended_action)
    VALUES (NEW.lote_id, NEW.date, 'ventilation',
            'Ventilation status is ' || NEW.ventilation_status,
            CASE WHEN NEW.ventilation_status = 'critical' THEN 'emergency' ELSE 'critical' END,
            'Immediate inspection required. Check all fans and vents.');
  END IF;

  -- Check air quality
  IF NEW.co2_level IS NOT NULL AND NEW.co2_level > 5000 THEN
    INSERT INTO environmental_alerts (lote_id, date, alert_type, message, severity, recommended_action)
    VALUES (NEW.lote_id, NEW.date, 'air_quality',
            'CO2 level critically high (' || NEW.co2_level || ' ppm)',
            'critical',
            'Increase ventilation immediately.');
  END IF;

  IF NEW.ammonia_level IS NOT NULL AND NEW.ammonia_level > 40 THEN
    INSERT INTO environmental_alerts (lote_id, date, alert_type, message, severity, recommended_action)
    VALUES (NEW.lote_id, NEW.date, 'air_quality',
            'Ammonia level critically high (' || NEW.ammonia_level || ' ppm)',
            'critical',
            'Improve ventilation. Clean and replace litter.');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically check alerts
CREATE TRIGGER trigger_check_environmental_alerts
  AFTER INSERT OR UPDATE ON environmental_data
  FOR EACH ROW
  EXECUTE FUNCTION check_and_create_environmental_alerts();

-- Add environmental data columns to registros_diarios (for backward compatibility)
ALTER TABLE registros_diarios
  ADD COLUMN IF NOT EXISTS temperature_c decimal(5,2),
  ADD COLUMN IF NOT EXISTS humidity_percent decimal(5,2),
  ADD COLUMN IF NOT EXISTS ventilation_rate decimal(5,2);
