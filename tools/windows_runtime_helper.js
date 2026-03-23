#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i += 1;
      }
    } else {
      out._.push(arg);
    }
  }
  return out;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target, source) {
  if (!isObject(source)) return target;
  for (const [key, value] of Object.entries(source)) {
    if (isObject(value)) {
      if (!isObject(target[key])) target[key] = {};
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function copyRecursive(srcRoot, dstRoot, mode, skipDirs = new Set([".git", "node_modules", ".openclaw"])) {
  const skipNames = new Set([".DS_Store", "Thumbs.db"]);
  let created = 0;
  let overwritten = 0;
  let preserved = 0;

  function walk(srcDir, dstDir) {
    ensureDir(dstDir);
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      if (skipNames.has(entry.name)) continue;
      if (entry.isDirectory() && skipDirs.has(entry.name)) continue;

      const from = path.join(srcDir, entry.name);
      const to = path.join(dstDir, entry.name);

      if (entry.isDirectory()) {
        walk(from, to);
        continue;
      }

      if (!entry.isFile()) continue;

      if (!fs.existsSync(to)) {
        ensureDir(path.dirname(to));
        fs.copyFileSync(from, to);
        created += 1;
      } else if (mode === "overwrite") {
        fs.copyFileSync(from, to);
        overwritten += 1;
      } else {
        preserved += 1;
      }
    }
  }

  walk(srcRoot, dstRoot);
  return { created, overwritten, preserved };
}

function commandCopyTree(args) {
  const srcRoot = args.src;
  const dstRoot = args.dst;
  const mode = args.mode || "missing";
  const label = args.label || "runtime tree";
  if (!srcRoot || !dstRoot) fail("copy-tree requires --src and --dst");
  if (!fs.existsSync(srcRoot) || !fs.statSync(srcRoot).isDirectory()) {
    fail(`Missing source directory for ${label}: ${srcRoot}`);
  }

  const result = copyRecursive(srcRoot, dstRoot, mode);
  console.log(`OK: Seeded ${label} -> ${dstRoot} (${result.created} new, ${result.overwritten} overwritten, ${result.preserved} preserved)`);
}

function commandSeedAgentDefinition(args) {
  const srcRoot = args["src-root"];
  const dstRoot = args["dst-root"];
  const mode = args.mode || "missing";
  const agent = args.agent || path.basename(srcRoot || "");
  if (!srcRoot || !dstRoot) fail("seed-agent-definition requires --src-root and --dst-root");
  if (!fs.existsSync(srcRoot) || !fs.statSync(srcRoot).isDirectory()) {
    fail(`Missing agent source directory: ${srcRoot}`);
  }

  const durableFiles = [
    "SOUL.md",
    "IDENTITY.md",
    "TOOLS.md",
    "HEARTBEAT.md",
    "AGENTS.md",
    "USER.md",
    "BOOTSTRAP.md",
    "MEMORY.md",
  ];

  let created = 0;
  let overwritten = 0;
  let preserved = 0;

  function copyFileIfNeeded(from, to) {
    if (!fs.existsSync(from) || !fs.statSync(from).isFile()) return;
    if (!fs.existsSync(to)) {
      ensureDir(path.dirname(to));
      fs.copyFileSync(from, to);
      created += 1;
    } else if (mode === "overwrite") {
      fs.copyFileSync(from, to);
      overwritten += 1;
    } else {
      preserved += 1;
    }
  }

  ensureDir(dstRoot);
  for (const file of durableFiles) {
    copyFileIfNeeded(path.join(srcRoot, file), path.join(dstRoot, file));
  }

  const skillsSrc = path.join(srcRoot, "skills");
  if (fs.existsSync(skillsSrc) && fs.statSync(skillsSrc).isDirectory()) {
    const skillsDst = path.join(dstRoot, "skills");
    const result = copyRecursive(skillsSrc, skillsDst, mode);
    created += result.created;
    overwritten += result.overwritten;
    preserved += result.preserved;
  }

  const userFile = path.join(dstRoot, "USER.md");
  if (!fs.existsSync(userFile)) {
    fs.writeFileSync(
      userFile,
      "# USER.md - About Your Human\r\n\r\nFounder profile not synced yet. Await onboarding.\r\n",
      "utf8",
    );
    created += 1;
  }

  console.log(`OK: Seeded OpenClaw agent definition for ${agent} (${created} new, ${overwritten} overwritten, ${preserved} preserved)`);
}

function commandDeepMergeJson(args) {
  const runtimePath = args.runtime;
  const templatePath = args.template;
  if (!runtimePath || !templatePath) fail("deep-merge-json requires --runtime and --template");
  if (!fs.existsSync(runtimePath) || !fs.existsSync(templatePath)) process.exit(0);

  const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
  const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));
  fs.writeFileSync(runtimePath, JSON.stringify(deepMerge(runtime, template), null, 2));
  console.log("OK: Applied workspace/openclaw.json template");
}

function commandPatchGatewayConfig(args) {
  const configPath = args.config;
  const bindMode = args.bind || "loopback";
  const originsCsv = args.origins || "";
  if (!configPath) fail("patch-gateway-config requires --config");
  if (!fs.existsSync(configPath)) process.exit(0);

  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  cfg.gateway = cfg.gateway || {};
  cfg.gateway.bind = bindMode;
  cfg.gateway.controlUi = cfg.gateway.controlUi || {};

  const origins = [...new Set(originsCsv.split(",").map((item) => item.trim()).filter(Boolean))];
  if (origins.length) {
    cfg.gateway.controlUi.allowedOrigins = origins;
  }
  if (bindMode !== "loopback") {
    cfg.gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback = true;
  }

  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  console.log(`OK: OpenClaw gateway config patched (bind=${bindMode})`);
}

