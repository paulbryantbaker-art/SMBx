#!/usr/bin/env node
// Deal math runner.
//   node harness/run.mjs <deal-dir> --model valuation|sba|lbo|earnout
//   node harness/run.mjs <deal-dir> --model compare <deal-dir-2> [deal-dir-3 ...]
// Writes <deal-dir>/models/<YYYY-MM-DD>/<model>/result.json, then calls the
// xlsx and dashboard builders (Python) on it.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { MODELS, compareModel } from "./models.mjs";
import { ENGINE_LABEL } from "./engine-adapter.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const mi = args.indexOf("--model");
if (args.length < 1 || mi === -1 || !args[mi + 1]) {
  console.error("usage: run.mjs <deal-dir> --model valuation|sba|lbo|earnout|compare [more deal dirs]");
  process.exit(2);
}
const model = args[mi + 1];
const dealDirs = [args[0], ...args.slice(mi + 2)].map((p) => resolve(p));
const loadDeal = (dir) => JSON.parse(readFileSync(join(dir, "deal.json"), "utf8"));

const date = process.env.RUN_DATE; // set by caller; no Date.now in some runtimes
const stamp = date ?? new Date().toISOString().slice(0, 10);

let result;
if (model === "compare") result = compareModel(dealDirs.map(loadDeal));
else if (MODELS[model]) {
  const deal = loadDeal(dealDirs[0]);
  result = MODELS[model](deal);
  result.inputs = deal; // raw inputs so the xlsx builder can write real formulas against them
} else { console.error(`unknown model: ${model}`); process.exit(2); }

result.run = { date: stamp, deal_dirs: dealDirs, engine: ENGINE_LABEL };

const outDir = join(dealDirs[0], "models", stamp, model);
mkdirSync(outDir, { recursive: true });
const resultPath = join(outDir, "result.json");
writeFileSync(resultPath, JSON.stringify(result, null, 2));
console.log(`result:    ${resultPath}`);
console.log(`engine:    ${ENGINE_LABEL}`);

// Builders are optional — result.json is the contract.
for (const [script, out] of [["build_xlsx.py", "model.xlsx"], ["build_dashboard.py", "dashboard.html"]]) {
  try {
    execFileSync("python3", [join(here, script), resultPath, join(outDir, out)], { stdio: "inherit" });
    console.log(`${out}: ${join(outDir, out)}`);
  } catch (e) {
    console.error(`builder ${script} failed — result.json is still valid. ${e.message}`);
  }
}
