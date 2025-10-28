// Module: Feeding Restriction Schedules with Precise Rationing and Timing Controls for Broiler Males

export interface FeedingSchedule {
  lotId: string;
  date: string;
  feedAmountGrams: number;
  feedingPeriods: FeedingPeriod[];
}

export interface FeedingPeriod {
  startHour: number; // 0-23
  endHour: number;   // 0-23
  feedAmountGrams: number;
}

export interface FeedingRestrictionPlan {
  lotId: string;
  startDay: number;
  endDay: number;
  restrictionPercent: number; // e.g., 40 means 40% restriction
  dailyFeedAmountGrams: number;
  feedingPeriods: FeedingPeriod[];
}

// Example feeding restriction plan for broiler males days 8-21 with 40% restriction
export const defaultFeedingRestrictionPlan: FeedingRestrictionPlan = {
  lotId: '',
  startDay: 8,
  endDay: 21,
  restrictionPercent: 40,
  dailyFeedAmountGrams: 60, // example total daily feed per bird under restriction
  feedingPeriods: [
    { startHour: 6, endHour: 10, feedAmountGrams: 30 },
    { startHour: 14, endHour: 18, feedAmountGrams: 30 },
  ],
};

// Function to check if current day is under restriction
export function isUnderRestriction(day: number, plan: FeedingRestrictionPlan = defaultFeedingRestrictionPlan): boolean {
  return day >= plan.startDay && day <= plan.endDay;
}

// Function to get feeding periods for a given day
export function getFeedingPeriodsForDay(day: number, plan: FeedingRestrictionPlan = defaultFeedingRestrictionPlan): FeedingPeriod[] {
  if (isUnderRestriction(day, plan)) {
    return plan.feedingPeriods;
  }
  // Outside restriction period, feeding ad libitum (single period full day)
  return [{ startHour: 0, endHour: 23, feedAmountGrams: 0 }]; // 0 means no restriction
}