import { useState } from 'react';
import { supabase, Lote, Venta } from '../lib/supabase';
import { X, DollarSign, AlertTriangle } from 'lucide-react';

interface FinalizarLoteProps {
  lote: Lote;
  costoTotal: number;
  pesoPromedioKg: number;
  onClose: () => void;
  onVentaRealizada: () => void;
}

export default function FinalizarLote({
  lote,
  costoTotal,
  pesoPromedioKg,
  onClose,
  onVentaRealizada
}: FinalizarLoteProps) {
  const [tipoVenta, setTipoVenta] = useState<'VIVO' | 'CONGELADO' | 'MIXTO'>('VIVO');
  const [cantidadVivo, setCantidadVivo] = useState(lote.num_aves_actual.toString());
  const [cantidadCongelado, setCantidadCongelado] = useState('0');
  const [precioVivo, setPrecioVivo] = useState('67.00');
  const [precioCongelado, setPrecioCongelado] = useState('105.00');
  const [fechaVenta, setFechaVenta] = useState(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calcularIngresos = () => {
    const avesVivo = tipoVenta === 'CONGELADO' ? 0 : parseInt(cantidadVivo || '0');
    const avesCongelado = tipoVenta === 'VIVO' ? 0 : parseInt(cantidadCongelado || '0');
    const pesoTotalKg = (avesVivo + avesCongelado) * pesoPromedioKg;

    const ingresoVivo = avesVivo * pesoPromedioKg * parseFloat(precioVivo);
    const ingresoCongelado = avesCongelado * pesoPromedioKg * parseFloat(precioCongelado);
    const ingresoTotal = ingresoVivo + ingresoCongelado;

    const ganancia = ingresoTotal - costoTotal;
    const margenPorcentaje = (ganancia / costoTotal) * 100;

    return {
      pesoTotalKg,
      ingresoTotal,
      ganancia,
      margenPorcentaje
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const avesVivo = tipoVenta === 'CONGELADO' ? 0 : parseInt(cantidadVivo || '0');
      const avesCongelado = tipoVenta === 'VIVO' ? 0 : parseInt(cantidadCongelado || '0');
      const totalAves = avesVivo + avesCongelado;

      if (totalAves > lote.num_aves_actual) {
        throw new Error('La cantidad total de aves excede el número disponible');
      }

      const { pesoTotalKg, ingresoTotal, ganancia } = calcularIngresos();

      const { error: ventaError } = await supabase.from('ventas').insert({
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

      if (ventaError) throw ventaError;

      const { error: updateError } = await supabase
        .from('lotes')
        .update({
          estado: 'FINALIZADO',
          fecha_finalizacion: fechaVenta
        })
        .eq('id', lote.id);

      if (updateError) throw updateError;

      onVentaRealizada();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al finalizar el lote');
    } finally {
      setLoading(false);
    }
  };

  const { pesoTotalKg, ingresoTotal, ganancia, margenPorcentaje } = calcularIngresos();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Finalizar Lote y Registrar Venta</h2>
            <p className="text-sm text-gray-600 mt-1">
              Lote {lote.linea_genetica} - {lote.num_aves_actual} aves disponibles
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Esta acción finalizará el lote permanentemente</p>
              <p className="mt-1">El lote dejará de aparecer en lotes activos y no se podrán agregar más registros.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Venta
              </label>
              <input
                type="date"
                value={fechaVenta}
                onChange={(e) => setFechaVenta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Venta
              </label>
              <select
                value={tipoVenta}
                onChange={(e) => setTipoVenta(e.target.value as 'VIVO' | 'CONGELADO' | 'MIXTO')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="VIVO">Venta en Vivo</option>
                <option value="CONGELADO">Sacrificio y Congelado</option>
                <option value="MIXTO">Mixto (Vivo + Congelado)</option>
              </select>
            </div>
          </div>

          {(tipoVenta === 'VIVO' || tipoVenta === 'MIXTO') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Aves Vivo
                </label>
                <input
                  type="number"
                  value={cantidadVivo}
                  onChange={(e) => setCantidadVivo(e.target.value)}
                  min="0"
                  max={lote.num_aves_actual}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Vivo (MXN/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioVivo}
                  onChange={(e) => setPrecioVivo(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          {(tipoVenta === 'CONGELADO' || tipoVenta === 'MIXTO') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Aves Congelado
                </label>
                <input
                  type="number"
                  value={cantidadCongelado}
                  onChange={(e) => setCantidadCongelado(e.target.value)}
                  min="0"
                  max={lote.num_aves_actual}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Congelado (MXN/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioCongelado}
                  onChange={(e) => setPrecioCongelado(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              placeholder="Notas adicionales sobre la venta..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Resumen Financiero</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-700">Peso Total:</p>
                <p className="font-semibold text-blue-900">{pesoTotalKg.toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-blue-700">Ingreso Total:</p>
                <p className="font-semibold text-blue-900">
                  ${ingresoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-blue-700">Costo Total:</p>
                <p className="font-semibold text-blue-900">
                  ${costoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-blue-700">Ganancia Neta:</p>
                <p className={`font-semibold ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${ganancia.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  {' '}({margenPorcentaje >= 0 ? '+' : ''}{margenPorcentaje.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Finalizando...' : 'Finalizar Lote y Vender'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
