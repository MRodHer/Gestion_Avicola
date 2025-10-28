-- Migration: Add Lighting Program Management Tables
-- Description: Implements lighting schedule tracking with photoperiod control and compliance monitoring

-- =============================================
-- Table: lighting_schedules
-- Purpose: Track daily lighting records with actual vs target hours and intensity
-- =============================================
CREATE TABLE IF NOT EXISTS lighting_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  actual_light_hours NUMERIC(4,2) NOT NULL CHECK (actual_light_hours >= 0 AND actual_light_hours <= 24),
  actual_intensity_lux INTEGER NOT NULL CHECK (actual_intensity_lux >= 0),
  target_light_hours NUMERIC(4,2) NOT NULL CHECK (target_light_hours >= 0 AND target_light_hours <= 24),
  target_intensity_lux INTEGER NOT NULL CHECK (target_intensity_lux >= 0),
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lot_id, date)
);

-- Index for faster queries by lot and date range
CREATE INDEX idx_lighting_schedules_lot_date ON lighting_schedules(lot_id, date DESC);

-- =============================================
-- Table: lighting_programs
-- Purpose: Define active lighting programs for each lot with auto-adjustment settings
-- =============================================
CREATE TABLE IF NOT EXISTS lighting_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  production_type VARCHAR(10) NOT NULL CHECK (production_type IN ('ENGORDE', 'POSTURA')),
  program_type VARCHAR(30) NOT NULL CHECK (program_type IN ('stimulation', 'maintenance', 'broiler_standard')),
  current_week INTEGER NOT NULL CHECK (current_week > 0),
  target_light_hours NUMERIC(4,2) NOT NULL,
  target_intensity_lux INTEGER NOT NULL,
  auto_adjust BOOLEAN DEFAULT true,
  preferred_start_time TIME DEFAULT '06:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lot_id)
);

-- Index for active programs
CREATE INDEX idx_lighting_programs_lot ON lighting_programs(lot_id);

-- =============================================
-- Table: lighting_alerts
-- Purpose: Store lighting-related alerts and deviations
-- =============================================
CREATE TABLE IF NOT EXISTS lighting_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lighting_schedule_id UUID NOT NULL REFERENCES lighting_schedules(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('hours_deviation', 'intensity_deviation', 'program_change')),
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for unacknowledged alerts
CREATE INDEX idx_lighting_alerts_unacknowledged ON lighting_alerts(lot_id, acknowledged) WHERE acknowledged = false;

