// Module: Advanced Environmental Control Parameters and Alerting System
// Implements temperature, humidity, ventilation monitoring with age-specific thresholds

export interface EnvironmentalData {
  id?: string;
  lotId: string;
  date: string;
  temperatureC: number; // Celsius
  humidityPercent: number; // Relative Humidity %
  ventilationRate: number; // Air changes per hour
  ventilationStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  co2Level?: number; // ppm (optional)
  ammoniaLevel?: number; // ppm (optional)
  notes?: string;
}

export interface EnvironmentalAlert {
  id?: string;
  lotId: string;
  date: string;
  alertType: 'temperature' | 'humidity' | 'ventilation' | 'air_quality';
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  recommendedAction: string;
  autoResolved?: boolean;
}

export interface EnvironmentalThresholds {
  tempMin: number;
  tempMax: number;
  tempIdeal: number;
  humidityMin: number;
  humidityMax: number;
  humidityIdeal: number;
  minVentilationRate: number;
  maxCO2: number;
  maxAmmonia: number;
}

// Age-based thresholds for broilers (ENGORDE)
const BROILER_THRESHOLDS: Record<string, EnvironmentalThresholds> = {
  'week_1': {
    tempMin: 30,
    tempMax: 34,
    tempIdeal: 32,
    humidityMin: 50,
    humidityMax: 70,
    humidityIdeal: 60,
    minVentilationRate: 0.8,
    maxCO2: 3000,
    maxAmmonia: 10,
  },
  'week_2': {
    tempMin: 27,
    tempMax: 30,
    tempIdeal: 28,
    humidityMin: 50,
    humidityMax: 70,
    humidityIdeal: 60,
    minVentilationRate: 1.2,
    maxCO2: 3000,
    maxAmmonia: 15,
  },
  'week_3': {
    tempMin: 24,
    tempMax: 27,
    tempIdeal: 25,
    humidityMin: 50,
    humidityMax: 70,
    humidityIdeal: 60,
    minVentilationRate: 1.5,
    maxCO2: 3000,
    maxAmmonia: 20,
  },
  'week_4_plus': {
    tempMin: 18,
    tempMax: 24,
    tempIdeal: 21,
    humidityMin: 50,
    humidityMax: 70,
    humidityIdeal: 60,
    minVentilationRate: 2.0,
    maxCO2: 3000,
    maxAmmonia: 25,
  },
};

// Thresholds for layers (POSTURA)
const LAYER_THRESHOLDS: EnvironmentalThresholds = {
  tempMin: 18,
  tempMax: 24,
  tempIdeal: 21,
  humidityMin: 40,
  humidityMax: 70,
  humidityIdeal: 55,
  minVentilationRate: 1.5,
  maxCO2: 3000,
  maxAmmonia: 20,
};

/**
 * Get age-appropriate environmental thresholds
 */
export function getEnvironmentalThresholds(
  productionType: 'ENGORDE' | 'POSTURA',
  ageInDays: number
): EnvironmentalThresholds {
  if (productionType === 'POSTURA') {
    return LAYER_THRESHOLDS;
  }

  // For broilers, use age-based thresholds
  if (ageInDays <= 7) return BROILER_THRESHOLDS.week_1;
  if (ageInDays <= 14) return BROILER_THRESHOLDS.week_2;
  if (ageInDays <= 21) return BROILER_THRESHOLDS.week_3;
  return BROILER_THRESHOLDS.week_4_plus;
}

/**
 * Calculate ventilation status based on rate and quality indicators
 */
