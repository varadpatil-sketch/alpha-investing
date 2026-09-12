export interface AllocationItem {
  symbol: string;
  name: string;
  exchange: string;
  instrumentToken: number;
  weightPct: number;
  allocatedAmount: number;
  sector: string;
  assetClass: string;
  riskRating: string;
  expectedCagr: number;
  description: string;
  lastPrice: number;
}

export interface RecommendationResult {
  investmentAmount: number;
  timeHorizonYears: number;
  expectedReturnPct: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  realityScore: 'realistic' | 'moderate_risk' | 'high_risk_warning';
  realityTitle: string;
  realityMessage: string;
  suggestedReturnPct: number;
  allocations: AllocationItem[];
  projectedValue1Yr: number;
  projectedValue3Yr: number;
  projectedValue5Yr: number;
  projectedValue10Yr: number;
  aiInsights?: string;
  aiModel?: string;
  backtestPerformance: {
    year: string;
    portfolioReturn: number;
    nifty50Return: number;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  riskTolerance?: string;
}

export interface SavedPortfolio {
  _id: string;
  title: string;
  investmentAmount: number;
  timeHorizonYears: number;
  expectedReturnPct: number;
  riskTolerance: string;
  realityScore: string;
  realityMessage: string;
  allocations: AllocationItem[];
  projectedValue5Yr: number;
  createdAt: string;
}

export interface QuantScoreBreakdown {
  totalScore: number;
  valueScore: number;
  growthScore: number;
  momentumScore: number;
  qualityScore: number;
  rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Underperform';
}

export interface ScreenerStockItem {
  symbol: string;
  fullSymbol: string;
  name: string;
  exchange: string;
  price: number;
  netChange: number;
  pctChange: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sector: string;
  assetClass: string;
  riskRating: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: number;
  pe?: number;
  priceToBook?: number;
  dividendYield?: number;
  debtToEquity?: number;
  returnOnEquity?: number;
  revenueGrowth?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  quantScore?: QuantScoreBreakdown;
  matchScorePct?: number;
  lastRefreshedAt?: string;
}

export interface QuantFilterParams {
  sector: string;
  marketCap: 'all' | 'large' | 'mid' | 'small';
  maxPe: number;
  minDivYield: number;
  rsiSignal: 'all' | 'oversold' | 'bullish' | 'overbought';
  maCrossover: 'all' | 'above_50_ema' | 'above_200_ema' | 'golden_cross';
  minQuantScore: number;
}
