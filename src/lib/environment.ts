// Module: Environmental Control Parameters and Alerting

export interface EnvironmentalData {
  lotId: string;
  date: string;
  temperatureC: number; // Celsius
  humidityPercent: number; // Relative Humidity %
  ventilationStatus: 'good' | 'poor' | 'unknown';
}

export interface EnvironmentalAlert {
  lotId: string;
  date: string;
  alertType: 'temperature' | 'humidity' | 'ventilation';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

// Thresholds for alerts (can be configurable)
const TEMP_MIN = 18;
const TEMP_MAX = 24;
const HUMIDITY_MIN = 40;
const HUMIDITY_MAX = 70;

export function checkEnvironmentalAlerts(data: EnvironmentalData): EnvironmentalAlert[] {
  const alerts: EnvironmentalAlert[] = [];

  if (data.temperatureC < TEMP_MIN) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'temperature',
      message: `Temperature too low (${data.temperatureC}°C). Minimum recommended is ${TEMP_MIN}°C.`,
      severity: 'warning',
    });
  } else if (data.temperatureC > TEMP_MAX) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'temperature',
      message: `Temperature too high (${data.temperatureC}°C). Maximum recommended is ${TEMP_MAX}°C.`,
      severity: 'warning',
    });
  }

  if (data.humidityPercent < HUMIDITY_MIN) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'humidity',
      message: `Humidity too low (${data.humidityPercent}%). Minimum recommended is ${HUMIDITY_MIN}%.`,
      severity: 'info',
    });
  } else if (data.humidityPercent > HUMIDITY_MAX) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'humidity',
      message: `Humidity too high (${data.humidityPercent}%). Maximum recommended is ${HUMIDITY_MAX}%.`,
      severity: 'info',
    });
  }

  if (data.ventilationStatus === 'poor') {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'ventilation',
      message: `Ventilation status is poor. Immediate action recommended.`,
      severity: 'critical',
    });
  }

  return alerts;
}