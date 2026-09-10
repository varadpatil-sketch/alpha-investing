import { ScreenerStockItem } from '../../types';

export interface UserProfileParams {
  investmentAmount: number;
  timeHorizonYears: number;
  expectedReturnPct: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export class UserMatcherEngine {
  /**
   * Calculates Match Score % (0% - 100%) for a stock against user investment profile
   */
  static calculateMatchScore(stock: ScreenerStockItem, profile?: UserProfileParams): number {
    if (!profile) return 85; // Default match score if no profile set

    let riskMatch = 80;
    if (profile.riskTolerance === 'conservative') {
      if (stock.assetClass === 'Index ETF' || stock.assetClass === 'Debt & Gold ETF') riskMatch = 100;
      else if (stock.riskRating === 'Low') riskMatch = 90;
      else if (stock.riskRating === 'Moderate') riskMatch = 65;
      else riskMatch = 40;
    } else if (profile.riskTolerance === 'moderate') {
      if (stock.assetClass === 'Large Cap Stock') riskMatch = 95;
      else if (stock.assetClass === 'Index ETF') riskMatch = 90;
      else if (stock.assetClass === 'Mid Cap Stock') riskMatch = 80;
      else riskMatch = 75;
    } else if (profile.riskTolerance === 'aggressive') {
      if (stock.assetClass === 'Mid Cap Stock') riskMatch = 100;
      else if (stock.assetClass === 'Large Cap Stock') riskMatch = 85;
      else riskMatch = 70;
    }

    // Horizon Suitability
    let horizonMatch = 80;
    if (profile.timeHorizonYears >= 5) {
      if (stock.assetClass === 'Large Cap Stock' || stock.assetClass === 'Index ETF') horizonMatch = 95;
      else horizonMatch = 85;
    } else if (profile.timeHorizonYears >= 3) {
      horizonMatch = 85;
    } else {
      if (stock.assetClass === 'Debt & Gold ETF') horizonMatch = 95;
      else horizonMatch = 70;
    }

    // Expected CAGR Alignment
    const stockCagr = stock.revenueGrowth ? Math.max(10, stock.revenueGrowth) : 14;
    const returnDiff = Math.abs(stockCagr - profile.expectedReturnPct);
    const returnMatch = Math.max(50, 100 - returnDiff * 3);

    // Weighted average
    const finalScore = Math.round(riskMatch * 0.45 + horizonMatch * 0.35 + returnMatch * 0.2);
    return Math.min(99, Math.max(45, finalScore));
  }
}