export function calculateVentilationStatus(
  ventilationRate: number,
  minRequired: number,
  co2Level?: number,
  ammoniaLevel?: number
): EnvironmentalData['ventilationStatus'] {
  const rateRatio = ventilationRate / minRequired;

  // Critical conditions
  if (co2Level && co2Level > 5000) return 'critical';
  if (ammoniaLevel && ammoniaLevel > 50) return 'critical';

  // Poor conditions
  if (rateRatio < 0.5 || (co2Level && co2Level > 4000) || (ammoniaLevel && ammoniaLevel > 35)) {
    return 'poor';
  }

  // Fair conditions
  if (rateRatio < 0.8 || (co2Level && co2Level > 3500) || (ammoniaLevel && ammoniaLevel > 25)) {
    return 'fair';
  }

  // Excellent conditions
  if (rateRatio >= 1.2 && (!co2Level || co2Level < 2000) && (!ammoniaLevel || ammoniaLevel < 15)) {
    return 'excellent';
  }

  return 'good';
}

/**
 * Check environmental parameters and generate alerts
 */
export function checkEnvironmentalAlerts(
  data: EnvironmentalData,
  thresholds: EnvironmentalThresholds
): EnvironmentalAlert[] {
  const alerts: EnvironmentalAlert[] = [];

  // Temperature alerts
  if (data.temperatureC < thresholds.tempMin - 3) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'temperature',
      message: `EMERGENCY: Temperature critically low (${data.temperatureC}°C)`,
      severity: 'emergency',
      recommendedAction: 'Activate heating systems immediately. Check for equipment failure.',
    });
  } else if (data.temperatureC < thresholds.tempMin) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'temperature',
      message: `Temperature below minimum (${data.temperatureC}°C). Target: ${thresholds.tempIdeal}°C.`,
      severity: 'warning',
      recommendedAction: 'Increase heating. Check ventilation settings.',
    });
  } else if (data.temperatureC > thresholds.tempMax + 3) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'temperature',
      message: `EMERGENCY: Temperature critically high (${data.temperatureC}°C)`,
      severity: 'emergency',
      recommendedAction: 'Increase ventilation immediately. Check cooling systems. Monitor for heat stress.',
    });
  } else if (data.temperatureC > thresholds.tempMax) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'temperature',
      message: `Temperature above maximum (${data.temperatureC}°C). Target: ${thresholds.tempIdeal}°C.`,
      severity: 'warning',
      recommendedAction: 'Increase ventilation. Consider cooling systems.',
    });
  }

  // Humidity alerts
  if (data.humidityPercent < thresholds.humidityMin - 10) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'humidity',
      message: `Humidity very low (${data.humidityPercent}%). Risk of respiratory issues.`,
      severity: 'warning',
      recommendedAction: 'Add humidification. Check water lines for leaks.',
    });
  } else if (data.humidityPercent < thresholds.humidityMin) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'humidity',
      message: `Humidity below minimum (${data.humidityPercent}%). Target: ${thresholds.humidityIdeal}%.`,
      severity: 'info',
      recommendedAction: 'Monitor humidity levels. Consider humidification.',
    });
  } else if (data.humidityPercent > thresholds.humidityMax + 10) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'humidity',
      message: `Humidity very high (${data.humidityPercent}%). Risk of disease and poor litter quality.`,
      severity: 'critical',
      recommendedAction: 'Increase ventilation immediately. Check for water leaks. Monitor litter condition.',
    });
  } else if (data.humidityPercent > thresholds.humidityMax) {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'humidity',
      message: `Humidity above maximum (${data.humidityPercent}%). Target: ${thresholds.humidityIdeal}%.`,
      severity: 'warning',
      recommendedAction: 'Increase ventilation. Check litter condition.',
    });
  }

  // Ventilation alerts
  if (data.ventilationStatus === 'critical') {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'ventilation',
      message: `CRITICAL: Ventilation system failure or extremely poor air quality`,
      severity: 'emergency',
      recommendedAction: 'Immediate inspection required. Check all fans and vents. Open emergency vents.',
    });
  } else if (data.ventilationStatus === 'poor') {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'ventilation',
      message: `Ventilation inadequate (${data.ventilationRate} air changes/hour)`,
      severity: 'critical',
      recommendedAction: 'Increase fan speed. Check for blocked vents. Verify fan operation.',
    });
  } else if (data.ventilationStatus === 'fair') {
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'ventilation',
      message: `Ventilation below optimal (${data.ventilationRate} air changes/hour)`,
      severity: 'warning',
      recommendedAction: 'Consider increasing ventilation rate.',
    });
  }

  // Air quality alerts
  if (data.co2Level && data.co2Level > thresholds.maxCO2) {
    const severity = data.co2Level > 5000 ? 'critical' : 'warning';
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'air_quality',
      message: `CO2 level high (${data.co2Level} ppm). Maximum: ${thresholds.maxCO2} ppm.`,
      severity,
      recommendedAction: 'Increase ventilation immediately. Check ventilation system.',
    });
  }

  if (data.ammoniaLevel && data.ammoniaLevel > thresholds.maxAmmonia) {
    const severity = data.ammoniaLevel > 40 ? 'critical' : 'warning';
    alerts.push({
      lotId: data.lotId,
      date: data.date,
      alertType: 'air_quality',
      message: `Ammonia level high (${data.ammoniaLevel} ppm). Maximum: ${thresholds.maxAmmonia} ppm.`,
      severity,
      recommendedAction: 'Improve ventilation. Clean and replace litter. Check drainage.',
    });
  }

  return alerts;
}

