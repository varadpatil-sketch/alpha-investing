import axios from 'axios';
import { SavedPortfolio, UserProfile, ScreenerStockItem } from '../types';

const rawApiUrl = (import.meta.env.VITE_API_URL as string) || '/api';
const API_BASE_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token if stored
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('alpha_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MarketIndexItem {
  symbol: string;
  rawSymbol: string;
  price: number;
  change: number;
  pctChange: number;
}

export interface CandleData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartApiResponse {
  symbol: string;
  rawSymbol: string;
  timeframe: string;
  interval: string;
  count: number;
  candles: CandleData[];
}

export const fetchNifty50Index = async (): Promise<{ symbol: string; price: number; change: number; pctChange: number } | null> => {
  try {
    const response = await client.get('/market/nifty50');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchMarketIndices = async (): Promise<MarketIndexItem[]> => {
  try {
    const response = await client.get('/market/indices');
    return response.data.indices || [];
  } catch (error) {
    return [];
  }
};

export interface SingleStockQuote {
  success: boolean;
  symbol: string;
  name: string;
  price: number;
  change: number;
  pctChange: number;
  sector: string;
}

export const fetchStockQuote = async (symbol: string): Promise<SingleStockQuote | null> => {
  try {
    const response = await client.get(`/market/quote/${encodeURIComponent(symbol)}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const fetchHistoricalCandles = async (

  symbol: string,
  timeframe: string = '1D'
): Promise<ChartApiResponse> => {
  const response = await client.get(`/market/chart/${encodeURIComponent(symbol)}`, {
    params: { timeframe },
  });
  return response.data;
};

export const fetchScreenerStocks = async (forceRefresh = false): Promise<{ count: number; refreshedAt: string; stocks: ScreenerStockItem[] }> => {
  const response = await client.get('/market/screener', {
    params: { refresh: forceRefresh },
  });
  return response.data;
};

export const generateRecommendation = async (params: {
  investmentAmount: number;
  timeHorizonYears: number;
  expectedReturnPct: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}) => {
  const response = await client.post('/recommendations/generate', params);
  return response.data;
};

export const fetchAiStatus = async (): Promise<{ status: string; isConfigured: boolean; message: string }> => {
  try {
    const response = await client.get('/ai/status');
    return response.data;
  } catch (error) {
    return { status: 'error', isConfigured: false, message: 'AI service unavailable' };
  }
};

export const fetchPortfolioAiInsight = async (portfolioData: any): Promise<{ success: boolean; insightText?: string; isConfigured?: boolean; error?: string }> => {
  const response = await client.post('/ai/portfolio-insight', portfolioData);
  return response.data;
};

export const fetchStockAiAnalysis = async (stockData: any): Promise<{ success: boolean; analysis?: string; isConfigured?: boolean; error?: string }> => {
  const response = await client.post('/ai/stock-analysis', stockData);
  return response.data;
};

export const sendAiChatMessage = async (message: string, context?: any): Promise<{ success: boolean; reply?: string; isConfigured?: boolean; error?: string }> => {
  const response = await client.post('/ai/chat', { message, context });
  return response.data;
};

export interface AlphaAnalystReportResponse {
  success: boolean;
  isAiGenerated: boolean;
  symbol: string;
  companyName: string;
  currentPrice: number;
  quote: any;
  technicals: {
    rsi: number;
    rsiSignal: string;
    fiftyDayAverage: number;
    twoHundredDayAverage: number;
    maTrend: string;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    distFromHighPct: number;
    distFromLowPct: number;
  };
  quantMetrics: {
    totalScore: number;
    rating: string;
    valueScore: number;
    growthScore: number;
    momentumScore: number;
    qualityScore: number;
  };
  reportMarkdown: string;
}

export const fetchAlphaAnalystReport = async (
  symbol: string,
  userProfile?: { riskTolerance?: string; timeHorizonYears?: number; expectedReturnPct?: number }
): Promise<AlphaAnalystReportResponse> => {
  const response = await client.post('/ai/alpha-analyst', { symbol, userProfile });
  return response.data;
};

export const fetchKiteQuotes = async (symbols?: string[]) => {
  const response = await client.get('/market/kite-quotes', {
    params: { symbols: symbols?.join(',') },
  });
  return response.data;
};

export const savePortfolio = async (portfolioData: any): Promise<SavedPortfolio> => {
  const response = await client.post('/portfolios/save', portfolioData);
  return response.data.portfolio;
};

export const fetchSavedPortfolios = async (): Promise<SavedPortfolio[]> => {
  const response = await client.get('/portfolios');
  return response.data.portfolios;
};

export const deleteSavedPortfolio = async (id: string): Promise<void> => {
  await client.delete(`/portfolios/${id}`);
};

export const loginUser = async (email: string, password: string): Promise<{ token: string; user: UserProfile }> => {
  const response = await client.post('/auth/login', { email, password });
  return response.data;
};

export const signupUser = async (
  name: string,
  email: string,
  password: string,
  riskTolerance: string
): Promise<{ token: string; user: UserProfile }> => {
  const response = await client.post('/auth/signup', { name, email, password, riskTolerance });
  return response.data;
};

export interface HoldingPosition {
  _id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  prevClose: number;
  investedAmount: number;
  currentValue: number;
  overallPnL: number;
  overallPnLPct: number;
  dayPnL: number;
  dayPnLPct: number;
  sector: string;
  assetClass: string;
}

export interface PortfolioHoldingsResponse {
  summary: {
    totalInvested: number;
    totalCurrent: number;
    totalOverallPnL: number;
    totalOverallPnLPct: number;
    totalDayPnL: number;
    totalDayPnLPct: number;
  };
  sectorAllocation: {
    name: string;
    value: number;
    percentage: number;
  }[];
  holdings: HoldingPosition[];
}

export const fetchPortfolioHoldings = async (): Promise<PortfolioHoldingsResponse> => {
  const response = await client.get('/holdings');
  return response.data;
};

export const addHoldingPosition = async (data: {
  symbol: string;
  name?: string;
  quantity: number;
  averagePrice: number;
  sector?: string;
}): Promise<void> => {
  await client.post('/holdings', data);
};

export const deleteHoldingPosition = async (id: string): Promise<void> => {
  await client.delete(`/holdings/${id}`);
};

export interface BasketConstituent {
  symbol: string;
  name: string;
  weightPct: number;
  ltp: number;
  pctChange: number;
  sector: string;
  assetClass: string;
}

export interface KiteOrderPayloadItem {
  tradingsymbol: string;
  exchange: string;
  transaction_type: string;
  order_type: string;
  quantity: number;
  product: string;
  last_price: number;
}

export interface BasketItem {
  _id: string;
  title: string;
  description: string;
  icon: string;
  riskRating: 'Low' | 'Moderate' | 'High';
  expectedCagr: number;
  isCustom: boolean;
  minCapital: number;
  dayChangePct: number;
  constituentsCount: number;
  constituents: BasketConstituent[];
  kiteOrderPayload: KiteOrderPayloadItem[];
}

export interface BasketsApiResponse {
  count: number;
  presets: BasketItem[];
  customBaskets: BasketItem[];
}

export const fetchBaskets = async (): Promise<BasketsApiResponse> => {
  const response = await client.get('/baskets');
  return response.data;
};

export const createCustomBasket = async (data: {
  title: string;
  description: string;
  icon: string;
  riskRating: string;
  expectedCagr: number;
  constituents: { symbol: string; name?: string; weightPct: number; sector?: string }[];
}): Promise<{ status: string; basket: BasketItem }> => {
  const response = await client.post('/baskets', data);
  return response.data;
};

export const deleteCustomBasket = async (id: string): Promise<void> => {
  await client.delete(`/baskets/${id}`);
};

export interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: string;
  snippet: string;
  category: string;
  relatedTickers?: string[];
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentimentScore: number;
  impactSummary: string;
  isAiAnalyzed: boolean;
}

export interface SentimentSummary {
  overallLabel: string;
  bullishPct: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  total: number;
}

export interface MarketNewsResponse {
  success: boolean;
  count: number;
  refreshedAt: string;
  sentimentSummary: SentimentSummary;
  news: NewsItem[];
}

export interface TickerNewsResponse {
  success: boolean;
  symbol: string;
  count: number;
  refreshedAt: string;
  sentimentSummary: SentimentSummary;
  news: NewsItem[];
}

export const fetchMarketNews = async (category: string = 'all', forceRefresh: boolean = false): Promise<MarketNewsResponse> => {
  const response = await client.get('/news/market', {
    params: { category, refresh: forceRefresh },
  });
  return response.data;
};

export const fetchTickerNews = async (symbol: string, forceRefresh: boolean = false): Promise<TickerNewsResponse> => {
  const response = await client.get(`/news/ticker/${encodeURIComponent(symbol)}`, {
    params: { refresh: forceRefresh },
  });
  return response.data;
};

