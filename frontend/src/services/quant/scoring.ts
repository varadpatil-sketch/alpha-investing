import { ScreenerStockItem, QuantScoreBreakdown } from '../../types';

export class QuantScoringEngine {
  /**
   * Calculates Multi-Factor Quant Score (0 - 100) for a given stock
   */
  static calculateQuantScore(stock: ScreenerStockItem): QuantScoreBreakdown {
    const valueScore = this.computeValueFactor(stock);
    const growthScore = this.computeGrowthFactor(stock);
    const momentumScore = this.computeMomentumFactor(stock);
    const qualityScore = this.computeQualityFactor(stock);

    // Equal 25% weight allocation across 4 Factor Models
    const totalScore = Math.round(
      valueScore * 0.25 + growthScore * 0.25 + momentumScore * 0.25 + qualityScore * 0.25
    );

    let rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Underperform' = 'Hold';
    if (totalScore >= 80) rating = 'Strong Buy';
    else if (totalScore >= 68) rating = 'Buy';
    else if (totalScore >= 50) rating = 'Hold';
    else rating = 'Underperform';

    return {
      totalScore,
      valueScore: Math.round(valueScore),
      growthScore: Math.round(growthScore),
      momentumScore: Math.round(momentumScore),
      qualityScore: Math.round(qualityScore),
      rating,
    };
  }

  /**
   * Value Factor Model (25%): P/E Ratio, P/B Ratio, Dividend Yield
   */
  private static computeValueFactor(stock: ScreenerStockItem): number {
    let peScore = 70;
    const pe = stock.pe || 25;
    if (pe < 18) peScore = 100;
    else if (pe < 28) peScore = 85;
    else if (pe < 40) peScore = 65;
    else peScore = 40;

    let pbScore = 70;
    const pb = stock.priceToBook || 3.2;
    if (pb < 2.5) pbScore = 100;
    else if (pb < 4.5) pbScore = 80;
    else pbScore = 50;

    let divScore = 50;
    const divYield = stock.dividendYield || 1.2;
    if (divYield >= 2.5) divScore = 100;
    else if (divYield >= 1.2) divScore = 80;
    else if (divYield > 0.5) divScore = 60;
    else divScore = 40;

    return peScore * 0.5 + pbScore * 0.3 + divScore * 0.2;
  }

  /**
   * Growth Factor Model (25%): Revenue Growth, ROE, 52W Performance
   */
  private static computeGrowthFactor(stock: ScreenerStockItem): number {
    let revScore = 70;
    const revGrowth = stock.revenueGrowth || 12;
    if (revGrowth >= 20) revScore = 100;
    else if (revGrowth >= 12) revScore = 85;
    else if (revGrowth >= 5) revScore = 65;
    else revScore = 40;

    let pctChangeScore = 70;
    if (stock.pctChange >= 2.5) pctChangeScore = 95;
    else if (stock.pctChange >= 0) pctChangeScore = 80;
    else if (stock.pctChange >= -2) pctChangeScore = 60;
    else pctChangeScore = 40;

    return revScore * 0.6 + pctChangeScore * 0.4;
  }

  /**
   * Momentum Factor Model (25%): RSI, Moving Average Alignment (50/200 EMA)
   */
  private static computeMomentumFactor(stock: ScreenerStockItem): number {
    // Estimating RSI based on 52W range position and recent net change
    const range = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow;
    const position = range > 0 ? (stock.price - stock.fiftyTwoWeekLow) / range : 0.5;

    // RSI Estimation (Approximate 14-day RSI)
    const estimatedRsi = Math.min(85, Math.max(25, 30 + position * 45 + stock.pctChange * 2));

    let rsiScore = 70;
    if (estimatedRsi >= 50 && estimatedRsi <= 68) rsiScore = 100; // Sweet momentum spot
    else if (estimatedRsi > 68 && estimatedRsi <= 78) rsiScore = 75; // Slightly overbought
    else if (estimatedRsi < 40) rsiScore = 65; // Oversold rebound potential
    else rsiScore = 80;

    // Moving Average Alignment
    const fiftyDay = stock.fiftyDayAverage || stock.price;
    const twoHundredDay = stock.twoHundredDayAverage || stock.price;

    let maScore = 70;
    if (stock.price >= fiftyDay && fiftyDay >= twoHundredDay) {
      maScore = 100; // Golden Cross Alignment
    } else if (stock.price >= fiftyDay) {
      maScore = 80;
    } else if (stock.price >= twoHundredDay) {
      maScore = 65;
    } else {
      maScore = 45;
    }

    return rsiScore * 0.5 + maScore * 0.5;
  }

  /**
   * Quality & Health Factor Model (25%): Debt-to-Equity, ROE, Risk Rating
   */
  private static computeQualityFactor(stock: ScreenerStockItem): number {
    let debtScore = 80;
    const de = stock.debtToEquity !== undefined ? stock.debtToEquity : 0.4;
    if (de <= 0.2) debtScore = 100;
    else if (de <= 0.6) debtScore = 85;
    else if (de <= 1.2) debtScore = 60;
    else debtScore = 35;

    let roeScore = 75;
    const roe = stock.returnOnEquity || 18;
    if (roe >= 22) roeScore = 100;
    else if (roe >= 15) roeScore = 85;
    else if (roe >= 10) roeScore = 65;
    else roeScore = 45;

    let riskScore = 80;
    if (stock.riskRating === 'Low') riskScore = 100;
    else if (stock.riskRating === 'Moderate') riskScore = 80;
    else riskScore = 60;

    return debtScore * 0.4 + roeScore * 0.4 + riskScore * 0.2;
  }
}
