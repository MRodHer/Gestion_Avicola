import { useState } from 'react';
import { supabase, Lote, RegistroDiario } from '../lib/supabase';
import { X } from 'lucide-react';

interface RegistroDiarioFormProps {
  lote: Lote;
  onClose: () => void;
  onRegistroCreado: (registro: RegistroDiario) => void;
}

export default function RegistroDiarioForm({ lote, onClose, onRegistroCreado }: RegistroDiarioFormProps) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [mortalidad, setMortalidad] = useState('0');
  const [alimento, setAlimento] = useState('');
  const [agua, setAgua] = useState('');
  const [peso, setPeso] = useState('');
  const [huevos, setHuevos] = useState('0');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: registroData, error: insertError } = await supabase
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

      if (insertError) throw insertError;

      const mortalidadNum = parseInt(mortalidad);
      if (mortalidadNum > 0) {
        const { error: updateError } = await supabase
          .from('lotes')
          .update({ num_aves_actual: lote.num_aves_actual - mortalidadNum })
          .eq('id', lote.id);

        if (updateError) throw updateError;
      }

      const precioAlimentoKg = 8.5;
      const costoAlimentoDia = parseFloat(alimento) * precioAlimentoKg;

      const { data: lotesActivos } = await supabase
        .from('lotes')
        .select('num_aves_actual')
        .eq('estado', 'ACTIVO');

      const totalAves = lotesActivos?.reduce((sum, l) => sum + l.num_aves_actual, 0) || 1;
      const proporcion = lote.num_aves_actual / totalAves;
      const costoIndirectoDiario = 500;
      const costoIndirectoProrrateado = costoIndirectoDiario * proporcion;

      const { data: ultimoCosto } = await supabase
        .from('costos_lote')
        .select('costo_transformacion_acumulado')
        .eq('lote_id', lote.id)
        .order('fecha', { ascending: false })
        .limit(1)
        .maybeSingle();

      const costoAcumuladoAnterior = ultimoCosto?.costo_transformacion_acumulado || 0;
      const costoTransformacionAcumulado = costoAcumuladoAnterior + costoAlimentoDia + costoIndirectoProrrateado;

      await supabase.from('costos_lote').insert({
        lote_id: lote.id,
        fecha,
        costo_alimento: costoAlimentoDia,
        costo_vacunas: 0,
        costos_indirectos_prorrateados: costoIndirectoProrrateado,
        costo_transformacion_acumulado: costoTransformacionAcumulado
      });

      if (registroData) {
        onRegistroCreado(registroData as RegistroDiario);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Registro Diario - Lote {lote.linea_genetica}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mortalidad Diaria
              </label>
              <input
                type="number"
                value={mortalidad}
                onChange={(e) => setMortalidad(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alimento Consumido (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                value={alimento}
                onChange={(e) => setAlimento(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agua Consumida (litros)
              </label>
              <input
                type="number"
                step="0.01"
                value={agua}
                onChange={(e) => setAgua(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso Promedio (gramos)
              </label>
              <input
                type="number"
                step="0.01"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                min="0"
                placeholder="Muestreo semanal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {lote.tipo_produccion === 'POSTURA' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Huevos Producidos
                </label>
                <input
                  type="number"
                  value={huevos}
                  onChange={(e) => setHuevos(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Vacunas, medicamentos, eventos especiales..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {loading ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
