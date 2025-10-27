import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Lote {
  id: string;
  tipo_produccion: 'ENGORDE' | 'POSTURA';
  linea_genetica: string;
  fecha_inicio: string;
  fecha_nacimiento?: string | null;
  num_aves_inicial: number;
  num_aves_actual: number;
  costo_pollito_unitario: number;
  estado: 'ACTIVO' | 'FINALIZADO';
  fecha_finalizacion?: string | null;
  alerta_42_dias?: boolean;
  created_at: string;
}

export interface RegistroDiario {
  id: string;
  lote_id: string;
  fecha: string;
  mortalidad_diaria: number;
  alimento_consumido_kg: number;
  agua_consumida_l: number;
  peso_promedio_g: number | null;
  huevos_producidos: number;
  observaciones: string | null;
  created_at: string;
}

export interface CostoLote {
  id: string;
  lote_id: string;
  fecha: string;
  costo_alimento: number;
  costo_vacunas: number;
  costos_indirectos_prorrateados: number;
  costo_transformacion_acumulado: number;
  created_at: string;
}

export interface Parametro {
  clave: string;
  valor: string;
  descripcion: string | null;
  categoria: string;
}

export interface Inventario {
  id: string;
  nombre: string;
  tipo: 'ALIMENTO' | 'VACUNA' | 'MEDICAMENTO' | 'OTRO';
  unidad_medida: string;
  stock_actual: number;
  costo_unitario: number;
  created_at: string;
}

export interface Venta {
  id: string;
  lote_id: string;
  fecha_venta: string;
  tipo_venta: 'VIVO' | 'CONGELADO' | 'MIXTO';
  cantidad_aves_vivo: number;
  cantidad_aves_congelado: number;
  peso_total_kg: number;
  precio_vivo_por_kg: number;
  precio_congelado_por_kg: number;
  ingreso_total: number;
  costo_total: number;
  ganancia_neta: number;
  observaciones?: string | null;
  created_at: string;
}
