export interface AIProvider {
  generateCheer(prompt: string): Promise<string>;
}
