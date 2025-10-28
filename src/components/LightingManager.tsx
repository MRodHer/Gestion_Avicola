import React, { useState, useEffect } from 'react';
import {
  LightingSchedule,
  LightingProgram,
  getLightingForWeek,
  calculateLightingCompliance,
  checkLightingAlerts,
  generateLightingReminder,
  calculateLightingTimes,
  evaluateLightingEffectiveness,
} from '../lib/lighting';
import { calculateAge } from '../lib/ageUtils';

interface LightingManagerProps {
  lotId: string;
  productionType: 'ENGORDE' | 'POSTURA';
  startDate: string;
  activeBirds: number;
}

export default function LightingManager({
  lotId,
  productionType,
  startDate,
  activeBirds,
}: LightingManagerProps) {
  const [schedules, setSchedules] = useState<LightingSchedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<LightingSchedule>({
    lotId,
    date: new Date().toISOString().split('T')[0],
    actualLightHours: 0,
    actualIntensityLux: 0,
    targetLightHours: 0,
    targetIntensityLux: 0,
  });
  const [preferredStartTime, setPreferredStartTime] = useState('06:00');

  const age = calculateAge(startDate);
  const currentWeek = Math.ceil(age / 7);
  const nextWeek = currentWeek + 1;

  // Get target lighting for current week
  useEffect(() => {
    const targetLighting = getLightingForWeek(productionType, currentWeek);
    if (targetLighting) {
      const times = calculateLightingTimes(targetLighting.lightHours, preferredStartTime);
      setCurrentSchedule(prev => ({
        ...prev,
        targetLightHours: targetLighting.lightHours,
        targetIntensityLux: targetLighting.intensityLux,
        startTime: times.startTime,
        endTime: times.endTime,
      }));
    }
  }, [currentWeek, productionType, preferredStartTime]);

  // Check for alerts
  const alerts = currentSchedule.actualLightHours > 0
    ? checkLightingAlerts(currentSchedule, productionType)
    : [];

  // Get reminder for next week
  const reminder = generateLightingReminder(productionType, currentWeek, nextWeek);

  // Calculate effectiveness (if we have historical data)
  const effectiveness = schedules.length > 0
    ? evaluateLightingEffectiveness(schedules, productionType)
    : null;

  // Calculate compliance
  const compliance = schedules.length > 0
    ? calculateLightingCompliance(schedules)
    : null;

  const handleSaveSchedule = async () => {
    // In real implementation, save to Supabase
    console.log('Saving lighting schedule:', currentSchedule);
    setSchedules([...schedules, currentSchedule]);

    // Reset for next entry
    setCurrentSchedule({
      lotId,
      date: new Date().toISOString().split('T')[0],
      actualLightHours: 0,
      actualIntensityLux: 0,
      targetLightHours: currentSchedule.targetLightHours,
      targetIntensityLux: currentSchedule.targetIntensityLux,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-900';
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'info': return 'bg-blue-100 border-blue-500 text-blue-900';
      default: return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Lighting Program Management
        </h2>
        <p className="text-gray-600">
          Production Type: <span className="font-semibold">{productionType}</span> |
          Age: <span className="font-semibold">{age} days (Week {currentWeek})</span> |
          Active Birds: <span className="font-semibold">{activeBirds.toLocaleString()}</span>
        </p>
      </div>

      {/* Current Week Target */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow p-6 border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Week Target</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Photoperiod</p>
            <p className="text-2xl font-bold text-purple-700">
              {currentSchedule.targetLightHours}h
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Intensity</p>
            <p className="text-2xl font-bold text-purple-700">
              {currentSchedule.targetIntensityLux} lux
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Schedule</p>
            <p className="text-lg font-semibold text-purple-700">
              {currentSchedule.startTime || '--:--'} to {currentSchedule.endTime || '--:--'}
            </p>
          </div>
        </div>
      </div>

      {/* Next Week Reminder */}
      {reminder && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Upcoming Adjustment</h4>
          <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans">
            {reminder}
          </pre>
        </div>
      )}

      {/* Daily Entry Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Record Daily Lighting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={currentSchedule.date}
              onChange={(e) => setCurrentSchedule({ ...currentSchedule, date: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Start Time
            </label>
            <input
              type="time"
              value={preferredStartTime}
              onChange={(e) => {
                setPreferredStartTime(e.target.value);
                const times = calculateLightingTimes(currentSchedule.targetLightHours, e.target.value);
                setCurrentSchedule({
                  ...currentSchedule,
                  startTime: times.startTime,
                  endTime: times.endTime,
                });
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Light Hours
            </label>
            <input
              type="number"
              step="0.5"
              value={currentSchedule.actualLightHours}
              onChange={(e) => setCurrentSchedule({
                ...currentSchedule,
                actualLightHours: parseFloat(e.target.value) || 0,
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 16.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Intensity (lux)
            </label>
            <input
              type="number"
              value={currentSchedule.actualIntensityLux}
              onChange={(e) => setCurrentSchedule({
                ...currentSchedule,
                actualIntensityLux: parseInt(e.target.value) || 0,
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 10"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={currentSchedule.notes || ''}
              onChange={(e) => setCurrentSchedule({ ...currentSchedule, notes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="Any observations or issues..."
            />
          </div>
        </div>
        <button
          onClick={handleSaveSchedule}
          disabled={currentSchedule.actualLightHours === 0}
          className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Save Daily Record
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Alerts</h3>
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-lg border-l-4 p-4 ${getSeverityColor(alert.severity)}`}
            >
              <h4 className="font-semibold mb-1">{alert.message}</h4>
              <p className="text-sm">{alert.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Effectiveness Metrics */}
      {effectiveness && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Program Effectiveness</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Avg Photoperiod</p>
              <p className="text-xl font-bold text-gray-800">
                {effectiveness.averagePhotoperiod.toFixed(1)}h
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Consistency</p>
              <p className="text-xl font-bold text-gray-800">
                {effectiveness.consistency.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Program Adherence</p>
              <p className="text-xl font-bold text-gray-800">
                {effectiveness.programAdherence.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Adjustments</p>
              <p className="text-xl font-bold text-gray-800">
                {effectiveness.totalAdjustments}
              </p>
            </div>
          </div>
          <div className={`p-3 rounded-md ${
            effectiveness.programAdherence >= 80 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
          }`}>
            <p className="font-medium">{effectiveness.recommendation}</p>
          </div>
        </div>
      )}

      {/* Compliance Summary */}
      {compliance && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Compliance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Average Deviation</p>
              <p className="text-xl font-bold text-gray-800">
                {compliance.averageDeviation.toFixed(2)}h
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <p className="text-xl font-bold text-gray-800">
                {compliance.complianceRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days Out of Spec</p>
              <p className="text-xl font-bold text-gray-800">
                {compliance.daysOutOfSpec} / {schedules.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
