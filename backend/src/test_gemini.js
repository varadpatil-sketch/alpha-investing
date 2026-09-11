import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing GEMINI_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE');

const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Respond with: "Gemini 3.6 Flash is working!"',
    });
    console.log('SUCCESS Response:', response.text);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

run();
