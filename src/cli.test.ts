import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockCheerleader = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('./core', () => ({
  cheerleader: mockCheerleader,
}));

vi.mock('./ai/gemini', () => ({
  GeminiProvider: vi.fn().mockImplementation(function () { return {}; }),
}));

vi.mock('./platform/gitlab', () => ({
  GitLabProvider: vi.fn().mockImplementation(function () { return {}; }),
}));

import { main } from './cli';

describe('CLI main', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      CHEERLEADER_AI_API_KEY: 'fake-key',
      GITLAB_TOKEN: 'fake-token',
      CI_PROJECT_ID: '123',
      CI_MERGE_REQUEST_IID: '42',
      CI_SERVER_URL: 'https://gitlab.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should run cheerleader with GitLab provider', async () => {
    await main();
    expect(mockCheerleader).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { style: 'enthusiastic', language: 'zh-TW' }
    );
  });

  it('should throw if CHEERLEADER_AI_API_KEY is missing', async () => {
    delete process.env.CHEERLEADER_AI_API_KEY;
    await expect(main()).rejects.toThrow('CHEERLEADER_AI_API_KEY');
  });

  it('should throw if GITLAB_TOKEN is missing', async () => {
    delete process.env.GITLAB_TOKEN;
    await expect(main()).rejects.toThrow('GITLAB_TOKEN');
  });

  it('should throw if CI_PROJECT_ID is missing', async () => {
    delete process.env.CI_PROJECT_ID;
    await expect(main()).rejects.toThrow('CI_PROJECT_ID');
  });

  it('should throw if CI_MERGE_REQUEST_IID is missing', async () => {
    delete process.env.CI_MERGE_REQUEST_IID;
    await expect(main()).rejects.toThrow('CI_MERGE_REQUEST_IID');
  });

  it('should throw on invalid style', async () => {
    process.env.CHEERLEADER_STYLE = 'invalid';
    await expect(main()).rejects.toThrow('Invalid style');
  });

  it('should throw on unsupported platform', async () => {
    process.env.CHEERLEADER_PLATFORM = 'bitbucket';
    await expect(main()).rejects.toThrow('Unsupported platform');
  });

  it('should use custom style and language from env', async () => {
    process.env.CHEERLEADER_STYLE = 'warm';
    process.env.CHEERLEADER_LANGUAGE = 'en';
    await main();
    expect(mockCheerleader).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { style: 'warm', language: 'en' }
    );
  });

  it('should default CI_SERVER_URL to https://gitlab.com', async () => {
    delete process.env.CI_SERVER_URL;
    const { GitLabProvider } = await import('./platform/gitlab');
    await main();
    expect(GitLabProvider).toHaveBeenCalledWith(
      'fake-token',
      expect.objectContaining({ gitlabUrl: 'https://gitlab.com' })
    );
  });
});
