# Pitch Demo

## Run locally

From the project root:

```bash
npm start
```

Then open `http://localhost:3000`.

## What this demo includes

- a sales-friendly product overview
- simulated voice and chat commands
- mock PMS, defect, requisition, and PO data
- mock API-backed responses so the experience feels closer to a product
- tool-call style reasoning and approval-safe draft actions

## Deployment shape

- Node app with no external runtime dependencies
- Railway-ready via `package.json` and `railway.json`
- root route serves the demo
- `/api/bootstrap` provides dashboard state
- `/api/query` provides mock orchestration responses

## Notes

- This is still a pitch prototype, not a real backend integration.
- If the browser supports the Web Speech API, the mic button can populate the command box.
- Sample commands are built into the page for a guided demo flow.
