import crypto from "crypto";
import fs from "fs";
import path from "path";
import { convex, convexApi } from "../lib/convexClient";

type SyncResult = {
    slug: string;
    synced: number;
    deleted: number;
};

const CATEGORY_MAP: Record<string, string> = {
    "00-onboarding": "onboarding",
    "01-founder-product-intelligence": "intelligence",
    "02-audience-market-intelligence": "intelligence",
    "03-positioning-narrative-system": "positioning",
    "04-idea-content-studio": "content",
    "05-network-influence-engine": "network",
    "06-governance": "governance",
    "07-operations": "operations",
    "08-memory": "memory",
};

function getProjectsRoot() {
    const domainsRoot =
        process.env.DOMAINS_ROOT ||
        (process.env.AKKI_REPO_ROOT
            ? path.join(process.env.AKKI_REPO_ROOT, "domains")
            : path.resolve(process.cwd(), "..", "..", "domains"));
    return path.join(domainsRoot, "pb-os", "projects");
}

function listProjectSlugs(projectsRoot: string) {
    if (!fs.existsSync(projectsRoot)) return [];
    return fs
        .readdirSync(projectsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "_template")
        .map((entry) => entry.name)
        .sort();
}

function collectFiles(root: string): string[] {
    const out: string[] = [];
    const stack = [root];

    while (stack.length) {
        const current = stack.pop()!;
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

    return out.sort();
}

function hashContent(content: string) {
    return crypto.createHash("sha256").update(content).digest("hex");
}

function classifyDocument(relativePath: string) {
    const normalized = relativePath.replace(/\\/g, "/");
    if (normalized === "README.md" || normalized === "project.yaml") {
        return "overview";
    }
    const [head] = normalized.split("/");
    return CATEGORY_MAP[head] || "misc";
}

function parseKeyValueBlock(raw: string) {
    const result: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf(":");
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (key) result[key] = value;
    }
    return result;
}

function parseStructuredData(relativePath: string, content: string) {
    const extension = path.extname(relativePath).toLowerCase();
    try {
        if (extension === ".yaml" || extension === ".yml") {
            return {
                parseStatus: "parsed",
                structuredData: parseKeyValueBlock(content),
            };
        }

        if (extension === ".md" && content.startsWith("---\n")) {
            const parts = content.split("\n---\n");
            if (parts.length > 1) {
                return {
                    parseStatus: "parsed",
                    structuredData: parseKeyValueBlock(parts[0].replace(/^---\n/, "")),
                };
            }
        }
    } catch (_error) {
        return {
            parseStatus: "invalid",
            structuredData: undefined,
        };
    }

    return {
        parseStatus: "raw",
        structuredData: undefined,
    };
}

function extractTitle(relativePath: string, content: string, structuredData?: Record<string, string>) {
    if (structuredData?.title) return structuredData.title;
    if (structuredData?.name) return structuredData.name;

    if (path.basename(relativePath).toLowerCase() === "readme.md") {
        const firstHeading = content.split(/\r?\n/).find((line) => line.startsWith("# "));
        if (firstHeading) return firstHeading.replace(/^# /, "").trim();
    }

    return path.basename(relativePath);
}

export async function syncProjectDocuments(slug: string): Promise<SyncResult> {
    const projectsRoot = getProjectsRoot();
    const projectRoot = path.join(projectsRoot, slug);

    if (!fs.existsSync(projectRoot)) {
        throw new Error(`Project slug not found: ${slug}`);
    }

    const files = collectFiles(projectRoot);
    const activePaths: string[] = [];
    let synced = 0;

    for (const file of files) {
        const relativePath = path.relative(projectRoot, file).replace(/\\/g, "/");
        const content = fs.readFileSync(file, "utf8");
        const stats = fs.statSync(file);
        const parsed = parseStructuredData(relativePath, content);
        const title = extractTitle(relativePath, content, parsed.structuredData);

        activePaths.push(relativePath);

        await convex.mutation(convexApi.projectDocuments.upsert, {
            slug,
            relativePath,
            category: classifyDocument(relativePath),
            extension: path.extname(relativePath).toLowerCase(),
            title,
            content,
            contentHash: hashContent(content),
            sourceMtime: stats.mtimeMs,
            lastSyncedAt: Date.now(),
            parseStatus: parsed.parseStatus,
            structuredData: parsed.structuredData,
        });
        synced += 1;
    }

    const cleanup = await convex.mutation(convexApi.projectDocuments.deleteMissingForSlug, {
        slug,
        activePaths,
    });

    return {
        slug,
        synced,
        deleted: cleanup.deleted || 0,
    };
}

export async function syncAllProjectDocuments() {
    const projectsRoot = getProjectsRoot();
    const slugs = listProjectSlugs(projectsRoot);
    const results: SyncResult[] = [];

    for (const slug of slugs) {
        results.push(await syncProjectDocuments(slug));
    }

    return {
        projectCount: slugs.length,
        results,
    };
}
