import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider } from './provider.js';

export class GeminiProvider implements AIProvider {
  private model: GenerativeModel;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateCheer(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : error}`);
    }
  }
}
