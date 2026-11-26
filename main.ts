// RumahKas entry program (Node 22, standard library only).
//
// The site is plain static files in app/ — HTML, ES modules and CSS, no
// build step and nothing loaded over the network. This program hands the
// site in: it copies app/ and screenshots/ next to this file into the
// output directory and writes output/dossier.json, the summary the judge
// reads (screenshots, first-load files and bytes, and the source). It uses
// the vendored make.fun library to build the dossier — leave
// vendor/makefun-frontend.ts untouched, because the scorer requires
// dossier.json to be byte for byte what its own copy of the library
// writes.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the site locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps: at most 4 screenshots, each at most 256 KiB; app/ at
// most 993 files and directories and 16 MiB in all. The dossier text is
// capped at 163,840 bytes.
const DOSSIER_OPTS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function handIn() {
  mkdirSync(outDir, { recursive: true });
  cpSync(join(root, 'app'), join(outDir, 'app'), { recursive: true });
  const shots = join(root, 'screenshots');
  if (existsSync(shots)) {
    cpSync(shots, join(outDir, 'screenshots'), { recursive: true });
  }
  const dossier = buildDossier(outDir, DOSSIER_OPTS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log(`RumahKas handed in to ${outDir}`);
}

handIn();
