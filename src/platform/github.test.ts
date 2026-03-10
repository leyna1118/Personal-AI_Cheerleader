import { describe, it, expect, vi } from 'vitest';
import { GitHubProvider } from './github';

const mockListFiles = vi.fn().mockResolvedValue({
  data: [{ filename: 'src/index.ts', patch: '@@ -1,3 +1,5 @@\n+console.log("hello")' }],
});
const mockGet = vi.fn().mockResolvedValue({
  data: { body: 'This PR adds a new feature' },
});
const mockCreateComment = vi.fn().mockResolvedValue({});

const mockOctokit = {
  rest: {
    pulls: {
      listFiles: mockListFiles,
      get: mockGet,
    },
    issues: {
      createComment: mockCreateComment,
    },
  },
};

describe('GitHubProvider', () => {
  const context = { owner: 'test-owner', repo: 'test-repo', pullNumber: 1 };

  it('should get PR diff from file patches', async () => {
    const provider = new GitHubProvider(mockOctokit as any, context);
    const diff = await provider.getDiff();
    expect(diff).toContain('src/index.ts');
    expect(diff).toContain('console.log');
    expect(mockListFiles).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      pull_number: 1,
    });
  });

  it('should get PR description', async () => {
    const provider = new GitHubProvider(mockOctokit as any, context);
    const desc = await provider.getPRDescription();
    expect(desc).toBe('This PR adds a new feature');
  });

  it('should post comment', async () => {
    const provider = new GitHubProvider(mockOctokit as any, context);
    await provider.postComment('Nice work!');
    expect(mockCreateComment).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 1,
      body: 'Nice work!',
    });
  });

  it('should return empty string for PR with no description', async () => {
    mockGet.mockResolvedValueOnce({ data: { body: null } });
    const provider = new GitHubProvider(mockOctokit as any, context);
    const desc = await provider.getPRDescription();
    expect(desc).toBe('');
  });
});
