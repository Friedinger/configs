// Resolves the presets in renovate/src into standalone files in renovate/,
// so a tag like v1.3.1 contains everything and no preset points to main.
// Usage: node renovate/build.mjs [--check]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, "src");
const check = process.argv.includes("--check");

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function merge(base, override) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (key === "packageRules") {
      result[key] = [...(base[key] ?? []), ...value];
    } else if (isObject(value) && isObject(base[key])) {
      result[key] = merge(base[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Local presets are referenced from the src root ("@/base/pin") or relative to the referencing file ("./pin").
function resolve(name, stack = []) {
  if (stack.includes(name)) {
    throw new Error(`Circular preset: ${[...stack, name].join(" -> ")}`);
  }
  const {
    $schema,
    extends: parents = [],
    ...own
  } = JSON.parse(readFileSync(join(srcDir, `${name}.json`), "utf8"));

  const external = [];
  let merged = {};
  for (const parent of parents) {
    if (parent.startsWith("@/") || parent.startsWith(".")) {
      const base = parent.startsWith("@/")
        ? resolvePath(srcDir, parent.slice(2))
        : resolvePath(srcDir, dirname(name), parent);
      const target = relative(srcDir, base).replace(/\.json$/, "");
      merged = merge(merged, resolve(target, [...stack, name]));
    } else if (merged !== undefined && Object.keys(merged).length > 0) {
      throw new Error(
        `${name}: external preset ${parent} must come before local presets`,
      );
    } else {
      external.push(parent);
    }
  }
  merged = merge(merged, own);
  if (external.length > 0) {
    merged = { extends: external, ...merged };
  }
  return merged;
}

const sources = readdirSync(srcDir).filter((file) => file.endsWith(".json"));
const schema = "https://docs.renovatebot.com/renovate-schema.json";
const prettierConfig = (await prettier.resolveConfig(root)) ?? {};
let outdated = false;

for (const file of sources) {
  const name = file.replace(/\.json$/, "");
  const output = await prettier.format(
    JSON.stringify({ $schema: schema, ...resolve(name) }),
    { ...prettierConfig, parser: "json" },
  );
  const target = join(root, file);
  let current = null;
  try {
    current = readFileSync(target, "utf8");
  } catch {}
  if (current === output) continue;
  if (check) {
    console.error(`renovate/${file} is outdated, run: npm run renovate:build`);
    outdated = true;
  } else {
    writeFileSync(target, output);
    console.log(`Generated renovate/${file}`);
  }
}

process.exit(outdated ? 1 : 0);
