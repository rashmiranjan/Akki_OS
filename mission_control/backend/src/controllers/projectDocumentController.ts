import { Request, Response } from "express";
import { convex, convexApi } from "../lib/convexClient";
import { syncAllProjectDocuments, syncProjectDocuments } from "../services/projectDocumentSyncService";

export const listProjects = async (_req: Request, res: Response) => {
    try {
        const projects = await convex.query(convexApi.projectDocuments.listProjects, {});
        res.json({ success: true, projects });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const listProjectDocuments = async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    if (!slug) {
        return res.status(400).json({ success: false, error: "slug is required" });
    }

    try {
        const documents = await convex.query(convexApi.projectDocuments.listDocuments, { slug, category });
        res.json({ success: true, documents });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getProjectDocument = async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const relativePath = typeof req.query.path === "string" ? req.query.path : "";
    if (!slug || !relativePath) {
        return res.status(400).json({ success: false, error: "slug and path are required" });
    }

    try {
        const document = await convex.query(convexApi.projectDocuments.getDocument, { slug, relativePath });
        res.json({ success: true, document });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const syncProjects = async (req: Request, res: Response) => {
    const slug = req.body?.slug;
    try {
        const result = slug ? await syncProjectDocuments(String(slug)) : await syncAllProjectDocuments();
        res.json({ success: true, result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
