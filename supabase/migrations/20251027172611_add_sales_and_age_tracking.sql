/*
  # Agregar módulo de ventas y tracking de edad
  
  1. Cambios en Tablas Existentes
    - Agregar `fecha_nacimiento` a lotes para cálculo preciso de edad
    - Agregar campos de finalización y venta
    
  2. Nueva Tabla: ventas
    - `id` (uuid, primary key)
    - `lote_id` (uuid, foreign key)
    - `fecha_venta` (date)
    - `tipo_venta` (text) - 'VIVO', 'CONGELADO', 'MIXTO'
    - `cantidad_aves_vivo` (integer)
    - `cantidad_aves_congelado` (integer)
    - `peso_total_kg` (decimal)
    - `precio_vivo_por_kg` (decimal)
    - `precio_congelado_por_kg` (decimal)
    - `ingreso_total` (decimal)
    - `costo_total` (decimal)
    - `ganancia_neta` (decimal)
    - `created_at` (timestamptz)
    
  3. Seguridad
    - Habilitar RLS en nueva tabla
    - Políticas para usuarios autenticados
*/

-- Agregar columna fecha_nacimiento a lotes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lotes' AND column_name = 'fecha_nacimiento'
  ) THEN
    ALTER TABLE lotes ADD COLUMN fecha_nacimiento timestamptz;
  END IF;
END $$;

-- Agregar columnas de finalización
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lotes' AND column_name = 'fecha_finalizacion'
  ) THEN
    ALTER TABLE lotes ADD COLUMN fecha_finalizacion date;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lotes' AND column_name = 'alerta_42_dias'
  ) THEN
    ALTER TABLE lotes ADD COLUMN alerta_42_dias boolean DEFAULT false;
  END IF;
END $$;

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id uuid NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  fecha_venta date NOT NULL,
  tipo_venta text NOT NULL CHECK (tipo_venta IN ('VIVO', 'CONGELADO', 'MIXTO')),
  cantidad_aves_vivo integer DEFAULT 0 CHECK (cantidad_aves_vivo >= 0),
  cantidad_aves_congelado integer DEFAULT 0 CHECK (cantidad_aves_congelado >= 0),
  peso_total_kg decimal(10,2) NOT NULL CHECK (peso_total_kg > 0),
  precio_vivo_por_kg decimal(10,2) DEFAULT 67.00,
  precio_congelado_por_kg decimal(10,2) DEFAULT 105.00,
  ingreso_total decimal(10,2) NOT NULL,
  costo_total decimal(10,2) NOT NULL,
  ganancia_neta decimal(10,2) NOT NULL,
  observaciones text,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ventas_lote ON ventas(lote_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);

-- Habilitar RLS
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ventas
CREATE POLICY "Permitir lectura de ventas"
  ON ventas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserción de ventas"
  ON ventas FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización de ventas"
  ON ventas FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insertar parámetros adicionales de razas
INSERT INTO parametros (clave, valor, descripcion, categoria) VALUES
('LEGHORN_PESO_DIA_140', '1500', 'Peso objetivo día 140 (gramos)', 'ESTANDAR_GENETICO'),
('LOHMAN_BROWN_PESO_DIA_140', '1650', 'Peso objetivo día 140 (gramos)', 'ESTANDAR_GENETICO'),
('CORAL_PESO_DIA_35', '2800', 'Peso objetivo día 35 (gramos)', 'ESTANDAR_GENETICO'),
('PRECIO_VIVO_KG', '67.00', 'Precio por kg de pollo vivo (MXN)', 'PRECIO_VENTA'),
('PRECIO_CONGELADO_KG', '105.00', 'Precio por kg de pollo congelado (MXN)', 'PRECIO_VENTA')
ON CONFLICT (clave) DO NOTHING;