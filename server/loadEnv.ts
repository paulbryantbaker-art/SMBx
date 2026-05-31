/**
 * Environment loader — imported first (side-effect) by server/index.ts so the
 * env is populated before any route/service module body evaluates.
 *
 * Why not plain `import 'dotenv/config'`? dotenv only fills variables that are
 * *missing* from the environment. A variable that is present-but-empty — e.g. a
 * shell profile that exports `ANTHROPIC_API_KEY=""` — is treated as "set", so
 * dotenv leaves it empty and the real value in `.env` is shadowed on every boot.
 * That silently breaks AI chat in local dev (the symptom: "ANTHROPIC_API_KEY is
 * not set" even though `.env` has it).
 *
 * Fix: after dotenv loads, backfill any var that is missing OR empty in the
 * environment from the parsed `.env`. A real, non-empty ambient override still
 * wins (intentional `KEY=foo npm run dev:api` is preserved). In production no
 * `.env` exists (it's gitignored / not in the image), so `parsed` is empty and
 * this is a no-op — platform env vars are untouched.
 */
import dotenv from 'dotenv';

const parsed = dotenv.config().parsed ?? {};

for (const [key, value] of Object.entries(parsed)) {
  if (value && !process.env[key]?.trim()) {
    process.env[key] = value;
  }
}
