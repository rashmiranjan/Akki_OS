"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  MessageSquare,
  BarChart3,
  Bot,
  LayoutDashboard,
  Zap,
  Star,
  FileText,
  Settings,
  ShieldAlert,
} from "lucide-react";

import { useAuth } from "@/auth/clerk";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/activity", label: "Live Feed", icon: Activity },
      { href: "/chat", label: "Chat Agents", icon: MessageSquare },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/agents", label: "Agent Cabinet", icon: Bot },
      { href: "/drafts", label: "Post Drafts", icon: FileText },
      { href: "/content", label: "Content Library", icon: FileText },
    ],
  },
  {
    label: "Strategy",
    items: [
      { href: "/strategy", label: "Content Roadmap", icon: Zap },
      { href: "/analytics", label: "Engagement", icon: BarChart3 },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin", label: "System Monitor", icon: ShieldAlert },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex-1 px-3 py-6 overflow-y-auto">
        <nav className="space-y-8">
          {NAV_ITEMS.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                      pathname === item.href
                        ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4",
                      pathname === item.href ? "text-indigo-600" : "text-slate-400"
                    )} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Akki Pro</p>
            <p className="text-xs font-bold mb-3 leading-tight">Upgrade for advanced analytics</p>
            <button className="w-full py-2 bg-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
              Upgrade Now
            </button>
          </div>
          <Star className="absolute top-[-10px] right-[-10px] w-16 h-16 text-white/5 rotate-12" />
        </div>
      </div>
    </aside>
  );
}
