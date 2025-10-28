/*
  # Sistema de Gestión Avícola - Esquema Base
  
  1. Nuevas Tablas
    - `lotes`
      - `id` (uuid, primary key)
      - `tipo_produccion` (text) - 'ENGORDE' o 'POSTURA'
      - `linea_genetica` (text) - 'COBB500', 'ROSS308', 'HYLINE_BROWN'
      - `fecha_inicio` (date) - Fecha de inicio del lote
      - `num_aves_inicial` (integer) - Número inicial de aves
      - `num_aves_actual` (integer) - Número actual de aves
      - `costo_pollito_unitario` (decimal) - Costo por pollito
      - `estado` (text) - 'ACTIVO', 'FINALIZADO'
      - `created_at` (timestamptz)
      
    - `registros_diarios`
      - `id` (uuid, primary key)
      - `lote_id` (uuid, foreign key)
      - `fecha` (date)
      - `mortalidad_diaria` (integer)
      - `alimento_consumido_kg` (decimal)
      - `agua_consumida_l` (decimal)
      - `peso_promedio_g` (decimal) - Peso promedio semanal
      - `huevos_producidos` (integer) - Solo para postura
      - `observaciones` (text)
      - `created_at` (timestamptz)
      
    - `costos_lote`
      - `id` (uuid, primary key)
      - `lote_id` (uuid, foreign key)
      - `fecha` (date)
      - `costo_alimento` (decimal)
      - `costo_vacunas` (decimal)
      - `costos_indirectos_prorrateados` (decimal)
      - `costo_transformacion_acumulado` (decimal)
      - `created_at` (timestamptz)
      
    - `parametros`
      - `clave` (text, primary key)
      - `valor` (text)
      - `descripcion` (text)
      - `categoria` (text)
      
    - `inventario`
      - `id` (uuid, primary key)
      - `nombre` (text)
      - `tipo` (text) - 'ALIMENTO', 'VACUNA', 'MEDICAMENTO'
      - `unidad_medida` (text)
      - `stock_actual` (decimal)
      - `costo_unitario` (decimal)
      - `created_at` (timestamptz)
      
  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
*/

-- Tabla de Lotes
CREATE TABLE IF NOT EXISTS lotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_produccion text NOT NULL CHECK (tipo_produccion IN ('ENGORDE', 'POSTURA')),
  linea_genetica text NOT NULL,
  fecha_inicio date NOT NULL,
  num_aves_inicial integer NOT NULL CHECK (num_aves_inicial > 0),
  num_aves_actual integer NOT NULL CHECK (num_aves_actual >= 0),
  costo_pollito_unitario decimal(10,2) NOT NULL CHECK (costo_pollito_unitario >= 0),
  estado text NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'FINALIZADO')),
  created_at timestamptz DEFAULT now()
);

-- Tabla de Registros Diarios
CREATE TABLE IF NOT EXISTS registros_diarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  mortalidad_diaria integer DEFAULT 0 CHECK (mortalidad_diaria >= 0),
  alimento_consumido_kg decimal(10,2) DEFAULT 0 CHECK (alimento_consumido_kg >= 0),
  agua_consumida_l decimal(10,2) DEFAULT 0,
  peso_promedio_g decimal(10,2),
  huevos_producidos integer DEFAULT 0 CHECK (huevos_producidos >= 0),
  observaciones text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lote_id, fecha)
);

-- Tabla de Costos por Lote
CREATE TABLE IF NOT EXISTS costos_lote (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  costo_alimento decimal(10,2) DEFAULT 0,
  costo_vacunas decimal(10,2) DEFAULT 0,
  costos_indirectos_prorrateados decimal(10,2) DEFAULT 0,
  costo_transformacion_acumulado decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lote_id, fecha)
);

-- Tabla de Parámetros y Estándares
CREATE TABLE IF NOT EXISTS parametros (
  clave text PRIMARY KEY,
  valor text NOT NULL,
  descripcion text,
  categoria text NOT NULL
);

-- Tabla de Inventario
CREATE TABLE IF NOT EXISTS inventario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('ALIMENTO', 'VACUNA', 'MEDICAMENTO', 'OTRO')),
  unidad_medida text NOT NULL,
  stock_actual decimal(10,2) DEFAULT 0 CHECK (stock_actual >= 0),
  costo_unitario decimal(10,2) DEFAULT 0 CHECK (costo_unitario >= 0),
  created_at timestamptz DEFAULT now()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_registros_lote_fecha ON registros_diarios(lote_id, fecha);
CREATE INDEX IF NOT EXISTS idx_costos_lote_fecha ON costos_lote(lote_id, fecha);
CREATE INDEX IF NOT EXISTS idx_lotes_estado ON lotes(estado);

-- Habilitar RLS
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE costos_lote ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametros ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (Acceso público para el MVP, ajustar según autenticación)
CREATE POLICY "Permitir lectura de lotes"
  ON lotes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción de lotes"
  ON lotes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de lotes"
  ON lotes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir lectura de registros"
  ON registros_diarios FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción de registros"
  ON registros_diarios FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir lectura de costos"
  ON costos_lote FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción de costos"
  ON costos_lote FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de costos"
  ON costos_lote FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir lectura de parámetros"
  ON parametros FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción de parámetros"
  ON parametros FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir lectura de inventario"
  ON inventario FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción de inventario"
  ON inventario FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de inventario"
  ON inventario FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);