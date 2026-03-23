import { PlatformProvider } from './provider.js';

export interface GitLabContext {
  gitlabUrl: string;
  projectId: string;
  mrIid: number;
}

export class GitLabProvider implements PlatformProvider {
  constructor(
    private token: string,
    private context: GitLabContext
  ) {}

  private get baseUrl(): string {
    return `${this.context.gitlabUrl}/api/v4/projects/${this.context.projectId}`;
  }

  private async request(path: string, options?: RequestInit): Promise<Response> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'PRIVATE-TOKEN': this.token,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`GitLab API error ${res.status}: ${await res.text()}`);
    }
    return res;
  }

  async getDiff(): Promise<string> {
    const res = await this.request(`/merge_requests/${this.context.mrIid}/diffs?per_page=100`);
    const diffs = (await res.json()) as Array<{ new_path: string; diff: string | null }>;
    return diffs
      .map((file) => `### ${file.new_path}\n${file.diff ?? '(binary or too large)'}`)
      .join('\n\n');
  }

  async getPRDescription(): Promise<string> {
    const res = await this.request(`/merge_requests/${this.context.mrIid}`);
    const data = (await res.json()) as { description?: string };
    return data.description ?? '';
  }

  async postComment(body: string): Promise<void> {
    await this.request(`/merge_requests/${this.context.mrIid}/notes`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }
}
