import { cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(currentDir, "../dist");

mkdirSync(distDir, { recursive: true });
cpSync(resolve(currentDir, "index.js"), resolve(distDir, "index.js"));

