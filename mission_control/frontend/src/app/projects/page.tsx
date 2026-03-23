"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { SignedIn, SignedOut, useAuth } from "@/auth/clerk";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";
import { FolderKanban, RefreshCw, FileText } from "lucide-react";
import { Markdown } from "@/components/atoms/Markdown";

type ProjectSummary = {
  slug: string;
  docCount: number;
  categories: Record<string, number>;
  updatedAt: number;
  title?: string;
};

type ProjectDocument = {
  slug: string;
  relativePath: string;
  category: string;
  content: string;
  title?: string;
  lastSyncedAt: number;
  parseStatus: string;
};

const CATEGORY_ORDER = [
  "overview",
  "onboarding",
  "intelligence",
  "positioning",
  "content",
  "network",
  "governance",
  "operations",
  "memory",
  "misc",
];

export default function ProjectsPage() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchProjects = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const next = data.projects || [];
        setProjects(next);
        if (!selectedSlug && next[0]?.slug) {
          setSelectedSlug(next[0].slug);
        }
      }
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchDocuments = async (slug: string) => {
    if (!slug) return;
    setLoadingDocuments(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${encodeURIComponent(slug)}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const nextDocs = data.documents || [];
        setDocuments(nextDocs);
        const nextPath = selectedPath && nextDocs.some((doc: ProjectDocument) => doc.relativePath === selectedPath)
          ? selectedPath
          : nextDocs[0]?.relativePath || "";
        setSelectedPath(nextPath);
      }
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchDocument = async (slug: string, relativePath: string) => {
    if (!slug || !relativePath) {
      setSelectedDocument(null);
      return;
    }
    const token = await getToken();
    const params = new URLSearchParams({ path: relativePath });
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${encodeURIComponent(slug)}/document?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (data.success) {
      setSelectedDocument(data.document || null);
    }
  };

  const syncProjects = async (slug?: string) => {
    setSyncing(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(slug ? { slug } : {}),
      });
      await fetchProjects();
      await fetchDocuments(slug || selectedSlug);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      fetchDocuments(selectedSlug);
    }
  }, [selectedSlug]);

  useEffect(() => {
    if (selectedSlug && selectedPath) {
      fetchDocument(selectedSlug, selectedPath);
    }
  }, [selectedSlug, selectedPath]);

  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, ProjectDocument[]>();
    for (const category of CATEGORY_ORDER) groups.set(category, []);
    for (const doc of documents) {
      const list = groups.get(doc.category) || [];
      list.push(doc);
      groups.set(doc.category, list);
    }
    return Array.from(groups.entries()).filter(([, docs]) => docs.length > 0);
  }, [documents]);

  return (
    <DashboardShell>
      <SignedOut>
        <SignedOutPanel message="Sign in to inspect synced PB-OS project documents." forceRedirectUrl="/projects" />
      </SignedOut>
      <SignedIn>
        <DashboardSidebar />
        <main className="flex-1 bg-slate-50 min-h-screen p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                  Project Mirror <FolderKanban className="w-6 h-6 text-indigo-600" />
                </h1>
                <p className="text-slate-500 mt-1">
                  Browse PB-OS project files as mirrored Convex documents.
                </p>
              </div>
              <button
                onClick={() => syncProjects()}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                Sync All Projects
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_320px_minmax(0,1fr)] gap-6">
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Projects</h2>
                  <span className="text-xs text-slate-400">{projects.length}</span>
                </div>
                <div className="space-y-2">
                  {loadingProjects ? (
                    <div className="h-20 rounded-xl bg-slate-50 animate-pulse" />
                  ) : projects.map((project) => (
                    <button
                      key={project.slug}
                      onClick={() => setSelectedSlug(project.slug)}
                      className={`w-full text-left rounded-xl border px-3 py-3 transition-all ${
                        selectedSlug === project.slug
                          ? "border-indigo-200 bg-indigo-50"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <p className="font-bold text-slate-900">{project.title || project.slug}</p>
                      <p className="text-xs text-slate-500 mt-1">{project.slug}</p>
                      <p className="text-[11px] text-slate-400 mt-2">
                        {project.docCount} docs • {new Date(project.updatedAt).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Documents</h2>
                  {selectedSlug ? (
                    <button
                      onClick={() => syncProjects(selectedSlug)}
                      disabled={syncing}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      Sync Slug
                    </button>
                  ) : null}
                </div>
                {loadingDocuments ? (
                  <div className="h-48 rounded-xl bg-slate-50 animate-pulse" />
                ) : (
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {groupedDocuments.map(([category, docs]) => (
                      <div key={category}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          {category}
                        </p>
                        <div className="space-y-2">
                          {docs.map((doc) => (
                            <button
                              key={doc.relativePath}
                              onClick={() => setSelectedPath(doc.relativePath)}
                              className={`w-full text-left rounded-xl border px-3 py-2 ${
                                selectedPath === doc.relativePath
                                  ? "border-indigo-200 bg-indigo-50"
                                  : "border-slate-100 hover:bg-slate-50"
                              }`}
                            >
                              <p className="text-sm font-semibold text-slate-800">{doc.title || doc.relativePath}</p>
                              <p className="text-[11px] text-slate-500 mt-1">{doc.relativePath}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[70vh]">
                {selectedDocument ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900">{selectedDocument.title || selectedDocument.relativePath}</h2>
                        <p className="text-sm text-slate-500 mt-1">{selectedDocument.relativePath}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          {selectedDocument.category}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {new Date(selectedDocument.lastSyncedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <Markdown content={selectedDocument.content} variant="basic" />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <FileText className="w-10 h-10 mb-3" />
                    <p className="font-semibold">Select a project document</p>
                    <p className="text-sm mt-1">Synced PB-OS files will appear here once a slug is selected.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </SignedIn>
    </DashboardShell>
  );
}
