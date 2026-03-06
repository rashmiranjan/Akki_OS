#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, "releases", "manifest.json");

function collectFiles(root) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(abs);
      if (entry.isFile()) out.push(abs);
    }
  }
  out.sort();
  return out;
}

function hashTree(root) {
  const digest = crypto.createHash("sha256");
  for (const file of collectFiles(root)) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    digest.update(rel);
    digest.update("\0");
    digest.update(fs.readFileSync(file));
    digest.update("\0");
  }
  return digest.digest("hex");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
for (const [name, component] of Object.entries(manifest.components || {})) {
  const relPath = component.path;
  const abs = path.join(repoRoot, relPath);
  manifest.components[name].checksum = hashTree(abs);
}
manifest.generated_at = new Date().toISOString();
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Updated ${manifestPath}`);
