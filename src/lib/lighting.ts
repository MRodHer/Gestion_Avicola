// Module: Lighting Program Management with Gradual Duration Adjustments and Intensity Monitoring

export interface LightingSchedule {
  lotId: string;
  date: string;
  totalLightHours: number;
  lightIntensityLux: number;
}

export interface LightingProgram {
  lotId: string;
  currentWeek: number;
  targetLightHours: number;
  targetIntensityLux: number;
  schedule: LightingSchedule[];
}

// Example lighting program for laying hens starting at week 21
export const defaultLightingProgram = [
  { week: 21, lightHours: 13, intensityLux: 10 },
  { week: 22, lightHours: 14, intensityLux: 10 },
  { week: 23, lightHours: 15, intensityLux: 10 },
  { week: 24, lightHours: 16, intensityLux: 10 },
  { week: 25, lightHours: 16.5, intensityLux: 10 },
  { week: 26, lightHours: 17, intensityLux: 10 },
  // Maintain 16-17 hours thereafter
];

// Function to get target lighting for current week
export function getLightingForWeek(week: number): { lightHours: number; intensityLux: number } | null {
  for (const entry of defaultLightingProgram) {
    if (entry.week === week) {
      return { lightHours: entry.lightHours, intensityLux: entry.intensityLux };
    }
  }
  // If week beyond defined, maintain last known values
  if (week > defaultLightingProgram[defaultLightingProgram.length - 1].week) {
    const last = defaultLightingProgram[defaultLightingProgram.length - 1];
    return { lightHours: last.lightHours, intensityLux: last.intensityLux };
  }
  return null;
}

// Function to generate reminder for lighting adjustment
export function generateLightingReminder(currentWeek: number): string | null {
  const lighting = getLightingForWeek(currentWeek);
  if (!lighting) return null;
  return `Reminder: Set lighting to ${lighting.lightHours} hours with intensity ${lighting.intensityLux} lux for week ${currentWeek}.`;
}