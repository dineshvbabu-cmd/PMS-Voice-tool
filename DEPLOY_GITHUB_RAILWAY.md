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

This project is already pushed to:

```text
https://github.com/dineshvbabu-cmd/PMS-Voice-tool
```

## Railway deployment path

### Current Railway target

This repo is wired to:

- project ID: `3d7873bd-e749-4e63-a8eb-75f85f077f52`
- service ID: `3f5aa530-8ebe-45fa-add0-c1aed44091f2`
- environment ID: `8d2c8323-a718-469d-8e3c-8c965ece6c8c`

### Option A: GitHub Actions automatic deploy

Prerequisite:

- add GitHub repository secret `RAILWAY_TOKEN`

Once that secret exists, every push to `main` will deploy automatically using `.github/workflows/deploy-railway.yml`.

### Option B: Deploy directly with Railway CLI

Prerequisite:

```bash
railway login
```

Then from this folder:

```bash
railway link --project 3d7873bd-e749-4e63-a8eb-75f85f077f52 --environment 8d2c8323-a718-469d-8e3c-8c965ece6c8c --service 3f5aa530-8ebe-45fa-add0-c1aed44091f2
railway up
```

### Option C: Deploy through GitHub on Railway

If Railway native GitHub deploy is preferred:

1. Log into Railway
2. Open the existing `PMS-Voice-tool` service
3. Connect the GitHub repo `dineshvbabu-cmd/PMS-Voice-tool`
4. Confirm start command `npm start`
5. Confirm health check path `/api/health`
6. Enable auto-deploy from `main`

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
