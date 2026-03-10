import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  GeminiProvider: class {
    generateCheer = vi.fn().mockResolvedValue('You are awesome!');
  },
}));

vi.mock('./platform/github', () => ({
  GitHubProvider: class {
    getDiff = vi.fn().mockResolvedValue('+ new code');
    getPRDescription = vi.fn().mockResolvedValue('Added feature');
    postComment = vi.fn().mockResolvedValue(undefined);
  },
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

  it('should complete the full flow without errors', async () => {
    await run();
    expect(core.setFailed).not.toHaveBeenCalled();
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
});
