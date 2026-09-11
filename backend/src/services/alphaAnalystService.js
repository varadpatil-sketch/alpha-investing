import { YahooFinanceService } from './yahooFinanceService.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'your_gemini_api_key_here') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/**
 * Calculates 14-period Relative Strength Index (RSI) from candle close prices
 */
function calculateRSI(candles, period = 14) {
  if (!candles || candles.length < period + 1) return 50.0;

  const closes = candles.map((c) => c.close);
  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100.0;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return Math.round(rsi * 10) / 10;
}

/**
 * Calculates Quant Score (0-100 scale) with Value, Growth, Momentum, & Quality sub-scores
 */
export function calculateQuantMetrics(quote, rsi) {
  const price = quote.last_price || quote.price || 100;
  const pe = quote.trailingPE || quote.pe || 24;
  const pb = quote.priceToBook || 3.0;
  const roe = quote.returnOnEquity || 15;
  const revGrowth = quote.revenueGrowth || 10;
  const debtEquity = quote.debtToEquity !== undefined ? quote.debtToEquity : 0.5;
  const divYield = quote.dividendYield || 1.0;
  const fiftyAvg = quote.fiftyDayAverage || price;
  const twoHundredAvg = quote.twoHundredDayAverage || price;

  // 1. Value Score (0-25)
  let valueScore = 15;
  if (pe < 15) valueScore += 7;
  else if (pe < 25) valueScore += 4;
  else if (pe > 45) valueScore -= 4;
  if (pb < 2.5) valueScore += 3;
  if (divYield > 2.0) valueScore += 3;

  // 2. Growth Score (0-25)
  let growthScore = 15;
  if (revGrowth > 18) growthScore += 7;
  else if (revGrowth > 10) growthScore += 4;
  if (roe > 20) growthScore += 6;
  else if (roe > 12) growthScore += 3;

  // 3. Momentum Score (0-25)
  let momentumScore = 15;
  if (price > fiftyAvg && fiftyAvg > twoHundredAvg) momentumScore += 6; // Golden alignment
  if (rsi > 40 && rsi < 65) momentumScore += 4; // Healthy bullish momentum
  else if (rsi < 30) momentumScore += 5; // Oversold bounce setup

  // 4. Quality & Balance Sheet Score (0-25)
  let qualityScore = 18;
  if (debtEquity < 0.3) qualityScore += 5;
  else if (debtEquity < 0.8) qualityScore += 2;
  else if (debtEquity > 1.5) qualityScore -= 5;

  const totalScore = Math.min(99, Math.max(30, valueScore + growthScore + momentumScore + qualityScore));

  let rating = 'Hold';
  if (totalScore >= 82) rating = 'Strong Buy';
  else if (totalScore >= 70) rating = 'Buy';
  else if (totalScore < 50) rating = 'Sell';

  return {
    totalScore,
    rating,
    valueScore: Math.min(25, Math.max(5, valueScore)),
    growthScore: Math.min(25, Math.max(5, growthScore)),
    momentumScore: Math.min(25, Math.max(5, momentumScore)),
    qualityScore: Math.min(25, Math.max(5, qualityScore)),
  };
}

