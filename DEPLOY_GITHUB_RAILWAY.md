# Deploy HarborOps Fleet Copilot Demo

## What is ready

This demo is already prepared as a small Node app:

- entrypoint: `server.js`
- frontend: `pitch_demo/`
- package script: `npm start`
- Railway config: `railway.json`
- health check: `/api/health`

## Run locally

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## GitHub publishing path

This folder is not yet a git repository. If you want to publish it to your GitHub:

### 1. Initialize git locally

```bash
git init
git add .
git commit -m "harborops fleet copilot pitch demo"
```

### 2. Create or connect a GitHub repo

If GitHub CLI is installed and authenticated:

```bash
gh repo create harborops-fleet-copilot-demo --private --source . --remote origin --push
```

If you prefer GitHub Desktop or the website:

- create an empty repository
- copy the remote URL
- run:

```bash
git remote add origin <YOUR_REPO_URL>
git branch -M main
git push -u origin main
```

## Railway deployment path

### Option A: Deploy directly with Railway CLI

Prerequisite:

```bash
railway login
```

Then from this folder:

```bash
railway init
railway up
```

If prompted:

- choose a new project
- deploy from the current directory

### Option B: Deploy through GitHub on Railway

After pushing to GitHub:

1. Log into Railway
2. Choose `New Project`
3. Choose `Deploy from GitHub repo`
4. Select the repo
5. Railway should detect the Node app automatically
6. Set start command to `npm start` if needed
7. Confirm the health check path `/api/health`

## Suggested production polish before customer demos

- add customer logo/theme switching
- add a small authentication wall for demo access
- add screenshots or a short video for offline pitching
- add live connector stubs for one real PMS sandbox
- add telemetry on most-used sample prompts

## Recommended next implementation step

Turn `/api/query` into a real orchestration service with:

- OpenAI transcription
- OpenAI tool-calling
- canonical connector interfaces
- one real PMS connector
- one real procurement connector
