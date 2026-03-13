import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitLabProvider } from './gitlab';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('GitLabProvider', () => {
  const context = {
    gitlabUrl: 'https://gitlab.com',
    projectId: '123',
    mrIid: 1,
  };
  const token = 'test-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get MR diff from diffs endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { new_path: 'src/index.ts', diff: '@@ -1,3 +1,5 @@\n+console.log("hello")' },
      ]),
    });

    const provider = new GitLabProvider(token, context);
    const diff = await provider.getDiff();

    expect(diff).toContain('src/index.ts');
    expect(diff).toContain('console.log');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://gitlab.com/api/v4/projects/123/merge_requests/1/diffs?per_page=100',
      expect.objectContaining({
        headers: expect.objectContaining({ 'PRIVATE-TOKEN': 'test-token' }),
      })
    );
  });

  it('should get MR description', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ description: 'This MR adds a new feature' }),
    });

    const provider = new GitLabProvider(token, context);
    const desc = await provider.getPRDescription();

    expect(desc).toBe('This MR adds a new feature');
  });

  it('should return empty string for MR with no description', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ description: null }),
    });

    const provider = new GitLabProvider(token, context);
    const desc = await provider.getPRDescription();

    expect(desc).toBe('');
  });

  it('should post comment as MR note', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    const provider = new GitLabProvider(token, context);
    await provider.postComment('Nice work!');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://gitlab.com/api/v4/projects/123/merge_requests/1/notes',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ body: 'Nice work!' }),
      })
    );
  });

  it('should throw on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: () => Promise.resolve('Forbidden'),
    });

    const provider = new GitLabProvider(token, context);
    await expect(provider.getDiff()).rejects.toThrow('GitLab API error 403');
  });

  it('should handle binary/large files with no diff', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { new_path: 'image.png', diff: null },
      ]),
    });

    const provider = new GitLabProvider(token, context);
    const diff = await provider.getDiff();

    expect(diff).toContain('image.png');
    expect(diff).toContain('(binary or too large)');
  });
});
