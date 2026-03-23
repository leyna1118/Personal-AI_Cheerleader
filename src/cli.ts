#!/usr/bin/env node
import { GeminiProvider } from './ai/gemini.js';
import { GitLabProvider } from './platform/gitlab.js';
import { cheerleader } from './core.js';
import { CheerStyle } from './prompt.js';

export async function main(): Promise<void> {
  const platformName = process.env.CHEERLEADER_PLATFORM || 'gitlab';
  if (platformName !== 'gitlab') {
    throw new Error(`Unsupported platform "${platformName}". Supported: gitlab`);
  }

  const apiKey = process.env.CHEERLEADER_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing CHEERLEADER_AI_API_KEY environment variable');
  }

  const style = (process.env.CHEERLEADER_STYLE || 'enthusiastic') as CheerStyle;
  const validStyles = ['enthusiastic', 'warm', 'auto'];
  if (!validStyles.includes(style)) {
    throw new Error(`Invalid style "${style}". Must be one of: ${validStyles.join(', ')}`);
  }

  const language = process.env.CHEERLEADER_LANGUAGE || 'zh-TW';
  const aiModel = process.env.CHEERLEADER_AI_MODEL || 'gemini-2.5-flash';

  const token = process.env.GITLAB_TOKEN;
  if (!token) {
    throw new Error('Missing GITLAB_TOKEN environment variable');
  }

  const projectId = process.env.CI_PROJECT_ID;
  if (!projectId) {
    throw new Error('Missing CI_PROJECT_ID environment variable (are you running in GitLab CI?)');
  }

  const mrIid = process.env.CI_MERGE_REQUEST_IID;
  if (!mrIid) {
    throw new Error('Missing CI_MERGE_REQUEST_IID environment variable (are you running in GitLab CI?)');
  }

  const gitlabUrl = process.env.CI_SERVER_URL || 'https://gitlab.com';

  const platform = new GitLabProvider(token, { gitlabUrl, projectId, mrIid: Number(mrIid) });
  const ai = new GeminiProvider(apiKey, aiModel);

  await cheerleader(platform, ai, { style, language, platform: 'gitlab' });
}

/* istanbul ignore next -- only runs as CLI entry point */
if (!process.env.VITEST) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    process.exit(1);
  });
}
