import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCheerleader = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  setFailed: vi.fn(),
  info: vi.fn(),
}));

vi.mock('@actions/github', () => ({
  getOctokit: vi.fn(),
  context: {
    payload: { pull_request: { number: 42 } },
    repo: { owner: 'test-owner', repo: 'test-repo' },
  },
}));

vi.mock('./ai/gemini', () => ({
  GeminiProvider: vi.fn().mockImplementation(function () { return {}; }),
}));

vi.mock('./platform/github', () => ({
  GitHubProvider: vi.fn().mockImplementation(function () { return {}; }),
}));

vi.mock('./core', () => ({
  cheerleader: mockCheerleader,
}));

import * as core from '@actions/core';
import { run } from './index';

describe('run', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'ai-api-key': 'fake-key',
        style: 'enthusiastic',
        language: 'zh-TW',
      };
      return inputs[name] ?? '';
    });
  });

  it('should delegate to cheerleader() with correct config', async () => {
    await run();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(mockCheerleader).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { style: 'enthusiastic', language: 'zh-TW', platform: 'github' },
      core.info
    );
  });

  it('should fail if no PR context', async () => {
    const github = await import('@actions/github');
    vi.mocked(github.context).payload = {};
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('not a pull request')
    );
    // restore
    vi.mocked(github.context).payload = { pull_request: { number: 42 } };
  });

  it('should fail on invalid style', async () => {
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'ai-api-key': 'fake-key',
        style: 'invalid',
      };
      return inputs[name] ?? '';
    });
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Invalid style')
    );
  });
});
