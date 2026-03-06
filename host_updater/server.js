#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const PORT = Number(process.env.UPDATER_PORT || 3010);
const HOST = process.env.UPDATER_HOST || "127.0.0.1";
const REPO_ROOT = path.resolve(process.env.UPDATER_REPO_ROOT || path.join(__dirname, ".."));
const TOKEN = process.env.UPDATER_TOKEN || "";
let STATE_DIR = process.platform === "win32"
  ? path.join(process.env.USERPROFILE || os.homedir(), ".akki", "state")
  : path.join(os.homedir(), ".akki", "state");
let JOBS_FILE = path.join(STATE_DIR, "upgrade-jobs.json");

if (!TOKEN) {
  process.stderr.write("ERROR: UPDATER_TOKEN is required\n");
  process.exit(1);
}

try {
  fs.mkdirSync(STATE_DIR, { recursive: true });
} catch (_) {
  STATE_DIR = path.join(REPO_ROOT, ".akki", "state");
  JOBS_FILE = path.join(STATE_DIR, "upgrade-jobs.json");
  fs.mkdirSync(STATE_DIR, { recursive: true });
}

let jobs = {};
try {
  jobs = JSON.parse(fs.readFileSync(JOBS_FILE, "utf8"));
} catch (_) {
  jobs = {};
}

function persistJobs() {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

function isAuthorized(req) {
  const token = req.headers["x-updater-token"] || "";
  return token === TOKEN;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 64) {
        reject(new Error("payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function safeCommand(body) {
  const cmd = [];
  if (body.pullLatest === true) {
    cmd.push(["git", ["pull", "--ff-only"]]);
  }
  if (process.platform === "win32") {
    cmd.push(["cmd", ["/c", "install.bat", "--upgrade", "--non-interactive"]]);
  } else {
    cmd.push(["bash", ["install.sh", "--upgrade", "--non-interactive"]]);
  }
  return cmd;
}

async function runJob(body) {
  const id = generateId();
  jobs[id] = {
    id,
    status: "running",
    startedAt: new Date().toISOString(),
    completedAt: null,
    logs: [],
    exitCode: null,
  };
  persistJobs();

  const commandQueue = safeCommand(body);

  const appendLog = (line) => {
    jobs[id].logs.push(`${new Date().toISOString()} ${line}`);
    if (jobs[id].logs.length > 400) {
      jobs[id].logs = jobs[id].logs.slice(-400);
    }
    persistJobs();
  };

  try {
    for (const [command, args] of commandQueue) {
      await new Promise((resolve, reject) => {
        appendLog(`RUN ${command} ${args.join(" ")}`);
        const child = spawn(command, args, { cwd: REPO_ROOT, env: process.env });
        child.stdout.on("data", (d) => appendLog(String(d).trimEnd()));
        child.stderr.on("data", (d) => appendLog(String(d).trimEnd()));
        child.on("error", reject);
        child.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`command failed: ${command} exit=${code}`));
        });
      });
    }

    jobs[id].status = "success";
    jobs[id].exitCode = 0;
    jobs[id].completedAt = new Date().toISOString();
    persistJobs();
    return id;
  } catch (err) {
    jobs[id].status = "failed";
    jobs[id].exitCode = 1;
    jobs[id].error = err && err.message ? err.message : String(err);
    jobs[id].completedAt = new Date().toISOString();
    persistJobs();
    return id;
  }
}

function runCheck() {
  const command = process.platform === "win32"
    ? ["node", ["tools\\managed_sync.js", "--action", "check", "--mode", "upgrade", "--repo-root", REPO_ROOT]]
    : ["node", ["tools/managed_sync.js", "--action", "check", "--mode", "upgrade", "--repo-root", REPO_ROOT]];

  return new Promise((resolve) => {
    const [cmd, args] = command;
    const child = spawn(cmd, args, { cwd: REPO_ROOT, env: process.env });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => { out += String(d); });
    child.stderr.on("data", (d) => { err += String(d); });
    child.on("close", () => {
      try {
        const parsed = JSON.parse(out || "{}");
        resolve({ success: true, check: parsed, stderr: err.trim() });
      } catch (_) {
        resolve({ success: false, error: "failed to parse check output", stdout: out.trim(), stderr: err.trim() });
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (!isAuthorized(req)) {
    return sendJson(res, 401, { success: false, error: "unauthorized" });
  }

  if (req.method === "POST" && req.url === "/api/v1/system/upgrade/check") {
    const payload = await runCheck();
    return sendJson(res, 200, payload);
  }

  if (req.method === "POST" && req.url === "/api/v1/system/upgrade/run") {
    try {
      const body = await readBody(req);
      const id = await runJob(body || {});
      return sendJson(res, 202, { success: true, jobId: id, status: jobs[id].status });
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  if (req.method === "GET" && req.url.startsWith("/api/v1/system/upgrade/status/")) {
    const id = req.url.split("/").pop();
    const job = jobs[id];
    if (!job) {
      return sendJson(res, 404, { success: false, error: "job not found" });
    }
    return sendJson(res, 200, { success: true, job });
  }

  return sendJson(res, 404, { success: false, error: "not found" });
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`Host updater listening on http://${HOST}:${PORT}\n`);
});
