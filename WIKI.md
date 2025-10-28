# Wiki - Sistema de Gestión Avícola

## Tabla de Contenidos

1. [Inicio](#inicio)
2. [Guía de Usuario](#guía-de-usuario)
3. [Conceptos Clave](#conceptos-clave)
4. [Preguntas Frecuentes (FAQ)](#preguntas-frecuentes-faq)
5. [Glosario de Términos](#glosario-de-términos)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Resolución de Problemas](#resolución-de-problemas)
8. [Referencias Técnicas](#referencias-técnicas)

---

## Inicio

### ¿Qué es el Sistema de Gestión Avícola?

El **Sistema de Gestión Avícola** es una aplicación web diseñada para el control integral de la producción avícola, especializada en:

- Pollo de engorde (broilers)
- Gallinas de postura (layers)

### Objetivos del Sistema

1. **Control de Eficiencia**: Monitoreo de indicadores clave de desempeño (KPIs)
2. **Cumplimiento Normativo**: Costeo según NIF C-11 (Activos Biológicos)
3. **Comparación Genética**: Análisis de desempeño real vs. estándares genéticos
4. **Gestión Financiera**: Control de costos, ingresos y rentabilidad

### Características Principales

- Gestión de múltiples lotes simultáneos
- Registro diario de datos productivos
- Cálculo automático de KPIs (CA, IP/FEE, mortalidad)
- Alertas de edad óptima de venta
- Historial de ventas y análisis financiero
- Valoración de activos biológicos (NIF C-11)

---

## Guía de Usuario

### 1. Crear un Nuevo Lote

#### Paso 1: Acceder al Formulario

1. Hacer clic en el botón **"Nuevo Lote"** (esquina superior derecha)
2. Se abrirá un formulario modal

#### Paso 2: Completar Información

**Campos del Formulario**:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Tipo de Producción** | ENGORDE o POSTURA | Pollo de Engorde |
| **Línea Genética** | Raza/línea genética | Cobb 500 |
| **Fecha de Inicio** | Fecha de inicio del lote | 2025-10-27 |
| **Edad Actual (semanas)** | Solo para POSTURA - edad actual de las aves | 10 semanas |
| **Número de Aves Inicial** | Cantidad inicial de aves | 1000 |
| **Costo por Pollito (MXN)** | Costo unitario del pollito | $12.50 |

#### Paso 3: Entender el Cálculo de Edad

**Para Pollo de Engorde**:
- La fecha de nacimiento es igual a la fecha de inicio
- Las aves comienzan en día 0

**Para Gallinas de Postura**:
- Si ingresas una edad (ej: 10 semanas), el sistema calcula la fecha de nacimiento automáticamente
- Ejemplo: Si hoy es 27 de octubre y las gallinas tienen 10 semanas, nacieron el 18 de agosto

#### Paso 4: Guardar

- Hacer clic en **"Crear Lote"**
- El lote aparecerá inmediatamente en "Lotes Activos"

---

### 2. Registrar Datos Diarios

#### Paso 1: Seleccionar el Lote

1. En la vista "Lotes Activos", el lote se selecciona automáticamente
2. Si hay múltiples lotes, hacer clic en el botón del lote deseado

#### Paso 2: Abrir Formulario de Registro

- Hacer clic en **"Registrar Datos"** en el dashboard del lote

#### Paso 3: Ingresar Datos

**Campos Obligatorios**:

| Campo | Descripción | Unidad | Frecuencia Recomendada |
|-------|-------------|--------|----------------------|
| **Fecha** | Fecha del registro | - | Diaria |
| **Mortalidad Diaria** | Aves muertas en el día | aves | Diaria |
| **Alimento Consumido** | Alimento total consumido | kg | Diaria |

**Campos Opcionales**:

| Campo | Descripción | Unidad | Frecuencia Recomendada |
|-------|-------------|--------|----------------------|
| **Agua Consumida** | Agua total consumida | litros | Diaria |
| **Peso Promedio** | Peso promedio de muestra | gramos | Semanal |
| **Huevos Producidos** | Solo para postura | unidades | Diaria |
| **Observaciones** | Vacunas, medicamentos, eventos | texto | Según necesidad |

#### Paso 4: Entender el Muestreo de Peso

**Recomendación**: Pesar una muestra de 10-20 aves semanalmente

**Ejemplo de Registro Semanal**:
- Día 1, 2, 3, 4, 5, 6: No ingresar peso
- Día 7: Ingresar peso promedio de muestra

**Importancia**: El peso es fundamental para:
- Cálculo de Conversión Alimenticia (CA)
- Comparación con estándares genéticos
- Estimación de peso total para venta

#### Paso 5: Guardar

- Hacer clic en **"Guardar Registro"**
- El sistema automáticamente:
  - Actualiza el número de aves actuales (resta mortalidad)
  - Calcula y registra el costo del día
  - Acumula el costo de transformación (NIF C-11)
  - Actualiza los KPIs del dashboard

---

### 3. Interpretar el Dashboard

El dashboard muestra información en tiempo real del lote seleccionado.

#### Sección 1: Header del Lote

Información general:
- **Nombre del lote**: Línea genética (ej: "Lote COBB500")
- **Fecha de inicio**: Fecha en que comenzó el lote
- **Aves actuales**: Número de aves vivas
- **Edad**: Edad formateada (ej: "3 semanas y 5 días")

#### Sección 2: KPIs Principales

##### KPI 1: Conversión Alimenticia (CA)

**¿Qué es?**
Indica cuántos kg de alimento se necesitan para producir 1 kg de carne.

**Fórmula**:
```
CA = Alimento Total Consumido (kg) / Peso Total Ganado (kg)
```

**Interpretación**:
- CA óptima en engorde: **1.5 - 1.8**
- Menor CA = Mejor eficiencia
- Mayor CA = Desperdicio de alimento o problemas de salud

**Ejemplo**:
- Alimento consumido: 1,800 kg
- Peso total ganado: 1,000 kg
- CA = 1,800 / 1,000 = **1.8** (Óptimo)

**Indicador de Color**:
- 🟢 **Verde**: CA dentro del rango óptimo o mejor que el estándar genético
- 🔴 **Rojo**: CA por encima del objetivo (ineficiente)

---

##### KPI 2: Índice de Productividad (IP/FEE)

**¿Qué es?**
Índice compuesto que evalúa el desempeño general del lote.

**Fórmula**:
```
IP = (Peso Promedio (kg) × (100 - % Mortalidad)) / (Edad (días) × CA) × 100
```

**Interpretación**:
- IP óptimo: **> 300**
- IP bueno: **250-300**
- IP regular: **200-250**
- IP deficiente: **< 200**

**Factores que influyen**:
- Mayor peso promedio → Mayor IP
- Menor mortalidad → Mayor IP
- Menor edad (venta temprana con buen peso) → Mayor IP
- Mejor CA → Mayor IP

**Ejemplo**:
- Peso promedio: 2.5 kg
- Mortalidad: 3%
- Edad: 42 días
- CA: 1.7

```
IP = (2.5 × (100 - 3)) / (42 × 1.7) × 100
IP = (2.5 × 97) / 71.4 × 100
IP = 242.5 / 71.4 × 100
IP = 339.6 ✓ (Excelente)
```

---

##### KPI 3: Mortalidad

**¿Qué es?**
Porcentaje de aves muertas respecto al total inicial.

**Fórmula**:
```
% Mortalidad = (Aves Muertas / Aves Iniciales) × 100
```

**Interpretación**:
- Óptimo: **< 3%**
- Aceptable: **3-5%**
- Alerta: **> 5%**

**Ejemplo**:
- Aves iniciales: 1,000
- Aves muertas acumuladas: 35
- % Mortalidad = (35 / 1,000) × 100 = **3.5%** (Aceptable)

**Indicador de Color**:
- 🟢 **Verde**: Mortalidad < 4.5%
- 🔴 **Rojo**: Mortalidad > 4.5%

**Causas Comunes de Alta Mortalidad**:
- Problemas de bioseguridad
- Enfermedades (Newcastle, Gumboro, etc.)
- Mala calidad de pollitos
- Estrés térmico
- Problemas de ventilación

---

##### KPI 4: Peso Promedio

**¿Qué muestra?**
Peso promedio actual vs. peso objetivo según la línea genética.

**Interpretación**:
- 🟢 **Verde** (↑): Peso real >= peso objetivo (excelente)
- 🔴 **Rojo** (↓): Peso real < peso objetivo (subdesarrollo)

**Objetivos por Línea Genética (gramos)**:

| Línea Genética | Día 7 | Día 14 | Día 21 | Día 28 | Día 35 |
|---------------|-------|--------|--------|--------|--------|
| **Cobb 500** | 180 | 570 | 1,116 | 1,783 | 2,521 |
| **Ross 308** | 202 | 588 | 1,320 | 2,359 | 3,635 |

**Ejemplo**:
- Lote: Cobb 500
- Edad: 28 días
- Peso real: 1,850 g
- Peso objetivo: 1,783 g
- **Diferencia**: +67 g (🟢 Por encima del objetivo)

---

#### Sección 3: Valoración Financiera (NIF C-11)

**NIF C-11**: Norma de Información Financiera para Activos Biológicos.

##### ¿Qué es un Activo Biológico?

Las aves vivas son activos biológicos en transformación. El costo acumulado representa el valor contable del inventario.

##### Componentes del Costo de Transformación

```
Costo Total = Costo Pollitos + Costo Alimento + Costos Indirectos
```

**1. Costo de Pollitos**:
```
Costo Pollitos = Número Inicial de Aves × Costo Unitario
```

**2. Costo de Alimento**:
```
Costo Alimento = Alimento Consumido (kg) × Precio por kg
```

**3. Costos Indirectos Prorrateados**:

Incluyen:
- Luz
- Agua
- Gas
- Mano de obra
- Mantenimiento
- Depreciación de instalaciones

**Prorrateo**:
```
Proporción = Aves del Lote / Total de Aves en Granja
Costo Indirecto del Lote = Costo Indirecto Diario × Días × Proporción
```

**Ejemplo**:
- Costo indirecto diario de la granja: $500
- Total de aves en granja: 2,500
- Aves del lote: 1,000
- Proporción: 1,000 / 2,500 = 0.4 (40%)
- Costo indirecto del lote (día 1): $500 × 0.4 = **$200**

##### Interpretación de los Valores

| Métrica | Descripción | Uso |
|---------|-------------|-----|
| **Activo Biológico** | Costo acumulado total del lote | Valor contable en balance general |
| **Costo por Ave** | Activo Biológico / Aves Actuales | Control de costo unitario |
| **Costo por Kg Producido** | Activo Biológico / Peso Total (kg) | Evaluación de eficiencia de costos |

**Ejemplo**:
- Activo Biológico: $25,000
- Aves actuales: 980
- Peso total producido: 2,450 kg

```
Costo por Ave = $25,000 / 980 = $25.51
Costo por Kg = $25,000 / 2,450 = $10.20
```

**Análisis**:
- Si precio de venta es $67/kg en vivo → Margen bruto = $56.80/kg (556%)
- Si precio de venta es $105/kg congelado → Margen bruto = $94.80/kg (929%)

---

#### Sección 4: Comparación Real vs. Estándar Genético

Esta tabla muestra el desempeño del lote comparado con los estándares de la línea genética.

**Columnas**:

| Columna | Descripción |
|---------|-------------|
| **Día** | Día del lote en que se tomó el peso |
| **Peso Real (g)** | Peso promedio registrado |
| **Peso Objetivo (g)** | Peso esperado según genética |
| **CA Real** | Conversión alimenticia real acumulada |
| **CA Objetivo** | CA esperada según genética |

**Interpretación de Desviaciones**:

##### Peso Real > Peso Objetivo

- ✅ **Excelente**: Las aves están creciendo mejor que el estándar
- Posibles causas:
  - Buena calidad de alimento
  - Excelente manejo
  - Condiciones ambientales óptimas

##### Peso Real < Peso Objetivo

- ⚠️ **Alerta**: Las aves están subdesarrolladas
- Posibles causas:
  - Mala calidad de alimento
  - Enfermedades subclínicas
  - Estrés térmico
  - Problemas de agua

##### CA Real < CA Objetivo

- ✅ **Excelente**: Mejor eficiencia alimenticia que el estándar
- Significa que se está usando menos alimento para el mismo peso

##### CA Real > CA Objetivo

- ⚠️ **Alerta**: Menor eficiencia que el estándar
- Posibles causas:
  - Desperdicio de alimento
  - Problemas digestivos
  - Alimento de baja calidad

---

#### Sección 5: Alerta de 42 Días

**¿Cuándo aparece?**
Cuando el lote de **ENGORDE** tiene 39 días o más.

**¿Por qué 42 días?**
Es la edad óptima de venta para pollos de engorde porque:
- El peso alcanzado es comercial (2.2 - 2.8 kg)
- La conversión alimenticia todavía es eficiente
- Después de 42 días, la CA empeora (se necesita más alimento para ganar peso)

**Ejemplo de Eficiencia por Edad**:

| Edad (días) | Peso (kg) | CA Acumulada | CA Marginal |
|------------|----------|--------------|-------------|
| 35 | 2.2 | 1.65 | 1.65 |
| 42 | 2.7 | 1.75 | 2.20 |
| 49 | 3.1 | 1.88 | 2.80 |

**Observación**: Después del día 42, cada kg adicional requiere 2.8 kg de alimento (ineficiente).

**Acción Recomendada**:
- Evaluar precio de mercado
- Considerar finalizar el lote
- Calcular proyección de rentabilidad

---

### 4. Finalizar Lote y Vender

#### Paso 1: Decidir Cuándo Finalizar

**Factores a Considerar**:

1. **Edad**: Óptimo en día 42 (engorde)
2. **Peso Promedio**: Mínimo comercial 2.2 kg
3. **Precio de Mercado**: Comparar precio vivo vs. congelado
4. **Espacio en Granja**: Necesidad de liberar espacio para nuevo lote

#### Paso 2: Abrir Modal de Finalización

- Hacer clic en **"Finalizar y Vender"** en el dashboard del lote

#### Paso 3: Seleccionar Tipo de Venta

**Opciones**:

| Tipo | Descripción | Precio Típico (MXN/kg) | Ventajas |
|------|-------------|----------------------|----------|
| **VIVO** | Venta de aves vivas | $67 | Rápido, sin costo de sacrificio |
| **CONGELADO** | Sacrificio y venta congelada | $105 | Mayor precio, mejor margen |
| **MIXTO** | Combinación de vivo y congelado | Variable | Flexibilidad |

#### Paso 4: Ingresar Cantidades

**Para Venta en Vivo**:
- Cantidad de aves: (máximo = aves actuales)
- Precio por kg: $67.00 (ajustable según mercado)

**Para Venta Congelada**:
- Cantidad de aves: (máximo = aves actuales)
- Precio por kg: $105.00 (ajustable según mercado)

**Para Venta Mixta**:
- Ingresar cantidades en ambos campos
- Total no debe exceder aves actuales

#### Paso 5: Revisar Resumen Financiero

El sistema calcula automáticamente:

**Fórmulas**:

```
Peso Total (kg) = Cantidad de Aves × Peso Promedio (kg)

Ingreso Vivo = Aves Vivo × Peso Promedio × Precio Vivo/kg
Ingreso Congelado = Aves Congelado × Peso Promedio × Precio Congelado/kg
Ingreso Total = Ingreso Vivo + Ingreso Congelado

Ganancia Neta = Ingreso Total - Costo Total Acumulado
Margen (%) = (Ganancia Neta / Costo Total) × 100
```

**Ejemplo de Venta en Vivo**:
- Aves: 980
- Peso promedio: 2.5 kg
- Precio: $67/kg
- Costo total: $25,000

```
Peso Total = 980 × 2.5 = 2,450 kg
Ingreso Total = 2,450 × $67 = $164,150
Ganancia Neta = $164,150 - $25,000 = $139,150
Margen = ($139,150 / $25,000) × 100 = 556.6%
```

**Ejemplo de Venta Congelada**:
- Aves: 980
- Peso promedio: 2.5 kg
- Precio: $105/kg
- Costo total: $25,000

```
Peso Total = 980 × 2.5 = 2,450 kg
Ingreso Total = 2,450 × $105 = $257,250
Ganancia Neta = $257,250 - $25,000 = $232,250
Margen = ($232,250 / $25,000) × 100 = 929%
```

**Análisis**:
- Venta congelada ofrece +56% más ingresos
- Debe considerarse costo de sacrificio y refrigeración

#### Paso 6: Confirmar Venta

- Hacer clic en **"Finalizar Lote y Vender"**
- El sistema automáticamente:
  - Registra la venta en la tabla de ventas
  - Cambia el estado del lote a "FINALIZADO"
  - Remueve el lote de "Lotes Activos"

---

### 5. Ver Historial de Ventas

#### Paso 1: Acceder a Vista de Ventas

- Hacer clic en **"Ventas"** en la navegación superior

#### Paso 2: Interpretar Tarjetas de Resumen

**Tarjeta 1: Ingresos Totales**
- Suma de todos los ingresos de ventas
- Color: Azul

**Tarjeta 2: Costos Totales**
- Suma de todos los costos de transformación
- Color: Naranja

**Tarjeta 3: Ganancias Netas**
- Ingresos Totales - Costos Totales
- Incluye margen de ganancia en porcentaje
- Color: Verde

**Ejemplo**:
```
Ingresos Totales: $500,000
Costos Totales: $180,000
Ganancias Netas: $320,000
Margen: 177.8%
```

#### Paso 3: Analizar Tabla de Ventas

**Columnas de la Tabla**:

| Columna | Descripción |
|---------|-------------|
| **Fecha** | Fecha de la venta |
| **Lote** | Línea genética del lote vendido |
| **Tipo Venta** | VIVO, CONGELADO o MIXTO (con badge de color) |
| **Cantidad** | Total de aves vendidas |
| **Peso (kg)** | Peso total vendido |
| **Ingreso** | Ingreso total de la venta |
| **Ganancia** | Ganancia neta (verde si positiva, roja si negativa) |

**Ordenamiento**: Las ventas se muestran de más reciente a más antigua.

---

## Conceptos Clave

### 1. Conversión Alimenticia (CA)

**Definición Técnica**:
Relación entre el alimento consumido y el peso ganado por las aves.

**Importancia**:
La CA es el indicador más importante de eficiencia en producción avícola porque:
- El alimento representa 60-70% del costo total
- Una mejora de 0.1 puntos en CA puede significar miles de pesos de ahorro

**Factores que Afectan la CA**:

1. **Genética**: Líneas genéticas modernas tienen mejor CA
2. **Nutrición**: Calidad del alimento (energía, proteína, digestibilidad)
3. **Sanidad**: Enfermedades subclínicas reducen la eficiencia
4. **Manejo**: Temperatura, ventilación, densidad de aves
5. **Edad**: A mayor edad, peor CA marginal

**CA por Etapa** (Cobb 500):

| Semana | CA Semanal | CA Acumulada |
|--------|-----------|--------------|
| 1 | 0.89 | 0.89 |
| 2 | 1.17 | 1.03 |
| 3 | 1.33 | 1.18 |
| 4 | 1.46 | 1.32 |
| 5 | 1.55 | 1.44 |
| 6 | 1.68 | 1.53 |

**Observación**: La CA semanal empeora con la edad, pero la acumulada se mantiene más estable.

---

### 2. Índice de Productividad (IP/FEE)

**Definición**:
Indicador compuesto que integra peso, mortalidad, edad y conversión alimenticia.

**Origen**:
Desarrollado por la industria avícola para comparar lotes con diferentes edades de venta.

**Fórmula Completa**:
```
IP = (Peso Final (kg) × Viabilidad (%)) / (Edad (días) × CA)
```

Donde:
```
Viabilidad (%) = 100 - Mortalidad (%)
```

**Interpretación por Rangos**:

| IP | Calificación | Descripción |
|----|-------------|-------------|
| > 350 | Excelente | Lote de clase mundial |
| 300-350 | Muy Bueno | Lote eficiente |
| 250-300 | Bueno | Lote aceptable |
| 200-250 | Regular | Necesita mejoras |
| < 200 | Deficiente | Problemas graves de manejo |

**Ejemplo de Cálculo Detallado**:

**Datos del Lote**:
- Peso final: 2.6 kg
- Mortalidad: 4%
- Edad: 43 días
- CA: 1.72

**Cálculo**:
```
Viabilidad = 100 - 4 = 96%

IP = (2.6 × 96) / (43 × 1.72)
IP = 249.6 / 73.96
IP = 337.4 → Muy Bueno
```

---

### 3. Estándares Genéticos

**Definición**:
Curvas de crecimiento y conversión alimenticia publicadas por las empresas de genética avícola.

**Principales Líneas Genéticas**:

#### Cobb 500

**Características**:
- Origen: Cobb-Vantress (EE.UU.)
- Enfoque: Equilibrio entre crecimiento y CA
- Uso: Pollos de engorde de propósito general

**Estándar de Desempeño** (macho):

| Edad (días) | Peso (g) | CA | Mortalidad (%) |
|------------|---------|-----|---------------|
| 7 | 180 | 0.89 | 0.5 |
| 14 | 570 | 1.03 | 0.7 |
| 21 | 1,116 | 1.18 | 1.0 |
| 28 | 1,783 | 1.32 | 1.5 |
| 35 | 2,521 | 1.44 | 2.0 |
| 42 | 3,322 | 1.55 | 2.5 |

#### Ross 308

**Características**:
- Origen: Aviagen (Reino Unido)
- Enfoque: Crecimiento rápido
- Uso: Mercados que valoran peso elevado

**Estándar de Desempeño** (macho):

| Edad (días) | Peso (g) | CA | Mortalidad (%) |
|------------|---------|-----|---------------|
| 7 | 202 | 0.90 | 0.5 |
| 14 | 588 | 1.05 | 0.8 |
| 21 | 1,320 | 1.25 | 1.2 |
| 28 | 2,359 | 1.40 | 1.8 |
| 35 | 3,635 | 1.55 | 2.3 |
| 42 | 4,989 | 1.68 | 2.8 |

**Comparación Cobb 500 vs. Ross 308**:

A los 42 días:
- Ross 308: +50% más peso (4,989g vs. 3,322g)
- Ross 308: +8% peor CA (1.68 vs. 1.55)
- Ross 308: +12% mayor mortalidad (2.8% vs. 2.5%)

**Conclusión**: Ross 308 es ideal para mercados que pagan prima por peso alto, Cobb 500 para eficiencia general.

---

### 4. NIF C-11 (Activos Biológicos)

**¿Qué es la NIF C-11?**
Norma de Información Financiera mexicana para el reconocimiento, valuación y presentación de activos biológicos.

**Definición de Activo Biológico**:
Un animal o planta vivos.

**Clasificación**:

| Tipo | Descripción | Ejemplo Avícola |
|------|-------------|-----------------|
| **Consumibles** | Se cosechan como producto agrícola | Pollos de engorde |
| **Para Producir** | Se mantienen para producir otros activos | Gallinas reproductoras |
| **En Crecimiento** | No han alcanzado madurez | Pollitos en desarrollo |
| **Maduros** | Han alcanzado madurez | Gallinas en producción |

**Valuación**:

La NIF C-11 permite dos métodos:

1. **Valor Razonable** (menos costos de venta)
   - Difícil de aplicar en avicultura
   - Requiere mercado activo

2. **Costo de Transformación** ⭐ (usado en este sistema)
   - Más práctico y confiable
   - Acumula costos directos e indirectos

**Componentes del Costo de Transformación**:

```
Costo Total = Costo Inicial + Costos Directos + Costos Indirectos
```

**1. Costo Inicial**:
- Costo de adquisición de pollitos

**2. Costos Directos**:
- Alimento
- Vacunas
- Medicamentos
- Mano de obra directa

**3. Costos Indirectos de Producción**:
- Depreciación de instalaciones
- Energía eléctrica
- Agua
- Gas
- Mano de obra indirecta
- Mantenimiento

**Prorrateo de Costos Indirectos**:

Los costos indirectos se prorratean entre lotes activos en función de:
- Número de aves
- Espacio ocupado
- Días de ocupación

**Ejemplo de Prorrateo**:

**Granja con 3 lotes**:
- Lote A: 1,000 aves
- Lote B: 800 aves
- Lote C: 700 aves
- Total: 2,500 aves

**Costo indirecto diario**: $1,000

**Prorrateo**:
- Lote A: $1,000 × (1,000 / 2,500) = **$400**
- Lote B: $1,000 × (800 / 2,500) = **$320**
- Lote C: $1,000 × (700 / 2,500) = **$280**

**Presentación en Estados Financieros**:

**Balance General**:
```
Activos Circulantes
  Inventarios
    Activos Biológicos en Transformación
      - Lote Cobb 500 (1,000 aves).........$25,000
      - Lote Ross 308 (800 aves)...........$18,500
    Total Activos Biológicos................$43,500
```

**Estado de Resultados**:
```
Ventas de Activos Biológicos...................$167,000
(-) Costo de Ventas (Activos Biológicos)......($25,000)
Utilidad Bruta.................................$142,000
```

---

## Preguntas Frecuentes (FAQ)

### Gestión de Lotes

**P: ¿Puedo editar un lote después de crearlo?**
R: Actualmente no. Si cometiste un error, debes crear un nuevo lote. Se recomienda verificar los datos antes de guardar.

**P: ¿Puedo tener múltiples lotes activos al mismo tiempo?**
R: Sí. El sistema soporta múltiples lotes simultáneos. Puedes alternar entre ellos desde la vista de "Lotes Activos".

**P: ¿Qué pasa si olvido registrar un día?**
R: Puedes registrar días anteriores cambiando la fecha en el formulario de registro. Sin embargo, es mejor mantener registros diarios para precisión.

**P: ¿Puedo eliminar un lote?**
R: Actualmente no hay función de eliminación para preservar el historial. Los lotes finalizados se ocultan de "Lotes Activos" pero permanecen en la base de datos.

---

### Registros Diarios

**P: ¿Tengo que pesar las aves todos los días?**
R: No. Se recomienda pesar semanalmente (días 7, 14, 21, 28, 35, 42). El peso es opcional en el formulario.

**P: ¿Cuántas aves debo pesar para el muestreo?**
R: Se recomienda una muestra de 10-20 aves representativas del lote. Evita pesar solo las más grandes o más pequeñas.

**P: ¿Qué hago si no consumieron alimento un día (día de ayuno)?**
R: Ingresa 0 en "Alimento Consumido". El sistema aceptará cero como valor válido.

**P: ¿El campo de observaciones es importante?**
R: Sí. Registra eventos importantes como:
- Vacunaciones (ej: "Vacuna Newcastle día 7")
- Medicamentos (ej: "Tratamiento con antibiótico por 5 días")
- Eventos especiales (ej: "Falla eléctrica 3 horas", "Ajuste temperatura")

---

### Cálculos y KPIs

**P: ¿Por qué mi CA es muy alta (>2.0)?**
R: Posibles causas:
1. Desperdicio de alimento (comederos mal ajustados)
2. Calidad de alimento baja (poca energía/proteína)
3. Enfermedad subclínica (problemas digestivos)
4. Edad avanzada (>49 días)
5. Error en registro de alimento o peso

**P: ¿Por qué mi IP es bajo (<200)?**
R: El IP bajo puede deberse a:
1. CA alta (ineficiencia alimenticia)
2. Mortalidad alta (>5%)
3. Peso bajo para la edad (subdesarrollo)
4. Edad excesiva (>56 días)

Revisa cada componente del IP individualmente para identificar el problema.

**P: ¿Qué hago si mi peso real está muy por debajo del objetivo?**
R: Investigar causas:
1. Verificar calidad de alimento (análisis de laboratorio)
2. Revisar programa de vacunación
3. Verificar temperatura y ventilación
4. Descartar enfermedades (Newcastle, Gumboro, etc.)
5. Revisar calidad de agua

---

### Costos y Finanzas

**P: ¿Cómo se calcula el precio del alimento?**
R: El sistema usa un precio fijo de $8.50/kg. Para modificarlo, debes editar el código en `RegistroDiarioForm.tsx:55`.

**P: ¿Cómo se calculan los costos indirectos?**
R: El sistema usa un costo fijo de $500/día para toda la granja, prorrateado por número de aves. Para ajustar, editar `RegistroDiarioForm.tsx:65`.

**P: ¿Por qué mi costo por kg es tan alto?**
R: Posibles causas:
1. Mortalidad alta (menos aves para distribuir el costo)
2. CA alta (mucho alimento consumido)
3. Peso bajo (poco kg producido)
4. Costos indirectos elevados

**P: ¿Cuál es un buen costo por kg?**
R: En México (2025), un costo de $10-15/kg es competitivo. Con precio de venta de $67/kg en vivo, esto representa márgenes de 447-570%.

---

### Ventas

**P: ¿Puedo vender solo una parte del lote?**
R: No. El sistema está diseñado para venta completa del lote. Una venta finaliza el lote completo.

**P: ¿Qué precio debo usar: vivo o congelado?**
R: Depende de tu mercado:
- **Vivo**: Más rápido, sin costo de procesamiento, menor precio ($67/kg típico)
- **Congelado**: Mayor precio ($105/kg típico), pero requiere sacrificio, eviscerado y refrigeración

Calcula el margen neto considerando costos de procesamiento.

**P: ¿Puedo editar una venta después de registrarla?**
R: No. Las ventas son permanentes. Verifica los datos antes de confirmar.

---

## Glosario de Términos

### Términos Avícolas

**Activo Biológico**: Animal o planta vivos utilizados en producción agrícola.

**Ave**: Unidad individual de producción (pollo, gallina).

**Broiler**: Pollo de engorde, criado para producción de carne.

**CA (Conversión Alimenticia)**: Kg de alimento necesarios para producir 1 kg de peso vivo.

**Ciclo de Producción**: Período desde el inicio del lote hasta su venta/finalización.

**Engorde**: Tipo de producción enfocada en carne.

**FEE (Factor de Eficiencia Europeo)**: Sinónimo de IP (Índice de Productividad).

**IP (Índice de Productividad)**: Indicador compuesto de eficiencia del lote.

**Layer**: Gallina de postura, criada para producción de huevos.

**Línea Genética**: Variedad genética de aves (Cobb 500, Ross 308, etc.).

**Lote**: Grupo de aves manejadas como unidad, con misma edad y manejo.

**Mortalidad**: Porcentaje de aves muertas respecto al total inicial.

**Peso Vivo**: Peso del animal vivo, antes del sacrificio.

**Postura**: Tipo de producción enfocada en huevos.

**Viabilidad**: Porcentaje de aves vivas (100 - Mortalidad).

---

### Términos Financieros/Contables

**Costo de Transformación**: Costos incurridos para convertir pollitos en aves listas para venta.

**Costo Directo**: Costo que puede atribuirse directamente a un lote (alimento, vacunas).

**Costo Indirecto**: Costo que beneficia a múltiples lotes (luz, agua, instalaciones).

**Margen de Ganancia**: Porcentaje de utilidad sobre el costo.

**NIF C-11**: Norma de Información Financiera para Activos Biológicos (México).

**Prorrateo**: Distribución de costos indirectos entre múltiples lotes.

**Valor Razonable**: Precio que se recibiría por vender un activo en el mercado.

---

### Términos Técnicos del Sistema

**Dashboard**: Panel de control que muestra KPIs y estado del lote.

**KPI (Key Performance Indicator)**: Indicador clave de desempeño.

**Lote Activo**: Lote en producción, no finalizado.

**Lote Finalizado**: Lote que ya fue vendido y cerrado.

**Modal**: Ventana emergente para formularios.

**Registro Diario**: Entrada de datos diaria para un lote.

**Supabase**: Plataforma de base de datos utilizada por el sistema.

---

## Mejores Prácticas

### 1. Registro de Datos

**Consistencia en Horarios**:
- Registra datos a la misma hora cada día
- Recomendación: Temprano en la mañana antes de alimentar

**Precisión en Mediciones**:
- Usa básculas calibradas para peso de aves
- Usa balanzas o básculas para alimento
- Instala medidores de agua si es posible

**Muestreo de Peso**:
- Pesa al menos 10 aves
- Distribuye la muestra en toda la caseta (no solo de un área)
- Evita pesar solo aves grandes o pequeñas (muestra representativa)

**Documentación de Eventos**:
- Registra vacunaciones con nombre de vacuna y lote
- Documenta cambios en alimento (tipo, proveedor)
- Anota eventos climáticos extremos
- Registra fallas de equipo (ventiladores, bebederos)

---

### 2. Interpretación de KPIs

**Revisión Diaria**:
- Revisa KPIs cada vez que registras datos
- Identifica tendencias (CA que empeora, mortalidad que aumenta)

**Comparación Semanal**:
- Compara peso real vs. objetivo cada semana
- Si hay desviación >5%, investiga causa

**Alertas Tempranas**:
- Si mortalidad >1% en un día → Investigar inmediatamente
- Si CA >2.0 en semana 3 → Revisar calidad de alimento
- Si peso <90% del objetivo → Revisar programa nutricional

---

### 3. Manejo de Costos

**Revisión de Proveedores**:
- Compara precios de alimento cada 3 meses
- Evalúa calidad vs. precio (no siempre lo más barato es lo mejor)

**Control de Desperdicio**:
- Ajusta comederos para minimizar desperdicio
- Altura ideal: A nivel del lomo de las aves
- Llena comederos solo a 2/3 de capacidad

**Optimización de Costos Indirectos**:
- Mejora aislamiento para reducir costos de calefacción
- Usa iluminación LED para reducir electricidad
- Programa mantenimiento preventivo (evita reparaciones costosas)

---

### 4. Decisiones de Venta

**Análisis de Mercado**:
- Consulta precios de mercado semanalmente
- Identifica tendencias estacionales (precios altos en festividades)

**Punto Óptimo de Venta**:
- No solo consideres edad (42 días)
- Evalúa peso (mínimo 2.2 kg para buen precio)
- Considera CA marginal (si CA semanal >2.5, vender)

**Vivo vs. Congelado**:
- Calcula margen neto de ambas opciones
- Considera capacidad de procesamiento
- Evalúa demanda de mercado (algunos mercados prefieren vivo)

**Ejemplo de Análisis**:

| Concepto | Vivo | Congelado |
|----------|------|-----------|
| Precio/kg | $67 | $105 |
| Rendimiento | 100% | 75% (merma en procesamiento) |
| Precio efectivo/kg ave viva | $67 | $78.75 |
| Costo procesamiento/ave | $0 | $15 |
| Margen neto (1000 aves, 2.5 kg) | $142,500 | $126,875 |

**Conclusión**: En este caso, vivo es más rentable considerando costo de procesamiento.

---

## Resolución de Problemas

### Problemas Comunes en la Aplicación

#### Problema: "No se cargan los lotes"

**Posibles Causas**:
1. Problema de conexión a internet
2. Credenciales de Supabase incorrectas
3. Error en base de datos

**Solución**:
1. Verificar conexión a internet
2. Refrescar página (F5)
3. Verificar consola del navegador (F12) para errores
4. Contactar soporte técnico si persiste

---

#### Problema: "Error al crear lote"

**Posibles Causas**:
1. Campos obligatorios vacíos
2. Número de aves = 0
3. Costo de pollito negativo

**Solución**:
1. Verificar que todos los campos requeridos estén completos
2. Número de aves debe ser > 0
3. Costo de pollito debe ser >= 0
4. Revisar mensaje de error específico

---

#### Problema: "Error al guardar registro diario"

**Posibles Causas**:
1. Ya existe un registro para esa fecha
2. Mortalidad > aves actuales
3. Campos numéricos con texto

**Solución**:
1. Verificar que no hayas registrado ese día anteriormente
2. Mortalidad no puede exceder aves vivas
3. Usar solo números en campos numéricos (sin letras)

---

#### Problema: "KPIs no se actualizan"

**Posibles Causas**:
1. Caché del navegador
2. No se guardó el último registro

**Solución**:
1. Refrescar página (F5)
2. Hacer clic en "Lotes Activos" para recargar datos
3. Verificar que el registro se guardó correctamente

---

### Problemas Comunes en Producción

#### Problema: CA muy alta (>2.0)

**Diagnóstico**:

1. **Revisar Alimento**:
   - Verificar análisis nutricional
   - Revisar fecha de fabricación (alimento viejo pierde calidad)
   - Verificar condiciones de almacenamiento

2. **Revisar Manejo**:
   - Altura de comederos (muy altos = desperdicio)
   - Llenado de comederos (>2/3 = desperdicio)
   - Ratones/pájaros comiendo alimento

3. **Revisar Salud**:
   - Diarrea (malabsorción)
   - Signos de enfermedad respiratoria
   - Coccidiosis (muy común)

**Soluciones**:
- Ajustar altura de comederos
- Mejorar almacenamiento de alimento
- Control de plagas
- Tratamiento si hay enfermedad

---

#### Problema: Mortalidad alta (>5%)

**Diagnóstico**:

1. **Revisar Bioseguridad**:
   - Limpieza y desinfección entre lotes
   - Control de visitas
   - Cambio de ropa/botas

2. **Revisar Ambiente**:
   - Temperatura (ideal: 32°C semana 1, -3°C por semana)
   - Ventilación (sin corrientes de aire)
   - Humedad (60-70%)

3. **Revisar Programa Sanitario**:
   - Vacunaciones al día
   - Calidad de vacunas (cadena de frío)

4. **Necropsia**:
   - Examinar aves muertas
   - Identificar causa de muerte

**Soluciones**:
- Mejorar bioseguridad
- Ajustar temperatura/ventilación
- Consultar veterinario
- Tratamiento específico según diagnóstico

---

#### Problema: Peso bajo (<90% objetivo)

**Diagnóstico**:

1. **Revisar Alimento**:
   - Calidad nutricional
   - Cantidad disponible (¿falta alimento en algún momento del día?)

2. **Revisar Agua**:
   - Disponibilidad 24/7
   - Calidad (sin contaminación)
   - Temperatura (agua muy caliente reduce consumo)

3. **Revisar Densidad**:
   - Aves/m² (alta densidad reduce crecimiento)
   - Espacio de comedero
   - Espacio de bebedero

4. **Revisar Salud**:
   - Enfermedades subclínicas
   - Parásitos internos

**Soluciones**:
- Mejorar programa nutricional
- Asegurar disponibilidad de agua
- Reducir densidad si es necesario
- Desparasitación
- Consultar veterinario

---

## Referencias Técnicas

### Documentación del Sistema

- **Documentación Técnica Completa**: `TECHNICAL_DOCS.md`
- **Código Fuente**: `/src` (componentes, servicios, utilidades)
- **Migraciones de Base de Datos**: `/supabase/migrations`

### Estándares Genéticos

- **Cobb 500 Performance & Nutrition Supplement**: https://www.cobb-vantress.com/
- **Ross 308 Broiler Performance Objectives**: https://aviagen.com/
- **Hy-Line Brown Management Guide**: https://www.hyline.com/

### Normas Contables

- **NIF C-11 Activos Biológicos**: Consejo Mexicano de Normas de Información Financiera (CINIF)
- **IAS 41 Agriculture**: International Accounting Standards Board (IASB)

### Recursos Avícolas

- **Manual de Manejo de Pollos de Engorde**: Ross Technical Service
- **Guía de Vacunación Avícola**: Cobb-Vantress
- **Manual de Bioseguridad Avícola**: SENASICA (México)

### Tecnologías Utilizadas

- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Supabase Documentation**: https://supabase.com/docs
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs

---

**Wiki generada**: 2025-10-27
**Versión**: 1.0
**Sistema**: Gestión Avícola - Control de Eficiencia y Cumplimiento NIF C-11

# Plan de Optimización para el Sistema de Gestión de la Granja Avícola

Este plan detalla las mejoras propuestas para optimizar la lógica del negocio en el sistema de gestión de la granja avícola, basadas en los documentos técnicos sobre producción de gallinas ponedoras y engorda de pollos en alta altitud.

## Objetivos Principales

- Mejorar el seguimiento y control de la producción diferenciada por líneas genéticas.
- Implementar control ambiental avanzado con alertas para mantener condiciones óptimas.
- Integrar planes nutricionales por fases con recordatorios automáticos.
- Gestionar programas de iluminación para estimular y mantener la postura.
- Incorporar cálculos económicos para optimizar la rentabilidad y duración del ciclo.
- Adaptar protocolos específicos para pollos de engorda en altitud, incluyendo ventilación y alimentación restringida.
- Monitorear suplementación y bioseguridad con registros detallados.
- Mejorar los dashboards con indicadores de comportamiento y mortalidad.

## Lista de Tareas

1. Implementar seguimiento diferenciado de producción de huevos por color para evaluar rendimiento genético.
2. Añadir parámetros ambientales (temperatura, humedad, ventilación) con sistema de alertas.
3. Integrar planes de alimentación por fases con ajustes automáticos según edad y etapa productiva.
4. Gestionar programas de iluminación con ajustes graduales de duración e intensidad.
5. Incorporar cálculos económicos para costos de alimento, producción de masa de huevo y optimización dinámica del ciclo.
6. Para pollos de engorda, implementar protocolos de ventilación y monitoreo ambiental con alertas.
7. Establecer horarios y cantidades precisas para alimentación restringida en machos.
8. Registrar y controlar suplementación con antioxidantes y sustitutos orgánicos de ingredientes.
9. Mejorar dashboards con indicadores de comportamiento de aves y seguimiento de mortalidad.
10. Incluir listas de verificación y registros de bioseguridad para personal y manejo de instalaciones.

Este plan servirá como guía para la implementación progresiva de mejoras en el sistema, buscando maximizar la eficiencia productiva y la rentabilidad de la granja.
