import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cheerleader } from './core';
import type { PlatformProvider } from './platform/provider';
import type { AIProvider } from './ai/provider';

describe('cheerleader', () => {
  const mockPlatform: PlatformProvider = {
    getDiff: vi.fn().mockResolvedValue('+ new code'),
    getPRDescription: vi.fn().mockResolvedValue('Added feature'),
    postComment: vi.fn().mockResolvedValue(undefined),
  };

  const mockAI: AIProvider = {
    generateCheer: vi.fn().mockResolvedValue('Great work!'),
  };

  const config = { style: 'enthusiastic' as const, language: 'zh-TW' };
  const mockLog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run full flow: diff → prompt → cheer → comment', async () => {
    await cheerleader(mockPlatform, mockAI, config, mockLog);

    expect(mockPlatform.getDiff).toHaveBeenCalled();
    expect(mockPlatform.getPRDescription).toHaveBeenCalled();
    expect(mockAI.generateCheer).toHaveBeenCalled();
    expect(mockPlatform.postComment).toHaveBeenCalledWith(
      expect.stringContaining('AICheerleader')
    );
    expect(mockPlatform.postComment).toHaveBeenCalledWith(
      expect.stringContaining('Great work!')
    );
  });

  it('should skip when diff is empty', async () => {
    vi.mocked(mockPlatform.getDiff).mockResolvedValueOnce('');
    await cheerleader(mockPlatform, mockAI, config, mockLog);

    expect(mockPlatform.getPRDescription).not.toHaveBeenCalled();
    expect(mockAI.generateCheer).not.toHaveBeenCalled();
    expect(mockPlatform.postComment).not.toHaveBeenCalled();
  });

  it('should use console.log as default logger', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await cheerleader(mockPlatform, mockAI, config);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