export class AlphaAnalystService {
  /**
   * Aggregates ticker data, computes quant & technical indicators, and calls Gemini SDK
   */
  static async generateGoldmanSachsReport(symbol, userProfile = {}) {
    // 1. Aggregate Raw Financial Data from Yahoo Finance
    const quote = await YahooFinanceService.getQuote(symbol, false);
    let chartData = null;
    let rsi = 54.2;

    try {
      chartData = await YahooFinanceService.getHistoricalChart(symbol, '1D');
      if (chartData && chartData.candles) {
        rsi = calculateRSI(chartData.candles, 14);
      }
    } catch (err) {
      console.warn(`Could not fetch candles for RSI calculation of ${symbol}:`, err.message);
    }

    // 2. Technical Indicators Aggregation
    const cmp = quote.last_price;
    const fiftyAvg = quote.fiftyDayAverage || cmp;
    const twoHundredAvg = quote.twoHundredDayAverage || cmp;
    const high52 = quote.fiftyTwoWeekHigh || cmp;
    const low52 = quote.fiftyTwoWeekLow || cmp;

    const distFromHighPct = Math.round(((high52 - cmp) / high52) * 1000) / 10;
    const distFromLowPct = Math.round(((cmp - low52) / low52) * 1000) / 10;

    let rsiSignal = 'Neutral Momentum';
    if (rsi < 30) rsiSignal = 'Oversold (Bullish Reversal Setup)';
    else if (rsi < 45) rsiSignal = 'Accumulation Zone';
    else if (rsi > 70) rsiSignal = 'Overbought (Take Profit Zone)';
    else if (rsi > 55) rsiSignal = 'Strong Bullish Trend';

    let maTrend = 'Trading near Moving Averages';
    if (cmp > fiftyAvg && fiftyAvg > twoHundredAvg) maTrend = 'Golden Alignment (Price > 50D > 200D EMA)';
    else if (cmp < fiftyAvg && cmp < twoHundredAvg) maTrend = 'Bearish Pressure (Price < 50D & 200D EMA)';

    const technicals = {
      rsi,
      rsiSignal,
      fiftyDayAverage: fiftyAvg,
      twoHundredDayAverage: twoHundredAvg,
      maTrend,
      fiftyTwoWeekHigh: high52,
      fiftyTwoWeekLow: low52,
      distFromHighPct,
      distFromLowPct,
    };

    // 3. Quant Score Aggregation
    const quantMetrics = calculateQuantMetrics(quote, rsi);

    // 4. Default User Profile
    const profile = {
      riskTolerance: userProfile.riskTolerance || 'moderate',
      timeHorizonYears: userProfile.timeHorizonYears || 3,
      expectedReturnPct: userProfile.expectedReturnPct || 14,
    };

    // 5. Structure LLM Prompt for Goldman Sachs Institutional Report
    const payloadPrompt = `
You are a Senior Managing Director & Lead Institutional Equity Analyst at Goldman Sachs India (Mumbai Desk).
You are publishing a Wall Street Goldman Sachs Equity Research Report for an Indian Stock listed on the NSE/BSE.

=== TICKER FINANCIAL & MARKET TELEMETRY ===
- Symbol: ${quote.tradingsymbol} (NSE)
- Company Name: ${quote.name}
- Current Market Price (CMP): ₹${cmp}
- 52-Week Range: ₹${low52} (Low) - ₹${high52} (High) | Distance from High: -${distFromHighPct}% | Distance from Low: +${distFromLowPct}%
- Sector: ${quote.sector} | Asset Class: ${quote.asset_class}
- Valuation: P/E: ${quote.trailingPE}x | P/B: ${quote.priceToBook}x | Dividend Yield: ${quote.dividendYield}%
- Financial Health: ROE: ${quote.returnOnEquity}% | Revenue Growth (YoY): ${quote.revenueGrowth}% | Debt-to-Equity: ${quote.debtToEquity}
- Technical Indicators: 14-Day RSI: ${rsi} (${rsiSignal}) | Moving Averages: 50-Day ₹${fiftyAvg}, 200-Day ₹${twoHundredAvg} | MA Trend: ${maTrend}
- Quant Score Breakdown: Total ${quantMetrics.totalScore}/100 | Quant Rating: ${quantMetrics.rating} (Value: ${quantMetrics.valueScore}/25, Growth: ${quantMetrics.growthScore}/25, Momentum: ${quantMetrics.momentumScore}/25, Quality: ${quantMetrics.qualityScore}/25)

=== CLIENT INVESTOR PROFILE ===
- Risk Tolerance: ${profile.riskTolerance}
- Preferred Holding Horizon: ${profile.timeHorizonYears} year(s)
- Target Annualized Return: ${profile.expectedReturnPct}% p.a.

=== MANDATORY GOLDMAN SACHS REPORT STRUCTURE (MUST USE MARKDOWN) ===

# 🏛️ GOLDMAN SACHS EQUITY RESEARCH | INDIAN EQUITIES
## ${quote.name} (NSE: ${quote.tradingsymbol}) - Institutional Equity Research

### 🎯 EXECUTIVE SUMMARY & FINAL RATING
- **Final Analyst Rating**: [Strong Buy | Buy | Hold | Sell]
- **Target Price**: ₹[NUMERIC_TARGET_PRICE] (Implied Upside/Downside: +[X]%)
- **Suggested Holding Horizon**: [X] Months/Years (Tailored specifically to client's ${profile.timeHorizonYears}-year timeline)
- **Risk Category**: [Low Risk / Capital Protection | Moderate Growth | High Beta Growth]

### 📊 QUANTITATIVE & TECHNICAL SCORECARD
- **Quant Score**: ${quantMetrics.totalScore}/100 (Value: ${quantMetrics.valueScore}/25 | Growth: ${quantMetrics.growthScore}/25 | Momentum: ${quantMetrics.momentumScore}/25 | Quality: ${quantMetrics.qualityScore}/25)
- **Technical Indicator Signal**: RSI ${rsi} (${rsiSignal}), ${maTrend}

### 💡 FUNDAMENTAL INVESTMENT THESIS
1. **Earnings Trajectory & Growth Catalysts**: Deep institutional breakdown of revenue drivers, margin outlook, and industry secular tailwinds in India.
2. **Economic Moat & Promoter Quality**: Key competitive moat (pricing power, network effects, brand equity), corporate governance, and promoter background.
3. **Valuation & Peer Comparison**: Assessment of P/E (${quote.trailingPE}x) and P/B (${quote.priceToBook}x) relative to NIFTY 50 and sector peers.
4. **Key Investment Risks & Downside Triggers**: What macro/micro risks could threaten this thesis (e.g. RBI rate cycles, raw material inflation, regulatory changes).

### 💼 CLIENT PORTFOLIO SUITABILITY
Explain directly why this ticker matches or diverges from the user's ${profile.riskTolerance} risk profile and ${profile.expectedReturnPct}% return target over ${profile.timeHorizonYears} years.

Write in an authoritative, analytical, Goldman Sachs Wall Street style. Keep numbers rounded and clear.
`;

    const ai = getAIClient();
    let reportMarkdown = '';
    let isAiGenerated = false;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: payloadPrompt,
        });
        reportMarkdown = response.text;
        isAiGenerated = true;
      } catch (err) {
        console.error('Gemini API Error in Alpha Analyst Service:', err);
      }
    }

    // Fallback template if GEMINI_API_KEY is not configured
    if (!reportMarkdown) {
      const estimatedTarget = Math.round(cmp * (1 + (quote.cagr_5yr || 14) / 100));
      reportMarkdown = `
# 🏛️ GOLDMAN SACHS EQUITY RESEARCH | INDIAN EQUITIES
## ${quote.name} (NSE: ${quote.tradingsymbol}) - Institutional Equity Research

> [!NOTE]
> *Standard Quantitative Research Report. Add your Gemini API key to backend/.env to unlock live Goldman Sachs AI analyst synthesis.*

### 🎯 EXECUTIVE SUMMARY & FINAL RATING
- **Final Analyst Rating**: **${quantMetrics.rating}**
- **Target Price**: **₹${estimatedTarget}** (Implied Upside: +${quote.cagr_5yr || 14}%)
- **Suggested Holding Horizon**: **${profile.timeHorizonYears} Years**
- **Risk Category**: **${quote.risk_rating} Risk**

### 📊 QUANTITATIVE & TECHNICAL SCORECARD
- **Quant Score**: **${quantMetrics.totalScore}/100** (Value: ${quantMetrics.valueScore}/25 | Growth: ${quantMetrics.growthScore}/25 | Momentum: ${quantMetrics.momentumScore}/25 | Quality: ${quantMetrics.qualityScore}/25)
- **Technical Indicator Signal**: RSI **${rsi}** (${rsiSignal}), ${maTrend}

### 💡 FUNDAMENTAL INVESTMENT THESIS
1. **Earnings Trajectory & Growth Catalysts**: ${quote.name} demonstrates robust revenue growth of ${quote.revenueGrowth}% YoY with ROE standing at ${quote.returnOnEquity}%.
2. **Economic Moat & Promoter Quality**: Strong market position in ${quote.sector} with low debt exposure (D/E: ${quote.debtToEquity}).
3. **Valuation & Peer Comparison**: Currently trading at P/E of ${quote.trailingPE}x and P/B of ${quote.priceToBook}x.
4. **Key Investment Risks**: Market volatility, sectoral regulatory changes, and broader macro fluctuations in the Indian market.

### 💼 CLIENT PORTFOLIO SUITABILITY
Suitable for a **${profile.riskTolerance}** investor targeting ~${profile.expectedReturnPct}% annualized returns over a ${profile.timeHorizonYears}-year horizon.
`;
    }

    return {
      success: true,
      isAiGenerated,
      symbol: quote.tradingsymbol,
      companyName: quote.name,
      currentPrice: cmp,
      quote,
      technicals,
      quantMetrics,
      userProfile: profile,
      reportMarkdown,
    };
  }
}
