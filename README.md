# AI Automation Kit

Base repo for internal automations: n8n workflows + Next.js dashboard.

## Story 1 — Running n8n instance

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Quick start

```powershell
# 1. Create .env with generated secrets
.\scripts\setup.ps1

# 2. Start n8n + PostgreSQL
docker compose up -d

# 3. Import kit workflows from git
.\scripts\import-workflows.ps1
```

Open **http://localhost:5678**, create your owner account on first visit, then confirm **Kit Starter Template** appears in the workflow list.

### What runs

| Service   | URL / port        | Purpose                                      |
|-----------|-------------------|----------------------------------------------|
| n8n       | http://localhost:5678 | Build and run workflows                  |
| PostgreSQL| internal only     | Persistent storage for workflows & executions |

Data survives restarts via Docker volumes `postgres_data` and `n8n_data`.

### Workflows as code

| Action  | Command |
|---------|---------|
| Import from `n8n/workflows/` | `.\scripts\import-workflows.ps1` |
| Export all workflows to `n8n/workflows/` | `.\scripts\export-workflows.ps1` |
| Seed test Google Sheet | `.\scripts\seed-google-sheet.ps1` |

You can also export a single workflow from the n8n UI: workflow menu → **Download**.

Commit exported JSON under `n8n/workflows/` so every fork starts from the same base.

### Verify acceptance criteria

1. **Reachable** — http://localhost:5678 loads after `docker compose up -d`
2. **Persistent** — create or edit a workflow, run `docker compose restart`, workflow is still there
3. **Saved & exported** — run `.\scripts\export-workflows.ps1` and confirm JSON files update in `n8n/workflows/`

### Useful commands

```powershell
docker compose ps          # service status
docker compose logs -f n8n  # n8n logs
docker compose down        # stop (data kept in volumes)
docker compose down -v     # stop and delete all data
```

### Environment variables

Copy `.env.example` to `.env` (or use `setup.ps1`). Important:

- `N8N_ENCRYPTION_KEY` — set **once** before first boot; changing it breaks stored credentials
- `POSTGRES_PASSWORD` — database password for the local Postgres container

### Project layout

```
├── docker-compose.yml
├── .env.example
├── n8n/
│   ├── CREDENTIALS.md        # Story 2 setup guide
│   └── workflows/            # version-controlled workflow JSON
├── dashboard/                # Story 3 — Next.js dashboard
└── scripts/
    ├── setup.ps1             # create .env + generate secrets
    ├── setup-dashboard.ps1   # copy API key to dashboard/.env.local
    ├── import-workflows.ps1  # import JSON into n8n
    ├── export-workflows.ps1  # export from n8n to git
    └── verify-credentials.ps1 # run Kit Credential Tests via API
```

## Story 2 — Pre-configured credentials

Standard credentials so workflows connect fast. See **[n8n/CREDENTIALS.md](n8n/CREDENTIALS.md)** for the full setup guide.

### Credential names (required)

| Name | Type |
|------|------|
| `Kit - LLM` | Google Gemini (PaLM) API |
| `Kit - Gmail` | Gmail OAuth2 |
| `Kit - Google Sheets` | Google Sheets OAuth2 API |
| `Kit - Google Sheets Trigger` | Google Sheets Trigger OAuth2 API |
| `Kit - Slack` | Slack OAuth2 API |

### Quick setup

```powershell
# 1. Add API keys / OAuth client secrets to .env (see .env.example)
# 2. Create the five credentials in n8n UI (http://localhost:5678 → Credentials)
# 3. Set KIT_TEST_SPREADSHEET_ID in .env, then restart:
docker compose up -d

# 4. Import the test workflow
.\scripts\import-workflows.ps1

# 5. Run tests in UI: open "Kit Credential Tests" → Test workflow
#    Or automate:
.\scripts\verify-credentials.ps1
```

### Verify acceptance criteria

1. **Credentials set** — all five kit credentials exist in n8n with the exact names above
2. **Test nodes pass** — `Kit Credential Tests` workflow runs green on all four branches:
   - Test LLM (Google Gemini message)
   - Test Gmail (list labels)
   - Test Google Sheets (read Sheet1!A1)
   - Test Slack (user info)

### New `.env` variables

```env
GEMINI_API_KEY=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
KIT_TEST_SPREADSHEET_ID=
N8N_API_KEY=
```

## Kit Automation Pipeline

Main production workflow: **new Google Sheet row** → **Gemini summary** → **Slack** → **Gmail** → **update sheet with AI output**.

```
New Sheet Row → Processable Rows Only → Gemini Summary → Format Notifications
  → Post to Slack → Send Gmail → Update Sheet Record
```

