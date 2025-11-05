import { useState, useEffect } from 'react';
import { Egg, TrendingUp, AlertCircle, Award } from 'lucide-react';
import {
  EggProductionData,
  ProductionSummary,
  GeneticLinePerformance,
  ProductionAlert,
  calculateProductionSummary,
  evaluateGeneticLinePerformance,
  calculateProductionRate,
  calculateEggMass,
  checkProductionQuality,
  calculateEggEconomics,
} from '../lib/eggProduction';
import { Lote } from '../lib/supabase';

interface EggProductionDashboardProps {
  lote: Lote;
  productionData: EggProductionData[];
}

export default function EggProductionDashboard({ lote, productionData }: EggProductionDashboardProps) {
  const [summary, setSummary] = useState<ProductionSummary | null>(null);
  const [linePerformance, setLinePerformance] = useState<GeneticLinePerformance | null>(null);
  const [alerts, setAlerts] = useState<ProductionAlert[]>([]);
  const [economics, setEconomics] = useState<any>(null);

  useEffect(() => {
    if (productionData.length === 0) return;

    const newSummary = calculateProductionSummary(productionData);
    const performance = evaluateGeneticLinePerformance(
      lote.linea_genetica,
      productionData,
      lote.num_aves_actual
    );

    // Default egg prices (MXN per egg)
    const prices = {
      XL: 2.50,
      L: 2.20,
      M: 1.80,
      S: 1.20,
      cracked: 0,
      dirty: 1.50,
    };

    const econ = calculateEggEconomics(newSummary, prices);
    const newAlerts = checkProductionQuality(newSummary, performance);

    setSummary(newSummary);
    setLinePerformance(performance);
    setEconomics(econ);
    setAlerts(newAlerts);
  }, [productionData, lote]);

  if (!summary || productionData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Producción de Huevos</h3>
        <p className="text-gray-600 text-sm">
          No hay datos de producción de huevos registrados. Solo disponible para lotes de POSTURA.
        </p>
      </div>
    );
  }

  const productionRate = calculateProductionRate(
    summary.totalEggs,
    lote.num_aves_actual,
    productionData.length
  );

  const eggMass = calculateEggMass(
    summary.totalWeight,
    lote.num_aves_actual,
    productionData.length
  );

  const getColorBadge = (color: string, count: number, percentage: number) => {
    const colors: Record<string, string> = {
      white: 'bg-gray-100 text-gray-800 border-gray-300',
      brown: 'bg-amber-100 text-amber-800 border-amber-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      cream: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };

    return (
      <div className={`px-3 py-2 rounded-lg border-2 ${colors[color] || 'bg-gray-100 text-gray-800'}`}>
        <div className="text-xs font-medium capitalize">{color}</div>
        <div className="text-2xl font-bold mt-1">{count.toLocaleString()}</div>
        <div className="text-xs mt-1">{percentage.toFixed(1)}%</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Production Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Producción de Huevos</h3>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <Egg className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">
              {summary.totalEggs.toLocaleString()}
            </span>
            <span className="text-sm text-blue-700">huevos totales</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Tasa de Postura</div>
            <div className="text-3xl font-bold text-gray-900">{productionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-600 mt-1">Huevos/ave/día</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Peso Promedio</div>
            <div className="text-3xl font-bold text-gray-900">{summary.averageWeight.toFixed(1)}g</div>
            <div className="text-xs text-gray-600 mt-1">Por huevo</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Calidad</div>
            <div className="text-3xl font-bold text-gray-900">{summary.qualityPercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-600 mt-1">XL+L+M grades</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Pérdidas</div>
            <div className="text-3xl font-bold text-gray-900">{summary.lossPercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-600 mt-1">Rotos</div>
          </div>
        </div>

        {/* Production by Color */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Producción por Color</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {getColorBadge('white', summary.totalByColor.white, (summary.totalByColor.white / summary.totalEggs) * 100)}
            {getColorBadge('brown', summary.totalByColor.brown, (summary.totalByColor.brown / summary.totalEggs) * 100)}
            {getColorBadge('blue', summary.totalByColor.blue, (summary.totalByColor.blue / summary.totalEggs) * 100)}
            {getColorBadge('cream', summary.totalByColor.cream, (summary.totalByColor.cream / summary.totalEggs) * 100)}
          </div>
        </div>

        {/* Production by Grade */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Clasificación por Tamaño</h4>
          <div className="space-y-2">
            {[
              { label: 'Extra Grande (XL)', value: summary.totalByGrade.xl, color: 'bg-green-500' },
              { label: 'Grande (L)', value: summary.totalByGrade.l, color: 'bg-blue-500' },
              { label: 'Mediano (M)', value: summary.totalByGrade.m, color: 'bg-yellow-500' },
              { label: 'Pequeño (S)', value: summary.totalByGrade.s, color: 'bg-orange-500' },
              { label: 'Rotos', value: summary.totalByGrade.cracked, color: 'bg-red-500' },
              { label: 'Sucios', value: summary.totalByGrade.dirty, color: 'bg-gray-500' },
            ].map((grade) => {
              const percentage = (grade.value / summary.totalEggs) * 100;
              return (
                <div key={grade.label} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium text-gray-700">{grade.label}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full ${grade.color} flex items-center justify-end px-2`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 5 && (
                        <span className="text-xs font-bold text-white">{percentage.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold text-gray-900">
                    {grade.value.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Genetic Line Performance */}
      {linePerformance && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Desempeño Genético - {linePerformance.lineage}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Pureza de Color</div>
              <div className="text-2xl font-bold text-purple-900">
                {linePerformance.colorPurity.toFixed(1)}%
              </div>
              <div className="text-xs text-purple-700 mt-1">
                Color esperado: {linePerformance.expectedColor}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Producción/Ave</div>
              <div className="text-2xl font-bold text-indigo-900">
                {linePerformance.avgProductionPerBird.toFixed(2)}
              </div>
              <div className="text-xs text-indigo-700 mt-1">Huevos por ave (periodo)</div>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Tasa de Calidad</div>
              <div className="text-2xl font-bold text-pink-900">
                {linePerformance.qualityRate.toFixed(1)}%
              </div>
              <div className="text-xs text-pink-700 mt-1">Huevos comercializables</div>
            </div>
          </div>
        </div>
      )}

      {/* Economic Analysis */}
      {economics && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Económico</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Valor Total</div>
              <div className="text-3xl font-bold text-green-900">
                ${economics.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-green-700 mt-1">MXN</div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Valor Perdido</div>
              <div className="text-3xl font-bold text-orange-900">
                ${economics.lossValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-orange-700 mt-1">Por huevos rotos</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <strong>Valor promedio por huevo:</strong> ${economics.averageValuePerEgg.toFixed(2)} MXN
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Alertas de Producción</h3>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border-l-4 ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="font-semibold text-gray-900 text-sm mb-1">{alert.message}</div>
                <div className="text-sm text-gray-700">
                  <strong>Recomendación:</strong> {alert.recommendation}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Tipo: {alert.type.replace('_', ' ').toUpperCase()} | Severidad: {alert.severity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
