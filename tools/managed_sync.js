#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

function parseArgs(argv) {
  const out = {
    action: "sync",
    mode: "install",
    dryRun: false,
    repoRoot: process.cwd(),
    fromVersion: "",
    backupDir: "",
    openclawConfig: defaultOpenclawConfigPath(),
    manifestPath: "",
    stateFile: defaultStateFilePath(),
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      out.dryRun = true;
    } else if (arg === "--action") {
      out.action = argv[++i] || out.action;
    } else if (arg === "--mode") {
      out.mode = argv[++i] || out.mode;
    } else if (arg === "--repo-root") {
      out.repoRoot = argv[++i] || out.repoRoot;
    } else if (arg === "--from-version") {
      out.fromVersion = argv[++i] || "";
    } else if (arg === "--backup-dir") {
      out.backupDir = argv[++i] || "";
    } else if (arg === "--openclaw-config") {
      out.openclawConfig = argv[++i] || out.openclawConfig;
    } else if (arg === "--manifest") {
      out.manifestPath = argv[++i] || "";
    } else if (arg === "--state-file") {
      out.stateFile = argv[++i] || out.stateFile;
    }
  }
  out.repoRoot = path.resolve(out.repoRoot);
  if (!out.manifestPath) {
    out.manifestPath = path.join(out.repoRoot, "releases", "manifest.json");
  }
  return out;
}

function resolveWritableStateFile(opts) {
  const primaryDir = path.dirname(opts.stateFile);
  try {
    ensureDir(primaryDir);
    return opts.stateFile;
  } catch (_) {
    const fallback = path.join(opts.repoRoot, ".akki", "state", "install-state.json");
    ensureDir(path.dirname(fallback));
    return fallback;
  }
}

function defaultOpenclawConfigPath() {
  if (process.platform === "win32") {
    const profile = process.env.USERPROFILE || os.homedir();
    return path.join(profile, ".openclaw", "openclaw.json");
  }
  return path.join(os.homedir(), ".openclaw", "openclaw.json");
}

function defaultStateFilePath() {
  if (process.platform === "win32") {
    const profile = process.env.USERPROFILE || os.homedir();
    return path.join(profile, ".akki", "state", "install-state.json");
  }
  return path.join(os.homedir(), ".akki", "state", "install-state.json");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonSafe(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return fallback;
  }
}

function listSubdirs(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort();
}

function hashFile(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function collectFiles(root) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
      } else if (entry.isFile()) {
        out.push(abs);
      }
    }
  }
  out.sort();
  return out;
}

function hashTree(root) {
  const files = collectFiles(root);
  const digest = crypto.createHash("sha256");
  for (const file of files) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    digest.update(rel);
    digest.update("\0");
    digest.update(hashFile(file));
    digest.update("\0");
  }
  return digest.digest("hex");
}

function copyDir(src, dst) {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (entry.isFile()) {
      ensureDir(path.dirname(to));
      fs.copyFileSync(from, to);
    }
  }
}

function loadManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return {
      version: "0.0.0",
      min_openclaw_version: "0.0.0",
      components: {},
      migrations: [],
    };
  }
  return readJsonSafe(manifestPath, {
    version: "0.0.0",
    min_openclaw_version: "0.0.0",
    components: {},
    migrations: [],
  });
}

function nowIso() {
  return new Date().toISOString();
}

function backupPathFor(opts) {
  if (opts.backupDir) return opts.backupDir;
  const stateDir = path.dirname(opts.stateFile);
  return path.join(stateDir, "backups", nowIso().replace(/[:.]/g, "-"));
}

function runCheck(opts) {
  const manifest = loadManifest(opts.manifestPath);
  const state = readJsonSafe(opts.stateFile, {});
  const agentsRoot = path.join(opts.repoRoot, "agents");
  const skillsSrcRoot = path.join(opts.repoRoot, "skills");
  const skillsDstRoot = path.join(opts.repoRoot, "workspace", "skills");

  const managedAgents = listSubdirs(agentsRoot);
  const managedSkills = listSubdirs(skillsSrcRoot);

  const collisions = [];
  for (const skill of managedSkills) {
    const src = path.join(skillsSrcRoot, skill);
    const dst = path.join(skillsDstRoot, skill);
    if (fs.existsSync(dst)) {
      const srcHash = hashTree(src);
      const dstHash = hashTree(dst);
      if (srcHash !== dstHash) {
        collisions.push({
          kind: "skill_local_modification",
          name: skill,
          destination: dst,
        });
      }
    }
  }

  return {
    success: true,
    action: "check",
    checkedAt: nowIso(),
    mode: opts.mode,
    manifestVersion: manifest.version,
    installedVersion: state.installedVersion || "unknown",
    updateAvailable: (state.installedVersion || "") !== manifest.version,
    openclawConfigPath: opts.openclawConfig,
    openclawConfigExists: fs.existsSync(opts.openclawConfig),
    managedAgents,
    managedSkills,
    collisions,
  };
}

