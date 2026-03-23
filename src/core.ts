import { PlatformProvider } from './platform/provider.js';
import { AIProvider } from './ai/provider.js';
import { buildPrompt, CheerStyle } from './prompt.js';

export interface CheerConfig {
  style: CheerStyle;
  language: string;
}

export async function cheerleader(
  platform: PlatformProvider,
  ai: AIProvider,
  config: CheerConfig,
  log: (msg: string) => void = console.log
): Promise<void> {
  log('Fetching PR diff and description...');
  const diff = await platform.getDiff();

  if (!diff) {
    log('No diff found, skipping.');
    return;
  }

  const description = await platform.getPRDescription();

  log(`Building prompt with style: ${config.style}, language: ${config.language}`);
  const prompt = buildPrompt({ diff, description, style: config.style, language: config.language });

  log('Generating cheer with AI...');
  const cheer = await ai.generateCheer(prompt);

  const comment = `## 📣 AICheerleader\n\n${cheer}`;

  log('Posting comment...');
  await platform.postComment(comment);

  log('Cheer posted successfully!');
}
