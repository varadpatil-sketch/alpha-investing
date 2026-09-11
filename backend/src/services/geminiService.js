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
 * Generate AI analysis for an investment portfolio recommendation
 */
export async function generatePortfolioInsights(portfolioData) {
  const ai = getAIClient();
  if (!ai) {
    return {
      success: false,
      isConfigured: false,
      message: 'GEMINI_API_KEY is not set or configured in backend/.env',
    };
  }

  const { investmentAmount, timeHorizonYears, expectedReturnPct, riskTolerance, allocations, realityScore } = portfolioData;

  const prompt = `
You are an expert SEBI-registered level financial analyst specializing in Indian Stock Market (NSE/BSE) wealth management.
Analyze the following portfolio recommendation for an Indian investor:

- Investment Amount: ₹${investmentAmount?.toLocaleString('en-IN') || investmentAmount}
- Time Horizon: ${timeHorizonYears} years
- Expected Return Target: ${expectedReturnPct}% p.a.
- Risk Profile: ${riskTolerance}
- Reality Check Assessment: ${realityScore}

Allocations:
${allocations?.map(a => `- ${a.symbol} (${a.name}): ${a.weightPct}% (₹${a.allocatedAmount?.toLocaleString('en-IN') || a.allocatedAmount}) | Sector: ${a.sector} | Expected CAGR: ${a.expectedCagr}%`).join('\n') || 'N/A'}

Provide a structured, concise, and highly practical analysis in GitHub Markdown format covering:
1. **Executive Portfolio Assessment**: Why this portfolio allocation suits their target & risk profile.
2. **Growth Drivers & Sector Allocation**: Top sectors/stocks expected to drive returns.
3. **Key Indian Market Risks**: Factors like RBI monetary policy, crude prices, inflation, FII/DII capital flow.
4. **Tax & SIP/Lumpsum Strategy**: Practical considerations for Indian investors (LTCG at 12.5% over ₹1.25L, STCG at 20%, rebalancing tips).
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return {
      success: true,
      isConfigured: true,
      insightText: response.text,
      modelUsed: 'gemini-2.5-flash',
    };
  } catch (error) {
    console.error('Gemini API portfolio insight error:', error);
    return {
      success: false,
      isConfigured: true,
      error: error.message || 'Failed to generate Gemini AI insights',
    };
  }
}

/**
 * Generate AI analysis for an individual stock in Indian Stock Market
 */
export async function generateStockAnalysis(stockData) {
  const ai = getAIClient();
  if (!ai) {
    return {
      success: false,
      isConfigured: false,
      message: 'GEMINI_API_KEY is not configured in backend/.env',
    };
  }

  const prompt = `
You are a senior equity research analyst for Indian Stock Markets (NSE/BSE).
Provide a quick research analysis for:

- Symbol: ${stockData.symbol}
- Company Name: ${stockData.name || stockData.symbol}
- Current Price: ₹${stockData.price || stockData.lastPrice}
- P/E Ratio: ${stockData.pe || 'N/A'}
- Sector: ${stockData.sector || 'N/A'}
- Market Cap / Class: ${stockData.marketCap || stockData.assetClass || 'N/A'}
- 52-Week High / Low: ₹${stockData.fiftyTwoWeekHigh || 'N/A'} / ₹${stockData.fiftyTwoWeekLow || 'N/A'}

Provide concise bulleted analysis:
1. **Business Summary**: Core business model and market position.
2. **Key Moats & Growth Catalysts**: Why it stands out in its sector.
3. **Valuation & Key Risks**: P/E context, downside risks.
4. **Investor Summary**: Suitability for long-term vs conservative portfolios.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return {
      success: true,
      isConfigured: true,
      analysis: response.text,
    };
  } catch (error) {
    console.error('Gemini API stock analysis error:', error);
    return {
      success: false,
      isConfigured: true,
      error: error.message,
    };
  }
}

/**
 * Interactive AI Assistant / Market Q&A
 */
export async function askMarketAssistant(userMessage, contextData = null) {
  const ai = getAIClient();
  if (!ai) {
    return {
      success: false,
      isConfigured: false,
      reply: 'Gemini API Key is missing in backend/.env. Please set GEMINI_API_KEY in backend/.env to enable the AI assistant.',
    };
  }

  const prompt = `
You are Alpha-AI, an expert Indian Stock Market (NSE/BSE) investment advisor & wealth management assistant.
Answer user questions accurately based on Indian equity market principles, technical/fundamental concepts, SEBI guidelines, and tax rules.

User Question: ${userMessage}
${contextData ? `Additional Context: ${JSON.stringify(contextData)}` : ''}

Respond in concise, helpful, formatted Markdown.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return {
      success: true,
      isConfigured: true,
      reply: response.text,
    };
  } catch (error) {
    console.error('Gemini Assistant Error:', error);
    return {
      success: false,
      isConfigured: true,
      error: error.message,
    };
  }
}
