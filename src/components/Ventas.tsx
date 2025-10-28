import { useEffect, useState } from 'react';
import { supabase, Venta, Lote } from '../lib/supabase';
import { DollarSign, TrendingUp, Package } from 'lucide-react';

export default function Ventas() {
  const [ventas, setVentas] = useState<(Venta & { lote?: Lote })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const { data: ventasData } = await supabase
        .from('ventas')
        .select('*')
        .order('fecha_venta', { ascending: false });

      if (ventasData) {
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
        setVentas(ventasConLotes);
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  const totales = ventas.reduce(
    (acc, venta) => ({
      ingresos: acc.ingresos + venta.ingreso_total,
      costos: acc.costos + venta.costo_total,
      ganancias: acc.ganancias + venta.ganancia_neta
    }),
    { ingresos: 0, costos: 0, ganancias: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Ingresos Totales</h3>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">
            ${totales.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-900">Costos Totales</h3>
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">
            ${totales.costos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-900">Ganancias Netas</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">
            ${totales.ganancias.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-green-700 mt-1">
            Margen: {totales.costos > 0 ? ((totales.ganancias / totales.costos) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Historial de Ventas</h2>
        </div>

        {ventas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No hay ventas registradas todavía</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganancia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ventas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(venta.fecha_venta).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venta.lote?.linea_genetica || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          venta.tipo_venta === 'VIVO'
                            ? 'bg-blue-100 text-blue-800'
                            : venta.tipo_venta === 'CONGELADO'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {venta.tipo_venta}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venta.cantidad_aves_vivo + venta.cantidad_aves_congelado} aves
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venta.peso_total_kg.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${venta.ingreso_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={venta.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${venta.ganancia_neta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
