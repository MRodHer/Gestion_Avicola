// Module: Supplementation Schedules for Antioxidants and Organic Feed Ingredient Substitutions

export interface SupplementationSchedule {
  lotId: string;
  date: string;
  supplementName: string;
  source: 'organic' | 'synthetic';
  dosageMgPerKgFeed: number;
  administrationRoute: 'feed' | 'water';
  startDay: number;
  endDay: number;
}

export interface SupplementationPlan {
  lotId: string;
  schedules: SupplementationSchedule[];
}

// Example supplementation schedules for antioxidants in broilers and layers
export const defaultSupplementationSchedules: SupplementationSchedule[] = [
  {
    lotId: '',
    date: '',
    supplementName: 'Vitamin C',
    source: 'organic',
    dosageMgPerKgFeed: 200,
    administrationRoute: 'water',
    startDay: 1,
    endDay: 21,
  },
  {
    lotId: '',
    date: '',
    supplementName: 'Vitamin E',
    source: 'organic',
    dosageMgPerKgFeed: 300,
    administrationRoute: 'water',
    startDay: 1,
    endDay: 21,
  },
  {
    lotId: '',
    date: '',
    supplementName: 'Selenium (organic yeast)',
    source: 'organic',
    dosageMgPerKgFeed: 0.3,
    administrationRoute: 'feed',
    startDay: 1,
    endDay: 42,
  },
];

// Function to get active supplements for a given day
export function getActiveSupplementsForDay(day: number, schedules: SupplementationSchedule[] = defaultSupplementationSchedules): SupplementationSchedule[] {
  return schedules.filter(s => day >= s.startDay && day <= s.endDay);
}

// Function to generate supplementation reminders
export function generateSupplementationReminder(day: number, schedules: SupplementationSchedule[] = defaultSupplementationSchedules): string | null {
  const activeSupplements = getActiveSupplementsForDay(day, schedules);
  if (activeSupplements.length === 0) return null;

  const supplementNames = activeSupplements.map(s => s.supplementName).join(', ');
  return `Reminder: Administer the following supplements today: ${supplementNames}.`;
}