import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  EnvironmentalData,
  EnvironmentalAlert,
  getEnvironmentalThresholds,
  checkEnvironmentalAlerts,
  calculateEnvironmentalScore,
  getEnvironmentalRecommendations,
  calculateVentilationStatus,
} from '../lib/environment';
import { Lote } from '../lib/supabase';

interface EnvironmentalMonitorProps {
  lote: Lote;
  environmentalData?: EnvironmentalData;
}

export default function EnvironmentalMonitor({ lote, environmentalData }: EnvironmentalMonitorProps) {
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [score, setScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (!environmentalData) return;

    const ageInDays = Math.floor(
      (new Date().getTime() - new Date(lote.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24)
    );

    const thresholds = getEnvironmentalThresholds(lote.tipo_produccion, ageInDays);
    const newAlerts = checkEnvironmentalAlerts(environmentalData, thresholds);
    const newScore = calculateEnvironmentalScore(environmentalData, thresholds);
    const newRecommendations = getEnvironmentalRecommendations(environmentalData, thresholds);

    setAlerts(newAlerts);
    setScore(newScore);
    setRecommendations(newRecommendations);
  }, [environmentalData, lote]);

  if (!environmentalData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoreo Ambiental</h3>
        <p className="text-gray-600 text-sm">
          No hay datos ambientales registrados. Agrega datos de temperatura, humedad y ventilación en el registro diario.
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getVentilationColor = (status: EnvironmentalData['ventilationStatus']): string => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  const getSeverityIcon = (severity: EnvironmentalAlert['severity']) => {
    switch (severity) {
      case 'emergency':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Environmental Score Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Calidad Ambiental</h3>
          <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${getScoreColor(score)}`}>
            {score}/100
          </div>
        </div>

        {/* Environmental Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Temperature */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Temperatura</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {environmentalData.temperatureC}°C
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Recomendado: 18-24°C
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Humedad</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {environmentalData.humidityPercent}%
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Recomendado: 50-70%
            </div>
          </div>

          {/* Ventilation */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Ventilación</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {environmentalData.ventilationRate}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Cambios/hora
            </div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVentilationColor(environmentalData.ventilationStatus)}`}>
                {environmentalData.ventilationStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Air Quality (if available) */}
        {(environmentalData.co2Level || environmentalData.ammoniaLevel) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {environmentalData.co2Level && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">CO₂</div>
                <div className="text-2xl font-bold text-gray-900">
                  {environmentalData.co2Level} ppm
                </div>
                <div className="text-xs text-gray-600 mt-1">Máximo: 3000 ppm</div>
              </div>
            )}
            {environmentalData.ammoniaLevel && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Amoníaco (NH₃)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {environmentalData.ammoniaLevel} ppm
                </div>
                <div className="text-xs text-gray-600 mt-1">Máximo: 20 ppm</div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Recomendaciones</h4>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alertas Ambientales ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border-l-4 ${
                  alert.severity === 'emergency'
                    ? 'bg-red-50 border-red-500'
                    : alert.severity === 'critical'
                    ? 'bg-orange-50 border-orange-500'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {alert.message}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          alert.severity === 'emergency'
                            ? 'bg-red-100 text-red-800'
                            : alert.severity === 'critical'
                            ? 'bg-orange-100 text-orange-800'
                            : alert.severity === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Acción recomendada:</strong> {alert.recommendedAction}
                    </p>
                    <div className="text-xs text-gray-500">
                      Tipo: {alert.alertType.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
