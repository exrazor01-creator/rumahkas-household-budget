// RumahKas entry program (Node 22, standard library only).
//
// The site itself is plain static files in app/ (HTML + ES modules + CSS,
// no build step, nothing loaded over the network). This program hands it in:
// it copies app/ and screenshots/ from beside this file into the output
// directory and writes output/dossier.json, the summary the judge reads
// (screenshots, first-load files and bytes, and the source), using the
// vendored make.fun library. Leave vendor/makefun-frontend.ts untouched:
// the scorer requires dossier.json to be byte for byte what its own copy
// of the library writes.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the site locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps: at most 4 screenshots, each at most 256 KiB; app/ at
// most 993 files and directories and 16 MiB in all. The dossier text is
// capped at 163,840 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
console.log(`RumahKas handed in to ${out}`);
