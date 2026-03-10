import * as core from '@actions/core';
import * as github from '@actions/github';
import { GeminiProvider } from './ai/gemini';
import { GitHubProvider } from './platform/github';
import { buildPrompt, CheerStyle } from './prompt';

export async function run(): Promise<void> {
  try {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
      core.setFailed('This action only works on pull request events — not a pull request.');
      return;
    }

    const apiKey = core.getInput('ai-api-key', { required: true });
    const style = (core.getInput('style') || 'enthusiastic') as CheerStyle;
    const language = core.getInput('language') || 'zh-TW';

    const token = process.env.GITHUB_TOKEN || core.getInput('github-token');
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;
    const pullNumber = pullRequest.number;

    const platform = new GitHubProvider(octokit, { owner, repo, pullNumber });
    const ai = new GeminiProvider(apiKey);

    core.info('Fetching PR diff and description...');
    const diff = await platform.getDiff();

    if (!diff) {
      core.info('No diff found, skipping.');
      return;
    }

    const description = await platform.getPRDescription();

    core.info(`Building prompt with style: ${style}, language: ${language}`);
    const prompt = buildPrompt({ diff, description, style, language });

    core.info('Generating cheer with AI...');
    const cheer = await ai.generateCheer(prompt);

    const comment = `## 📣 AICheerleader\n\n${cheer}`;

    core.info('Posting comment...');
    await platform.postComment(comment);

    core.info('Cheer posted successfully!');
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
