import { readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd(), "src");

const collectFiles = (directory) => {
  const entries = readdirSync(directory);

  return entries.flatMap((entry) => {
    const fullPath = resolve(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return collectFiles(fullPath);
    }

    return fullPath.endsWith(".js") ? [fullPath] : [];
  });
};

for (const filePath of collectFiles(root)) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