Only rows with `status = pending` (or stuck `processing` with empty `ai_summary`) continue. Rows with `done` or `active` are skipped automatically.

### Sheet format

Row 1 headers (required):

| message | status | source | ai_summary | processed_at |
|---------|--------|--------|------------|--------------|
| Client needs demo | pending | website | | |

Only rows with `status = pending` are processed. After success:
- `status` → `done`
- `ai_summary` → Gemini text
- `processed_at` → timestamp

### Setup

1. Ensure `.env` has your sheet ID and notification targets:
   ```env
   KIT_TEST_SPREADSHEET_ID=your-sheet-id
   KIT_SLACK_CHANNEL=#your-channel
   KIT_NOTIFY_EMAIL=your-email@gmail.com
   ```
2. `docker compose up -d`
3. `.\scripts\import-workflows.ps1`
4. In n8n, open **Kit Automation Pipeline**
5. On **New Sheet Row** and **Update Sheet Record**: re-select **Document** and **Sheet** from the dropdown (fixes "bad request" errors)
6. Link credentials on all nodes:
   - **New Sheet Row** → `Kit - Google Sheets Trigger`
   - **Update Sheet Record** → `Kit - Google Sheets`
   - **Gemini Summary** → `Kit - LLM`
   - **Post to Slack** → `Kit - Slack`
   - **Send Gmail** → `Kit - Gmail`
7. Delete old **Kit Main Workflow** copies from n8n if present
8. **Activate** the workflow

### Seed demo data

**Option A — CSV import (recommended first time)**

1. Open your Google Sheet.
2. Clear Sheet1 and import `n8n/data/kit-test-sheet-seed.csv` (File → Import).

**Option B — n8n seed workflow**

```powershell
.\scripts\import-workflows.ps1
```

In n8n: open **Kit Seed Google Sheet** → **Test workflow** (appends demo rows; ensure row 1 headers exist first).

### Test

Add a new row to Sheet1 (or use a `pending` row from the seed data):

```
Automation demo: customer asked for callback | pending | manual
```

Wait ~1 minute → check **Executions**. Expect Slack message, email, and sheet updated with `ai_summary`, `processed_at`, and `status` → `done`.

### Troubleshooting

| Issue | Fix |
|-------|-----|
| Bad request / invalid sheet | Re-pick spreadsheet **From list** on trigger + Mark Processed nodes |
| Nothing runs | Workflow must be **Active**; row needs `status=pending` |
| Credential errors / `googleSheetsTriggerOAuth2Api` | Create `Kit - Google Sheets Trigger`; assign on **New Sheet Row** only |
| Credential errors (other nodes) | Re-select credentials on each node after import |
| Slack fails | Invite app to channel; check `KIT_SLACK_CHANNEL` |
| Email fails | Check `KIT_NOTIFY_EMAIL`; reconnect Gmail |
| Gemini rate limit (free tier) | Wait a few minutes; add one `pending` row at a time; workflow now polls every 5 min and uses `gemini-1.5-flash` |

## Story 3 — Dashboard template

Next.js dashboard that reads live workflow execution status from n8n. Connect-account and on/off controls are **stubbed** for the kit template.

### Quick start

```powershell
# 1. Ensure n8n is running and N8N_API_KEY is in root .env
docker compose up -d

# 2. Create dashboard env from root .env
.\scripts\setup-dashboard.ps1

# 3. Install and run dashboard
cd dashboard
npm install
npm run dev
```

Open **http://localhost:3000**

### Pages

| Page | Purpose |
|------|---------|
| **Overview** | Workflow status, last run, **Run workflow** button, recent activity |
| **Runs** | Full execution history with status and duration |
| **Run detail** | Per-node execution log from n8n |
| **Workflows** | All n8n workflows with status, Run, and Open in n8n |
| **Credentials** | Kit integration checklist with stubbed Connect buttons |

### API scopes

Create an n8n API key with:

- `workflow:read`
- `workflow:execute`
- `execution:read`

### Verify acceptance criteria

1. **Next.js skeleton** — dashboard runs at `:3000` with Overview, Workflows, Runs, Credentials
2. **Reads run status / logs** — after a sheet row triggers the pipeline, new runs appear on **Runs** with node-level detail
3. **Connect + on/off stubbed** — buttons and toggle show toasts; they do not change n8n credentials or workflow active state

### Project layout (Story 3)

```
dashboard/
├── .env.example
├── src/
│   ├── app/              # pages + /api routes
│   ├── components/       # UI shell, tables, stub controls
│   └── lib/              # n8n client, formatting, kit config
└── package.json
```
