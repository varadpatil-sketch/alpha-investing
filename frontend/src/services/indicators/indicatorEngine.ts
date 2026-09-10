import { CandleData } from '../api';
import {
  SMA,
  EMA,
  BollingerBands,
  RSI,
  MACD,
  StochasticRSI,
  ATR,
} from 'technicalindicators';

export interface IndicatorSettings {
  sma50Enabled: boolean;
  sma50Color: string;
  sma200Enabled: boolean;
  sma200Color: string;
  ema20Enabled: boolean;
  ema20Color: string;
  ema50Enabled: boolean;
  ema50Color: string;
  bollingerEnabled: boolean;
  bollingerPeriod: number;
  bollingerStdDev: number;
  supertrendEnabled: boolean;
  supertrendPeriod: number;
  supertrendMultiplier: number;
  rsiEnabled: boolean;
  rsiPeriod: number;
  macdEnabled: boolean;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  stochRsiEnabled: boolean;
  volumeEnabled: boolean;
}

export const DEFAULT_INDICATOR_SETTINGS: IndicatorSettings = {
  sma50Enabled: true,
  sma50Color: '#3b82f6', // blue
  sma200Enabled: false,
  sma200Color: '#a855f7', // purple
  ema20Enabled: true,
  ema20Color: '#f59e0b', // amber
  ema50Enabled: false,
  ema50Color: '#ec4899', // pink
  bollingerEnabled: false,
  bollingerPeriod: 20,
  bollingerStdDev: 2,
  supertrendEnabled: false,
  supertrendPeriod: 10,
  supertrendMultiplier: 3,
  rsiEnabled: true,
  rsiPeriod: 14,
  macdEnabled: false,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  stochRsiEnabled: false,
  volumeEnabled: true,
};

export class IndicatorEngine {
  /**
   * Generates Heikin-Ashi candles from standard OHLC candles
   */
  static computeHeikinAshi(candles: CandleData[]): CandleData[] {
    if (!candles || candles.length === 0) return [];

    const haCandles: CandleData[] = [];
    let prevOpen = candles[0].open;
    let prevClose = candles[0].close;

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen = i === 0 ? (c.open + c.close) / 2 : (prevOpen + prevClose) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);

      haCandles.push({
        time: c.time,
        open: Math.round(haOpen * 100) / 100,
        high: Math.round(haHigh * 100) / 100,
        low: Math.round(haLow * 100) / 100,
        close: Math.round(haClose * 100) / 100,
        volume: c.volume,
      });

