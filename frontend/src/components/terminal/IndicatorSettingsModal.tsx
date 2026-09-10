import React from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { IndicatorSettings } from '../../services/indicators/indicatorEngine';

interface IndicatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicators: IndicatorSettings;
  onChangeIndicators: (updated: IndicatorSettings) => void;
}

export const IndicatorSettingsModal: React.FC<IndicatorSettingsModalProps> = ({
  isOpen,
  onClose,
  indicators,
  onChangeIndicators,
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof IndicatorSettings) => {
    onChangeIndicators({
      ...indicators,
      [key]: !indicators[key],
    });
  };

  const updateNumber = (key: keyof IndicatorSettings, val: number) => {
    onChangeIndicators({
      ...indicators,
      [key]: val,
    });
  };

  const updateColor = (key: keyof IndicatorSettings, color: string) => {
    onChangeIndicators({
      ...indicators,
      [key]: color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-emerald-400" />
            <h3 className="font-extrabold text-lg text-white">Technical Indicator Engine</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Overlays Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Chart Overlay Indicators
            </h4>
            <div className="space-y-3">
              {/* SMA 50 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={indicators.sma50Enabled}
                    onChange={() => toggle('sma50Enabled')}
                    className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-200">SMA 50</span>
                    <p className="text-xs text-slate-500">50-Period Simple Moving Average</p>
                  </div>
                </div>
                <input
                  type="color"
                  value={indicators.sma50Color}
                  onChange={(e) => updateColor('sma50Color', e.target.value)}
                  className="h-7 w-7 rounded border-none bg-transparent cursor-pointer"
                />
              </div>

              {/* SMA 200 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={indicators.sma200Enabled}
                    onChange={() => toggle('sma200Enabled')}
                    className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-200">SMA 200</span>
                    <p className="text-xs text-slate-500">200-Period Simple Moving Average</p>
                  </div>
                </div>
                <input
                  type="color"
                  value={indicators.sma200Color}
                  onChange={(e) => updateColor('sma200Color', e.target.value)}
                  className="h-7 w-7 rounded border-none bg-transparent cursor-pointer"
                />
              </div>

              {/* EMA 20 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={indicators.ema20Enabled}
                    onChange={() => toggle('ema20Enabled')}
                    className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-200">EMA 20</span>
                    <p className="text-xs text-slate-500">20-Period Exponential Moving Average</p>
                  </div>
                </div>
                <input
                  type="color"
                  value={indicators.ema20Color}
                  onChange={(e) => updateColor('ema20Color', e.target.value)}
                  className="h-7 w-7 rounded border-none bg-transparent cursor-pointer"
                />
              </div>

              {/* Bollinger Bands */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={indicators.bollingerEnabled}
                      onChange={() => toggle('bollingerEnabled')}
                      className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                    />
                    <div>
                      <span className="font-bold text-sm text-slate-200">Bollinger Bands</span>
                      <p className="text-xs text-slate-500">Volatility Bands (Upper, Middle, Lower)</p>
                    </div>
                  </div>
                </div>
                {indicators.bollingerEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Period</label>
                      <input
                        type="number"
                        value={indicators.bollingerPeriod}
                        onChange={(e) => updateNumber('bollingerPeriod', parseInt(e.target.value) || 20)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Std Dev</label>
                      <input
                        type="number"
                        value={indicators.bollingerStdDev}
                        onChange={(e) => updateNumber('bollingerStdDev', parseFloat(e.target.value) || 2)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Supertrend */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={indicators.supertrendEnabled}
                      onChange={() => toggle('supertrendEnabled')}
                      className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                    />
                    <div>
                      <span className="font-bold text-sm text-slate-200">Supertrend</span>
                      <p className="text-xs text-slate-500">ATR-based Trend Following Line</p>
                    </div>
                  </div>
                </div>
                {indicators.supertrendEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">ATR Period</label>
                      <input
                        type="number"
                        value={indicators.supertrendPeriod}
                        onChange={(e) => updateNumber('supertrendPeriod', parseInt(e.target.value) || 10)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Multiplier</label>
                      <input
                        type="number"
                        value={indicators.supertrendMultiplier}
                        onChange={(e) => updateNumber('supertrendMultiplier', parseFloat(e.target.value) || 3)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Chart Oscillators Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Sub-Chart Oscillators
            </h4>
            <div className="space-y-3">
              {/* RSI */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={indicators.rsiEnabled}
                      onChange={() => toggle('rsiEnabled')}
                      className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                    />
                    <div>
                      <span className="font-bold text-sm text-slate-200">RSI (Relative Strength Index)</span>
                      <p className="text-xs text-slate-500">Momentum Oscillator (0 - 100)</p>
                    </div>
                  </div>
                </div>
                {indicators.rsiEnabled && (
                  <div className="w-1/2 pt-2">
                    <label className="text-[11px] font-semibold text-slate-400">RSI Period</label>
                    <input
                      type="number"
                      value={indicators.rsiPeriod}
                      onChange={(e) => updateNumber('rsiPeriod', parseInt(e.target.value) || 14)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* MACD */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={indicators.macdEnabled}
                      onChange={() => toggle('macdEnabled')}
                      className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                    />
                    <div>
                      <span className="font-bold text-sm text-slate-200">MACD</span>
                      <p className="text-xs text-slate-500">Moving Average Convergence Divergence</p>
                    </div>
                  </div>
                </div>
                {indicators.macdEnabled && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Fast</label>
                      <input
                        type="number"
                        value={indicators.macdFast}
                        onChange={(e) => updateNumber('macdFast', parseInt(e.target.value) || 12)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Slow</label>
                      <input
                        type="number"
                        value={indicators.macdSlow}
                        onChange={(e) => updateNumber('macdSlow', parseInt(e.target.value) || 26)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Signal</label>
                      <input
                        type="number"
                        value={indicators.macdSignal}
                        onChange={(e) => updateNumber('macdSignal', parseInt(e.target.value) || 9)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stochastic RSI */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={indicators.stochRsiEnabled}
                    onChange={() => toggle('stochRsiEnabled')}
                    className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-200">Stochastic RSI</span>
                    <p className="text-xs text-slate-500">%K and %D Stochastic Lines</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Apply Indicators</span>
          </button>
        </div>
      </div>
    </div>
  );
};
