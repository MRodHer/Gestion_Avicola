// Module: Egg Production Tracking by Color and Quality
// Differentiates production by genetic line (white, brown, or other)

export type EggColor = 'white' | 'brown' | 'blue' | 'cream';
export type EggGrade = 'XL' | 'L' | 'M' | 'S' | 'cracked' | 'dirty';

export interface EggProductionData {
  id?: string;
  loteId: string;
  date: string;

  // Production by color
  whiteEggs: number;
  brownEggs: number;
  blueEggs: number;
  creamEggs: number;

  // Quality classification
  xlGrade: number;      // Extra Large
  lGrade: number;       // Large
  mGrade: number;       // Medium
  sGrade: number;       // Small
  crackedEggs: number;  // Cracked/broken
  dirtyEggs: number;    // Dirty (need cleaning)

  // Weight data
  averageWeight: number; // grams per egg
  totalWeight: number;   // kg total production

  notes?: string;
  createdAt?: string;
}

export interface ProductionSummary {
  totalEggs: number;
  totalByColor: {
    white: number;
    brown: number;
    blue: number;
    cream: number;
  };
  totalByGrade: {
    xl: number;
    l: number;
    m: number;
    s: number;
    cracked: number;
    dirty: number;
  };
  qualityPercentage: number; // % of marketable eggs (XL+L+M)
  lossPercentage: number;    // % of cracked eggs
  averageWeight: number;      // Average weight in grams
  totalWeight: number;        // Total kg
}

export interface GeneticLinePerformance {
  lineage: string;
  expectedColor: EggColor;
  avgProductionPerBird: number;
  avgEggWeight: number;
  colorPurity: number; // % of eggs matching expected color
  qualityRate: number; // % of XL+L+M grades
}

/**
 * Calculate total egg production from production data
 */
export function calculateTotalEggs(data: EggProductionData): number {
  return (
    data.whiteEggs +
    data.brownEggs +
    data.blueEggs +
    data.creamEggs
  );
}

/**
 * Calculate production summary from array of daily production data
 */
export function calculateProductionSummary(
  productionData: EggProductionData[]
): ProductionSummary {
  if (productionData.length === 0) {
    return {
      totalEggs: 0,
      totalByColor: { white: 0, brown: 0, blue: 0, cream: 0 },
      totalByGrade: { xl: 0, l: 0, m: 0, s: 0, cracked: 0, dirty: 0 },
      qualityPercentage: 0,
      lossPercentage: 0,
      averageWeight: 0,
      totalWeight: 0,
    };
  }

  const summary = productionData.reduce(
    (acc, data) => ({
      totalEggs: acc.totalEggs + calculateTotalEggs(data),
      totalByColor: {
        white: acc.totalByColor.white + data.whiteEggs,
        brown: acc.totalByColor.brown + data.brownEggs,
        blue: acc.totalByColor.blue + data.blueEggs,
        cream: acc.totalByColor.cream + data.creamEggs,
      },
      totalByGrade: {
        xl: acc.totalByGrade.xl + data.xlGrade,
        l: acc.totalByGrade.l + data.lGrade,
        m: acc.totalByGrade.m + data.mGrade,
        s: acc.totalByGrade.s + data.sGrade,
        cracked: acc.totalByGrade.cracked + data.crackedEggs,
        dirty: acc.totalByGrade.dirty + data.dirtyEggs,
      },
      totalWeight: acc.totalWeight + data.totalWeight,
      weightSum: acc.weightSum + data.averageWeight * calculateTotalEggs(data),
    }),
    {
      totalEggs: 0,
      totalByColor: { white: 0, brown: 0, blue: 0, cream: 0 },
      totalByGrade: { xl: 0, l: 0, m: 0, s: 0, cracked: 0, dirty: 0 },
      totalWeight: 0,
      weightSum: 0,
    }
  );

  const totalEggs = summary.totalEggs;
  const marketableEggs =
    summary.totalByGrade.xl + summary.totalByGrade.l + summary.totalByGrade.m;
  const qualityPercentage = totalEggs > 0 ? (marketableEggs / totalEggs) * 100 : 0;
  const lossPercentage = totalEggs > 0 ? (summary.totalByGrade.cracked / totalEggs) * 100 : 0;
  const averageWeight = totalEggs > 0 ? summary.weightSum / totalEggs : 0;

  return {
    totalEggs,
    totalByColor: summary.totalByColor,
    totalByGrade: summary.totalByGrade,
    qualityPercentage,
    lossPercentage,
    averageWeight,
    totalWeight: summary.totalWeight,
  };
}

/**
 * Evaluate genetic line performance based on expected color
 */
export function evaluateGeneticLinePerformance(
  lineGenetic: string,
  productionData: EggProductionData[],
  numberOfBirds: number
): GeneticLinePerformance {
  // Define expected color by genetic line
  const expectedColors: Record<string, EggColor> = {
    HYLINE_BROWN: 'brown',
    LOHMAN_BROWN: 'brown',
    LEGHORN: 'white',
    ISA_BROWN: 'brown',
    BABCOCK: 'white',
    ARAUCANA: 'blue',
  };

  const expectedColor = expectedColors[lineGenetic] || 'brown';
  const summary = calculateProductionSummary(productionData);

  let colorMatchCount = 0;
  switch (expectedColor) {
    case 'white':
      colorMatchCount = summary.totalByColor.white;
      break;
    case 'brown':
      colorMatchCount = summary.totalByColor.brown;
      break;
    case 'blue':
      colorMatchCount = summary.totalByColor.blue;
      break;
    case 'cream':
      colorMatchCount = summary.totalByColor.cream;
      break;
  }

  const colorPurity = summary.totalEggs > 0 ? (colorMatchCount / summary.totalEggs) * 100 : 0;
  const avgProductionPerBird = numberOfBirds > 0 ? summary.totalEggs / numberOfBirds : 0;

  return {
    lineage: lineGenetic,
    expectedColor,
    avgProductionPerBird,
    avgEggWeight: summary.averageWeight,
    colorPurity,
    qualityRate: summary.qualityPercentage,
  };
}

