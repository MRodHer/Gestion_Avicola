import { useEffect, useState } from 'react';
import { supabase, Lote, RegistroDiario, CostoLote } from '../lib/supabase';
import { calcularKPIs, generarComparacionEstandar, KPIResult } from '../lib/calculations';
import { calcularEdadEnDias, calcularEdadEnSemanas, formatearEdad, debeAlertarPorEdad } from '../lib/ageUtils';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Bell } from 'lucide-react';

interface DashboardLoteProps {
  lote: Lote;
  onRegistrarClick: () => void;
  onFinalizarClick?: () => void;
}

export default function DashboardLote({ lote, onRegistrarClick, onFinalizarClick }: DashboardLoteProps) {
  const [registros, setRegistros] = useState<RegistroDiario[]>([]);
  const [costos, setCostos] = useState<CostoLote[]>([]);
  const [kpis, setKpis] = useState<KPIResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [lote.id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: registrosData } = await supabase
        .from('registros_diarios')
        .select('*')
        .eq('lote_id', lote.id)
        .order('fecha', { ascending: true });

      const { data: costosData } = await supabase
        .from('costos_lote')
        .select('*')
        .eq('lote_id', lote.id)
        .order('fecha', { ascending: true });

      if (registrosData) {
        setRegistros(registrosData as RegistroDiario[]);
        const kpisCalculados = calcularKPIs(lote, registrosData as RegistroDiario[]);
        setKpis(kpisCalculados);
      }

      if (costosData) {
        setCostos(costosData as CostoLote[]);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const ultimoCosto = costos.length > 0 ? costos[costos.length - 1] : null;
  const comparaciones = generarComparacionEstandar(lote, registros);
  const ultimaComparacion = comparaciones.length > 0 ? comparaciones[comparaciones.length - 1] : null;

  const edadDias = lote.fecha_nacimiento ? calcularEdadEnDias(lote.fecha_nacimiento) : kpis?.edad_dias || 0;
  const edadSemanas = lote.fecha_nacimiento ? calcularEdadEnSemanas(lote.fecha_nacimiento) : 0;
  const edadFormateada = lote.fecha_nacimiento ? formatearEdad(lote.fecha_nacimiento) : `${kpis?.edad_dias || 0} días`;
  const mostrarAlerta = lote.tipo_produccion === 'ENGORDE' && lote.fecha_nacimiento && debeAlertarPorEdad(lote.fecha_nacimiento, 42);

  const getStatusColor = (value: number, target: number, inverse: boolean = false) => {
    const diff = inverse ? target - value : value - target;
    if (Math.abs(diff) <= target * 0.05) return 'text-green-600';
    if (diff > 0) return inverse ? 'text-red-600' : 'text-green-600';
    return inverse ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {mostrarAlerta && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-orange-900">
              Alerta: Lote próximo a los 42 días
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Este lote tiene {edadDias} días. Considera finalizar el lote pronto para optimizar la conversión alimenticia.
            </p>
          </div>
          {onFinalizarClick && (
            <button
              onClick={onFinalizarClick}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Finalizar Lote
            </button>
          )}
        </div>
      )}

      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Lote {lote.linea_genetica}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Inicio: {new Date(lote.fecha_inicio).toLocaleDateString('es-MX')} |
              Aves actuales: {lote.num_aves_actual.toLocaleString()} |
              Edad: {edadFormateada} ({edadDias} días)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRegistrarClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrar Datos
            </button>
            {onFinalizarClick && lote.tipo_produccion === 'ENGORDE' && (
              <button
                onClick={onFinalizarClick}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Finalizar y Vender
              </button>
            )}
          </div>
        </div>
      </div>

      {!kpis ? (
        <div className="p-6 text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No hay registros diarios todavía.</p>
          <p className="text-sm mt-1">Comienza registrando los datos del primer día.</p>
        </div>
      ) : (
        <>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-900">CA Acumulada</h3>
                {ultimaComparacion && (
                  <span className={getStatusColor(kpis.ca_acumulada, ultimaComparacion.ca_objetivo, true)}>
                    {kpis.ca_acumulada < ultimaComparacion.ca_objetivo ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {kpis.ca_acumulada.toFixed(3)}
              </p>
              {ultimaComparacion && (
                <p className="text-xs text-blue-700 mt-1">
                  Objetivo: {ultimaComparacion.ca_objetivo.toFixed(3)}
                </p>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-900">IP / FEE</h3>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {kpis.ip_fee.toFixed(1)}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Índice de Productividad
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-orange-900">Mortalidad</h3>
                <span className={getStatusColor(kpis.mortalidad_porcentaje, 4.5, true)}>
                  {kpis.mortalidad_porcentaje > 4.5 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {kpis.mortalidad_porcentaje.toFixed(2)}%
              </p>
              <p className="text-xs text-orange-700 mt-1">
                {kpis.mortalidad_acumulada} aves
              </p>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-emerald-900">Peso Promedio</h3>
                {ultimaComparacion && (
                  <span className={getStatusColor(ultimaComparacion.peso_real, ultimaComparacion.peso_objetivo)}>
                    {ultimaComparacion.peso_real >= ultimaComparacion.peso_objetivo ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-emerald-900">
                {ultimaComparacion ? (ultimaComparacion.peso_real / 1000).toFixed(2) : '0.00'} kg
              </p>
              {ultimaComparacion && (
                <p className="text-xs text-emerald-700 mt-1">
                  Objetivo: {(ultimaComparacion.peso_objetivo / 1000).toFixed(2)} kg
                </p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Valoración Financiera (NIF C-11)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Activo Biológico (Costo Acumulado)</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${(ultimoCosto?.costo_transformacion_acumulado || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Costo por Ave</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${((ultimoCosto?.costo_transformacion_acumulado || 0) / lote.num_aves_actual).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Costo por Kg Producido</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${kpis.peso_total_ganado_kg > 0 ?
                        ((ultimoCosto?.costo_transformacion_acumulado || 0) / kpis.peso_total_ganado_kg).toFixed(2) :
                        '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {comparaciones.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Comparación Real vs. Estándar Genético
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700">Día</th>
                      <th className="px-4 py-2 text-left text-gray-700">Peso Real (g)</th>
                      <th className="px-4 py-2 text-left text-gray-700">Peso Objetivo (g)</th>
                      <th className="px-4 py-2 text-left text-gray-700">CA Real</th>
                      <th className="px-4 py-2 text-left text-gray-700">CA Objetivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparaciones.map((comp, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-4 py-2">{comp.dia}</td>
                        <td className="px-4 py-2 font-medium">
                          {comp.peso_real.toFixed(0)}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {comp.peso_objetivo.toFixed(0)}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {comp.ca_real.toFixed(3)}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {comp.ca_objetivo.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
