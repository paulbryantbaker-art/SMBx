# Dev Yulia Runbook

Use this when you want local preview to exercise the real Yulia loop: database, auth, chat, tools, deliverables, and model/canvas state.

## 1. Create a real `.env`

Copy `.env.example` to `.env` and fill at least:

```bash
DATABASE_URL=postgres://smbx:smbx@localhost:5432/smbx
DATABASE_SSL=false
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=dev-secret-change-me
APP_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
TEST_MODE=true
DEV_NO_PAYWALL=true
VITE_DEV_AUTH_BYPASS=false
UPLOAD_PATH=./uploads
DEV_ADMIN_EMAIL=pbaker@smbx.ai
DEV_ADMIN_PASSWORD=test123
```

Using a Railway/Neon/Supabase dev database is also fine. Leave `DATABASE_SSL` unset for those, or set it to `true`.

## 2. Start the API once

```bash
npm run dev:api
```

The API auto-runs SQL migrations on startup. Keep this process running.

## 3. Seed the dev superadmin

In another terminal:

```bash
npm run dev:seed
```

Login:

```text
pbaker@smbx.ai / test123
```

That account is seeded as `role=superadmin`, `plan=enterprise`, `is_advisor=true`, and owns sample sell, buy, raise, and PMI deals so you can test the full authenticated Yulia loop from one login.

Optional persona accounts for cross-user testing:

```bash
npm run dev:seed:personas
```

## 4. Start the web app

```bash
npm run dev:web
```

Open http://localhost:5173 and sign in as `pbaker@smbx.ai`.

## 5. Check the stack

```bash
npm run dev:health
```

Optional live Anthropic check:

```bash
DEV_HEALTH_TEST_AI=true npm run dev:health
```

## Why not use dev auth bypass?

`VITE_DEV_AUTH_BYPASS=true` is useful for visual preview, but V6 intentionally routes that mode through the anonymous chat path. For real Yulia testing, set `VITE_DEV_AUTH_BYPASS=false` and log in with an actual dev user so these paths run:

- JWT auth
- `/api/chat/conversations/*`
- deal creation and gate advancement
- Yulia tool execution
- staged actions
- deliverable queueing
- data room, docs, analysis, and portfolio APIs
