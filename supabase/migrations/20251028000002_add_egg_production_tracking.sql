/*
  # Add Egg Production Tracking by Color and Quality

  1. New Table
    - `egg_production`
      - `id` (uuid, primary key)
      - `lote_id` (uuid, foreign key)
      - `date` (date)
      - `white_eggs` (integer) - White eggs count
      - `brown_eggs` (integer) - Brown eggs count
      - `blue_eggs` (integer) - Blue/green eggs count
      - `cream_eggs` (integer) - Cream colored eggs count
      - `xl_grade` (integer) - Extra Large grade (>=73g)
      - `l_grade` (integer) - Large grade (63-73g)
      - `m_grade` (integer) - Medium grade (53-63g)
      - `s_grade` (integer) - Small grade (<53g)
      - `cracked_eggs` (integer) - Cracked/broken eggs
      - `dirty_eggs` (integer) - Dirty eggs requiring cleaning
      - `average_weight` (decimal) - Average weight per egg (grams)
      - `total_weight` (decimal) - Total weight (kg)
      - `notes` (text, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Table for detailed egg production tracking
CREATE TABLE IF NOT EXISTS egg_production (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  date date NOT NULL,

  -- Production by color
  white_eggs integer DEFAULT 0 CHECK (white_eggs >= 0),
  brown_eggs integer DEFAULT 0 CHECK (brown_eggs >= 0),
  blue_eggs integer DEFAULT 0 CHECK (blue_eggs >= 0),
  cream_eggs integer DEFAULT 0 CHECK (cream_eggs >= 0),

  -- Quality classification
  xl_grade integer DEFAULT 0 CHECK (xl_grade >= 0),
  l_grade integer DEFAULT 0 CHECK (l_grade >= 0),
  m_grade integer DEFAULT 0 CHECK (m_grade >= 0),
  s_grade integer DEFAULT 0 CHECK (s_grade >= 0),
  cracked_eggs integer DEFAULT 0 CHECK (cracked_eggs >= 0),
  dirty_eggs integer DEFAULT 0 CHECK (dirty_eggs >= 0),

  -- Weight data
  average_weight decimal(6,2) CHECK (average_weight >= 0),
  total_weight decimal(10,2) CHECK (total_weight >= 0),

  notes text,
  created_at timestamptz DEFAULT now(),

  UNIQUE(lote_id, date)
);

-- Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_egg_production_lote_date ON egg_production(lote_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_egg_production_date ON egg_production(date DESC);

-- Enable RLS
ALTER TABLE egg_production ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Permitir lectura de producción de huevos"
  ON egg_production FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción de producción de huevos"
  ON egg_production FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de producción de huevos"
  ON egg_production FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Function to calculate total eggs
CREATE OR REPLACE FUNCTION calculate_total_eggs(production_record egg_production)
RETURNS integer AS $$
BEGIN
  RETURN production_record.white_eggs +
         production_record.brown_eggs +
         production_record.blue_eggs +
         production_record.cream_eggs;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate quality percentage
CREATE OR REPLACE FUNCTION calculate_quality_percentage(production_record egg_production)
RETURNS decimal AS $$
DECLARE
  total_eggs integer;
  marketable_eggs integer;
BEGIN
  total_eggs := calculate_total_eggs(production_record);

  IF total_eggs = 0 THEN
    RETURN 0;
  END IF;

  marketable_eggs := production_record.xl_grade +
                     production_record.l_grade +
                     production_record.m_grade;

  RETURN (marketable_eggs::decimal / total_eggs) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- View for production summary by lot
CREATE OR REPLACE VIEW egg_production_summary AS
SELECT
  ep.lote_id,
  l.linea_genetica,
  l.tipo_produccion,
  l.num_aves_actual,
  COUNT(ep.id) as days_recorded,
  SUM(ep.white_eggs) as total_white_eggs,
  SUM(ep.brown_eggs) as total_brown_eggs,
  SUM(ep.blue_eggs) as total_blue_eggs,
  SUM(ep.cream_eggs) as total_cream_eggs,
  SUM(calculate_total_eggs(ep)) as total_eggs,
  SUM(ep.xl_grade) as total_xl,
  SUM(ep.l_grade) as total_l,
  SUM(ep.m_grade) as total_m,
  SUM(ep.s_grade) as total_s,
  SUM(ep.cracked_eggs) as total_cracked,
  SUM(ep.dirty_eggs) as total_dirty,
  AVG(ep.average_weight) as avg_egg_weight,
  SUM(ep.total_weight) as total_weight_kg,
  AVG(calculate_quality_percentage(ep)) as avg_quality_percentage,
  (SUM(calculate_total_eggs(ep))::decimal / NULLIF(COUNT(ep.id) * l.num_aves_actual, 0)) * 100 as production_rate_percent
FROM egg_production ep
JOIN lotes l ON ep.lote_id = l.id
GROUP BY ep.lote_id, l.linea_genetica, l.tipo_produccion, l.num_aves_actual;

-- Trigger to update registros_diarios when egg production is recorded
CREATE OR REPLACE FUNCTION sync_egg_production_to_registros_diarios()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert into registros_diarios
  INSERT INTO registros_diarios (
    lote_id,
    fecha,
    huevos_producidos,
    mortalidad_diaria,
    alimento_consumido_kg,
    agua_consumida_l,
    peso_promedio_g,
    observaciones
  )
  VALUES (
    NEW.lote_id,
    NEW.date,
    calculate_total_eggs(NEW),
    0,
    0,
    0,
    NULL,
    NEW.notes
  )
  ON CONFLICT (lote_id, fecha)
  DO UPDATE SET
    huevos_producidos = calculate_total_eggs(NEW);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_egg_production
  AFTER INSERT OR UPDATE ON egg_production
  FOR EACH ROW
  EXECUTE FUNCTION sync_egg_production_to_registros_diarios();

-- Add genetic line color mapping table
CREATE TABLE IF NOT EXISTS genetic_line_specs (
  linea_genetica text PRIMARY KEY,
  expected_egg_color text NOT NULL CHECK (expected_egg_color IN ('white', 'brown', 'blue', 'cream')),
  expected_production_rate decimal(5,2), -- Expected eggs per hen per day (%)
  expected_egg_weight decimal(6,2),      -- Expected average egg weight (grams)
  peak_production_age_weeks integer,
  description text
);

-- Insert common genetic lines
INSERT INTO genetic_line_specs (linea_genetica, expected_egg_color, expected_production_rate, expected_egg_weight, peak_production_age_weeks, description) VALUES
  ('HYLINE_BROWN', 'brown', 95.0, 62.5, 26, 'High production brown egg layer'),
  ('LOHMAN_BROWN', 'brown', 94.0, 63.0, 28, 'Robust brown egg layer with good feed efficiency'),
  ('LEGHORN', 'white', 92.0, 60.0, 24, 'Classic white egg layer, excellent feed conversion'),
  ('ISA_BROWN', 'brown', 95.0, 63.5, 27, 'Industry-leading brown egg production'),
  ('BABCOCK', 'white', 91.0, 59.5, 25, 'Reliable white egg producer'),
  ('ARAUCANA', 'blue', 75.0, 55.0, 30, 'Blue/green egg layer, specialty market')
ON CONFLICT (linea_genetica) DO NOTHING;

-- Enable RLS on genetic_line_specs
ALTER TABLE genetic_line_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de especificaciones genéticas"
  ON genetic_line_specs FOR SELECT
  TO anon, authenticated
  USING (true);
