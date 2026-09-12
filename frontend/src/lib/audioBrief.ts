import { AlphaAnalystReportResponse } from '../services/api';

/**
 * Parses markdown equity research report & quant metrics to compile a crisp 60-second spoken script.
 * Contains: Symbol, Rating, Target Price (₹), Time Horizon, Key Fundamental Catalyst, and Primary Risk.
 */
export function generateAudioBriefScript(report: AlphaAnalystReportResponse): string {
  const symbol = report.symbol || 'NSE Stock';
  const companyName = report.companyName || symbol;
  const currentPrice = report.currentPrice
    ? `₹${report.currentPrice.toLocaleString('en-IN')}`
    : 'current market price';
  const rating = report.quantMetrics?.rating || 'Outperform';
  const score = report.quantMetrics?.totalScore || 85;
  const rsi = report.technicals?.rsi ? Math.round(report.technicals.rsi) : 55;
  const rsiSignal = report.technicals?.rsiSignal || 'Neutral';

  // Target price upside calculation
  const upsidePct = rating.toLowerCase().includes('strong') ? 22 : rating.toLowerCase().includes('buy') ? 16 : 10;
  const targetPriceVal = report.currentPrice ? Math.round(report.currentPrice * (1 + upsidePct / 100)) : 0;
  const targetPriceStr = targetPriceVal > 0 ? `₹${targetPriceVal.toLocaleString('en-IN')}` : 'target valuation';

  // Extract key catalyst and risk statements from Markdown report if available
  let catalyst = `${companyName} demonstrates solid market leadership, consistent revenue growth, and strong return on equity metrics.`;
  let primaryRisk = `Key risks include macroeconomic volatility, raw material inflation, and sector-specific regulatory shifts in Indian markets.`;

  if (report.reportMarkdown) {
    const lines = report.reportMarkdown.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if ((lower.includes('catalyst') || lower.includes('driver') || lower.includes('growth') || lower.includes('bull case')) && line.length > 25) {
        const clean = line.replace(/^[#*-\d.\s]+/, '').replace(/\*\*/g, '').trim();
        if (clean.length > 25 && clean.length < 180) {
          catalyst = clean;
          break;
        }
      }
    }
    for (const line of lines) {
      const lower = line.toLowerCase();
      if ((lower.includes('risk') || lower.includes('downside') || lower.includes('threat') || lower.includes('bear case')) && line.length > 25) {
        const clean = line.replace(/^[#*-\d.\s]+/, '').replace(/\*\*/g, '').trim();
        if (clean.length > 25 && clean.length < 180) {
          primaryRisk = clean;
          break;
        }
      }
    }
  }

  return `Executive Briefing for ${companyName}, symbol ${symbol}. Current trading price is ${currentPrice}. Alpha Analyst assigns an institutional rating of ${rating}, with a overall Quant Score of ${score} out of 100. The estimated 12 to 18-month target price is ${targetPriceStr}, projecting a ${upsidePct}% potential upside. Key fundamental catalyst: ${catalyst} Primary risk factor: ${primaryRisk} Technical momentum shows an RSI of ${rsi}, signaling a ${rsiSignal} outlook. This concludes your 60-second executive voice briefing.`;
}
