// A working black-friday-deal-finder-01 entry (Node 22, standard library only): the site is this directory's app/
// folder, plain static files a browser opens at app/index.html (ES modules, CSS, no build step), its deals held in its
// own files: nothing it runs, styles or shows loads over the network, and each deal links out to its store. The program
// hands it in: it copies app/ and screenshots/ from beside this file to /output and writes /output/dossier.json, the
// summary the judge reads (your screenshots, the first load's files and bytes, and your source), with the vendored
// make.fun library. Leave vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte
// what its own copy writes.
//
// The site is DealDrop: 51 real Black Friday deals, found and price-checked by the agent in this session on 27 Nov
// 2026, each with its store link, sale price, usual price, discount, check time, source and an honest verdict on
// whether it is really a deal. Search and filters by category, store and discount work from the hash, so a filtered
// view has its own address; a phone layout is included.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The entry is only worth building when its parts are all present: the
// site's front page and at least three screenshots of it running. Fail
// loudly instead of handing in a half-built output directory.
function requireFile(path: string): void {
  if (!existsSync(path) || !statSync(path).isFile()) throw new Error(`missing entry file: ${path}`);
}

requireFile(join(here, "app", "index.html"));
const shots = readdirSync(join(here, "screenshots")).filter((f) => !f.startsWith("."));
if (shots.length < 3) throw new Error(`need at least 3 screenshots, found ${shots.length}`);

mkdirSync(out, { recursive: true });
// A repeat run must not leave stale files behind, but the output directory
// itself belongs to the grader: remove only its children, never the directory.
// One rmSync per child (recursive, force) covers files and directories alike
// without listing anything first.
for (const child of readdirSync(out)) {
  rmSync(join(out, child), { recursive: true, force: true });
}
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(out, "dossier.json"), dossier);
console.log(`DealDrop: ${shots.length} screenshots, dossier ${dossier.length} bytes -> ${out}`);
