import { useState } from 'react';
import { supabase, Lote } from '../lib/supabase';
import { X } from 'lucide-react';

interface CrearLoteProps {
  onClose: () => void;
  onLoteCreado: (lote: Lote) => void;
}

export default function CrearLote({ onClose, onLoteCreado }: CrearLoteProps) {
  const [tipo, setTipo] = useState<'ENGORDE' | 'POSTURA'>('ENGORDE');
  const [lineaGenetica, setLineaGenetica] = useState('COBB500');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [edadSemanas, setEdadSemanas] = useState('');
  const [numAves, setNumAves] = useState('1000');
  const [costoPollito, setCostoPollito] = useState('12.50');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let fechaNacimiento: Date | null = null;

      if (tipo === 'ENGORDE') {
        fechaNacimiento = new Date(fechaInicio);
      } else if (edadSemanas) {
        const fecha = new Date(fechaInicio);
        const diasARestar = parseInt(edadSemanas) * 7;
        fechaNacimiento = new Date(fecha.setDate(fecha.getDate() - diasARestar));
      }

      const { data, error: insertError } = await supabase
        .from('lotes')
        .insert({
          tipo_produccion: tipo,
          linea_genetica: lineaGenetica,
          fecha_inicio: fechaInicio,
          fecha_nacimiento: fechaNacimiento ? fechaNacimiento.toISOString() : null,
          num_aves_inicial: parseInt(numAves),
          num_aves_actual: parseInt(numAves),
          costo_pollito_unitario: parseFloat(costoPollito),
          estado: 'ACTIVO'
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      if (data) {
        onLoteCreado(data as Lote);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el lote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Lote</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Producción
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'ENGORDE' | 'POSTURA')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ENGORDE">Pollo de Engorde</option>
              <option value="POSTURA">Gallina de Postura</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Línea Genética / Raza
            </label>
            <select
              value={lineaGenetica}
              onChange={(e) => setLineaGenetica(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tipo === 'ENGORDE' ? (
                <>
                  <option value="COBB500">Cobb 500</option>
                  <option value="ROSS308">Ross 308</option>
                  <option value="CORAL">Coral</option>
                </>
              ) : (
                <>
                  <option value="HYLINE_BROWN">Hy-Line Brown</option>
                  <option value="LOHMAN_BROWN">Lohman Brown</option>
                  <option value="LEGHORN">Leghorn</option>
                </>
              )}
            </select>
          </div>

          {tipo === 'POSTURA' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad Actual (semanas) - Opcional
              </label>
              <input
                type="number"
                value={edadSemanas}
                onChange={(e) => setEdadSemanas(e.target.value)}
                min="0"
                max="100"
                placeholder="Ej: 10 semanas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si ingresas la edad, se calculará la fecha de nacimiento automáticamente
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Aves Inicial
            </label>
            <input
              type="number"
              value={numAves}
              onChange={(e) => setNumAves(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo por Pollito (MXN)
            </label>
            <input
              type="number"
              step="0.01"
              value={costoPollito}
              onChange={(e) => setCostoPollito(e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
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
              {loading ? 'Creando...' : 'Crear Lote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
