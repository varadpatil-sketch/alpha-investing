import axios from 'axios';
import { SavedPortfolio, UserProfile, ScreenerStockItem } from '../types';

const API_BASE_URL = '/api';

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
