import { GitHub } from '@actions/github/lib/utils';
import { PlatformProvider } from './provider';

export interface GitHubContext {
  owner: string;
  repo: string;
  pullNumber: number;
}

export class GitHubProvider implements PlatformProvider {
  constructor(
    private octokit: InstanceType<typeof GitHub>,
    private context: GitHubContext
  ) {}

  async getDiff(): Promise<string> {
    try {
      const { data: files } = await this.octokit.rest.pulls.listFiles({
        owner: this.context.owner,
        repo: this.context.repo,
        pull_number: this.context.pullNumber,
        per_page: 100,
      });

      return files
        .map((file) => `### ${file.filename}\n${file.patch ?? '(binary or too large)'}`)
        .join('\n\n');
    } catch (error) {
      throw new Error(`Failed to fetch PR diff: ${error instanceof Error ? error.message : error}`);
    }
  }

  async getPRDescription(): Promise<string> {
    try {
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner: this.context.owner,
        repo: this.context.repo,
        pull_number: this.context.pullNumber,
      });

      return pr.body ?? '';
    } catch (error) {
      throw new Error(`Failed to fetch PR description: ${error instanceof Error ? error.message : error}`);
    }
  }

  async postComment(body: string): Promise<void> {
    try {
      await this.octokit.rest.issues.createComment({
        owner: this.context.owner,
        repo: this.context.repo,
        issue_number: this.context.pullNumber,
        body,
      });
    } catch (error) {
      throw new Error(`Failed to post comment: ${error instanceof Error ? error.message : error}`);
    }
  }
}
