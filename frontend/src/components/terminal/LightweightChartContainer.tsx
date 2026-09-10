import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts';
import { CandleData } from '../../services/api';
import { IndicatorEngine, IndicatorSettings } from '../../services/indicators/indicatorEngine';

export type ChartType = 'candlestick' | 'heikin-ashi' | 'line' | 'area';

interface LightweightChartContainerProps {
  candles: CandleData[];
  symbol: string;
  chartType: ChartType;
  indicators: IndicatorSettings;
}

export const LightweightChartContainer: React.FC<LightweightChartContainerProps> = ({
  candles,
  symbol,
  chartType,
  indicators,
}) => {
  const mainChartContainerRef = useRef<HTMLDivElement>(null);
  const oscillatorChartContainerRef = useRef<HTMLDivElement>(null);

  const mainChartRef = useRef<IChartApi | null>(null);
  const oscillatorChartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!mainChartContainerRef.current || !candles || candles.length === 0) return;

    // Clean up previous charts
    if (mainChartRef.current) {
      mainChartRef.current.remove();
      mainChartRef.current = null;
    }
    if (oscillatorChartRef.current) {
      oscillatorChartRef.current.remove();
      oscillatorChartRef.current = null;
    }

    const isOscillatorActive = indicators.rsiEnabled || indicators.macdEnabled || indicators.stochRsiEnabled;

    // Determine candles to render (Standard vs Heikin-Ashi)
    const effectiveCandles =
      chartType === 'heikin-ashi' ? IndicatorEngine.computeHeikinAshi(candles) : candles;

    // Create Main Chart Instance
    const mainChart = createChart(mainChartContainerRef.current, {
      width: mainChartContainerRef.current.clientWidth,
      height: isOscillatorActive ? 380 : 540,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#38bdf8', width: 1, style: 2 },
        horzLine: { color: '#38bdf8', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    mainChartRef.current = mainChart;

    // Add Main Price Series (Candlestick / Area / Line)
    if (chartType === 'candlestick' || chartType === 'heikin-ashi') {
      const candleSeries = mainChart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderUpColor: '#10b981',
        borderDownColor: '#f43f5e',
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
      candleSeries.setData(
        effectiveCandles.map((c) => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
    } else if (chartType === 'area') {
      const areaSeries = mainChart.addSeries(AreaSeries, {
        topColor: 'rgba(16, 185, 129, 0.4)',
        bottomColor: 'rgba(16, 185, 129, 0.0)',
        lineColor: '#10b981',
        lineWidth: 2,
      });
      areaSeries.setData(
        effectiveCandles.map((c) => ({
          time: c.time as any,
          value: c.close,
        }))
      );
    } else if (chartType === 'line') {
      const lineSeries = mainChart.addSeries(LineSeries, {
        color: '#38bdf8',
        lineWidth: 2,
      });
      lineSeries.setData(
        effectiveCandles.map((c) => ({
          time: c.time as any,
          value: c.close,
        }))
      );
    }

    // Overlays: Volume Histogram
    if (indicators.volumeEnabled) {
      const volumeSeries = mainChart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // Overlay on main pane
      });
      mainChart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      volumeSeries.setData(
        effectiveCandles.map((c) => ({
          time: c.time as any,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)',
        }))
      );
    }

    // Overlays: SMA 50
    if (indicators.sma50Enabled) {
      const sma50Data = IndicatorEngine.computeSMA(effectiveCandles, 50);
      if (sma50Data.length > 0) {
        const sma50Series = mainChart.addSeries(LineSeries, {
          color: indicators.sma50Color,
          lineWidth: 2,
          title: 'SMA 50',
        });
        sma50Series.setData(sma50Data.map((d) => ({ time: d.time as any, value: d.value })));
      }
    }

    // Overlays: SMA 200
    if (indicators.sma200Enabled) {
      const sma200Data = IndicatorEngine.computeSMA(effectiveCandles, 200);
      if (sma200Data.length > 0) {
        const sma200Series = mainChart.addSeries(LineSeries, {
          color: indicators.sma200Color,
          lineWidth: 2,
          title: 'SMA 200',
        });
        sma200Series.setData(sma200Data.map((d) => ({ time: d.time as any, value: d.value })));
      }
    }

    // Overlays: EMA 20
    if (indicators.ema20Enabled) {
      const ema20Data = IndicatorEngine.computeEMA(effectiveCandles, 20);
      if (ema20Data.length > 0) {
        const ema20Series = mainChart.addSeries(LineSeries, {
          color: indicators.ema20Color,
          lineWidth: 2,
          title: 'EMA 20',
        });
        ema20Series.setData(ema20Data.map((d) => ({ time: d.time as any, value: d.value })));
      }
    }

    // Overlays: EMA 50
    if (indicators.ema50Enabled) {
      const ema50Data = IndicatorEngine.computeEMA(effectiveCandles, 50);
      if (ema50Data.length > 0) {
        const ema50Series = mainChart.addSeries(LineSeries, {
          color: indicators.ema50Color,
          lineWidth: 2,
          title: 'EMA 50',
        });
        ema50Series.setData(ema50Data.map((d) => ({ time: d.time as any, value: d.value })));
      }
    }

    // Overlays: Bollinger Bands
    if (indicators.bollingerEnabled) {
      const bb = IndicatorEngine.computeBollingerBands(
        effectiveCandles,
        indicators.bollingerPeriod,
        indicators.bollingerStdDev
      );
      if (bb.upper.length > 0) {
        const upperSeries = mainChart.addSeries(LineSeries, { color: '#f43f5e', lineWidth: 1, title: 'BB Upper' });
        const middleSeries = mainChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, title: 'BB Middle' });
        const lowerSeries = mainChart.addSeries(LineSeries, { color: '#10b981', lineWidth: 1, title: 'BB Lower' });

        upperSeries.setData(bb.upper.map((d) => ({ time: d.time as any, value: d.value })));
        middleSeries.setData(bb.middle.map((d) => ({ time: d.time as any, value: d.value })));
        lowerSeries.setData(bb.lower.map((d) => ({ time: d.time as any, value: d.value })));
      }
    }

    // Overlays: Supertrend
    if (indicators.supertrendEnabled) {
      const stData = IndicatorEngine.computeSupertrend(
        effectiveCandles,
        indicators.supertrendPeriod,
        indicators.supertrendMultiplier
      );
      if (stData.length > 0) {
        const stSeries = mainChart.addSeries(LineSeries, {
          lineWidth: 2,
          title: 'Supertrend',
        });
        stSeries.setData(stData.map((d) => ({ time: d.time as any, value: d.value, color: d.color })));
      }
    }

    // Oscillators Sub-Chart Pane (RSI / MACD / Stoch RSI)
    if (isOscillatorActive && oscillatorChartContainerRef.current) {
      const oscChart = createChart(oscillatorChartContainerRef.current, {
        width: oscillatorChartContainerRef.current.clientWidth,
        height: 180,
        layout: {
          background: { type: ColorType.Solid, color: '#090d16' },
          textColor: '#94a3b8',
        },
        grid: {
          vertLines: { color: '#1e293b' },
          horzLines: { color: '#1e293b' },
        },
        rightPriceScale: {
          borderColor: '#334155',
        },
        timeScale: {
          borderColor: '#334155',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      oscillatorChartRef.current = oscChart;

      // Sub-Chart: RSI
      if (indicators.rsiEnabled) {
        const rsiData = IndicatorEngine.computeRSI(effectiveCandles, indicators.rsiPeriod);
        if (rsiData.length > 0) {
          const rsiSeries = oscChart.addSeries(LineSeries, {
            color: '#a855f7',
            lineWidth: 2,
            title: `RSI (${indicators.rsiPeriod})`,
          });
          rsiSeries.setData(rsiData.map((d) => ({ time: d.time as any, value: d.value })));

          // Overbought (70) and Oversold (30) reference lines
          const rsi70 = oscChart.addSeries(LineSeries, { color: 'rgba(244, 63, 94, 0.5)', lineWidth: 1 });
          const rsi30 = oscChart.addSeries(LineSeries, { color: 'rgba(16, 185, 129, 0.5)', lineWidth: 1 });

          const referencePoints70 = rsiData.map((d) => ({ time: d.time as any, value: 70 }));
          const referencePoints30 = rsiData.map((d) => ({ time: d.time as any, value: 30 }));

          rsi70.setData(referencePoints70);
          rsi30.setData(referencePoints30);
        }
      }

      // Sub-Chart: MACD
      if (indicators.macdEnabled) {
        const macdRes = IndicatorEngine.computeMACD(
          effectiveCandles,
          indicators.macdFast,
          indicators.macdSlow,
          indicators.macdSignal
        );
        if (macdRes.macdLine.length > 0) {
          const macdSeries = oscChart.addSeries(LineSeries, {
            color: '#38bdf8',
            lineWidth: 2,
            title: 'MACD',
          });
          const signalSeries = oscChart.addSeries(LineSeries, {
            color: '#f59e0b',
            lineWidth: 2,
            title: 'Signal',
          });
          const histSeries = oscChart.addSeries(HistogramSeries, {
            title: 'Hist',
          });

          macdSeries.setData(macdRes.macdLine.map((d) => ({ time: d.time as any, value: d.value })));
          signalSeries.setData(macdRes.signalLine.map((d) => ({ time: d.time as any, value: d.value })));
          histSeries.setData(
            macdRes.histogram.map((d) => ({
              time: d.time as any,
              value: d.value,
              color: d.color,
            }))
          );
        }
      }

      // Sub-Chart: Stochastic RSI
      if (indicators.stochRsiEnabled) {
        const stochRes = IndicatorEngine.computeStochasticRSI(effectiveCandles);
        if (stochRes.k.length > 0) {
          const kSeries = oscChart.addSeries(LineSeries, {
            color: '#06b6d4',
            lineWidth: 2,
            title: 'Stoch %K',
          });
          const dSeries = oscChart.addSeries(LineSeries, {
            color: '#ec4899',
            lineWidth: 2,
            title: 'Stoch %D',
          });

          kSeries.setData(stochRes.k.map((d) => ({ time: d.time as any, value: d.value })));
          dSeries.setData(stochRes.d.map((d) => ({ time: d.time as any, value: d.value })));
        }
      }

      // Synchronize time scales between Main Chart and Oscillator Sub-Chart
      mainChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
        if (range && oscillatorChartRef.current) {
          oscillatorChartRef.current.timeScale().setVisibleRange(range);
        }
      });

      oscChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
        if (range && mainChartRef.current) {
          mainChartRef.current.timeScale().setVisibleRange(range);
        }
      });
    }

    // Fit content into view
    mainChart.timeScale().fitContent();

    // Resize handler
    const handleResize = () => {
      if (mainChartContainerRef.current && mainChartRef.current) {
        mainChartRef.current.applyOptions({
          width: mainChartContainerRef.current.clientWidth,
        });
      }
      if (oscillatorChartContainerRef.current && oscillatorChartRef.current) {
        oscillatorChartRef.current.applyOptions({
          width: oscillatorChartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mainChartRef.current) {
        mainChartRef.current.remove();
        mainChartRef.current = null;
      }
      if (oscillatorChartRef.current) {
        oscillatorChartRef.current.remove();
        oscillatorChartRef.current = null;
      }
    };
  }, [candles, chartType, indicators]);

  return (
    <div className="w-full flex flex-col space-y-2 bg-slate-950 p-2 rounded-xl border border-slate-800/80 shadow-2xl">
      {/* Main Price Chart Canvas Pane */}
      <div className="relative w-full overflow-hidden rounded-lg border border-slate-800">
        <div className="absolute top-2 left-3 z-10 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-xs font-mono">
          <span className="font-extrabold text-emerald-400">{symbol}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 capitalize">{chartType}</span>
          {candles && candles.length > 0 && (
            <>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">
                Close: ₹{candles[candles.length - 1].close.toLocaleString('en-IN')}
              </span>
            </>
          )}
        </div>
        <div ref={mainChartContainerRef} className="w-full" />
      </div>

      {/* Oscillator Sub-Chart Pane */}
      {(indicators.rsiEnabled || indicators.macdEnabled || indicators.stochRsiEnabled) && (
        <div className="relative w-full overflow-hidden rounded-lg border border-slate-800">
          <div className="absolute top-2 left-3 z-10 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Sub-Chart Oscillators</span>
          </div>
          <div ref={oscillatorChartContainerRef} className="w-full" />
        </div>
      )}
    </div>
  );
};