/**
 * Calculate daily production rate (eggs per hen per day)
 */
export function calculateProductionRate(
  totalEggs: number,
  numberOfBirds: number,
  numberOfDays: number
): number {
  if (numberOfBirds === 0 || numberOfDays === 0) return 0;
  return (totalEggs / numberOfBirds / numberOfDays) * 100; // Percentage
}

/**
 * Get recommended egg weight ranges by grade (grams)
 */
export function getEggWeightRanges(): Record<EggGrade, { min: number; max: number }> {
  return {
    XL: { min: 73, max: 1000 },
    L: { min: 63, max: 73 },
    M: { min: 53, max: 63 },
    S: { min: 0, max: 53 },
    cracked: { min: 0, max: 1000 },
    dirty: { min: 0, max: 1000 },
  };
}

/**
 * Classify egg by weight into appropriate grade
 */
export function classifyEggByWeight(weight: number): EggGrade {
  if (weight >= 73) return 'XL';
  if (weight >= 63) return 'L';
  if (weight >= 53) return 'M';
  return 'S';
}

/**
 * Calculate egg mass production (kg of eggs per hen per day)
 */
export function calculateEggMass(
  totalWeight: number,
  numberOfBirds: number,
  numberOfDays: number
): number {
  if (numberOfBirds === 0 || numberOfDays === 0) return 0;
  return totalWeight / numberOfBirds / numberOfDays; // kg per bird per day
}

/**
 * Generate production quality alerts
 */
export interface ProductionAlert {
  type: 'quality' | 'loss' | 'weight' | 'color_purity';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

export function checkProductionQuality(
  summary: ProductionSummary,
  linePerformance?: GeneticLinePerformance
): ProductionAlert[] {
  const alerts: ProductionAlert[] = [];

  // Quality percentage alerts
  if (summary.qualityPercentage < 85) {
    alerts.push({
      type: 'quality',
      severity: summary.qualityPercentage < 75 ? 'critical' : 'warning',
      message: `Low quality rate: ${summary.qualityPercentage.toFixed(1)}% marketable eggs`,
      recommendation: 'Review nutrition, especially calcium and vitamin D3. Check for stress factors.',
    });
  }

  // Loss percentage alerts
  if (summary.lossPercentage > 5) {
    alerts.push({
      type: 'loss',
      severity: summary.lossPercentage > 10 ? 'critical' : 'warning',
      message: `High cracked egg rate: ${summary.lossPercentage.toFixed(1)}%`,
      recommendation: 'Check nesting boxes condition, calcium supplementation, and collection frequency.',
    });
  }

  // Weight alerts
  if (summary.averageWeight < 55) {
    alerts.push({
      type: 'weight',
      severity: summary.averageWeight < 50 ? 'critical' : 'warning',
      message: `Low average egg weight: ${summary.averageWeight.toFixed(1)}g`,
      recommendation: 'Increase protein and energy in feed. Check for diseases affecting nutrient absorption.',
    });
  }

  // Color purity alerts (if genetic line data available)
  if (linePerformance && linePerformance.colorPurity < 90) {
    alerts.push({
      type: 'color_purity',
      severity: linePerformance.colorPurity < 80 ? 'warning' : 'info',
      message: `Color purity ${linePerformance.colorPurity.toFixed(1)}% for ${linePerformance.lineage}`,
      recommendation: 'Verify genetic line purity. Some color variation is normal but >10% variation may indicate mixed genetics.',
    });
  }

  return alerts;
}

/**
 * Calculate economic value of egg production
 */
export interface EggEconomics {
  totalValue: number;
  valueByGrade: Record<EggGrade, number>;
  averageValuePerEgg: number;
  lossValue: number; // Value lost to cracked eggs
}

export function calculateEggEconomics(
  summary: ProductionSummary,
  prices: Record<EggGrade, number>
): EggEconomics {
  const valueByGrade: Record<EggGrade, number> = {
    XL: summary.totalByGrade.xl * prices.XL,
    L: summary.totalByGrade.l * prices.L,
    M: summary.totalByGrade.m * prices.M,
    S: summary.totalByGrade.s * prices.S,
    cracked: 0,
    dirty: summary.totalByGrade.dirty * prices.dirty,
  };

  const totalValue = Object.values(valueByGrade).reduce((sum, val) => sum + val, 0);
  const averageValuePerEgg = summary.totalEggs > 0 ? totalValue / summary.totalEggs : 0;
  const lossValue = summary.totalByGrade.cracked * ((prices.XL + prices.L + prices.M) / 3);

  return {
    totalValue,
    valueByGrade,
    averageValuePerEgg,
    lossValue,
  };
}
