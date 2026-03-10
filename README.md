# 📣 AICheerleader

AI-powered cheerleader for your Pull Requests. It analyzes your code changes and PR description to find technical highlights, then leaves an encouraging comment — no bug reports, no nitpicks, just praise.

## How It Works

1. A PR is opened or updated
2. AICheerleader fetches the diff and PR description
3. Sends them to Google Gemini AI with a style-appropriate prompt
4. Posts a warm, specific compliment as a PR comment

## Quick Start

Add this workflow to your repo at `.github/workflows/cheerleader.yml`:

```yaml
name: AICheerleader
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  pull-requests: write

jobs:
  cheer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: leyna1118/Personal-AI_Cheerleader@main
        with:
          ai-api-key: ${{ secrets.GEMINI_API_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Then add your Gemini API key to **Settings → Secrets → Actions** as `GEMINI_API_KEY`.

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `ai-api-key` | Yes | — | Google Gemini API key |
| `style` | No | `enthusiastic` | Cheer style (see below) |
| `language` | No | `zh-TW` | Language for the compliment |

## Cheer Styles

| Style | Description |
|---|---|
| `enthusiastic` | Cheerleader energy — exclamation marks, emojis, hype |
| `warm` | Supportive colleague — specific technical praise, gentle tone |
| `auto` | AI picks the best tone based on the PR |

Example with custom style:

```yaml
- uses: leyna1118/Personal-AI_Cheerleader@main
  with:
    ai-api-key: ${{ secrets.GEMINI_API_KEY }}
    style: warm
    language: en
```

## Example Output

> ## 📣 AICheerleader
>
> 🔥 This PR has 3 highlights:
> 1. Extracting the API calls into a service layer makes the architecture much cleaner!
> 2. The error handling is thorough — you even covered the timeout case!
> 3. Test coverage went up by 15%, amazing discipline!

## Architecture

```
src/
├── index.ts              # Entry point, orchestrates the flow
├── ai/
│   ├── provider.ts       # AI provider interface (extensible)
│   └── gemini.ts         # Google Gemini implementation
├── platform/
│   ├── provider.ts       # Platform interface (extensible)
│   └── github.ts         # GitHub implementation
└── prompt.ts             # Style-based prompt templates
```

Designed for extensibility:
- **Add a new AI provider:** implement `AIProvider` in `src/ai/`
- **Add a new platform (e.g., GitLab):** implement `PlatformProvider` in `src/platform/`

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build & bundle
npm run all
```

## License

MIT