function runSync(opts) {
  const check = runCheck(opts);
  const manifest = loadManifest(opts.manifestPath);
  const stateDir = path.dirname(opts.stateFile);
  const logsDir = path.join(stateDir, "logs");
  ensureDir(stateDir);
  ensureDir(logsDir);

  const skillsSrcRoot = path.join(opts.repoRoot, "skills");
  const skillsDstRoot = path.join(opts.repoRoot, "workspace", "skills");
  const incomingRoot = path.join(skillsDstRoot, "_incoming");

  const report = {
    ...check,
    action: "sync",
    startedAt: nowIso(),
    dryRun: opts.dryRun,
    backups: [],
    copiedSkills: [],
    preservedSkills: [],
    incomingSkills: [],
    conflicts: [],
    fromVersion: opts.fromVersion || "",
    manifestPath: opts.manifestPath,
    stateFile: opts.stateFile,
  };

  let backupDir = "";

  if (opts.mode === "upgrade") {
    backupDir = backupPathFor(opts);
    report.backupDir = backupDir;
    if (!opts.dryRun) {
      ensureDir(backupDir);
      if (fs.existsSync(opts.openclawConfig)) {
        const backupTarget = path.join(backupDir, "openclaw.json");
        fs.copyFileSync(opts.openclawConfig, backupTarget);
        report.backups.push({ kind: "openclaw_config", path: backupTarget });
      }
      if (fs.existsSync(skillsDstRoot)) {
        const backupSkills = path.join(backupDir, "workspace-skills");
        copyDir(skillsDstRoot, backupSkills);
        report.backups.push({ kind: "workspace_skills", path: backupSkills });
      }
    }
  }

  const managedSkills = listSubdirs(skillsSrcRoot);
  if (!opts.dryRun) {
    ensureDir(skillsDstRoot);
    ensureDir(incomingRoot);
  }

  for (const skill of managedSkills) {
    const src = path.join(skillsSrcRoot, skill);
    const dst = path.join(skillsDstRoot, skill);

    if (!fs.existsSync(dst)) {
      if (!opts.dryRun) {
        copyDir(src, dst);
      }
      report.copiedSkills.push(skill);
      continue;
    }

    const srcHash = hashTree(src);
    const dstHash = hashTree(dst);
    if (srcHash === dstHash) {
      report.preservedSkills.push(skill);
      continue;
    }

    const incomingDst = path.join(incomingRoot, skill);
    report.conflicts.push({
      kind: "skill_local_modification",
      skill,
      destination: dst,
      incoming: incomingDst,
    });

    if (!opts.dryRun) {
      if (fs.existsSync(incomingDst)) {
        fs.rmSync(incomingDst, { recursive: true, force: true });
      }
      copyDir(src, incomingDst);
    }
    report.incomingSkills.push(skill);
  }

  report.completedAt = nowIso();
  report.success = true;

  if (!opts.dryRun) {
    const previous = readJsonSafe(opts.stateFile, {});
    const newState = {
      ...previous,
      installedVersion: manifest.version,
      minOpenclawVersion: manifest.min_openclaw_version,
      lastMode: opts.mode,
      lastSuccessAt: report.completedAt,
      lastBackupDir: report.backupDir || previous.lastBackupDir || "",
      lastConflictCount: report.conflicts.length,
      lastReportPath: path.join(logsDir, "last-sync-report.json"),
    };
    fs.writeFileSync(opts.stateFile, JSON.stringify(newState, null, 2));
    fs.writeFileSync(path.join(logsDir, "last-sync-report.json"), JSON.stringify(report, null, 2));
  }

  return report;
}

function main() {
  const opts = parseArgs(process.argv);
  try {
    opts.stateFile = resolveWritableStateFile(opts);
    const result = opts.action === "check" ? runCheck(opts) : runSync(opts);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (err) {
    const failure = {
      success: false,
      error: err && err.message ? err.message : String(err),
      action: opts.action,
      mode: opts.mode,
      at: nowIso(),
    };
    process.stdout.write(`${JSON.stringify(failure, null, 2)}\n`);
    process.exit(1);
  }
}

main();
