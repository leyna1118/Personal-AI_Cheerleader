import { describe, it, expect, vi } from 'vitest';
import { GeminiProvider } from './gemini';

vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: { text: () => 'Great job on this PR!' },
  });
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return { generateContent: mockGenerateContent };
      }
    },
  };
});

describe('GeminiProvider', () => {
  it('should implement AIProvider and return cheer text', async () => {
    const provider = new GeminiProvider('fake-api-key');
    const result = await provider.generateCheer('test prompt');
    expect(result).toBe('Great job on this PR!');
  });

  it('should throw on empty API key', () => {
    expect(() => new GeminiProvider('')).toThrow();
  });
});