      prevOpen = haOpen;
      prevClose = haClose;
    }

    return haCandles;
  }

  /**
   * Computes Simple Moving Average (SMA)
   */
  static computeSMA(candles: CandleData[], period: number): { time: string | number; value: number }[] {
    if (candles.length < period) return [];

    const closes = candles.map((c) => c.close);
    const smaValues = SMA.calculate({ period, values: closes });

    const offset = candles.length - smaValues.length;
    return smaValues.map((val, idx) => ({
      time: candles[idx + offset].time,
      value: Math.round(val * 100) / 100,
    }));
  }

  /**
   * Computes Exponential Moving Average (EMA)
   */
  static computeEMA(candles: CandleData[], period: number): { time: string | number; value: number }[] {
    if (candles.length < period) return [];

    const closes = candles.map((c) => c.close);
    const emaValues = EMA.calculate({ period, values: closes });

    const offset = candles.length - emaValues.length;
    return emaValues.map((val, idx) => ({
      time: candles[idx + offset].time,
      value: Math.round(val * 100) / 100,
    }));
  }

  /**
   * Computes Bollinger Bands (Upper, Middle, Lower)
   */
  static computeBollingerBands(
    candles: CandleData[],
    period = 20,
    stdDev = 2
  ): {
    upper: { time: string | number; value: number }[];
    middle: { time: string | number; value: number }[];
    lower: { time: string | number; value: number }[];
  } {
    if (candles.length < period) return { upper: [], middle: [], lower: [] };

    const closes = candles.map((c) => c.close);
    const bbResults = BollingerBands.calculate({ period, stdDev, values: closes });

    const offset = candles.length - bbResults.length;
    const upper: { time: string | number; value: number }[] = [];
    const middle: { time: string | number; value: number }[] = [];
    const lower: { time: string | number; value: number }[] = [];

    bbResults.forEach((res, idx) => {
      const time = candles[idx + offset].time;
      upper.push({ time, value: Math.round(res.upper * 100) / 100 });
      middle.push({ time, value: Math.round(res.middle * 100) / 100 });
      lower.push({ time, value: Math.round(res.lower * 100) / 100 });
    });

    return { upper, middle, lower };
  }

  /**
   * Computes Supertrend (ATR-based trend follower)
   */
  static computeSupertrend(
    candles: CandleData[],
    period = 10,
    multiplier = 3
  ): { time: string | number; value: number; color: string }[] {
    if (candles.length < period + 1) return [];

    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const closes = candles.map((c) => c.close);

    const atrValues = ATR.calculate({ period, high: highs, low: lows, close: closes });
    const offset = candles.length - atrValues.length;

    const result: { time: string | number; value: number; color: string }[] = [];
    let isBullish = true;
    let prevUpperBand = 0;
    let prevLowerBand = 0;

    for (let i = 0; i < atrValues.length; i++) {
      const candleIdx = i + offset;
      const c = candles[candleIdx];
      const atr = atrValues[i];

      const basicUpperBand = (c.high + c.low) / 2 + multiplier * atr;
      const basicLowerBand = (c.high + c.low) / 2 - multiplier * atr;

      const upperBand =
        i > 0 && basicUpperBand < prevUpperBand || candles[candleIdx - 1].close > prevUpperBand
          ? basicUpperBand
          : prevUpperBand;

      const lowerBand =
        i > 0 && basicLowerBand > prevLowerBand || candles[candleIdx - 1].close < prevLowerBand
          ? basicLowerBand
          : prevLowerBand;

      let supertrend = upperBand;
      if (isBullish) {
        supertrend = lowerBand;
        if (c.close < lowerBand) {
          isBullish = false;
          supertrend = upperBand;
        }
      } else {
        supertrend = upperBand;
        if (c.close > upperBand) {
          isBullish = true;
          supertrend = lowerBand;
        }
      }

      result.push({
        time: c.time,
        value: Math.round(supertrend * 100) / 100,
        color: isBullish ? '#10b981' : '#f43f5e',
      });

      prevUpperBand = upperBand;
      prevLowerBand = lowerBand;
    }

    return result;
  }

  /**
   * Computes Relative Strength Index (RSI)
   */
  static computeRSI(candles: CandleData[], period = 14): { time: string | number; value: number }[] {
    if (candles.length < period + 1) return [];

    const closes = candles.map((c) => c.close);
    const rsiValues = RSI.calculate({ period, values: closes });

    const offset = candles.length - rsiValues.length;
    return rsiValues.map((val, idx) => ({
      time: candles[idx + offset].time,
      value: Math.round(val * 100) / 100,
    }));
  }

  /**
   * Computes MACD (MACD Line, Signal Line, Histogram)
   */
  static computeMACD(
    candles: CandleData[],
    fastPeriod = 12,
    slowPeriod = 26,
    signalPeriod = 9
  ): {
    macdLine: { time: string | number; value: number }[];
    signalLine: { time: string | number; value: number }[];
    histogram: { time: string | number; value: number; color: string }[];
  } {
    if (candles.length < slowPeriod) return { macdLine: [], signalLine: [], histogram: [] };

    const closes = candles.map((c) => c.close);
    const macdResults = MACD.calculate({
      fastPeriod,
      slowPeriod,
      signalPeriod,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
      values: closes,
    });

    const offset = candles.length - macdResults.length;
    const macdLine: { time: string | number; value: number }[] = [];
    const signalLine: { time: string | number; value: number }[] = [];
    const histogram: { time: string | number; value: number; color: string }[] = [];

    macdResults.forEach((res, idx) => {
      if (res.MACD !== undefined && res.signal !== undefined && res.histogram !== undefined) {
        const time = candles[idx + offset].time;
        const macdVal = Math.round(res.MACD * 100) / 100;
        const signalVal = Math.round(res.signal * 100) / 100;
        const histVal = Math.round(res.histogram * 100) / 100;

        macdLine.push({ time, value: macdVal });
        signalLine.push({ time, value: signalVal });
        histogram.push({
          time,
          value: histVal,
          color: histVal >= 0 ? '#10b981' : '#f43f5e',
        });
      }
    });

    return { macdLine, signalLine, histogram };
  }

  /**
   * Computes Stochastic RSI (%K and %D lines)
   */
  static computeStochasticRSI(
    candles: CandleData[],
    rsiPeriod = 14,
    stochasticPeriod = 14,
    kPeriod = 3,
    dPeriod = 3
  ): {
    k: { time: string | number; value: number }[];
    d: { time: string | number; value: number }[];
  } {
    if (candles.length < rsiPeriod + stochasticPeriod) return { k: [], d: [] };

    const closes = candles.map((c) => c.close);
    const stochResults = StochasticRSI.calculate({
      values: closes,
      rsiPeriod,
      stochasticPeriod,
      kPeriod,
      dPeriod,
    });

    const offset = candles.length - stochResults.length;
    const kLine: { time: string | number; value: number }[] = [];
    const dLine: { time: string | number; value: number }[] = [];

    stochResults.forEach((res, idx) => {
      if (res.k !== undefined && res.d !== undefined) {
        const time = candles[idx + offset].time;
        kLine.push({ time, value: Math.round(res.k * 100) / 100 });
        dLine.push({ time, value: Math.round(res.d * 100) / 100 });
      }
    });

    return { k: kLine, d: dLine };
  }
}
