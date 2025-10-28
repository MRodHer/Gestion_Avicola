// Module: Advanced Lighting Program Management with Gradual Adjustments, Intensity Monitoring and Automated Alerts
// Implements lighting programs for both layers and broilers with photoperiod control

export interface LightingSchedule {
  id?: string;
  lotId: string;
  date: string;
  actualLightHours: number;
  actualIntensityLux: number;
  targetLightHours: number;
  targetIntensityLux: number;
  startTime?: string; // HH:MM format
  endTime?: string;   // HH:MM format
  notes?: string;
  createdAt?: string;
}

export interface LightingProgram {
  id?: string;
  lotId: string;
  productionType: 'ENGORDE' | 'POSTURA';
  programType: 'stimulation' | 'maintenance' | 'broiler_standard';
  currentWeek: number;
  targetLightHours: number;
  targetIntensityLux: number;
  autoAdjust: boolean; // Automatically adjust based on age
}

export interface LightingProgramEntry {
  week: number;
  lightHours: number;
  intensityLux: number;
  description?: string;
}

export interface LightingAlert {
  type: 'hours_deviation' | 'intensity_deviation' | 'program_change';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

// Lighting program for layer stimulation (start at week 16-18)
export const layerStimulationProgram: LightingProgramEntry[] = [
  { week: 16, lightHours: 10, intensityLux: 5, description: 'Pre-stimulation - natural daylight' },
  { week: 17, lightHours: 11, intensityLux: 10, description: 'Begin stimulation' },
  { week: 18, lightHours: 12, intensityLux: 10, description: 'Gradual increase +1hr' },
  { week: 19, lightHours: 13, intensityLux: 10, description: 'Gradual increase +1hr' },
  { week: 20, lightHours: 14, intensityLux: 10, description: 'Gradual increase +1hr' },
  { week: 21, lightHours: 15, intensityLux: 10, description: 'Gradual increase +1hr' },
  { week: 22, lightHours: 15.5, intensityLux: 10, description: 'Slow increase +30min' },
  { week: 23, lightHours: 16, intensityLux: 10, description: 'Slow increase +30min' },
  { week: 24, lightHours: 16, intensityLux: 10, description: 'Maintain for peak production' },
  { week: 25, lightHours: 16, intensityLux: 10, description: 'Maintain for peak production' },
  { week: 26, lightHours: 16.5, intensityLux: 10, description: 'Final adjustment' },
  { week: 27, lightHours: 17, intensityLux: 10, description: 'Maximum photoperiod' },
];

// Lighting program for layer maintenance (week 28+)
export const layerMaintenanceProgram: LightingProgramEntry[] = [
  { week: 28, lightHours: 17, intensityLux: 10, description: 'Peak production maintenance' },
  { week: 40, lightHours: 17, intensityLux: 10, description: 'Maintain through production cycle' },
  { week: 60, lightHours: 16.5, intensityLux: 10, description: 'Slight reduction in late production' },
];

// Lighting program for broilers
export const broilerLightingProgram: LightingProgramEntry[] = [
  { week: 1, lightHours: 23, intensityLux: 20, description: 'Week 1 - near continuous light for feeding' },
  { week: 2, lightHours: 18, intensityLux: 15, description: 'Week 2 - reduce to prevent leg issues' },
  { week: 3, lightHours: 18, intensityLux: 10, description: 'Week 3 - maintain with lower intensity' },
  { week: 4, lightHours: 18, intensityLux: 10, description: 'Week 4+ - maintain until market' },
];

/**
 * Get appropriate lighting program based on production type and age
 */
export function getLightingProgram(
  productionType: 'ENGORDE' | 'POSTURA',
  ageWeeks: number
): LightingProgramEntry[] {
  if (productionType === 'ENGORDE') {
    return broilerLightingProgram;
  }

  // For layers, use stimulation until week 27, then maintenance
  if (ageWeeks < 28) {
    return layerStimulationProgram;
  }
  return layerMaintenanceProgram;
}

/**
 * Get target lighting for specific week
 */
export function getLightingForWeek(
  productionType: 'ENGORDE' | 'POSTURA',
  week: number
): { lightHours: number; intensityLux: number; description?: string } | null {
  const program = getLightingProgram(productionType, week);

  // Find exact week match
  const exactMatch = program.find(entry => entry.week === week);
  if (exactMatch) {
    return {
      lightHours: exactMatch.lightHours,
      intensityLux: exactMatch.intensityLux,
      description: exactMatch.description,
    };
  }

  // Find nearest week (use previous week's settings)
  const sortedProgram = [...program].sort((a, b) => a.week - b.week);
  let nearest = sortedProgram[0];

  for (const entry of sortedProgram) {
    if (entry.week <= week) {
      nearest = entry;
    } else {
      break;
    }
  }

  return {
    lightHours: nearest.lightHours,
    intensityLux: nearest.intensityLux,
    description: nearest.description,
  };
}

/**
 * Calculate lighting schedule compliance
 */
export function calculateLightingCompliance(
  schedule: LightingSchedule[]
): {
  averageDeviation: number;
  complianceRate: number;
  daysOutOfSpec: number;
} {
  if (schedule.length === 0) {
    return { averageDeviation: 0, complianceRate: 100, daysOutOfSpec: 0 };
  }

  let totalDeviation = 0;
  let daysOutOfSpec = 0;

  schedule.forEach(day => {
    const deviation = Math.abs(day.actualLightHours - day.targetLightHours);
    totalDeviation += deviation;

    // Consider out of spec if deviation > 30 minutes (0.5 hours)
    if (deviation > 0.5) {
      daysOutOfSpec++;
    }
  });

  const averageDeviation = totalDeviation / schedule.length;
  const complianceRate = ((schedule.length - daysOutOfSpec) / schedule.length) * 100;

  return {
    averageDeviation,
    complianceRate,
    daysOutOfSpec,
  };
}

/**
 * Check lighting schedule and generate alerts
 */
export function checkLightingAlerts(
  schedule: LightingSchedule,
  productionType: 'ENGORDE' | 'POSTURA'
): LightingAlert[] {
  const alerts: LightingAlert[] = [];

  // Check hours deviation
  const hoursDeviation = Math.abs(schedule.actualLightHours - schedule.targetLightHours);

  if (hoursDeviation > 1.0) {
    alerts.push({
      type: 'hours_deviation',
      severity: 'critical',
      message: `Lighting hours significantly off target: ${schedule.actualLightHours}h vs ${schedule.targetLightHours}h target`,
      recommendation: 'Immediately adjust timer settings. Large deviations can impact egg production and bird welfare.',
    });
  } else if (hoursDeviation > 0.5) {
    alerts.push({
      type: 'hours_deviation',
      severity: 'warning',
      message: `Lighting hours deviation: ${schedule.actualLightHours}h vs ${schedule.targetLightHours}h target`,
      recommendation: 'Adjust timer settings at next opportunity. Aim for ±15 minutes accuracy.',
    });
  }

  // Check intensity deviation
  const intensityDeviation = Math.abs(schedule.actualIntensityLux - schedule.targetIntensityLux);
  const intensityDeviationPercent = (intensityDeviation / schedule.targetIntensityLux) * 100;

  if (intensityDeviationPercent > 30) {
    alerts.push({
      type: 'intensity_deviation',
      severity: 'warning',
      message: `Light intensity ${intensityDeviationPercent.toFixed(0)}% off target: ${schedule.actualIntensityLux} vs ${schedule.targetIntensityLux} lux`,
      recommendation: 'Check bulbs for cleanliness and function. Replace if needed. Verify lux meter readings.',
    });
  }

  // For layers, check if photoperiod is decreasing (not allowed)
  if (productionType === 'POSTURA' && schedule.actualLightHours < schedule.targetLightHours - 0.5) {
    alerts.push({
      type: 'program_change',
      severity: 'critical',
      message: 'Photoperiod decrease detected! This will severely impact egg production.',
      recommendation: 'NEVER decrease light hours during lay. Birds can stop laying. Restore to target immediately.',
    });
  }

  return alerts;
}

/**
 * Generate lighting adjustment reminder for upcoming week
 */
export function generateLightingReminder(
  productionType: 'ENGORDE' | 'POSTURA',
  currentWeek: number,
  nextWeek: number
): string | null {
  const currentLighting = getLightingForWeek(productionType, currentWeek);
  const nextLighting = getLightingForWeek(productionType, nextWeek);

  if (!currentLighting || !nextLighting) return null;

  // Check if there's a change
  if (
    currentLighting.lightHours !== nextLighting.lightHours ||
    currentLighting.intensityLux !== nextLighting.intensityLux
  ) {
    const hourChange = nextLighting.lightHours - currentLighting.lightHours;
    const changeDescription = hourChange > 0 ? `increase by ${hourChange}h` : `decrease by ${Math.abs(hourChange)}h`;

    return `REMINDER: Week ${nextWeek} lighting adjustment needed:\n` +
           `Current: ${currentLighting.lightHours}h at ${currentLighting.intensityLux} lux\n` +
           `New: ${nextLighting.lightHours}h at ${nextLighting.intensityLux} lux\n` +
           `Action: ${changeDescription}\n` +
           `Tip: ${nextLighting.description || 'Maintain stable photoperiod'}`;
  }

  return null; // No change needed
}

/**
 * Calculate optimal start time based on desired photoperiod
 */
export function calculateLightingTimes(
  lightHours: number,
  preferredStartTime: string = '06:00'
): { startTime: string; endTime: string } {
  const [startHour, startMinute] = preferredStartTime.split(':').map(Number);

  const totalMinutes = lightHours * 60;
  const endTotalMinutes = startHour * 60 + startMinute + totalMinutes;

  const endHour = Math.floor(endTotalMinutes / 60) % 24;
  const endMinute = endTotalMinutes % 60;

  return {
    startTime: preferredStartTime,
    endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
  };
}

/**
 * Evaluate lighting program effectiveness
 */
export interface LightingEffectiveness {
  averagePhotoperiod: number;
  consistency: number; // 0-100%
  programAdherence: number; // 0-100%
  totalAdjustments: number;
  recommendation: string;
}

export function evaluateLightingEffectiveness(
  schedule: LightingSchedule[],
  productionType: 'ENGORDE' | 'POSTURA'
): LightingEffectiveness {
  if (schedule.length === 0) {
    return {
      averagePhotoperiod: 0,
      consistency: 0,
      programAdherence: 0,
      totalAdjustments: 0,
      recommendation: 'No data available. Begin recording daily lighting hours.',
    };
  }

  const totalHours = schedule.reduce((sum, day) => sum + day.actualLightHours, 0);
  const averagePhotoperiod = totalHours / schedule.length;

  // Calculate consistency (standard deviation)
  const variance = schedule.reduce((sum, day) => {
    return sum + Math.pow(day.actualLightHours - averagePhotoperiod, 2);
  }, 0) / schedule.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - (stdDev * 20)); // Lower std dev = higher consistency

  // Calculate program adherence
  const compliance = calculateLightingCompliance(schedule);
  const programAdherence = compliance.complianceRate;

  // Count adjustments (days where target changed from previous day)
  let totalAdjustments = 0;
  for (let i = 1; i < schedule.length; i++) {
    if (schedule[i].targetLightHours !== schedule[i - 1].targetLightHours) {
      totalAdjustments++;
    }
  }

  let recommendation = '';
  if (programAdherence < 80) {
    recommendation = 'Critical: Low program adherence. Review timer settings and equipment reliability.';
  } else if (consistency < 85) {
    recommendation = 'Warning: High variation in daily photoperiod. Ensure timer is functioning correctly.';
  } else if (productionType === 'POSTURA' && averagePhotoperiod < 15) {
    recommendation = 'Increase photoperiod for optimal egg production. Target 16-17 hours for layers.';
  } else {
    recommendation = 'Lighting program is well-managed. Continue monitoring daily.';
  }

  return {
    averagePhotoperiod,
    consistency,
    programAdherence,
    totalAdjustments,
    recommendation,
  };
}