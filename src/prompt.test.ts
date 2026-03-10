import { describe, it, expect } from 'vitest';
import { buildPrompt, CheerStyle } from './prompt';

describe('buildPrompt', () => {
  const diff = '+ console.log("hello")';
  const description = 'Added logging';

  it('should build prompt with enthusiastic style', () => {
    const prompt = buildPrompt({ diff, description, style: 'enthusiastic', language: 'zh-TW' });
    expect(prompt).toContain('zh-TW');
    expect(prompt).toContain(diff);
    expect(prompt).toContain(description);
    expect(prompt).toContain('enthusiastic');
  });

  it('should build prompt with warm style', () => {
    const prompt = buildPrompt({ diff, description, style: 'warm', language: 'en' });
    expect(prompt).toContain(diff);
    expect(prompt).toContain('warm');
  });

  it('should build prompt with auto style', () => {
    const prompt = buildPrompt({ diff, description, style: 'auto', language: 'zh-TW' });
    expect(prompt).toContain(diff);
  });

  it('should throw on invalid style', () => {
    expect(() => buildPrompt({ diff: 'x', description: 'y', style: 'invalid' as CheerStyle, language: 'en' })).toThrow('Unknown cheer style');
  });

  it('should truncate long diffs', () => {
    const longDiff = 'a'.repeat(30000);
    const prompt = buildPrompt({ diff: longDiff, description, style: 'enthusiastic', language: 'zh-TW' });
    expect(prompt.length).toBeLessThan(longDiff.length);
    expect(prompt).toContain('(diff truncated');
  });
});
