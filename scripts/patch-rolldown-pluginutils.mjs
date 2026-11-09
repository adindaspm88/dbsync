import { readFile, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const rolldownPackage = require.resolve("rolldown/package.json");
const pluginUtilsEntry = join(dirname(rolldownPackage), "node_modules", "@rolldown", "pluginutils", "dist", "index.js");
const pluginUtilsDir = dirname(pluginUtilsEntry);
const rootPluginUtils = join(dirname(dirname(fileURLToPath(import.meta.url))), "node_modules", "@rolldown", "pluginutils", "dist");

try {
  const contents = await readFile(pluginUtilsEntry, "utf8");
  if (!contents.includes('"./filter/index.js"') && !contents.includes("./filter/index.js")) {
    await writeFile(pluginUtilsEntry, 'export * from "./filter/index.js";\n', "utf8");
    console.log("Applied Rolldown pluginutils entry-point compatibility fix.");
  }
} catch (error) {
  if (error.code === "ENOENT") {
    console.warn("Rolldown's nested pluginutils package was not found; no compatibility fix was needed.");
  } else {
    throw error;
  }
}

// The same published rc.17 package can also contain empty utility files.
// Reuse the compatible utility implementation already installed for the React plugin.
const nestedUtils = join(pluginUtilsDir, "utils.js");
if ((await stat(nestedUtils)).size === 0) {
  const utilitySource = await readFile(join(rootPluginUtils, "utils.js"), "utf8");
  await writeFile(nestedUtils, utilitySource, "utf8");
  console.log("Restored the empty Rolldown pluginutils utility module.");
}
