// Module: Ventilation Management Protocols and Environmental Monitoring for Broilers

export interface BroilerVentilationData {
  lotId: string;
  date: string;
  oxygenLevelPercent: number; // Ambient oxygen concentration
  ammoniaLevelPpm: number; // Ammonia concentration in ppm
  co2LevelPpm: number; // Carbon dioxide concentration in ppm
  temperatureC: number;
  humidityPercent: number;
  ventilationStatus: 'good' | 'poor' | 'unknown';
}

export interface VentilationAlert {
  lotId: string;
  date: string;
  alertType: 'oxygen' | 'ammonia' | 'co2' | 'temperature' | 'humidity' | 'ventilation';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

// Thresholds for broiler ventilation alerts (configurable)
const OXYGEN_MIN = 18; // percent
const AMMONIA_MAX = 10; // ppm
const CO2_MAX = 3000; // ppm
const TEMP_MIN = 23; // Celsius (preheating)
const TEMP_MAX = 30; // Celsius
const HUMIDITY_MIN = 50; // percent
const HUMIDITY_MAX = 70; // percent

export function checkBroilerVentilationAlerts(data: BroilerVentilationData): VentilationAlert[] {
  const alerts: VentilationAlert[] = [];

  if (data.oxygenLevelPercent < OXYGEN_MIN) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'oxygen',
      message: `Oxygen level low (${data.oxygenLevelPercent}%). Minimum recommended is ${OXYGEN_MIN}%.`,
      severity: 'critical',
    });
  }

  if (data.ammoniaLevelPpm > AMMONIA_MAX) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'ammonia',
      message: `Ammonia level high (${data.ammoniaLevelPpm} ppm). Maximum recommended is ${AMMONIA_MAX} ppm.`,
      severity: 'critical',
    });
  }

  if (data.co2LevelPpm > CO2_MAX) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'co2',
      message: `CO2 level high (${data.co2LevelPpm} ppm). Maximum recommended is ${CO2_MAX} ppm.`,
      severity: 'warning',
    });
  }

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