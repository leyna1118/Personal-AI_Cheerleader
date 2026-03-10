export interface PlatformProvider {
  getDiff(): Promise<string>;
  getPRDescription(): Promise<string>;
  postComment(body: string): Promise<void>;
}
