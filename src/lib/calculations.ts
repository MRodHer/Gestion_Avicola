import { RegistroDiario, Lote } from './supabase';

export interface KPIResult {
  edad_dias: number;
  ca_acumulada: number;
  mortalidad_acumulada: number;
  mortalidad_porcentaje: number;
  peso_total_ganado_kg: number;
  alimento_total_consumido_kg: number;
  ip_fee: number;
  aves_actuales: number;
}

export interface ComparacionEstandar {
  dia: number;
  peso_real: number;
  peso_objetivo: number;
  ca_real: number;
  ca_objetivo: number;
}

export function calcularKPIs(
  lote: Lote,
  registros: RegistroDiario[]
): KPIResult | null {
  if (registros.length === 0) {
    return null;
  }

  const registrosOrdenados = [...registros].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  const fechaInicio = new Date(lote.fecha_inicio);
  const ultimoRegistro = registrosOrdenados[registrosOrdenados.length - 1];
  const fechaUltima = new Date(ultimoRegistro.fecha);
  const edadDias = Math.floor(
    (fechaUltima.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
  );

  const mortalidadTotal = registrosOrdenados.reduce(
    (sum, r) => sum + r.mortalidad_diaria,
    0
  );
  const alimentoTotalKg = registrosOrdenados.reduce(
    (sum, r) => sum + r.alimento_consumido_kg,
    0
  );

  const avesActuales = lote.num_aves_inicial - mortalidadTotal;
  const mortalidadPorcentaje = (mortalidadTotal / lote.num_aves_inicial) * 100;

  const pesoPromedioActualG = ultimoRegistro.peso_promedio_g || 0;
  const pesoPromedioActualKg = pesoPromedioActualG / 1000;

  const pesoTotalGanadoKg = (pesoPromedioActualKg * avesActuales);

  const caAcumulada = pesoTotalGanadoKg > 0
    ? alimentoTotalKg / pesoTotalGanadoKg
    : 0;

  const ipFee = edadDias > 0 && caAcumulada > 0
    ? (pesoPromedioActualKg * (100 - mortalidadPorcentaje)) / (edadDias * caAcumulada) * 100
    : 0;

  return {
    edad_dias: edadDias,
    ca_acumulada: caAcumulada,
    mortalidad_acumulada: mortalidadTotal,
    mortalidad_porcentaje: mortalidadPorcentaje,
    peso_total_ganado_kg: pesoTotalGanadoKg,
    alimento_total_consumido_kg: alimentoTotalKg,
    ip_fee: ipFee,
    aves_actuales: avesActuales
  };
}

export function obtenerEstandarGenetico(
  lineaGenetica: string,
  dia: number
): { peso: number; ca: number } | null {
  const estandares: Record<string, Record<number, { peso: number; ca: number }>> = {
    COBB500: {
      7: { peso: 180, ca: 0.891 },
      14: { peso: 570, ca: 1.029 },
      21: { peso: 1116, ca: 1.182 },
      28: { peso: 1783, ca: 1.322 },
      35: { peso: 2521, ca: 1.441 }
    },
    ROSS308: {
      7: { peso: 202, ca: 0.900 },
      14: { peso: 588, ca: 1.050 },
      21: { peso: 1320, ca: 1.250 },
      28: { peso: 2359, ca: 1.400 },
      35: { peso: 3635, ca: 1.550 }
    }
  };

  const dias = [7, 14, 21, 28, 35];
  const diaRef = dias.reduce((prev, curr) =>
    Math.abs(curr - dia) < Math.abs(prev - dia) ? curr : prev
  );

  return estandares[lineaGenetica]?.[diaRef] || null;
}

export function generarComparacionEstandar(
  lote: Lote,
  registros: RegistroDiario[]
): ComparacionEstandar[] {
  const comparaciones: ComparacionEstandar[] = [];
  const registrosOrdenados = [...registros].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  const fechaInicio = new Date(lote.fecha_inicio);
  let alimentoAcumulado = 0;
  let mortalidadAcumulada = 0;

  registrosOrdenados.forEach((registro) => {
    alimentoAcumulado += registro.alimento_consumido_kg;
    mortalidadAcumulada += registro.mortalidad_diaria;

    const fecha = new Date(registro.fecha);
    const dia = Math.floor(
      (fecha.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (registro.peso_promedio_g && registro.peso_promedio_g > 0) {
      const avesActuales = lote.num_aves_inicial - mortalidadAcumulada;
      const pesoTotalKg = (registro.peso_promedio_g / 1000) * avesActuales;
      const caReal = pesoTotalKg > 0 ? alimentoAcumulado / pesoTotalKg : 0;

      const estandar = obtenerEstandarGenetico(lote.linea_genetica, dia);

      comparaciones.push({
        dia,
        peso_real: registro.peso_promedio_g,
        peso_objetivo: estandar?.peso || 0,
        ca_real: caReal,
        ca_objetivo: estandar?.ca || 0
      });
    }
  });

  return comparaciones;
}

export function calcularCostoTransformacion(
  lote: Lote,
  registros: RegistroDiario[],
  precioAlimentoKg: number,
  costoIndirectoDiario: number,
  totalAvesGranja: number
): number {
  const alimentoTotalKg = registros.reduce(
    (sum, r) => sum + r.alimento_consumido_kg,
    0
  );

  const costoAlimento = alimentoTotalKg * precioAlimentoKg;
  const costoPollitos = lote.num_aves_inicial * lote.costo_pollito_unitario;

  const avesActuales = lote.num_aves_actual;
  const proporcionAves = totalAvesGranja > 0 ? avesActuales / totalAvesGranja : 1;
  const costoIndirectoProrrateado = costoIndirectoDiario * registros.length * proporcionAves;

  return costoPollitos + costoAlimento + costoIndirectoProrrateado;
}
