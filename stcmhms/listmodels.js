import * as genai from '@google/genai';

const client = new genai.TextServiceClient({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    const res = await client.listModels();
    console.log('Available models:', res);
  } catch (err) {
    console.error('Error listing models:', err);
  }
}
listModels();