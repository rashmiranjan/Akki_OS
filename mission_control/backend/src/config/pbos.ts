export const PBOS_AGENT_IDS = [
  "atlas",
  "archivist",
  "oracle",
  "pulse",
  "scribe",
  "keith",
  "sentinel",
] as const;

export type PbosAgentId = (typeof PBOS_AGENT_IDS)[number];

export const PBOS_AGENTS = [
  {
    id: "atlas",
    name: "Atlas",
    role: "Orchestrator",
    status: "online",
    description:
      "Coordinates the PB-OS workflow, creates project scaffolds, and routes work across specialist agents.",
    capabilities: [
      "Workflow orchestration",
      "Project initialization",
      "Cross-agent routing",
    ],
  },
  {
    id: "archivist",
    name: "Archivist",
    role: "Founder Intelligence",
    status: "online",
    description:
      "Builds the durable founder, product, and context memory that keeps the system aligned over time.",
    capabilities: [
      "Founder profiling",
      "Memory curation",
      "Context synthesis",
    ],
  },
  {
    id: "oracle",
    name: "Oracle",
    role: "Audience Intelligence",
    status: "online",
    description:
      "Turns scattered audience signals into ICP, JTBD, objections, and trend intelligence.",
    capabilities: [
      "Conversation mining",
      "ICP mapping",
      "Trend detection",
    ],
  },
  {
    id: "pulse",
    name: "Pulse",
    role: "Analytics",
    status: "online",
    description:
      "Interprets performance signals, identifies what is compounding, and recommends strategic changes.",
    capabilities: [
      "Performance analysis",
      "Feedback loops",
      "Iteration guidance",
    ],
  },
  {
    id: "scribe",
    name: "Scribe",
    role: "Content Engine",
    status: "online",
    description:
      "Transforms strategy and positioning into drafts, refined ideas, and content assets across formats.",
    capabilities: [
      "Draft creation",
      "Narrative alignment",
      "Format adaptation",
    ],
  },
  {
    id: "keith",
    name: "Keith",
    role: "Distribution Network",
    status: "online",
    description:
      "Maps conversations, collaborators, and outreach opportunities to grow reach through strategic distribution.",
    capabilities: [
      "Conversation detection",
      "Network mapping",
      "Strategic engagement",
    ],
  },
  {
    id: "sentinel",
    name: "Sentinel",
    role: "Signal Monitor",
    status: "online",
    description:
      "Tracks signal quality, narrative resonance, and topic movement to surface what the system should notice next.",
    capabilities: [
      "Signal collection",
      "Pattern identification",
      "Narrative monitoring",
    ],
  },
] as const;

export const PBOS_AGENT_MAP = Object.fromEntries(
  PBOS_AGENTS.map((agent) => [agent.id, agent]),
) as Record<PbosAgentId, (typeof PBOS_AGENTS)[number]>;
