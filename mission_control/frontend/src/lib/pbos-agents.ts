import {
  Activity,
  BarChart3,
  Bot,
  Brain,
  Cpu,
  Feather,
  Orbit,
  Radar,
} from "lucide-react";

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

export const PBOS_AGENT_OPTIONS = [...PBOS_AGENT_IDS];

export const PBOS_AGENTS = [
  {
    id: "atlas",
    name: "Atlas",
    role: "Orchestrator",
    description:
      "Coordinates the PB-OS workflow, project scaffolds, and cross-agent handoffs.",
    capabilities: [
      "Workflow orchestration",
      "Project initialization",
      "Cross-agent routing",
    ],
    status: "online" as const,
    icon: Cpu,
    color: "text-blue-600",
  },
  {
    id: "archivist",
    name: "Archivist",
    role: "Founder Intelligence",
    description:
      "Builds durable founder, product, and context memory for the whole system.",
    capabilities: ["Founder profiling", "Memory curation", "Context synthesis"],
    status: "online" as const,
    icon: Brain,
    color: "text-amber-600",
  },
  {
    id: "oracle",
    name: "Oracle",
    role: "Audience Intelligence",
    description:
      "Converts audience signals into ICP, JTBD, objections, and trend intelligence.",
    capabilities: ["Conversation mining", "ICP mapping", "Trend detection"],
    status: "online" as const,
    icon: Radar,
    color: "text-yellow-600",
  },
  {
    id: "pulse",
    name: "Pulse",
    role: "Analytics",
    description:
      "Analyzes performance and recommends strategic iteration based on live signals.",
    capabilities: [
      "Performance analysis",
      "Feedback loops",
      "Iteration guidance",
    ],
    status: "online" as const,
    icon: BarChart3,
    color: "text-violet-600",
  },
  {
    id: "scribe",
    name: "Scribe",
    role: "Content Engine",
    description:
      "Transforms strategy and positioning into drafts and publish-ready content assets.",
    capabilities: ["Draft creation", "Narrative alignment", "Format adaptation"],
    status: "online" as const,
    icon: Feather,
    color: "text-emerald-600",
  },
  {
    id: "keith",
    name: "Keith",
    role: "Distribution Network",
    description:
      "Finds collaboration, community, and engagement opportunities to grow reach.",
    capabilities: [
      "Conversation detection",
      "Network mapping",
      "Strategic engagement",
    ],
    status: "online" as const,
    icon: Orbit,
    color: "text-indigo-600",
  },
  {
    id: "sentinel",
    name: "Sentinel",
    role: "Signal Monitor",
    description:
      "Tracks signal quality, topic movement, and narrative resonance across the system.",
    capabilities: [
      "Signal collection",
      "Pattern identification",
      "Narrative monitoring",
    ],
    status: "online" as const,
    icon: Activity,
    color: "text-rose-600",
  },
] as const;

export const DEFAULT_AGENT_ICON = Bot;
