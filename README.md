# 📣 AICheerleader

AI-powered cheerleader for your Pull Requests and Merge Requests. It analyzes your code changes and description to find technical highlights, then leaves an encouraging comment — no bug reports, no nitpicks, just praise.

Supports **GitHub Actions** and **GitLab CI/CD**.

## How It Works

1. A PR or MR is opened or updated
2. AICheerleader fetches the diff and description
3. Sends them to Google Gemini AI with a style-appropriate prompt
4. Posts a warm, specific compliment as a comment

## Quick Start

### GitHub Actions

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

### GitLab CI/CD

> **Before you start:** Go to your GitLab project's **Settings → General → Visibility, project features and permissions**, and make sure the **CI/CD** toggle is turned on. Otherwise the pipeline won't run.

Add this to your `.gitlab-ci.yml`:

```yaml
cheerleader:
  image: node:20
  script:
    - git clone https://github.com/leyna1118/Personal-AI_Cheerleader.git /tmp/cheerleader
    - cd /tmp/cheerleader && npm install && npm run build
    - node /tmp/cheerleader/lib/cli.js
  variables:
    CHEERLEADER_AI_API_KEY: $AI_API_KEY
    GITLAB_TOKEN: $CHEERLEADER_GITLAB_TOKEN
  rules:
    - if: $CI_MERGE_REQUEST_IID
```

Then add two CI/CD variables in **Settings → CI/CD → Variables**:
- `AI_API_KEY` — your Google Gemini API key
- `CHEERLEADER_GITLAB_TOKEN` — a Project Access Token or Personal Access Token with `api` scope
  - **Project Access Token（推薦）：** 到專案的 **Settings → Access Tokens**，點選 **Add new token**，輸入名稱、選擇 `api` scope，點選 **Create project access token**，複製產生的 token。
  - **Personal Access Token：** 到 GitLab 右上角頭像 → **Edit profile → Access Tokens**，點選 **Add new token**，輸入名稱、選擇 `api` scope，點選 **Create personal access token**，複製產生的 token。
  - 取得 token 後，到專案的 **Settings → CI/CD → Variables**，新增變數名稱為 `CHEERLEADER_GITLAB_TOKEN`，值貼上剛才複製的 token。

## GitHub Action Inputs

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

Example with custom style (GitHub):

```yaml
- uses: leyna1118/Personal-AI_Cheerleader@main
  with:
    ai-api-key: ${{ secrets.GEMINI_API_KEY }}
    style: warm
    language: en
```

## GitLab CI Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `CHEERLEADER_AI_API_KEY` | Yes | — | Google Gemini API key |
| `GITLAB_TOKEN` | Yes | — | Project/Personal Access Token with `api` scope |
| `CHEERLEADER_STYLE` | No | `enthusiastic` | Cheer style (see above) |
| `CHEERLEADER_LANGUAGE` | No | `zh-TW` | Language for the compliment |

`CI_PROJECT_ID`, `CI_MERGE_REQUEST_IID`, and `CI_SERVER_URL` are auto-injected by GitLab CI.

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
├── core.ts               # Shared orchestration logic
├── index.ts              # GitHub Action entry point
├── cli.ts                # CLI entry point (GitLab CI)
├── ai/
│   ├── provider.ts       # AI provider interface
│   └── gemini.ts         # Google Gemini implementation
├── platform/
│   ├── provider.ts       # Platform interface
│   ├── github.ts         # GitHub implementation
│   └── gitlab.ts         # GitLab implementation
└── prompt.ts             # Style-based prompt templates
```

Designed for extensibility:
- **Add a new AI provider:** implement `AIProvider` in `src/ai/`
- **Add a new platform:** implement `PlatformProvider` in `src/platform/`

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