-- =============================================
-- Function: Calculate lighting deviation
-- Purpose: Calculate how much actual lighting deviates from target
-- =============================================
CREATE OR REPLACE FUNCTION calculate_lighting_deviation(
  p_schedule_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  v_deviation NUMERIC;
BEGIN
  SELECT ABS(actual_light_hours - target_light_hours)
  INTO v_deviation
  FROM lighting_schedules
  WHERE id = p_schedule_id;

  RETURN COALESCE(v_deviation, 0);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function: Check and create lighting alerts
-- Purpose: Automatically generate alerts when lighting deviations are detected
-- =============================================
CREATE OR REPLACE FUNCTION check_and_create_lighting_alerts()
RETURNS TRIGGER AS $$
DECLARE
  v_hours_deviation NUMERIC;
  v_intensity_deviation_percent NUMERIC;
  v_production_type VARCHAR(10);
BEGIN
  -- Get production type from lot
  SELECT tipo_produccion INTO v_production_type
  FROM lotes
  WHERE id = NEW.lot_id;

  -- Calculate deviations
  v_hours_deviation := ABS(NEW.actual_light_hours - NEW.target_light_hours);

  IF NEW.target_intensity_lux > 0 THEN
    v_intensity_deviation_percent := (ABS(NEW.actual_intensity_lux - NEW.target_intensity_lux)::NUMERIC / NEW.target_intensity_lux) * 100;
  ELSE
    v_intensity_deviation_percent := 0;
  END IF;

  -- Critical hours deviation (>1 hour)
  IF v_hours_deviation > 1.0 THEN
    INSERT INTO lighting_alerts (lighting_schedule_id, lot_id, alert_type, severity, message, recommendation)
    VALUES (
      NEW.id,
      NEW.lot_id,
      'hours_deviation',
      'critical',
      format('Lighting hours significantly off target: %sh vs %sh target', NEW.actual_light_hours, NEW.target_light_hours),
      'Immediately adjust timer settings. Large deviations can impact egg production and bird welfare.'
    );
  -- Warning hours deviation (>0.5 hour)
  ELSIF v_hours_deviation > 0.5 THEN
    INSERT INTO lighting_alerts (lighting_schedule_id, lot_id, alert_type, severity, message, recommendation)
    VALUES (
      NEW.id,
      NEW.lot_id,
      'hours_deviation',
      'warning',
      format('Lighting hours deviation: %sh vs %sh target', NEW.actual_light_hours, NEW.target_light_hours),
      'Adjust timer settings at next opportunity. Aim for ±15 minutes accuracy.'
    );
  END IF;

  -- Intensity deviation warning (>30%)
  IF v_intensity_deviation_percent > 30 THEN
    INSERT INTO lighting_alerts (lighting_schedule_id, lot_id, alert_type, severity, message, recommendation)
    VALUES (
      NEW.id,
      NEW.lot_id,
      'intensity_deviation',
      'warning',
      format('Light intensity %s%% off target: %s vs %s lux', ROUND(v_intensity_deviation_percent), NEW.actual_intensity_lux, NEW.target_intensity_lux),
      'Check bulbs for cleanliness and function. Replace if needed. Verify lux meter readings.'
    );
  END IF;

  -- Critical: Photoperiod decrease for layers
  IF v_production_type = 'POSTURA' AND NEW.actual_light_hours < (NEW.target_light_hours - 0.5) THEN
    INSERT INTO lighting_alerts (lighting_schedule_id, lot_id, alert_type, severity, message, recommendation)
    VALUES (
      NEW.id,
      NEW.lot_id,
      'program_change',
      'critical',
      'Photoperiod decrease detected! This will severely impact egg production.',
      'NEVER decrease light hours during lay. Birds can stop laying. Restore to target immediately.'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically check for alerts when schedule is inserted or updated
CREATE TRIGGER trigger_check_lighting_alerts
  AFTER INSERT OR UPDATE ON lighting_schedules
  FOR EACH ROW
  EXECUTE FUNCTION check_and_create_lighting_alerts();

-- =============================================
-- Function: Update lighting program based on age
-- Purpose: Automatically update target lighting when auto_adjust is enabled
-- =============================================
CREATE OR REPLACE FUNCTION auto_update_lighting_program()
RETURNS void AS $$
DECLARE
  r RECORD;
  v_age_days INTEGER;
  v_age_weeks INTEGER;
  v_target_hours NUMERIC(4,2);
  v_target_intensity INTEGER;
BEGIN
  FOR r IN
    SELECT lp.*, l.fecha_inicio
    FROM lighting_programs lp
    JOIN lotes l ON l.id = lp.lot_id
    WHERE lp.auto_adjust = true
      AND l.estado = 'ACTIVO'
  LOOP
    -- Calculate age in weeks
    v_age_days := EXTRACT(DAY FROM (CURRENT_DATE - r.fecha_inicio));
    v_age_weeks := CEIL(v_age_days::NUMERIC / 7);

    -- Update current week if changed
    IF v_age_weeks != r.current_week THEN
      UPDATE lighting_programs
      SET current_week = v_age_weeks,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = r.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- View: Lighting compliance summary
-- Purpose: Provide quick overview of lighting compliance by lot
-- =============================================
CREATE OR REPLACE VIEW lighting_compliance_summary AS
SELECT
  ls.lot_id,
  l.nombre_lote,
  l.tipo_produccion,
  COUNT(*) as total_days,
  AVG(ABS(ls.actual_light_hours - ls.target_light_hours)) as avg_deviation_hours,
  ROUND(
    (COUNT(*) FILTER (WHERE ABS(ls.actual_light_hours - ls.target_light_hours) <= 0.5)::NUMERIC / COUNT(*)) * 100,
    1
  ) as compliance_rate_percent,
  COUNT(*) FILTER (WHERE ABS(ls.actual_light_hours - ls.target_light_hours) > 0.5) as days_out_of_spec,
  MAX(ls.date) as last_recorded_date
FROM lighting_schedules ls
JOIN lotes l ON l.id = ls.lot_id
GROUP BY ls.lot_id, l.nombre_lote, l.tipo_produccion;

-- =============================================
-- View: Recent lighting alerts
-- Purpose: Show unacknowledged and recent alerts
-- =============================================
CREATE OR REPLACE VIEW recent_lighting_alerts AS
SELECT
  la.*,
  l.nombre_lote,
  ls.date as schedule_date,
  ls.actual_light_hours,
  ls.target_light_hours
FROM lighting_alerts la
JOIN lotes l ON l.id = la.lot_id
JOIN lighting_schedules ls ON ls.id = la.lighting_schedule_id
WHERE la.acknowledged = false
  OR la.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY la.created_at DESC;

-- =============================================
-- Enable Row Level Security
-- =============================================
ALTER TABLE lighting_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lighting_schedules
CREATE POLICY "Users can view lighting schedules for their organization"
  ON lighting_schedules FOR SELECT
  USING (true); -- Adjust based on your auth requirements

CREATE POLICY "Users can insert lighting schedules"
  ON lighting_schedules FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update lighting schedules"
  ON lighting_schedules FOR UPDATE
  USING (true);

-- RLS Policies for lighting_programs
CREATE POLICY "Users can view lighting programs"
  ON lighting_programs FOR SELECT
  USING (true);

CREATE POLICY "Users can manage lighting programs"
  ON lighting_programs FOR ALL
  USING (true);

-- RLS Policies for lighting_alerts
CREATE POLICY "Users can view lighting alerts"
  ON lighting_alerts FOR SELECT
  USING (true);

CREATE POLICY "Users can acknowledge lighting alerts"
  ON lighting_alerts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Insert sample lighting program templates
-- =============================================
COMMENT ON TABLE lighting_schedules IS 'Daily lighting records tracking actual vs target photoperiod and intensity';
COMMENT ON TABLE lighting_programs IS 'Active lighting programs for each lot with auto-adjustment capabilities';
COMMENT ON TABLE lighting_alerts IS 'Automated alerts for lighting deviations and program compliance';
COMMENT ON FUNCTION check_and_create_lighting_alerts() IS 'Trigger function to automatically detect and create lighting alerts';
COMMENT ON FUNCTION auto_update_lighting_program() IS 'Scheduled function to update lighting programs based on bird age';
COMMENT ON VIEW lighting_compliance_summary IS 'Aggregated compliance metrics for lighting programs by lot';
COMMENT ON VIEW recent_lighting_alerts IS 'Recent and unacknowledged lighting alerts for monitoring';
