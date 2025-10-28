// Module: Economic Calculations for Feed Cost, Egg Mass Production, and Dynamic Cycle Length Optimization

export interface EconomicData {
  lotId: string;
  date: string;
  feedConsumedKg: number;
  feedCostPerKg: number;
  eggMassProducedG: number;
  eggPricePerKg: number;
  otherCosts: number; // Other variable costs for the day
}

export interface EconomicSummary {
  lotId: string;
  date: string;
  totalFeedCost: number;
  totalOtherCosts: number;
  totalCosts: number;
  revenueFromEggs: number;
  profit: number;
  breakEvenEggMassG: number;
  isProfitable: boolean;
}

// Calculate daily economic summary
export function calculateEconomicSummary(data: EconomicData): EconomicSummary {
  const totalFeedCost = data.feedConsumedKg * data.feedCostPerKg;
  const totalOtherCosts = data.otherCosts;
  const totalCosts = totalFeedCost + totalOtherCosts;
  const revenueFromEggs = (data.eggMassProducedG / 1000) * data.eggPricePerKg;
  const profit = revenueFromEggs - totalCosts;

  // Break-even egg mass in grams to cover costs
  const breakEvenEggMassG = (totalCosts / data.eggPricePerKg) * 1000;

  return {
    lotId: data.lotId,
    date: data.date,
    totalFeedCost,
    totalOtherCosts,
    totalCosts,
    revenueFromEggs,
    profit,
    breakEvenEggMassG,
    isProfitable: profit >= 0,
  };
}

// Function to suggest optimal cycle length based on profitability trend
export interface CycleProfitability {
  week: number;
  profit: number;
}

export function suggestOptimalCycleLength(profitabilityData: CycleProfitability[]): number | null {
  // Find the week where profit starts to decline or becomes negative
  for (let i = 1; i < profitabilityData.length; i++) {
    if (profitabilityData[i].profit < profitabilityData[i - 1].profit || profitabilityData[i].profit < 0) {
      return profitabilityData[i - 1].week;
    }
  }
  // If no decline found, return last week
  if (profitabilityData.length > 0) {
    return profitabilityData[profitabilityData.length - 1].week;
  }
  return null;
}