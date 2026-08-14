// Engine adapter — the ONLY place the harness touches calculation code.
// If engine/index.mjs exists (vendored from the SMBx repo), it is used and
// result.json records the engine commit from ENGINE_PROVENANCE.
// Until then, the V17 reference implementation runs, and every output is
// stamped engine:"v17-reference" so nobody mistakes it for the ported engine.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const enginePath = join(here, "..", "engine", "index.mjs");

let impl, engineLabel;
if (existsSync(enginePath)) {
  impl = await import(enginePath);
  engineLabel = impl.ENGINE_VERSION ?? "smbx-engine (see ENGINE_PROVENANCE.md)";
} else {
  impl = await import("../fixtures/v17-reference.mjs");
  engineLabel = "v17-reference (engine not yet vendored — see ENGINE_PROVENANCE.md)";
}

export const engine = impl;
export const ENGINE_LABEL = engineLabel;
