// Module: Monitoring Dashboards with Bird Behavior Indicators and Mortality Tracking

export interface BirdBehaviorData {
  lotId: string;
  date: string;
  activePercentage: number; // % of birds active and distributed evenly
  feedingActivityLevel: 'low' | 'normal' | 'high';
  signsOfStress: boolean;
  abnormalBehaviors: string[]; // e.g., "panting", "lethargy", "grouping"
}

export interface MortalityData {
  lotId: string;
  date: string;
  dailyMortalityCount: number;
  cumulativeMortalityCount: number;
  mortalityRatePercent: number; // cumulative mortality rate
}

export interface DashboardSummary {
  lotId: string;
  date: string;
  behaviorStatus: 'normal' | 'warning' | 'critical';
  mortalityStatus: 'normal' | 'warning' | 'critical';
  behaviorMessages: string[];
  mortalityMessages: string[];
}

// Thresholds for behavior and mortality alerts
const ACTIVE_THRESHOLD = 70; // % active birds considered normal
const MORTALITY_WARNING_THRESHOLD = 3; // % mortality warning
const MORTALITY_CRITICAL_THRESHOLD = 5; // % mortality critical

export function evaluateBehaviorStatus(data: BirdBehaviorData): { status: 'normal' | 'warning' | 'critical'; messages: string[] } {
  const messages: string[] = [];
  let status: 'normal' | 'warning' | 'critical' = 'normal';

  if (data.activePercentage < ACTIVE_THRESHOLD) {
    messages.push(`Low activity detected: only ${data.activePercentage}% birds active.`);
    status = 'warning';
  }

  if (data.signsOfStress) {
    messages.push('Signs of stress observed in the flock.');
    status = 'critical';
  }

  if (data.abnormalBehaviors.length > 0) {
    messages.push(`Abnormal behaviors detected: ${data.abnormalBehaviors.join(', ')}.`);
    status = 'critical';
  }

  return { status, messages };
}

export function evaluateMortalityStatus(data: MortalityData): { status: 'normal' | 'warning' | 'critical'; messages: string[] } {
  const messages: string[] = [];
  let status: 'normal' | 'warning' | 'critical' = 'normal';

  if (data.mortalityRatePercent >= MORTALITY_CRITICAL_THRESHOLD) {
    messages.push(`Critical mortality rate: ${data.mortalityRatePercent.toFixed(2)}%. Immediate action required.`);
    status = 'critical';
  } else if (data.mortalityRatePercent >= MORTALITY_WARNING_THRESHOLD) {
    messages.push(`Elevated mortality rate: ${data.mortalityRatePercent.toFixed(2)}%. Monitor closely.`);
    status = 'warning';
  }

  return { status, messages };
}

export function generateDashboardSummary(
  behaviorData: BirdBehaviorData,
  mortalityData: MortalityData
): DashboardSummary {
  const behaviorEval = evaluateBehaviorStatus(behaviorData);
  const mortalityEval = evaluateMortalityStatus(mortalityData);

  // Determine overall status (worst of the two)
  const statusPriority = { normal: 0, warning: 1, critical: 2 };
  const overallBehaviorStatus = behaviorEval.status;
  const overallMortalityStatus = mortalityEval.status;
  const overallStatus = statusPriority[overallBehaviorStatus] > statusPriority[overallMortalityStatus] ? overallBehaviorStatus : overallMortalityStatus;

  return {
    lotId: behaviorData.lotId,
    date: behaviorData.date,
    behaviorStatus: overallBehaviorStatus,
    mortalityStatus: overallMortalityStatus,
    behaviorMessages: behaviorEval.messages,
    mortalityMessages: mortalityEval.messages,
  };
}