# Documentación Técnica - Sistema de Gestión Avícola

## Tabla de Contenidos
1. [Información General](#información-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Base de Datos](#base-de-datos)
5. [Componentes de la Aplicación](#componentes-de-la-aplicación)
6. [Servicios y Lógica de Negocio](#servicios-y-lógica-de-negocio)
7. [Flujos de Datos](#flujos-de-datos)
8. [API y Endpoints](#api-y-endpoints)
9. [Configuración y Despliegue](#configuración-y-despliegue)

---

## Información General

### Descripción del Proyecto
Sistema de Gestión Avícola desarrollado con React y TypeScript para el control de eficiencia en la producción avícola, con cumplimiento de la norma contable NIF C-11 (Activos Biológicos).

### Versión
0.0.0

### Ubicación
`/etc/easypanel/projects/softvibes/mauvsc-server/volumes/config/workspace/Gestion_Avicola`

### Tipo de Aplicación
Single Page Application (SPA) - React + Supabase

---

## Arquitectura del Sistema

### Patrón Arquitectónico
El proyecto sigue una arquitectura de **Componentes React + Servicios de Datos** con las siguientes capas:

```
┌─────────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN (UI)               │
│  React Components + Tailwind CSS                │
├─────────────────────────────────────────────────┤
│  - App.tsx (Router lógico y orquestador)       │
│  - CrearLote.tsx                                │
│  - DashboardLote.tsx                            │
│  - RegistroDiarioForm.tsx                       │
│  - FinalizarLote.tsx                            │
│  - Ventas.tsx                                   │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│      CAPA DE LÓGICA DE NEGOCIO (Services)       │
├─────────────────────────────────────────────────┤
│  - calculations.ts (KPIs, comparativas, costos) │
│  - ageUtils.ts (cálculos de edad)              │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│     CAPA DE ACCESO A DATOS (Data Access)        │
├─────────────────────────────────────────────────┤
│  - supabase.ts (Cliente + Interfaces)           │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│    CAPA DE BASE DE DATOS (Supabase/PostgreSQL)  │
├─────────────────────────────────────────────────┤
│  - lotes                                        │
│  - registros_diarios                            │
│  - costos_lote                                  │
│  - ventas                                       │
│  - parametros                                   │
│  - inventario                                   │
└─────────────────────────────────────────────────┘
```

### Principios de Diseño
- **Separación de Responsabilidades**: Componentes UI separados de lógica de negocio
- **Reusabilidad**: Funciones de cálculo y utilidades compartidas
- **Tipado Fuerte**: TypeScript con interfaces estrictas
- **Estado Centralizado**: React Hooks para gestión de estado
- **Backend as a Service**: Supabase para base de datos y autenticación

---

## Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **React** | 18.3.1 | Framework UI principal |
| **TypeScript** | 5.5.3 | Tipado estático y seguridad de tipos |
| **Vite** | 5.4.2 | Build tool y dev server |
| **Tailwind CSS** | 3.4.1 | Framework de estilos utilitarios |
| **PostCSS** | 8.4.35 | Procesamiento de CSS |
| **Lucide React** | 0.344.0 | Biblioteca de iconos |

### Backend/Base de Datos

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Supabase** | - | Backend as a Service (BaaS) |
| **@supabase/supabase-js** | 2.57.4 | Cliente JavaScript para Supabase |
| **PostgreSQL** | - | Base de datos relacional (vía Supabase) |

### Herramientas de Desarrollo

| Herramienta | Versión | Propósito |
|------------|---------|-----------|
| **ESLint** | 9.9.1 | Linting y análisis estático de código |
| **TypeScript ESLint** | 8.3.0 | Reglas de ESLint para TypeScript |
| **Autoprefixer** | 10.4.18 | Prefijos CSS automáticos |

---

## Base de Datos

### Esquema General

El sistema utiliza PostgreSQL a través de Supabase con las siguientes tablas:

#### Diagrama Entidad-Relación

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   lotes     │──┬───<│ registros_diarios│       │  parametros │
│             │  │    │                  │       │             │
│ - id (PK)   │  │    │ - id (PK)        │       │ - clave (PK)│
│ - tipo      │  │    │ - lote_id (FK)   │       │ - valor     │
│ - linea     │  │    │ - fecha          │       │ - categoria │
│ - estado    │  │    │ - mortalidad     │       └─────────────┘
└─────────────┘  │    │ - alimento       │
                 │    │ - peso           │       ┌─────────────┐
                 │    └──────────────────┘       │ inventario  │
                 │                               │             │
                 ├───<│ costos_lote     │       │ - id (PK)   │
                 │    │                 │       │ - nombre    │
                 │    │ - id (PK)       │       │ - tipo      │
                 │    │ - lote_id (FK)  │       │ - stock     │
                 │    │ - costo_total   │       │ - costo_u   │
                 │    └─────────────────┘       └─────────────┘
                 │
                 └───<│ ventas          │
                      │                 │
                      │ - id (PK)       │
                      │ - lote_id (FK)  │
                      │ - ingreso_total │
                      │ - ganancia_neta │
                      └─────────────────┘
```

---

### Tabla: `lotes`

Almacena información de cada lote de aves (pollo de engorde o gallina de postura).

**Ubicación**: `/supabase/migrations/20251026042651_create_poultry_management_schema.sql:59-69`

#### Estructura

| Columna | Tipo | Nulable | Default | Restricciones | Descripción |
|---------|------|---------|---------|---------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Identificador único del lote |
| `tipo_produccion` | text | NO | - | IN ('ENGORDE', 'POSTURA') | Tipo de producción avícola |
| `linea_genetica` | text | NO | - | - | Línea genética (COBB500, ROSS308, etc.) |
| `fecha_inicio` | date | NO | - | - | Fecha de inicio del lote |
| `fecha_nacimiento` | timestamptz | SÍ | null | - | Fecha de nacimiento de las aves (agregado en migración posterior) |
| `num_aves_inicial` | integer | NO | - | > 0 | Número inicial de aves |
| `num_aves_actual` | integer | NO | - | >= 0 | Número actual de aves (actualizado con mortalidad) |
| `costo_pollito_unitario` | decimal(10,2) | NO | - | >= 0 | Costo unitario por pollito en MXN |
| `estado` | text | NO | 'ACTIVO' | IN ('ACTIVO', 'FINALIZADO') | Estado del lote |
| `fecha_finalizacion` | date | SÍ | null | - | Fecha de finalización del lote |
| `alerta_42_dias` | boolean | SÍ | false | - | Alerta de proximidad a 42 días (óptimo engorde) |
| `created_at` | timestamptz | NO | now() | - | Fecha de creación del registro |

#### Índices

- `idx_lotes_estado` ON `estado` - Para consultas de lotes activos/finalizados

#### Interface TypeScript

**Ubicación**: `/src/lib/supabase.ts:12-25`

```typescript
interface Lote {
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
```

---

### Tabla: `registros_diarios`

Registros diarios de mortalidad, consumo de alimento/agua, peso promedio y producción de huevos.

**Ubicación**: `/supabase/migrations/20251026042651_create_poultry_management_schema.sql:72-84`

#### Estructura

| Columna | Tipo | Nulable | Default | Restricciones | Descripción |
|---------|------|---------|---------|---------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Identificador único del registro |
| `lote_id` | uuid | NO | - | FOREIGN KEY → lotes(id) ON DELETE CASCADE | Referencia al lote |
| `fecha` | date | NO | - | UNIQUE(lote_id, fecha) | Fecha del registro |
| `mortalidad_diaria` | integer | SÍ | 0 | >= 0 | Número de aves muertas en el día |
| `alimento_consumido_kg` | decimal(10,2) | SÍ | 0 | >= 0 | Kilogramos de alimento consumido |
| `agua_consumida_l` | decimal(10,2) | SÍ | 0 | - | Litros de agua consumida |
| `peso_promedio_g` | decimal(10,2) | SÍ | null | - | Peso promedio en gramos (muestreo semanal) |
| `huevos_producidos` | integer | SÍ | 0 | >= 0 | Huevos producidos (solo para postura) |
| `observaciones` | text | SÍ | null | - | Observaciones (vacunas, eventos, medicamentos) |
| `created_at` | timestamptz | NO | now() | - | Fecha de creación del registro |

#### Índices

- `idx_registros_lote_fecha` ON `(lote_id, fecha)` - Optimización de consultas por lote y fecha

#### Interface TypeScript

**Ubicación**: `/src/lib/supabase.ts:27-38`

```typescript
interface RegistroDiario {
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
```

---

### Tabla: `costos_lote`

Costeo diario del lote siguiendo la norma NIF C-11 (Activos Biológicos).

**Ubicación**: `/supabase/migrations/20251026042651_create_poultry_management_schema.sql:87-97`

#### Estructura

| Columna | Tipo | Nulable | Default | Restricciones | Descripción |
|---------|------|---------|---------|---------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Identificador único del costo |
| `lote_id` | uuid | NO | - | FOREIGN KEY → lotes(id) ON DELETE CASCADE | Referencia al lote |
| `fecha` | date | NO | - | UNIQUE(lote_id, fecha) | Fecha del registro de costo |
| `costo_alimento` | decimal(10,2) | SÍ | 0 | - | Costo diario de alimento (kg * precio/kg) |
| `costo_vacunas` | decimal(10,2) | SÍ | 0 | - | Costo de vacunas aplicadas |
| `costos_indirectos_prorrateados` | decimal(10,2) | SÍ | 0 | - | Costos indirectos prorratados por proporción de aves |
| `costo_transformacion_acumulado` | decimal(10,2) | SÍ | 0 | - | Costo total acumulado (NIF C-11) |
| `created_at` | timestamptz | NO | now() | - | Fecha de creación del registro |

#### Índices

- `idx_costos_lote_fecha` ON `(lote_id, fecha)` - Optimización de consultas por lote y fecha

#### Interface TypeScript

**Ubicación**: `/src/lib/supabase.ts:40-49`

```typescript
interface CostoLote {
  id: string;
  lote_id: string;
  fecha: string;
  costo_alimento: number;
  costo_vacunas: number;
  costos_indirectos_prorrateados: number;
  costo_transformacion_acumulado: number;
  created_at: string;
}
```

---

### Tabla: `ventas`

Registro de ventas de lotes finalizados (venta en vivo, congelado o mixto).

**Ubicación**: `/supabase/migrations/20251027172611_add_sales_and_age_tracking.sql:61-76`

#### Estructura

| Columna | Tipo | Nulable | Default | Restricciones | Descripción |
|---------|------|---------|---------|---------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Identificador único de la venta |
| `lote_id` | uuid | NO | - | FOREIGN KEY → lotes(id) ON DELETE CASCADE | Referencia al lote vendido |
| `fecha_venta` | date | NO | - | - | Fecha de la venta |
| `tipo_venta` | text | NO | - | IN ('VIVO', 'CONGELADO', 'MIXTO') | Tipo de venta |
| `cantidad_aves_vivo` | integer | SÍ | 0 | >= 0 | Cantidad de aves vendidas en vivo |
| `cantidad_aves_congelado` | integer | SÍ | 0 | >= 0 | Cantidad de aves sacrificadas y congeladas |
| `peso_total_kg` | decimal(10,2) | NO | - | > 0 | Peso total vendido en kilogramos |
| `precio_vivo_por_kg` | decimal(10,2) | SÍ | 67.00 | - | Precio por kg de pollo vivo (MXN) |
| `precio_congelado_por_kg` | decimal(10,2) | SÍ | 105.00 | - | Precio por kg de pollo congelado (MXN) |
| `ingreso_total` | decimal(10,2) | NO | - | - | Ingreso total de la venta |
| `costo_total` | decimal(10,2) | NO | - | - | Costo total acumulado del lote |
| `ganancia_neta` | decimal(10,2) | NO | - | - | Ganancia neta (ingreso - costo) |
| `observaciones` | text | SÍ | null | - | Observaciones de la venta |
| `created_at` | timestamptz | NO | now() | - | Fecha de creación del registro |

#### Índices

- `idx_ventas_lote` ON `lote_id` - Búsqueda de ventas por lote
- `idx_ventas_fecha` ON `fecha_venta` - Ordenamiento y filtrado por fecha

#### Interface TypeScript

**Ubicación**: `/src/lib/supabase.ts:68-83`

```typescript
interface Venta {
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
```

---

### Tabla: `parametros`

Parámetros de configuración y estándares genéticos.

**Ubicación**: `/supabase/migrations/20251026042651_create_poultry_management_schema.sql:100-105`

#### Estructura

| Columna | Tipo | Nulable | Default | Restricciones | Descripción |
|---------|------|---------|---------|---------------|-------------|
| `clave` | text | NO | - | PRIMARY KEY | Clave única del parámetro |
| `valor` | text | NO | - | - | Valor del parámetro |
| `descripcion` | text | SÍ | null | - | Descripción del parámetro |
| `categoria` | text | NO | - | - | Categoría (ESTANDAR_GENETICO, PRECIO_VENTA, etc.) |

#### Datos Precargados

**Ubicación**: `/supabase/migrations/20251027172611_add_sales_and_age_tracking.sql:103-109`

```sql
INSERT INTO parametros (clave, valor, descripcion, categoria) VALUES
('LEGHORN_PESO_DIA_140', '1500', 'Peso objetivo día 140 (gramos)', 'ESTANDAR_GENETICO'),
('LOHMAN_BROWN_PESO_DIA_140', '1650', 'Peso objetivo día 140 (gramos)', 'ESTANDAR_GENETICO'),
('CORAL_PESO_DIA_35', '2800', 'Peso objetivo día 35 (gramos)', 'ESTANDAR_GENETICO'),
('PRECIO_VIVO_KG', '67.00', 'Precio por kg de pollo vivo (MXN)', 'PRECIO_VENTA'),
('PRECIO_CONGELADO_KG', '105.00', 'Precio por kg de pollo congelado (MXN)', 'PRECIO_VENTA');
```

#### Interface TypeScript

**Ubicación**: `/src/lib/supabase.ts:51-56`

```typescript
interface Parametro {
  clave: string;
  valor: string;
  descripcion: string | null;
  categoria: string;
}
```

---

### Tabla: `inventario`

Inventario de insumos (alimento, vacunas, medicamentos).

**Ubicación**: `/supabase/migrations/20251026042651_create_poultry_management_schema.sql:108-116`

#### Estructura

| Columna | Tipo | Nulable | Default | Restricciones | Descripción |
|---------|------|---------|---------|---------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Identificador único del item |
| `nombre` | text | NO | - | - | Nombre del insumo |
| `tipo` | text | NO | - | IN ('ALIMENTO', 'VACUNA', 'MEDICAMENTO', 'OTRO') | Tipo de insumo |
| `unidad_medida` | text | NO | - | - | Unidad de medida (kg, litros, dosis, etc.) |
| `stock_actual` | decimal(10,2) | SÍ | 0 | >= 0 | Stock disponible |
| `costo_unitario` | decimal(10,2) | SÍ | 0 | >= 0 | Costo unitario del insumo |
| `created_at` | timestamptz | NO | now() | - | Fecha de creación del registro |

#### Interface TypeScript

**Ubicación**: `/src/lib/supabase.ts:58-66`

```typescript
interface Inventario {
  id: string;
  nombre: string;
  tipo: 'ALIMENTO' | 'VACUNA' | 'MEDICAMENTO' | 'OTRO';
  unidad_medida: string;
  stock_actual: number;
  costo_unitario: number;
  created_at: string;
}
```

---

### Row Level Security (RLS)

Todas las tablas tienen habilitado RLS con políticas permisivas para el MVP:

**Ubicación**: `/supabase/migrations/20251026042651_create_poultry_management_schema.sql:124-197`

```sql
-- Ejemplo de políticas para tabla lotes
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
```

**NOTA IMPORTANTE**: En producción, las políticas RLS deben ser más restrictivas, validando `auth.uid()` para limitar acceso solo a datos del usuario autenticado.

---

## Componentes de la Aplicación

### Arquitectura de Componentes

```
App.tsx (Root Component)
├── Header
│   ├── Logo + Title
│   ├── Botón "Nuevo Lote"
│   └── Navegación (Lotes Activos | Ventas)
│
├── Main Content (Vista dinámica)
│   ├── Vista 'lotes' → DashboardLote
│   └── Vista 'ventas' → Ventas
│
└── Modales (Overlays)
    ├── CrearLote (Modal)
    ├── RegistroDiarioForm (Modal)
    └── FinalizarLote (Modal)
```

---

### Componente: `App.tsx`

**Ubicación**: `/src/App.tsx`

**Responsabilidad**: Orquestador principal de la aplicación, gestiona el estado global, navegación y renderizado de componentes.

#### Estado Gestionado

```typescript
type Vista = 'lotes' | 'ventas';

// Estados principales
const [vista, setVista] = useState<Vista>('lotes');
const [lotes, setLotes] = useState<Lote[]>([]);
const [loteSeleccionado, setLoteSeleccionado] = useState<Lote | null>(null);
const [mostrarCrearLote, setMostrarCrearLote] = useState(false);
const [mostrarRegistro, setMostrarRegistro] = useState(false);
const [mostrarFinalizar, setMostrarFinalizar] = useState(false);
const [costoTotalLote, setCostoTotalLote] = useState(0);
const [pesoPromedioLote, setPesoPromedioLote] = useState(0);
const [loading, setLoading] = useState(true);
```

#### Funciones Principales

| Función | Línea | Descripción |
|---------|-------|-------------|
| `cargarLotes()` | 27-47 | Carga todos los lotes activos desde Supabase |
| `handleLoteCreado()` | 49-52 | Callback cuando se crea un nuevo lote |
| `handleRegistroCreado()` | 54-56 | Callback cuando se registran datos diarios |
| `handleFinalizarClick()` | 58-84 | Prepara datos para finalizar lote (obtiene costo y peso) |
| `handleVentaRealizada()` | 86-90 | Callback cuando se finaliza una venta |

#### Estructura de Renderizado

1. **Header** (líneas 94-148)
   - Logo y título
   - Botón "Nuevo Lote"
   - Navegación entre vistas (Lotes Activos / Ventas)

2. **Main Content** (líneas 150-207)
   - Vista "ventas": Renderiza componente `<Ventas />`
   - Vista "lotes":
     - Estado de carga (spinner)
     - Estado vacío (mensaje + botón crear lote)
     - Lista de lotes + `<DashboardLote />` del lote seleccionado

3. **Modales** (líneas 209-232)
   - `<CrearLote />` - Modal para crear nuevo lote
   - `<RegistroDiarioForm />` - Modal de registro diario
   - `<FinalizarLote />` - Modal de venta y finalización

---

### Componente: `CrearLote`

**Ubicación**: `/src/components/CrearLote.tsx`

**Responsabilidad**: Formulario modal para crear un nuevo lote de aves.

#### Props

```typescript
interface CrearLoteProps {
  onClose: () => void;
  onLoteCreado: (lote: Lote) => void;
}
```

#### Estado del Formulario

```typescript
const [tipo, setTipo] = useState<'ENGORDE' | 'POSTURA'>('ENGORDE');
const [lineaGenetica, setLineaGenetica] = useState('COBB500');
const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
const [edadSemanas, setEdadSemanas] = useState('');  // Solo para POSTURA
const [numAves, setNumAves] = useState('1000');
const [costoPollito, setCostoPollito] = useState('12.50');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

#### Lógica de Negocio

**Función**: `handleSubmit()` (líneas 20-61)

1. Calcula `fecha_nacimiento`:
   - **ENGORDE**: `fecha_nacimiento = fecha_inicio` (pollitos recién nacidos)
   - **POSTURA**: `fecha_nacimiento = fecha_inicio - (edadSemanas * 7 días)`

2. Inserta en tabla `lotes` con Supabase:
   ```typescript
   await supabase.from('lotes').insert({
     tipo_produccion: tipo,
     linea_genetica: lineaGenetica,
     fecha_inicio: fechaInicio,
     fecha_nacimiento: fechaNacimiento?.toISOString() || null,
     num_aves_inicial: parseInt(numAves),
     num_aves_actual: parseInt(numAves),
     costo_pollito_unitario: parseFloat(costoPollito),
     estado: 'ACTIVO'
   }).select().maybeSingle();
   ```

3. Ejecuta callback `onLoteCreado(data)` y cierra el modal.

#### Líneas Genéticas Soportadas

- **ENGORDE**: COBB500, ROSS308, CORAL
- **POSTURA**: HYLINE_BROWN, LOHMAN_BROWN, LEGHORN

---

### Componente: `DashboardLote`

**Ubicación**: `/src/components/DashboardLote.tsx`

**Responsabilidad**: Panel principal que muestra KPIs, comparativas genéticas, costeo y estado del lote.

#### Props

```typescript
interface DashboardLoteProps {
  lote: Lote;
  onRegistrarClick: () => void;
  onFinalizarClick?: () => void;
}
```

#### Estado

```typescript
const [registros, setRegistros] = useState<RegistroDiario[]>([]);
const [costos, setCostos] = useState<CostoLote[]>([]);
const [kpis, setKpis] = useState<KPIResult | null>(null);
const [loading, setLoading] = useState(true);
```

#### Lógica de Negocio

**Función**: `cargarDatos()` (líneas 23-52)

1. Carga `registros_diarios` del lote (ordenados por fecha)
2. Carga `costos_lote` del lote (ordenados por fecha)
3. Calcula KPIs usando `calcularKPIs(lote, registros)`
4. Genera comparaciones usando `generarComparacionEstandar(lote, registros)`

**Cálculos de Edad** (líneas 58-61):
```typescript
const edadDias = lote.fecha_nacimiento
  ? calcularEdadEnDias(lote.fecha_nacimiento)
  : kpis?.edad_dias || 0;

const edadFormateada = lote.fecha_nacimiento
  ? formatearEdad(lote.fecha_nacimiento)  // "3 semanas y 2 días"
  : `${kpis?.edad_dias || 0} días`;

const mostrarAlerta = lote.tipo_produccion === 'ENGORDE'
  && lote.fecha_nacimiento
  && debeAlertarPorEdad(lote.fecha_nacimiento, 42);
```

#### Secciones del Dashboard

1. **Alerta de 42 días** (líneas 83-103)
   - Se muestra cuando el lote tiene >= 39 días (alerta de proximidad a 42 días óptimos)
   - Botón rápido para "Finalizar Lote"

2. **Header del Lote** (líneas 105-133)
   - Nombre del lote (línea genética)
   - Fecha de inicio, aves actuales, edad formateada
   - Botones: "Registrar Datos" y "Finalizar y Vender"

3. **KPIs** (líneas 144-220)
   - **CA Acumulada** (Conversión Alimenticia): Alimento / Peso ganado
   - **IP/FEE** (Índice de Productividad): `(Peso * (100 - Mortalidad%)) / (Días * CA) * 100`
   - **Mortalidad**: Porcentaje y cantidad acumulada
   - **Peso Promedio**: Real vs. objetivo genético

4. **Valoración Financiera NIF C-11** (líneas 223-254)
   - Activo Biológico (costo transformación acumulado)
   - Costo por ave
   - Costo por kg producido

5. **Comparación Real vs. Estándar Genético** (líneas 256-294)
   - Tabla con datos por día de muestreo
   - Peso real vs. peso objetivo
   - CA real vs. CA objetivo

#### Función de Estado de Color

**Función**: `getStatusColor()` (líneas 63-68)

Determina el color del indicador (verde/rojo) según si el valor está dentro del rango objetivo:

```typescript
const getStatusColor = (value: number, target: number, inverse: boolean = false) => {
  const diff = inverse ? target - value : value - target;
  if (Math.abs(diff) <= target * 0.05) return 'text-green-600';  // ±5% es óptimo
  if (diff > 0) return inverse ? 'text-red-600' : 'text-green-600';
  return inverse ? 'text-green-600' : 'text-red-600';
};
```

---

### Componente: `RegistroDiarioForm`

**Ubicación**: `/src/components/RegistroDiarioForm.tsx`

**Responsabilidad**: Formulario modal para registrar datos diarios del lote (mortalidad, alimento, agua, peso, huevos).

#### Props

```typescript
interface RegistroDiarioFormProps {
  lote: Lote;
  onClose: () => void;
  onRegistroCreado: (registro: RegistroDiario) => void;
}
```

#### Estado del Formulario

```typescript
const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
const [mortalidad, setMortalidad] = useState('0');
const [alimento, setAlimento] = useState('');  // Requerido
const [agua, setAgua] = useState('');
const [peso, setPeso] = useState('');  // Opcional (muestreo semanal)
const [huevos, setHuevos] = useState('0');  // Solo para POSTURA
const [observaciones, setObservaciones] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

#### Lógica de Negocio

**Función**: `handleSubmit()` (líneas 22-96)

##### Paso 1: Insertar registro diario (líneas 28-43)

```typescript
const { data: registroData } = await supabase
  .from('registros_diarios')
  .insert({
    lote_id: lote.id,
    fecha,
    mortalidad_diaria: parseInt(mortalidad),
    alimento_consumido_kg: parseFloat(alimento),
    agua_consumida_l: agua ? parseFloat(agua) : 0,
    peso_promedio_g: peso ? parseFloat(peso) : null,
    huevos_producidos: parseInt(huevos),
    observaciones: observaciones || null
  })
  .select()
  .maybeSingle();
```

##### Paso 2: Actualizar mortalidad del lote (líneas 45-53)

Si hay mortalidad > 0, actualiza `num_aves_actual` en tabla `lotes`:

```typescript
if (mortalidadNum > 0) {
  await supabase
    .from('lotes')
    .update({ num_aves_actual: lote.num_aves_actual - mortalidadNum })
    .eq('id', lote.id);
}
```

##### Paso 3: Calcular y registrar costos (líneas 55-86)

**Costo de Alimento** (líneas 55-56):
```typescript
const precioAlimentoKg = 8.5;  // Precio fijo por kg
const costoAlimentoDia = parseFloat(alimento) * precioAlimentoKg;
```

**Costos Indirectos Prorrateados** (líneas 58-66):
```typescript
// Obtener total de aves activas en todos los lotes
const { data: lotesActivos } = await supabase
  .from('lotes')
  .select('num_aves_actual')
  .eq('estado', 'ACTIVO');

const totalAves = lotesActivos?.reduce((sum, l) => sum + l.num_aves_actual, 0) || 1;
const proporcion = lote.num_aves_actual / totalAves;

const costoIndirectoDiario = 500;  // Costo fijo diario de granja
const costoIndirectoProrrateado = costoIndirectoDiario * proporcion;
```

**Costo Transformación Acumulado (NIF C-11)** (líneas 68-77):
```typescript
const { data: ultimoCosto } = await supabase
  .from('costos_lote')
  .select('costo_transformacion_acumulado')
  .eq('lote_id', lote.id)
  .order('fecha', { ascending: false })
  .limit(1)
  .maybeSingle();

const costoAcumuladoAnterior = ultimoCosto?.costo_transformacion_acumulado || 0;
const costoTransformacionAcumulado =
  costoAcumuladoAnterior + costoAlimentoDia + costoIndirectoProrrateado;
```

**Insertar Costo** (líneas 79-86):
```typescript
await supabase.from('costos_lote').insert({
  lote_id: lote.id,
  fecha,
  costo_alimento: costoAlimentoDia,
  costo_vacunas: 0,
  costos_indirectos_prorrateados: costoIndirectoProrrateado,
  costo_transformacion_acumulado: costoTransformacionAcumulado
});
```

#### Campos Condicionales

- **Huevos Producidos** (líneas 187-201): Solo se muestra si `lote.tipo_produccion === 'POSTURA'`

---

### Componente: `FinalizarLote`

**Ubicación**: `/src/components/FinalizarLote.tsx`

**Responsabilidad**: Modal para finalizar un lote y registrar la venta (en vivo, congelado o mixto).

#### Props

```typescript
interface FinalizarLoteProps {
  lote: Lote;
  costoTotal: number;  // Costo transformación acumulado del lote
  pesoPromedioKg: number;  // Peso promedio del último registro
  onClose: () => void;
  onVentaRealizada: () => void;
}
```

#### Estado del Formulario

```typescript
const [tipoVenta, setTipoVenta] = useState<'VIVO' | 'CONGELADO' | 'MIXTO'>('VIVO');
const [cantidadVivo, setCantidadVivo] = useState(lote.num_aves_actual.toString());
const [cantidadCongelado, setCantidadCongelado] = useState('0');
const [precioVivo, setPrecioVivo] = useState('67.00');  // MXN/kg
const [precioCongelado, setPrecioCongelado] = useState('105.00');  // MXN/kg
const [fechaVenta, setFechaVenta] = useState(new Date().toISOString().split('T')[0]);
const [observaciones, setObservaciones] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

#### Lógica de Negocio

**Función**: `calcularIngresos()` (líneas 30-48)

Calcula ingresos, ganancia y margen de ganancia en tiempo real:

```typescript
const calcularIngresos = () => {
  const avesVivo = tipoVenta === 'CONGELADO' ? 0 : parseInt(cantidadVivo || '0');
  const avesCongelado = tipoVenta === 'VIVO' ? 0 : parseInt(cantidadCongelado || '0');
  const pesoTotalKg = (avesVivo + avesCongelado) * pesoPromedioKg;

  const ingresoVivo = avesVivo * pesoPromedioKg * parseFloat(precioVivo);
  const ingresoCongelado = avesCongelado * pesoPromedioKg * parseFloat(precioCongelado);
  const ingresoTotal = ingresoVivo + ingresoCongelado;

  const ganancia = ingresoTotal - costoTotal;
  const margenPorcentaje = (ganancia / costoTotal) * 100;

  return { pesoTotalKg, ingresoTotal, ganancia, margenPorcentaje };
};
```

**Función**: `handleSubmit()` (líneas 50-100)

1. **Validación** (líneas 56-62):
   ```typescript
   const totalAves = avesVivo + avesCongelado;
   if (totalAves > lote.num_aves_actual) {
     throw new Error('La cantidad total de aves excede el número disponible');
   }
   ```

2. **Registrar Venta** (líneas 66-79):
   ```typescript
   await supabase.from('ventas').insert({
     lote_id: lote.id,
     fecha_venta: fechaVenta,
     tipo_venta: tipoVenta,
     cantidad_aves_vivo: avesVivo,
     cantidad_aves_congelado: avesCongelado,
     peso_total_kg: pesoTotalKg,
     precio_vivo_por_kg: parseFloat(precioVivo),
     precio_congelado_por_kg: parseFloat(precioCongelado),
     ingreso_total: ingresoTotal,
     costo_total: costoTotal,
     ganancia_neta: ganancia,
     observaciones: observaciones || null
   });
   ```

3. **Finalizar Lote** (líneas 83-89):
   ```typescript
   await supabase
     .from('lotes')
     .update({
       estado: 'FINALIZADO',
       fecha_finalizacion: fechaVenta
     })
     .eq('id', lote.id);
   ```

4. Ejecutar callback `onVentaRealizada()` y cerrar modal.

#### Resumen Financiero en Tiempo Real

El componente muestra un resumen financiero que se actualiza automáticamente al cambiar los valores del formulario (líneas 242-272):

- Peso Total (kg)
- Ingreso Total (MXN)
- Costo Total (MXN)
- Ganancia Neta (MXN y %)

---

### Componente: `Ventas`

**Ubicación**: `/src/components/Ventas.tsx`

**Responsabilidad**: Vista de historial de ventas con resumen financiero agregado.

#### Estado

```typescript
const [ventas, setVentas] = useState<(Venta & { lote?: Lote })[]>([]);
const [loading, setLoading] = useState(true);
```

#### Lógica de Negocio

**Función**: `cargarVentas()` (líneas 13-40)

1. Carga todas las ventas ordenadas por fecha descendente:
   ```typescript
   const { data: ventasData } = await supabase
     .from('ventas')
     .select('*')
     .order('fecha_venta', { ascending: false });
   ```

2. Para cada venta, obtiene el lote asociado (JOIN manual):
   ```typescript
   const ventasConLotes = await Promise.all(
     ventasData.map(async (venta) => {
       const { data: loteData } = await supabase
         .from('lotes')
         .select('*')
         .eq('id', venta.lote_id)
         .maybeSingle();

       return { ...venta, lote: loteData } as Venta & { lote?: Lote };
     })
   );
   ```

**Cálculo de Totales** (líneas 42-49):

```typescript
const totales = ventas.reduce(
  (acc, venta) => ({
    ingresos: acc.ingresos + venta.ingreso_total,
    costos: acc.costos + venta.costo_total,
    ganancias: acc.ganancias + venta.ganancia_neta
  }),
  { ingresos: 0, costos: 0, ganancias: 0 }
);
```

#### Estructura de la Vista

1. **Tarjetas de Resumen** (líneas 61-94)
   - Ingresos Totales (azul)
   - Costos Totales (naranja)
   - Ganancias Netas + Margen % (verde)

2. **Tabla de Ventas** (líneas 96-176)

Columnas:
- Fecha
- Lote (línea genética)
- Tipo Venta (badge con color)
- Cantidad (aves)
- Peso (kg)
- Ingreso (MXN)
- Ganancia (MXN, color verde/rojo según signo)

---

## Servicios y Lógica de Negocio

### Servicio: `supabase.ts`

**Ubicación**: `/src/lib/supabase.ts`

**Responsabilidad**: Cliente de Supabase e interfaces TypeScript de todas las entidades.

#### Inicialización del Cliente

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Variables de Entorno Requeridas**:
- `VITE_SUPABASE_URL`: URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave pública (anon) de Supabase

#### Interfaces Exportadas

Ver sección [Base de Datos](#base-de-datos) para detalles de cada interface.

---

### Servicio: `calculations.ts`

**Ubicación**: `/src/lib/calculations.ts`

**Responsabilidad**: Cálculos de KPIs avícolas, comparativas genéticas y costeo.

---

#### Función: `calcularKPIs()`

**Ubicación**: `/src/lib/calculations.ts:22-76`

**Firma**:
```typescript
function calcularKPIs(
  lote: Lote,
  registros: RegistroDiario[]
): KPIResult | null
```

**Retorna**:
```typescript
interface KPIResult {
  edad_dias: number;
  ca_acumulada: number;              // Conversión Alimenticia
  mortalidad_acumulada: number;
  mortalidad_porcentaje: number;
  peso_total_ganado_kg: number;
  alimento_total_consumido_kg: number;
  ip_fee: number;                    // Índice de Productividad / FEE
  aves_actuales: number;
}
```

**Algoritmo**:

1. **Validación**: Retorna `null` si no hay registros.

2. **Cálculo de Edad** (líneas 34-39):
   ```typescript
   const fechaInicio = new Date(lote.fecha_inicio);
   const ultimoRegistro = registrosOrdenados[registrosOrdenados.length - 1];
   const fechaUltima = new Date(ultimoRegistro.fecha);
   const edadDias = Math.floor(
     (fechaUltima.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
   );
   ```

3. **Acumulación de Datos** (líneas 41-48):
   ```typescript
   const mortalidadTotal = registrosOrdenados.reduce(
     (sum, r) => sum + r.mortalidad_diaria, 0
   );
   const alimentoTotalKg = registrosOrdenados.reduce(
     (sum, r) => sum + r.alimento_consumido_kg, 0
   );
   ```

4. **Cálculo de Conversión Alimenticia (CA)** (líneas 50-60):
   ```typescript
   const avesActuales = lote.num_aves_inicial - mortalidadTotal;
   const pesoPromedioActualG = ultimoRegistro.peso_promedio_g || 0;
   const pesoPromedioActualKg = pesoPromedioActualG / 1000;
   const pesoTotalGanadoKg = pesoPromedioActualKg * avesActuales;

   const caAcumulada = pesoTotalGanadoKg > 0
     ? alimentoTotalKg / pesoTotalGanadoKg
     : 0;
   ```

   **Fórmula**: `CA = Alimento Total Consumido / Peso Total Ganado`

   **Interpretación**:
   - CA óptima en engorde: 1.5 - 1.8
   - Menor CA = mejor eficiencia (menos alimento por kg de carne)

5. **Cálculo de Índice de Productividad (IP/FEE)** (líneas 62-64):
   ```typescript
   const ipFee = edadDias > 0 && caAcumulada > 0
     ? (pesoPromedioActualKg * (100 - mortalidadPorcentaje)) / (edadDias * caAcumulada) * 100
     : 0;
   ```

   **Fórmula**: `IP = (Peso Promedio * (100 - % Mortalidad)) / (Edad * CA) * 100`

   **Interpretación**:
   - IP óptimo: > 300
   - Considera peso, mortalidad, edad y conversión alimenticia

---

#### Función: `obtenerEstandarGenetico()`

**Ubicación**: `/src/lib/calculations.ts:78-105`

**Firma**:
```typescript
function obtenerEstandarGenetico(
  lineaGenetica: string,
  dia: number
): { peso: number; ca: number } | null
```

**Responsabilidad**: Retorna el estándar genético (peso en gramos y CA) para una línea genética en un día específico.

**Estándares Definidos** (líneas 82-97):

```typescript
const estandares: Record<string, Record<number, { peso: number; ca: number }>> = {
  COBB500: {
    7:  { peso: 180,  ca: 0.891 },
    14: { peso: 570,  ca: 1.029 },
    21: { peso: 1116, ca: 1.182 },
    28: { peso: 1783, ca: 1.322 },
    35: { peso: 2521, ca: 1.441 }
  },
  ROSS308: {
    7:  { peso: 202,  ca: 0.900 },
    14: { peso: 588,  ca: 1.050 },
    21: { peso: 1320, ca: 1.250 },
    28: { peso: 2359, ca: 1.400 },
    35: { peso: 3635, ca: 1.550 }
  }
};
```

**Algoritmo de Búsqueda** (líneas 99-102):

Encuentra el día de referencia más cercano (7, 14, 21, 28 o 35):

```typescript
const dias = [7, 14, 21, 28, 35];
const diaRef = dias.reduce((prev, curr) =>
  Math.abs(curr - dia) < Math.abs(prev - dia) ? curr : prev
);
```

**Ejemplo**:
- Si `dia = 10`, retorna estándar del día 7
- Si `dia = 25`, retorna estándar del día 28

---

#### Función: `generarComparacionEstandar()`

**Ubicación**: `/src/lib/calculations.ts:107-147`

**Firma**:
```typescript
function generarComparacionEstandar(
  lote: Lote,
  registros: RegistroDiario[]
): ComparacionEstandar[]
```

**Retorna**:
```typescript
interface ComparacionEstandar {
  dia: number;
  peso_real: number;      // Peso promedio real en gramos
  peso_objetivo: number;  // Peso objetivo según genética
  ca_real: number;        // CA real acumulada
  ca_objetivo: number;    // CA objetivo según genética
}
```

**Algoritmo**:

1. Ordena registros por fecha (líneas 111-114).

2. Para cada registro con `peso_promedio_g` válido:

   a. **Calcula día** (líneas 125-127):
   ```typescript
   const fecha = new Date(registro.fecha);
   const dia = Math.floor(
     (fecha.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
   );
   ```

   b. **Calcula CA real** (líneas 130-132):
   ```typescript
   const avesActuales = lote.num_aves_inicial - mortalidadAcumulada;
   const pesoTotalKg = (registro.peso_promedio_g / 1000) * avesActuales;
   const caReal = pesoTotalKg > 0 ? alimentoAcumulado / pesoTotalKg : 0;
   ```

   c. **Obtiene estándar genético**:
   ```typescript
   const estandar = obtenerEstandarGenetico(lote.linea_genetica, dia);
   ```

   d. **Crea entrada de comparación** (líneas 136-143).

**Uso**: Este array se utiliza en `DashboardLote` para mostrar la tabla comparativa entre valores reales y objetivos.

---

#### Función: `calcularCostoTransformacion()`

**Ubicación**: `/src/lib/calculations.ts:149-169`

**Firma**:
```typescript
function calcularCostoTransformacion(
  lote: Lote,
  registros: RegistroDiario[],
  precioAlimentoKg: number,
  costoIndirectoDiario: number,
  totalAvesGranja: number
): number
```

**Responsabilidad**: Calcula el costo total de transformación del lote siguiendo la NIF C-11 (Activos Biológicos).

**Fórmula del Costo de Transformación (NIF C-11)**:

```
Costo Total = Costo Pollitos + Costo Alimento + Costos Indirectos Prorrateados
```

**Componentes**:

1. **Costo de Alimento** (líneas 156-162):
   ```typescript
   const alimentoTotalKg = registros.reduce(
     (sum, r) => sum + r.alimento_consumido_kg, 0
   );
   const costoAlimento = alimentoTotalKg * precioAlimentoKg;
   ```

2. **Costo de Pollitos**:
   ```typescript
   const costoPollitos = lote.num_aves_inicial * lote.costo_pollito_unitario;
   ```

3. **Costos Indirectos Prorrateados** (líneas 164-166):
   ```typescript
   const avesActuales = lote.num_aves_actual;
   const proporcionAves = totalAvesGranja > 0 ? avesActuales / totalAvesGranja : 1;
   const costoIndirectoProrrateado = costoIndirectoDiario * registros.length * proporcionAves;
   ```

   **Prorrateo**: Los costos indirectos (luz, agua, mano de obra, etc.) se distribuyen proporcionalmente según el número de aves de cada lote.

4. **Suma Total**:
   ```typescript
   return costoPollitos + costoAlimento + costoIndirectoProrrateado;
   ```

**Nota**: Esta función se usa principalmente para validación. El cálculo real se hace en `RegistroDiarioForm` de manera incremental (acumulativa) en cada registro diario.

---

### Servicio: `ageUtils.ts`

**Ubicación**: `/src/lib/ageUtils.ts`

**Responsabilidad**: Utilidades para cálculo y formato de edad de las aves.

---

#### Función: `calcularEdadEnDias()`

**Ubicación**: `/src/lib/ageUtils.ts:1-6`

**Firma**:
```typescript
function calcularEdadEnDias(fechaNacimiento: string | Date): number
```

**Algoritmo**:
```typescript
const nacimiento = new Date(fechaNacimiento);
const hoy = new Date();
const diferencia = hoy.getTime() - nacimiento.getTime();
return Math.floor(diferencia / (1000 * 60 * 60 * 24));
```

**Ejemplo**:
- Fecha nacimiento: `2025-10-01`
- Hoy: `2025-10-27`
- Resultado: `26 días`

---

#### Función: `calcularEdadEnSemanas()`

**Ubicación**: `/src/lib/ageUtils.ts:8-11`

**Firma**:
```typescript
function calcularEdadEnSemanas(fechaNacimiento: string | Date): number
```

**Algoritmo**:
```typescript
const dias = calcularEdadEnDias(fechaNacimiento);
return Math.floor(dias / 7);
```

---

#### Función: `formatearEdad()`

**Ubicación**: `/src/lib/ageUtils.ts:13-27`

**Firma**:
```typescript
function formatearEdad(fechaNacimiento: string | Date): string
```

**Responsabilidad**: Formatea la edad de manera legible en español.

**Algoritmo**:
```typescript
const dias = calcularEdadEnDias(fechaNacimiento);
const semanas = Math.floor(dias / 7);
const diasRestantes = dias % 7;

if (semanas === 0) {
  return `${dias} ${dias === 1 ? 'día' : 'días'}`;
}

if (diasRestantes === 0) {
  return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
}

return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'} y ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}`;
```

**Ejemplos**:
- 5 días → `"5 días"`
- 14 días → `"2 semanas"`
- 26 días → `"3 semanas y 5 días"`

---

#### Función: `calcularFechaNacimiento()`

**Ubicación**: `/src/lib/ageUtils.ts:29-34`

**Firma**:
```typescript
function calcularFechaNacimiento(
  fechaActual: string | Date,
  edadEnSemanas: number
): Date
```

**Responsabilidad**: Calcula la fecha de nacimiento retrospectivamente a partir de una edad conocida.

**Algoritmo**:
```typescript
const fecha = new Date(fechaActual);
const diasARestar = edadEnSemanas * 7;
fecha.setDate(fecha.getDate() - diasARestar);
return fecha;
```

**Uso**: Se utiliza en `CrearLote` cuando se crea un lote de POSTURA con edad conocida (ejemplo: gallinas de 10 semanas).

**Ejemplo**:
- Fecha actual: `2025-10-27`
- Edad en semanas: `10`
- Fecha nacimiento calculada: `2025-08-18` (70 días antes)

---

#### Función: `debeAlertarPorEdad()`

**Ubicación**: `/src/lib/ageUtils.ts:36-39`

**Firma**:
```typescript
function debeAlertarPorEdad(
  fechaNacimiento: string | Date,
  diasObjetivo: number = 42
): boolean
```

**Responsabilidad**: Determina si se debe mostrar una alerta de proximidad al día objetivo (por defecto 42 días para engorde).

**Algoritmo**:
```typescript
const dias = calcularEdadEnDias(fechaNacimiento);
return dias >= diasObjetivo - 3;  // Alerta a partir del día 39
```

**Ejemplo**:
- Día objetivo: `42`
- Alerta comienza: `día 39`
- Si edad >= 39 días → retorna `true` (mostrar alerta)

**Uso**: En `DashboardLote` para mostrar la alerta naranja cuando el lote se acerca a los 42 días (edad óptima para venta de pollos de engorde).

---

## Flujos de Datos

### Flujo 1: Crear Nuevo Lote

```
┌─────────────────────────────────────────────────────────┐
│ USUARIO: Click en "Nuevo Lote"                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ App.tsx: setMostrarCrearLote(true)                     │
│ → Renderiza <CrearLote />                              │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ CrearLote.tsx: Usuario completa formulario             │
│ - Tipo: ENGORDE / POSTURA                              │
│ - Línea genética                                        │
│ - Fecha inicio                                          │
│ - Edad (opcional, solo POSTURA)                        │
│ - Número aves                                           │
│ - Costo pollito                                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ CrearLote.tsx: handleSubmit()                          │
│                                                         │
│ SI tipo = ENGORDE:                                      │
│   fecha_nacimiento = fecha_inicio                       │
│                                                         │
│ SI tipo = POSTURA y edadSemanas ingresada:             │
│   fecha_nacimiento = fecha_inicio - (edadSemanas * 7)  │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Supabase: INSERT INTO lotes                             │
│ {                                                       │
│   tipo_produccion: 'ENGORDE',                          │
│   linea_genetica: 'COBB500',                           │
│   fecha_inicio: '2025-10-27',                          │
│   fecha_nacimiento: '2025-10-27',                      │
│   num_aves_inicial: 1000,                              │
│   num_aves_actual: 1000,                               │
│   costo_pollito_unitario: 12.50,                       │
│   estado: 'ACTIVO'                                      │
│ }                                                       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ App.tsx: handleLoteCreado(nuevoLote)                   │
│ → setLotes([nuevoLote, ...lotes])                      │
│ → setLoteSeleccionado(nuevoLote)                       │
│ → setMostrarCrearLote(false)                           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ RESULTADO: Lote creado y visible en dashboard          │
└─────────────────────────────────────────────────────────┘
```

---

### Flujo 2: Registrar Datos Diarios

```
┌─────────────────────────────────────────────────────────┐
│ USUARIO: Click en "Registrar Datos" en DashboardLote   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ App.tsx: setMostrarRegistro(true)                      │
│ → Renderiza <RegistroDiarioForm lote={loteSeleccionado} />
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ RegistroDiarioForm: Usuario ingresa datos diarios      │
│ - Fecha                                                 │
│ - Mortalidad diaria                                     │
│ - Alimento consumido (kg) *                            │
│ - Agua consumida (litros)                              │
│ - Peso promedio (gramos) - opcional                    │
│ - Huevos producidos (solo POSTURA)                     │
│ - Observaciones                                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ RegistroDiarioForm: handleSubmit()                     │
│                                                         │
│ PASO 1: Insertar registro diario                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: INSERT INTO registros_diarios         │   │
│ │ {                                                │   │
│ │   lote_id: '...',                               │   │
│ │   fecha: '2025-10-27',                          │   │
│ │   mortalidad_diaria: 2,                         │   │
│ │   alimento_consumido_kg: 45.5,                  │   │
│ │   agua_consumida_l: 80,                         │   │
│ │   peso_promedio_g: 1200,                        │   │
│ │   huevos_producidos: 0,                         │   │
│ │   observaciones: 'Vacuna Newcastle'             │   │
│ │ }                                                │   │
│ └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 2: Actualizar mortalidad en lote (si hay)         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ SI mortalidad_diaria > 0:                       │   │
│ │   Supabase: UPDATE lotes                        │   │
│ │   SET num_aves_actual = 1000 - 2 = 998          │   │
│ │   WHERE id = lote.id                            │   │
│ └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 3: Calcular costos                                │
│                                                         │
│ Costo alimento = 45.5 kg * $8.50/kg = $386.75         │
│                                                         │
│ Obtener total aves activas:                            │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: SELECT num_aves_actual                │   │
│ │ FROM lotes WHERE estado = 'ACTIVO'              │   │
│ │ → Total: 2500 aves                              │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Prorrateo:                                              │
│   proporcion = 998 / 2500 = 0.3992                     │
│   costo_indirecto = $500 * 0.3992 = $199.60           │
│                                                         │
│ Obtener costo acumulado anterior:                      │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: SELECT costo_transformacion_acumulado │   │
│ │ FROM costos_lote                                 │   │
│ │ WHERE lote_id = '...'                           │   │
│ │ ORDER BY fecha DESC LIMIT 1                     │   │
│ │ → Anterior: $5,000.00                           │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Costo acumulado nuevo:                                  │
│   $5,000.00 + $386.75 + $199.60 = $5,586.35           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 4: Insertar costo                                 │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: INSERT INTO costos_lote               │   │
│ │ {                                                │   │
│ │   lote_id: '...',                               │   │
│ │   fecha: '2025-10-27',                          │   │
│ │   costo_alimento: 386.75,                       │   │
│ │   costo_vacunas: 0,                             │   │
│ │   costos_indirectos_prorrateados: 199.60,       │   │
│ │   costo_transformacion_acumulado: 5586.35       │   │
│ │ }                                                │   │
│ └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ App.tsx: handleRegistroCreado()                        │
│ → cargarLotes() (refresca datos)                       │
│ → setMostrarRegistro(false)                            │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ DashboardLote: cargarDatos()                           │
│ → Obtiene registros_diarios                            │
│ → Obtiene costos_lote                                  │
│ → Calcula KPIs                                          │
│ → Genera comparaciones con estándares                  │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ RESULTADO: KPIs actualizados en dashboard              │
│ - CA Acumulada                                          │
│ - IP/FEE                                                │
│ - Mortalidad %                                          │
│ - Peso Promedio vs. Objetivo                           │
│ - Costo Total Acumulado                                │
└─────────────────────────────────────────────────────────┘
```

---

### Flujo 3: Finalizar Lote y Vender

```
┌─────────────────────────────────────────────────────────┐
│ USUARIO: Click en "Finalizar y Vender"                 │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ App.tsx: handleFinalizarClick()                        │
│                                                         │
│ Obtener costo total:                                    │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: SELECT costo_transformacion_acumulado │   │
│ │ FROM costos_lote                                 │   │
│ │ WHERE lote_id = '...'                           │   │
│ │ ORDER BY fecha DESC LIMIT 1                     │   │
│ │ → Costo Total: $25,000.00                       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Obtener peso promedio:                                  │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: SELECT peso_promedio_g                │   │
│ │ FROM registros_diarios                           │   │
│ │ WHERE lote_id = '...'                           │   │
│ │ ORDER BY fecha DESC LIMIT 1                     │   │
│ │ → Peso: 2500g = 2.5 kg                          │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ → setCostoTotalLote($25,000.00)                        │
│ → setPesoPromedioLote(2.5)                             │
│ → setMostrarFinalizar(true)                            │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ FinalizarLote: Usuario ingresa datos de venta          │
│ - Fecha venta: 2025-10-27                              │
│ - Tipo venta: VIVO                                      │
│ - Cantidad aves vivo: 998                              │
│ - Precio vivo/kg: $67.00                               │
│                                                         │
│ Cálculo en tiempo real (calcularIngresos):             │
│   Peso total = 998 aves * 2.5 kg = 2,495 kg           │
│   Ingreso = 2,495 kg * $67.00 = $167,165.00           │
│   Ganancia = $167,165.00 - $25,000.00 = $142,165.00   │
│   Margen = (142,165 / 25,000) * 100 = 568.7%          │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ FinalizarLote: handleSubmit()                          │
│                                                         │
│ PASO 1: Validar cantidad de aves                       │
│   998 <= 998 ✓                                          │
│                                                         │
│ PASO 2: Insertar venta                                 │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: INSERT INTO ventas                    │   │
│ │ {                                                │   │
│ │   lote_id: '...',                               │   │
│ │   fecha_venta: '2025-10-27',                    │   │
│ │   tipo_venta: 'VIVO',                           │   │
│ │   cantidad_aves_vivo: 998,                      │   │
│ │   cantidad_aves_congelado: 0,                   │   │
│ │   peso_total_kg: 2495,                          │   │
│ │   precio_vivo_por_kg: 67.00,                    │   │
│ │   precio_congelado_por_kg: 105.00,              │   │
│ │   ingreso_total: 167165.00,                     │   │
│ │   costo_total: 25000.00,                        │   │
│ │   ganancia_neta: 142165.00,                     │   │
│ │   observaciones: null                            │   │
│ │ }                                                │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ PASO 3: Finalizar lote                                 │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: UPDATE lotes                          │   │
│ │ SET estado = 'FINALIZADO',                      │   │
│ │     fecha_finalizacion = '2025-10-27'           │   │
│ │ WHERE id = '...'                                │   │
│ └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ App.tsx: handleVentaRealizada()                        │
│ → cargarLotes() (lote ya no aparece en activos)        │
│ → setMostrarFinalizar(false)                           │
│ → setLoteSeleccionado(null)                            │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ RESULTADO: Lote finalizado, venta registrada           │
│ - Lote desaparece de "Lotes Activos"                   │
│ - Venta aparece en vista "Ventas"                      │
└─────────────────────────────────────────────────────────┘
```

---

### Flujo 4: Ver Historial de Ventas

```
┌─────────────────────────────────────────────────────────┐
│ USUARIO: Click en "Ventas" en navegación               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ App.tsx: setVista('ventas')                            │
│ → Renderiza <Ventas />                                 │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Ventas.tsx: cargarVentas()                             │
│                                                         │
│ PASO 1: Obtener ventas                                 │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: SELECT *                              │   │
│ │ FROM ventas                                      │   │
│ │ ORDER BY fecha_venta DESC                       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ PASO 2: Para cada venta, obtener lote asociado         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Supabase: SELECT *                              │   │
│ │ FROM lotes                                       │   │
│ │ WHERE id = venta.lote_id                        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ → ventasConLotes = [...ventas con datos de lote]       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Ventas.tsx: Calcular totales (reduce)                  │
│                                                         │
│ totales = {                                             │
│   ingresos: $350,000.00,                               │
│   costos: $120,000.00,                                 │
│   ganancias: $230,000.00                               │
│ }                                                       │
│                                                         │
│ Margen = (230,000 / 120,000) * 100 = 191.7%           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ RESULTADO: Vista de ventas con:                        │
│ - Tarjetas de resumen (ingresos, costos, ganancias)    │
│ - Tabla de ventas ordenada por fecha                   │
│ - Cada fila muestra:                                    │
│   * Fecha                                               │
│   * Lote (línea genética)                              │
│   * Tipo venta (badge con color)                       │
│   * Cantidad de aves                                    │
│   * Peso total                                          │
│   * Ingreso                                             │
│   * Ganancia (verde/rojo según signo)                  │
└─────────────────────────────────────────────────────────┘
```

---

## API y Endpoints

### Cliente Supabase

El proyecto utiliza el cliente de Supabase para comunicarse con la base de datos PostgreSQL mediante REST API.

**Inicialización**: `/src/lib/supabase.ts:10`

```typescript
export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

### Endpoints de Supabase (REST)

Supabase expone automáticamente endpoints REST para cada tabla. A continuación se documentan los endpoints utilizados en el proyecto:

---

#### Tabla: `lotes`

##### GET - Listar lotes activos

**Uso**: `/src/App.tsx:30-34`

```typescript
const { data } = await supabase
  .from('lotes')
  .select('*')
  .eq('estado', 'ACTIVO')
  .order('fecha_inicio', { ascending: false });
```

**Equivalente REST**:
```
GET /rest/v1/lotes?estado=eq.ACTIVO&order=fecha_inicio.desc
```

**Respuesta**:
```json
[
  {
    "id": "uuid",
    "tipo_produccion": "ENGORDE",
    "linea_genetica": "COBB500",
    "fecha_inicio": "2025-10-27",
    "fecha_nacimiento": "2025-10-27T00:00:00Z",
    "num_aves_inicial": 1000,
    "num_aves_actual": 998,
    "costo_pollito_unitario": 12.50,
    "estado": "ACTIVO",
    "fecha_finalizacion": null,
    "alerta_42_dias": false,
    "created_at": "2025-10-27T12:00:00Z"
  }
]
```

---

##### POST - Crear nuevo lote

**Uso**: `/src/components/CrearLote.tsx:36-49`

```typescript
const { data, error } = await supabase
  .from('lotes')
  .insert({
    tipo_produccion: tipo,
    linea_genetica: lineaGenetica,
    fecha_inicio: fechaInicio,
    fecha_nacimiento: fechaNacimiento?.toISOString() || null,
    num_aves_inicial: parseInt(numAves),
    num_aves_actual: parseInt(numAves),
    costo_pollito_unitario: parseFloat(costoPollito),
    estado: 'ACTIVO'
  })
  .select()
  .maybeSingle();
```

**Equivalente REST**:
```
POST /rest/v1/lotes
Content-Type: application/json
Prefer: return=representation
```

**Request Body**:
```json
{
  "tipo_produccion": "ENGORDE",
  "linea_genetica": "COBB500",
  "fecha_inicio": "2025-10-27",
  "fecha_nacimiento": "2025-10-27T00:00:00Z",
  "num_aves_inicial": 1000,
  "num_aves_actual": 1000,
  "costo_pollito_unitario": 12.50,
  "estado": "ACTIVO"
}
```

---

##### PATCH - Actualizar lote (mortalidad)

**Uso**: `/src/components/RegistroDiarioForm.tsx:47-50`

```typescript
const { error } = await supabase
  .from('lotes')
  .update({ num_aves_actual: lote.num_aves_actual - mortalidadNum })
  .eq('id', lote.id);
```

**Equivalente REST**:
```
PATCH /rest/v1/lotes?id=eq.{lote_id}
```

**Request Body**:
```json
{
  "num_aves_actual": 998
}
```

---

##### PATCH - Finalizar lote

**Uso**: `/src/components/FinalizarLote.tsx:83-89`

```typescript
const { error } = await supabase
  .from('lotes')
  .update({
    estado: 'FINALIZADO',
    fecha_finalizacion: fechaVenta
  })
  .eq('id', lote.id);
```

**Request Body**:
```json
{
  "estado": "FINALIZADO",
  "fecha_finalizacion": "2025-10-27"
}
```

---

#### Tabla: `registros_diarios`

##### GET - Obtener registros de un lote

**Uso**: `/src/components/DashboardLote.tsx:26-30`

```typescript
const { data: registrosData } = await supabase
  .from('registros_diarios')
  .select('*')
  .eq('lote_id', lote.id)
  .order('fecha', { ascending: true });
```

**Equivalente REST**:
```
GET /rest/v1/registros_diarios?lote_id=eq.{lote_id}&order=fecha.asc
```

---

##### POST - Crear registro diario

**Uso**: `/src/components/RegistroDiarioForm.tsx:28-42`

```typescript
const { data, error } = await supabase
  .from('registros_diarios')
  .insert({
    lote_id: lote.id,
    fecha,
    mortalidad_diaria: parseInt(mortalidad),
    alimento_consumido_kg: parseFloat(alimento),
    agua_consumida_l: agua ? parseFloat(agua) : 0,
    peso_promedio_g: peso ? parseFloat(peso) : null,
    huevos_producidos: parseInt(huevos),
    observaciones: observaciones || null
  })
  .select()
  .maybeSingle();
```

**Request Body**:
```json
{
  "lote_id": "uuid",
  "fecha": "2025-10-27",
  "mortalidad_diaria": 2,
  "alimento_consumido_kg": 45.5,
  "agua_consumida_l": 80.0,
  "peso_promedio_g": 1200.0,
  "huevos_producidos": 0,
  "observaciones": "Vacuna Newcastle"
}
```

---

#### Tabla: `costos_lote`

##### GET - Obtener costos de un lote

**Uso**: `/src/components/DashboardLote.tsx:32-36`

```typescript
const { data: costosData } = await supabase
  .from('costos_lote')
  .select('*')
  .eq('lote_id', lote.id)
  .order('fecha', { ascending: true });
```

---

##### GET - Obtener último costo acumulado

**Uso**: `/src/components/RegistroDiarioForm.tsx:68-74`

```typescript
const { data: ultimoCosto } = await supabase
  .from('costos_lote')
  .select('costo_transformacion_acumulado')
  .eq('lote_id', lote.id)
  .order('fecha', { ascending: false })
  .limit(1)
  .maybeSingle();
```

**Equivalente REST**:
```
GET /rest/v1/costos_lote?lote_id=eq.{lote_id}&select=costo_transformacion_acumulado&order=fecha.desc&limit=1
```

---

##### POST - Crear registro de costo

**Uso**: `/src/components/RegistroDiarioForm.tsx:79-86`

```typescript
await supabase.from('costos_lote').insert({
  lote_id: lote.id,
  fecha,
  costo_alimento: costoAlimentoDia,
  costo_vacunas: 0,
  costos_indirectos_prorrateados: costoIndirectoProrrateado,
  costo_transformacion_acumulado: costoTransformacionAcumulado
});
```

---

#### Tabla: `ventas`

##### GET - Listar todas las ventas

**Uso**: `/src/components/Ventas.tsx:16-19`

```typescript
const { data: ventasData } = await supabase
  .from('ventas')
  .select('*')
  .order('fecha_venta', { ascending: false });
```

**Equivalente REST**:
```
GET /rest/v1/ventas?order=fecha_venta.desc
```

---

##### POST - Registrar venta

**Uso**: `/src/components/FinalizarLote.tsx:66-79`

```typescript
const { error } = await supabase.from('ventas').insert({
  lote_id: lote.id,
  fecha_venta: fechaVenta,
  tipo_venta: tipoVenta,
  cantidad_aves_vivo: avesVivo,
  cantidad_aves_congelado: avesCongelado,
  peso_total_kg: pesoTotalKg,
  precio_vivo_por_kg: parseFloat(precioVivo),
  precio_congelado_por_kg: parseFloat(precioCongelado),
  ingreso_total: ingresoTotal,
  costo_total: costoTotal,
  ganancia_neta: ganancia,
  observaciones: observaciones || null
});
```

**Request Body**:
```json
{
  "lote_id": "uuid",
  "fecha_venta": "2025-10-27",
  "tipo_venta": "VIVO",
  "cantidad_aves_vivo": 998,
  "cantidad_aves_congelado": 0,
  "peso_total_kg": 2495.0,
  "precio_vivo_por_kg": 67.00,
  "precio_congelado_por_kg": 105.00,
  "ingreso_total": 167165.00,
  "costo_total": 25000.00,
  "ganancia_neta": 142165.00,
  "observaciones": null
}
```

---

### Autenticación y Seguridad

Actualmente el proyecto utiliza políticas RLS permisivas que permiten acceso anónimo (para MVP):

```sql
CREATE POLICY "Permitir lectura de lotes"
  ON lotes FOR SELECT
  TO anon, authenticated
  USING (true);
```

**IMPORTANTE**: En producción se debe:

1. **Implementar autenticación**:
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password'
   });
   ```

2. **Restringir políticas RLS**:
   ```sql
   CREATE POLICY "Users can only see their own lotes"
     ON lotes FOR SELECT
     TO authenticated
     USING (auth.uid() = user_id);
   ```

3. **Agregar columna `user_id`** a todas las tablas para multi-tenancy.

---

## Configuración y Despliegue

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Obtener credenciales de Supabase**:
1. Ir a https://app.supabase.com
2. Seleccionar proyecto
3. Settings → API
4. Copiar "Project URL" y "anon/public key"

---

### Instalación Local

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd Gestion_Avicola

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Aplicar migraciones de base de datos
# (Ir a Supabase Dashboard → SQL Editor)
# Ejecutar archivos en orden:
# - supabase/migrations/20251026042651_create_poultry_management_schema.sql
# - supabase/migrations/20251027172611_add_sales_and_age_tracking.sql

# 5. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

### Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **dev** | `npm run dev` | Inicia servidor de desarrollo con Vite |
| **build** | `npm run build` | Genera build de producción en `/dist` |
| **preview** | `npm run preview` | Previsualiza build de producción localmente |
| **lint** | `npm run lint` | Ejecuta ESLint para análisis de código |
| **typecheck** | `npm run typecheck` | Verifica tipos TypeScript sin compilar |

---

### Build de Producción

```bash
# 1. Generar build
npm run build

# 2. El output estará en /dist
# Archivos generados:
# - index.html
# - assets/index-*.js (JavaScript bundle)
# - assets/index-*.css (CSS bundle)

# 3. Preview local (opcional)
npm run preview
```

---

### Despliegue

#### Opción 1: Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar variables de entorno en Vercel Dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

#### Opción 2: Netlify

```bash
# Build command: npm run build
# Publish directory: dist

# Variables de entorno (Netlify Dashboard):
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

#### Opción 3: Servidor Propio (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/Gestion_Avicola/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### Configuración de TypeScript

**tsconfig.json** (Principal):
- Modo estricto activado
- Target: ES2020
- Módulos: ESNext

**tsconfig.app.json** (Aplicación):
- Incluye: src/**
- Librerías: DOM, DOM.Iterable, ES2020

**tsconfig.node.json** (Configuración de Vite):
- Target: ES2022
- Módulos: ESNext

---

### Configuración de Vite

**vite.config.ts**:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
```

---

### Configuración de Tailwind CSS

**tailwind.config.js**:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## Conclusión

Este sistema proporciona una solución completa para la gestión de producción avícola con las siguientes características principales:

- Control de lotes de engorde y postura
- Registro diario de datos productivos
- Cálculo automático de KPIs (CA, IP/FEE, mortalidad)
- Comparación con estándares genéticos
- Costeo según NIF C-11 (Activos Biológicos)
- Gestión de ventas y análisis financiero
- Alertas de proximidad a edad óptima de venta

La arquitectura modular facilita el mantenimiento y la extensión del sistema con nuevas funcionalidades.

---

**Documentación generada**: 2025-10-27
**Versión del sistema**: 0.0.0
**Autor**: Sistema de Gestión Avícola
