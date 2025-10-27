import { useEffect, useState } from 'react';
import { supabase, Lote, CostoLote } from './lib/supabase';
import CrearLote from './components/CrearLote';
import RegistroDiarioForm from './components/RegistroDiarioForm';
import DashboardLote from './components/DashboardLote';
import FinalizarLote from './components/FinalizarLote';
import Ventas from './components/Ventas';
import { Plus, Bird, Home, DollarSign } from 'lucide-react';

type Vista = 'lotes' | 'ventas';

function App() {
  const [vista, setVista] = useState<Vista>('lotes');
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState<Lote | null>(null);
  const [mostrarCrearLote, setMostrarCrearLote] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mostrarFinalizar, setMostrarFinalizar] = useState(false);
  const [costoTotalLote, setCostoTotalLote] = useState(0);
  const [pesoPromedioLote, setPesoPromedioLote] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarLotes();
  }, []);

  const cargarLotes = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lotes')
        .select('*')
        .eq('estado', 'ACTIVO')
        .order('fecha_inicio', { ascending: false });

      if (data) {
        setLotes(data as Lote[]);
        if (data.length > 0 && !loteSeleccionado) {
          setLoteSeleccionado(data[0] as Lote);
        }
      }
    } catch (error) {
      console.error('Error al cargar lotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoteCreado = (nuevoLote: Lote) => {
    setLotes([nuevoLote, ...lotes]);
    setLoteSeleccionado(nuevoLote);
  };

  const handleRegistroCreado = () => {
    cargarLotes();
  };

  const handleFinalizarClick = async () => {
    if (!loteSeleccionado) return;

    const { data: costosData } = await supabase
      .from('costos_lote')
      .select('costo_transformacion_acumulado')
      .eq('lote_id', loteSeleccionado.id)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: registrosData } = await supabase
      .from('registros_diarios')
      .select('peso_promedio_g')
      .eq('lote_id', loteSeleccionado.id)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle();

    const costoTotal = costosData?.costo_transformacion_acumulado || 0;
    const pesoPromedioG = registrosData?.peso_promedio_g || 0;
    const pesoPromedioKg = pesoPromedioG / 1000;

    setCostoTotalLote(costoTotal);
    setPesoPromedioLote(pesoPromedioKg);
    setMostrarFinalizar(true);
  };

  const handleVentaRealizada = () => {
    cargarLotes();
    setMostrarFinalizar(false);
    setLoteSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Bird className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Gestión Avícola
                </h1>
                <p className="text-sm text-gray-600">
                  Control de Eficiencia y Cumplimiento NIF C-11
                </p>
              </div>
            </div>
            <button
              onClick={() => setMostrarCrearLote(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Lote
            </button>
          </div>
        </div>

        <nav className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setVista('lotes')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  vista === 'lotes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Home className="w-4 h-4" />
                Lotes Activos
              </button>
              <button
                onClick={() => setVista('ventas')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  vista === 'ventas'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Ventas
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {vista === 'ventas' ? (
          <Ventas />
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : lotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bird className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No hay lotes activos
            </h2>
            <p className="text-gray-600 mb-6">
              Comienza creando tu primer lote de producción avícola
            </p>
            <button
              onClick={() => setMostrarCrearLote(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Lote
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {lotes.length > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Lotes Activos</h3>
                <div className="flex flex-wrap gap-2">
                  {lotes.map((lote) => (
                    <button
                      key={lote.id}
                      onClick={() => setLoteSeleccionado(lote)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        loteSeleccionado?.id === lote.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lote.linea_genetica} ({lote.num_aves_actual} aves)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loteSeleccionado && (
              <DashboardLote
                key={loteSeleccionado.id}
                lote={loteSeleccionado}
                onRegistrarClick={() => setMostrarRegistro(true)}
                onFinalizarClick={handleFinalizarClick}
              />
            )}
          </div>
        )}
      </main>

      {mostrarCrearLote && (
        <CrearLote
          onClose={() => setMostrarCrearLote(false)}
          onLoteCreado={handleLoteCreado}
        />
      )}

      {mostrarRegistro && loteSeleccionado && (
        <RegistroDiarioForm
          lote={loteSeleccionado}
          onClose={() => setMostrarRegistro(false)}
          onRegistroCreado={handleRegistroCreado}
        />
      )}

      {mostrarFinalizar && loteSeleccionado && (
        <FinalizarLote
          lote={loteSeleccionado}
          costoTotal={costoTotalLote}
          pesoPromedioKg={pesoPromedioLote}
          onClose={() => setMostrarFinalizar(false)}
          onVentaRealizada={handleVentaRealizada}
        />
      )}
    </div>
  );
}

export default App;