/**
 * Calculate environmental quality score (0-100)
 */
export function calculateEnvironmentalScore(
  data: EnvironmentalData,
  thresholds: EnvironmentalThresholds
): number {
  let score = 100;

  // Temperature score (max -30 points)
  const tempDeviation = Math.abs(data.temperatureC - thresholds.tempIdeal);
  score -= Math.min(30, tempDeviation * 5);

  // Humidity score (max -25 points)
  const humidityDeviation = Math.abs(data.humidityPercent - thresholds.humidityIdeal);
  score -= Math.min(25, humidityDeviation * 0.5);

  // Ventilation score (max -25 points)
  const ventilationScores = {
    'excellent': 0,
    'good': 5,
    'fair': 15,
    'poor': 25,
    'critical': 30,
  };
  score -= ventilationScores[data.ventilationStatus] || 0;

  // Air quality score (max -20 points)
  if (data.co2Level) {
    score -= Math.min(10, Math.max(0, (data.co2Level - thresholds.maxCO2) / 100));
  }
  if (data.ammoniaLevel) {
    score -= Math.min(10, Math.max(0, (data.ammoniaLevel - thresholds.maxAmmonia) * 0.5));
  }

  return Math.max(0, Math.round(score));
}

/**
 * Get recommended environmental adjustments
 */
export function getEnvironmentalRecommendations(
  data: EnvironmentalData,
  thresholds: EnvironmentalThresholds
): string[] {
  const recommendations: string[] = [];

  if (data.temperatureC < thresholds.tempIdeal - 1) {
    recommendations.push(`Increase temperature by ${(thresholds.tempIdeal - data.temperatureC).toFixed(1)}°C`);
  } else if (data.temperatureC > thresholds.tempIdeal + 1) {
    recommendations.push(`Decrease temperature by ${(data.temperatureC - thresholds.tempIdeal).toFixed(1)}°C`);
  }

  if (data.humidityPercent < thresholds.humidityIdeal - 5) {
    recommendations.push('Increase humidity through water spraying or humidifiers');
  } else if (data.humidityPercent > thresholds.humidityIdeal + 5) {
    recommendations.push('Decrease humidity by improving ventilation');
  }

  if (data.ventilationRate < thresholds.minVentilationRate) {
    const increase = ((thresholds.minVentilationRate - data.ventilationRate) / data.ventilationRate * 100).toFixed(0);
    recommendations.push(`Increase ventilation rate by approximately ${increase}%`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Environmental parameters are optimal. Maintain current settings.');
  }

  return recommendations;
}