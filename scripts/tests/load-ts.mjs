// Loads a dependency-free TypeScript module for node:test by transpiling it in memory.
import { readFile } from "node:fs/promises";
import ts from "typescript";

export async function loadTs(path) {
  const source = await readFile(path, "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
}
