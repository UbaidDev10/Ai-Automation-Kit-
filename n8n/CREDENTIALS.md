# Story 2 — Credential setup

Create these five credentials in n8n (**Credentials → Add credential**). Names must match exactly so imported workflows link automatically.

| Kit name | n8n credential type | Auth method |
|----------|---------------------|-------------|
| `Kit - LLM` | Google Gemini (PaLM) API | API key (from `.env`) |
| `Kit - Gmail` | Gmail OAuth2 | Google OAuth |
| `Kit - Google Sheets` | Google Sheets OAuth2 | Google OAuth (same app as Gmail) |
| `Kit - Google Sheets Trigger` | Google Sheets Trigger OAuth2 API | Google OAuth (same app; **required for sheet triggers**) |
| `Kit - Slack` | Slack OAuth2 API | Slack OAuth |

Copy values from `.env` when creating credentials. Never commit real secrets to git.

## 1. Google Gemini — `Kit - LLM`

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Add to `.env`:
   ```env
   GEMINI_API_KEY=your-key-here
   ```
3. Restart n8n so the container receives the env var:
   ```powershell
   docker compose up -d
   ```
4. In n8n: **Credentials → Add credential → Google Gemini(PaLM) API**.
5. Configure:
   - **Host:** `https://generativelanguage.googleapis.com` (default)
   - **API Key:** click the **Expression** toggle and enter:
     ```
     {{ $env.GEMINI_API_KEY }}
     ```
     This reads the key from `.env` via Docker — no need to paste it twice.
6. Name the credential **`Kit - LLM`** → **Save**.

If you previously created an **OpenAI** credential named `Kit - LLM`, delete it and create this Gemini credential instead.

## 2. Google — `Kit - Gmail` and `Kit - Google Sheets`

### Create OAuth app (one-time)

1. [Google Cloud Console](https://console.cloud.google.com/) → create project.
2. Enable **Gmail API**, **Google Sheets API**, and **Google Drive API** (Drive is required for the Sheets trigger).
3. **Credentials → Create OAuth client ID → Web application**.
4. Authorized redirect URI:
   ```
   http://localhost:5678/rest/oauth2-credential/callback
   ```
5. Add Client ID and secret to `.env`:
   ```env
   GOOGLE_OAUTH_CLIENT_ID=
   GOOGLE_OAUTH_CLIENT_SECRET=
   ```
6. **OAuth consent screen** → add your Google account as a **Test user** (while app is in testing).

### Gmail credential

1. **Gmail OAuth2** → name `Kit - Gmail`.
2. Paste Client ID / Secret → **Connect my account** → **Save**.

### Google Sheets credential (read/write nodes)

1. **Google Sheets OAuth2 API** → name `Kit - Google Sheets`.
2. Same Client ID / Secret → **Sign in with Google** → **Save**.

Used by **Mark Processed**, **Test Google Sheets**, and **Kit Seed Google Sheet**.

### Google Sheets Trigger credential (trigger node only)

The **Google Sheets Trigger** node cannot use `Kit - Google Sheets`. It needs a separate credential type:

1. **Google Sheets Trigger OAuth2 API** → name `Kit - Google Sheets Trigger`.
2. Same Client ID / Secret → **Sign in with Google** (same account as above) → **Save**.

Used only by **New Sheet Row** in **Kit Automation Pipeline**.

### Test spreadsheet

1. Create a sheet named **Kit Test**.
2. Set row 1 headers: `message`, `status`, `source`, `ai_summary`, `processed_at`.
3. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
   ```
4. Add to `.env`:
   ```env
   KIT_TEST_SPREADSHEET_ID=<SPREADSHEET_ID>
   ```
5. Restart n8n so it picks up the env var:
   ```powershell
   docker compose up -d
   ```
6. Seed dummy data (requires `Kit - Google Sheets` credential in n8n):
   ```powershell
   .\scripts\seed-google-sheet.ps1
   ```
   Or in n8n UI: open **Kit Seed Google Sheet** → **Test workflow**.

   Resulting **Sheet1** layout:

   | message | status | source | ai_summary | processed_at |
   |---------|--------|--------|------------|--------------|
   | System health check | active | setup | | |
   | Client requested enterprise pricing quote | pending | website | | |
   | Sales inquiry: 50-user license | pending | email-campaign | | |
   | Completed onboarding call | done | sales | Team notified... | 2026-07-01 10:00 |

   Rows with `status = pending` are picked up by **Kit Automation Pipeline**.

## 3. Slack — `Kit - Slack`

1. [Slack API](https://api.slack.com/apps) → **Create New App** → **From scratch**.
2. **OAuth & Permissions → Redirect URL:**
   ```
   http://localhost:5678/rest/oauth2-credential/callback
   ```
3. Bot token scopes (minimum): `users:read` (for the test node).
4. Copy Client ID / Secret to `.env`:
   ```env
   SLACK_CLIENT_ID=
   SLACK_CLIENT_SECRET=
   ```
5. In n8n: **Slack OAuth2 API** → name `Kit - Slack` → connect workspace → **Save**.

## 4. Run credential tests

```powershell
# Import (or re-import) workflows
.\scripts\import-workflows.ps1

# In n8n UI: open "Kit Credential Tests" → Test workflow
# All four nodes should succeed: Test LLM, Test Gmail, Test Google Sheets, Test Slack
```

Or automate with an API key:

```powershell
# Create API key in n8n: Settings → API (scopes: workflow:read, workflow:execute, execution:read, credential:read)
# Add to .env: N8N_API_KEY=n8n_api_...

.\scripts\verify-credentials.ps1
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Redirect URI mismatch | URI must be exactly `http://localhost:5678/rest/oauth2-credential/callback` |
| Google "access blocked" | Add yourself as a test user on the OAuth consent screen |
| Sheets node: missing document | Set `KIT_TEST_SPREADSHEET_ID` in `.env` and restart n8n |
| Workflow shows red credentials | Credential names must match the table above exactly |
| `googleSheetsTriggerOAuth2Api` does not exist | Create **Google Sheets Trigger OAuth2 API** as `Kit - Google Sheets Trigger`; assign on **New Sheet Row** |
| Trigger uses wrong Sheets cred | **New Sheet Row** → `Kit - Google Sheets Trigger`; **Mark Processed** → `Kit - Google Sheets` |
| Gemini "model not found" | In the Test LLM node, pick another model (e.g. `gemini-1.5-flash`) |
| Gemini invalid API key | Check `GEMINI_API_KEY` in `.env` and run `docker compose up -d` |
| Gemini "too many requests" / rate limit | Free tier has low RPM; workflow polls every 5 min and marks rows `processing` to avoid duplicate calls. Wait 1–2 min and add one row at a time. Try `gemini-1.5-flash` in the Gemini node. |
| Same row runs multiple times | Row should go `pending` → `processing` → `done`. Do not leave rows stuck on `pending`. |
| Credentials lost after restart | Do not change `N8N_ENCRYPTION_KEY` in `.env` |
