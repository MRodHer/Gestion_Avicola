// Module: Phase-Based Nutrition Plans with Automatic Reminders

export interface NutritionPhase {
  phaseName: string;
  startWeek: number;
  endWeek: number;
  proteinPercent: number;
  energyKcalPerKg: number;
  calciumPercent: number;
  lysinePercent: number;
  methioninePercent: number;
}

export interface NutritionPlan {
  lotId: string;
  currentWeek: number;
  currentPhase: NutritionPhase | null;
  phases: NutritionPhase[];
}

// Example phases based on laying hen production cycle
export const defaultNutritionPhases: NutritionPhase[] = [
  {
    phaseName: 'Inicio de Puesta',
    startWeek: 21,
    endWeek: 35,
    proteinPercent: 18,
    energyKcalPerKg: 2750,
    calciumPercent: 3.9,
    lysinePercent: 0.9,
    methioninePercent: 0.45,
  },
  {
    phaseName: 'Pico y Mantenimiento',
    startWeek: 36,
    endWeek: 60,
    proteinPercent: 17,
    energyKcalPerKg: 2700,
    calciumPercent: 4.15,
    lysinePercent: 0.84,
    methioninePercent: 0.41,
  },
  {
    phaseName: 'Postura Tardía',
    startWeek: 61,
    endWeek: 100,
    proteinPercent: 16,
    energyKcalPerKg: 2675,
    calciumPercent: 4.3,
    lysinePercent: 0.78,
    methioninePercent: 0.39,
  },
];

// Function to get current nutrition phase based on week
export function getNutritionPhaseForWeek(week: number, phases: NutritionPhase[] = defaultNutritionPhases): NutritionPhase | null {
  for (const phase of phases) {
    if (week >= phase.startWeek && week <= phase.endWeek) {
      return phase;
    }
  }
  return null;
}

// Function to generate reminder message for nutrition phase transition
export function generateNutritionReminder(currentWeek: number, phases: NutritionPhase[] = defaultNutritionPhases): string | null {
  const currentPhase = getNutritionPhaseForWeek(currentWeek, phases);
  if (!currentPhase) return null;

  // Check if next week is start of a new phase
  for (const phase of phases) {
    if (phase.startWeek === currentWeek + 1) {
      return `Reminder: Transition to nutrition phase "${phase.phaseName}" next week. Adjust feed formulation accordingly.`;
    }
  }
  return null;
}