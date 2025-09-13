#!/usr/bin/env node
// Thin CLI wrapper to ensure proper shebang execution when installed via npx
// ESM import triggers the server startup defined in dist/index.js
import("../dist/index.js");

