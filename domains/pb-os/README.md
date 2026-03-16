# PB-OS Domain

This domain is the canonical workspace for Personal Branding OS.

## Purpose
- Keep all PB-OS work in one shared structure.
- Avoid handoff risk across Atlas + Archivist + Oracle + Pulse + Scribe + Keith + Sentinel.
- Keep project context retrievable from a single location.

## Rules
1. All PB-OS projects live under `projects/<slug>/`.
2. No project decisions outside project folders.
3. Atlas creates project scaffolds at initiation.
4. Agents may read all folders; default writes follow `agent-charter.yaml`.
5. Every strategic or operational decision must be logged under `08-memory/`.

## Quickstart
- Create a new project from `_shared/templates/project-init.md` + scaffold tree.
- Register metadata in `project.yaml`.
- Start execution from `07-operations/backlog.md`.
