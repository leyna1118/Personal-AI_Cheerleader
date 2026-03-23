import * as core from '@actions/core';
import * as github from '@actions/github';
import { GeminiProvider } from './ai/gemini.js';
import { GitHubProvider } from './platform/github.js';
import { cheerleader } from './core.js';
import { CheerStyle } from './prompt.js';

export async function run(): Promise<void> {
  try {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
      core.setFailed('This action only works on pull request events — not a pull request.');
      return;
    }

    const apiKey = core.getInput('ai-api-key', { required: true });
    const validStyles = ['enthusiastic', 'warm', 'auto'];
    const styleInput = core.getInput('style') || 'enthusiastic';
    if (!validStyles.includes(styleInput)) {
      core.setFailed(`Invalid style "${styleInput}". Must be one of: ${validStyles.join(', ')}`);
      return;
    }
    const style = styleInput as CheerStyle;
    const language = core.getInput('language') || 'zh-TW';

    const token = process.env.GITHUB_TOKEN || core.getInput('github-token');
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;
    const pullNumber = pullRequest.number;

    const platform = new GitHubProvider(octokit, { owner, repo, pullNumber });
    const ai = new GeminiProvider(apiKey);

    await cheerleader(platform, ai, { style, language }, core.info);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

/* istanbul ignore next -- only runs as GitHub Action entry point */
if (!process.env.VITEST) {
  run();
}