function commandConfigureRuntimeLayout(args) {
  const configPath = args.config;
  const workspaceRoot = args["workspace-root"];
  const agentsRoot = args["agents-root"];
  const agentDirRoot = args["agent-dir-root"];
  const agents = (args.agents || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (!configPath || !workspaceRoot || !agentsRoot || !agentDirRoot) {
    fail("configure-runtime-layout requires --config, --workspace-root, --agents-root, and --agent-dir-root");
  }
  if (!fs.existsSync(configPath)) process.exit(0);

  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  cfg.agents = cfg.agents || {};
  cfg.agents.defaults = cfg.agents.defaults || {};
  cfg.agents.defaults.workspace = workspaceRoot;
  cfg.agents.list = Array.isArray(cfg.agents.list) ? cfg.agents.list : [];

  for (const agent of agents) {
    const workspace = path.join(agentsRoot, agent);
    const agentDir = path.join(agentDirRoot, agent, "agent");
    const existing = cfg.agents.list.find((item) => item && item.id === agent);
    if (existing) {
      existing.name = existing.name || agent;
      existing.workspace = workspace;
      existing.agentDir = existing.agentDir || agentDir;
    } else {
      cfg.agents.list.push({ id: agent, name: agent, workspace, agentDir });
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  console.log("OK: OpenClaw runtime layout updated for self-contained Akki runtime");
}

function commandValidateRuntime(args) {
  const configPath = args.config;
  const agentsRoot = args["agents-root"];
  const domainsRoot = args["domains-root"];
  const skillsRoot = args["skills-root"];
  const globalSkillsRoot = args["global-skills-root"];
  const agentDirRoot = args["agent-dir-root"];
  const agents = (args.agents || "").split(",").map((item) => item.trim()).filter(Boolean);
  let failed = false;

  function reportError(message) {
    console.error(`ERROR: ${message}`);
    failed = true;
  }

  if (!fs.existsSync(path.join(domainsRoot || "", "pb-os"))) {
    reportError(`Self-contained domain root missing at ${path.join(domainsRoot || "", "pb-os")}`);
  }
  if (!fs.existsSync(skillsRoot || "")) {
    reportError(`Self-contained workspace skills missing at ${skillsRoot}`);
  }
  if (!fs.existsSync(globalSkillsRoot || "")) {
    reportError(`Self-contained global skills missing at ${globalSkillsRoot}`);
  }

  for (const agent of agents) {
    const workspaceDir = path.join(agentsRoot, agent);
    const definitionDir = path.join(agentDirRoot, agent, "agent");
    if (!fs.existsSync(workspaceDir)) {
      reportError(`Missing self-contained workspace for ${agent} at ${workspaceDir}`);
      continue;
    }
    for (const file of ["SOUL.md", "IDENTITY.md", "TOOLS.md", "HEARTBEAT.md", "AGENTS.md", "USER.md"]) {
      if (!fs.existsSync(path.join(workspaceDir, file))) {
        reportError(`Missing ${file} in ${workspaceDir}`);
      }
    }
    if (!fs.existsSync(path.join(definitionDir, "SOUL.md"))) {
      reportError(`Missing OpenClaw SOUL.md for ${agent} at ${definitionDir}`);
    }
    if (!fs.existsSync(path.join(workspaceDir, "skills"))) {
      reportError(`Missing agent-local skills for ${agent} at ${path.join(workspaceDir, "skills")}`);
    }
  }

  if (configPath && fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const list = Array.isArray(cfg?.agents?.list) ? cfg.agents.list : [];
      for (const agent of agents) {
        const entry = list.find((item) => item && item.id === agent);
        const expectedWorkspace = path.join(agentsRoot, agent);
        if (!entry) {
          reportError(`OpenClaw config missing agent entry for ${agent}`);
        } else if (entry.workspace !== expectedWorkspace) {
          reportError(`Agent ${agent} workspace mismatch (${entry.workspace || "unset"} != ${expectedWorkspace})`);
        }
      }
    } catch (error) {
      reportError(`Could not validate OpenClaw config: ${error.message}`);
    }
  }

  if (failed) {
    process.exit(1);
  }
  console.log("OK: Self-contained OpenClaw runtime validation passed");
}

function commandUpsertEnv(args) {
  const envFile = args.file;
  const key = args.key;
  const value = args.value ?? "";
  if (!envFile || !key) fail("upsert-env requires --file and --key");

  let lines = [];
  if (fs.existsSync(envFile)) {
    lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);
  }

  let found = false;
  lines = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    if (lines.length && lines[lines.length - 1] === "") lines.pop();
    lines.push(`${key}=${value}`);
  }

  ensureDir(path.dirname(envFile));
  fs.writeFileSync(envFile, `${lines.filter((line, index, arr) => !(index === arr.length - 1 && line === "")).join("\r\n")}\r\n`, "utf8");
}

const args = parseArgs(process.argv);
const command = args._[0];

switch (command) {
  case "copy-tree":
    commandCopyTree(args);
    break;
  case "seed-agent-definition":
    commandSeedAgentDefinition(args);
    break;
  case "deep-merge-json":
    commandDeepMergeJson(args);
    break;
  case "patch-gateway-config":
    commandPatchGatewayConfig(args);
    break;
  case "configure-runtime-layout":
    commandConfigureRuntimeLayout(args);
    break;
  case "validate-runtime":
    commandValidateRuntime(args);
    break;
  case "upsert-env":
    commandUpsertEnv(args);
    break;
  default:
    fail(`Unknown command: ${command || "(missing)"}`);
}
