"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, isClerkEnabled } from "@/auth/clerk";

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function LandingHero() {
  const clerkEnabled = isClerkEnabled();

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">🤖 AKKI OS — AI Agent System</div>
          <h1>
            Your personal brand,<br />
            <span className="hero-highlight">on autopilot.</span>
          </h1>
          <p>
            Akki OS runs 24/7 — researching trends, writing posts, engaging your audience,
            and publishing content. You focus on building. Agents handle the rest.
          </p>

          <div className="hero-actions">
            <SignedOut>
              {clerkEnabled ? (
                <>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard" signUpForceRedirectUrl="/onboarding">
                    <button type="button" className="btn-large primary">
                      Open Dashboard <ArrowIcon />
                    </button>
                  </SignInButton>
                  <SignInButton mode="modal" forceRedirectUrl="/onboarding" signUpForceRedirectUrl="/onboarding">
                    <button type="button" className="btn-large secondary">
                      Get Started
                    </button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="btn-large primary">
                    Open Dashboard <ArrowIcon />
                  </Link>
                  <Link href="/onboarding" className="btn-large secondary">
                    Get Started
                  </Link>
                </>
              )}
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-large primary">
                Open Dashboard <ArrowIcon />
              </Link>
              <Link href="/content" className="btn-large secondary">
                Content Library
              </Link>
            </SignedIn>
          </div>

          <div className="hero-features">
            {[
              "Loki writes posts 24/7",
              "Atlas publishes automatically",
              "Fury researches trends",
              "Jarvis coordinates everything",
            ].map((label) => (
              <div key={label} className="hero-feature">
                <div className="feature-icon">✓</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="command-surface">
          <div className="surface-header">
            <div className="surface-title">Agent Status</div>
            <div className="live-indicator">
              <div className="live-dot" />
              LIVE
            </div>
          </div>
          <div className="surface-subtitle">
            <h3>Your agents are working right now.</h3>
            <p>Research, writing, publishing — all autonomous.</p>
          </div>
          <div className="metrics-row">
            {[
              { label: "Posts Written", value: "24" },
              { label: "Published", value: "18" },
              { label: "Engagements", value: "340" },
            ].map((item) => (
              <div key={item.label} className="metric">
                <div className="metric-value">{item.value}</div>
                <div className="metric-label">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="surface-content">
            <div className="content-section">
              <h4>Agents — Online</h4>
              {[
                { name: "Jarvis", role: "Orchestrating tasks" },
                { name: "Loki", role: "Writing 2 LinkedIn posts" },
                { name: "Fury", role: "Researching AI trends" },
                { name: "Atlas", role: "Publishing approved drafts" },
              ].map((agent) => (
                <div key={agent.name} className="status-item">
                  <div className="status-icon progress">⊙</div>
                  <div className="status-item-content">
                    <div className="status-item-title">{agent.name} — {agent.role}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="content-section">
              <h4>Drafts — Pending Approval</h4>
              {[
                { title: "Why AI agents will replace SaaS tools", status: "ready" as const },
                { title: "3 things founders get wrong about automation", status: "ready" as const },
                { title: "The future of personal branding with AI", status: "waiting" as const },
              ].map((item) => (
                <div key={item.title} className="approval-item">
                  <div className="approval-title">{item.title}</div>
                  <div className={`approval-badge ${item.status}`}>{item.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "2rem", borderTop: "1px solid var(--neutral-200)" }}>
            <div className="content-section">
              <h4>Recent Activity</h4>
              {[
                { text: "Loki wrote post about AI agents", time: "2m" },
                { text: "Atlas published to LinkedIn", time: "1h" },
                { text: "Fury found 3 trending topics", time: "4h" },
              ].map((signal) => (
                <div key={signal.text} className="signal-item">
                  <div className="signal-text">{signal.text}</div>
                  <div className="signal-time">{signal.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="capabilities">
        <div className="features-grid">
          {[
            {
              title: "Loki — Content Writer",
              description: "Writes LinkedIn and Twitter posts in your voice, 24/7. Bold, direct, targeted at Founders & Developers.",
            },
            {
              title: "Fury — Researcher",
              description: "Scans trending topics in AI agents space every 4 hours. Feeds insights to Oracle and Loki.",
            },
            {
              title: "Atlas — Publisher",
              description: "Publishes approved drafts to LinkedIn and Twitter automatically. Likes, comments, connects on your behalf.",
            },
            {
              title: "Jarvis — Orchestrator",
              description: "Coordinates all agents, reviews mission status every 6 hours, keeps everything aligned with your goals.",
            },
          ].map((feature, idx) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-number">{String(idx + 1).padStart(2, "0")}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Start building your brand on autopilot.</h2>
          <p>
            Onboard once. Your agents learn your voice, research your niche,
            and post consistently — every single day.
          </p>
          <div className="cta-actions">
            <SignedOut>
              {clerkEnabled ? (
                <>
                  <SignInButton mode="modal" forceRedirectUrl="/onboarding" signUpForceRedirectUrl="/onboarding">
                    <button type="button" className="btn-large white">Get Started</button>
                  </SignInButton>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard">
                    <button type="button" className="btn-large outline">Open Dashboard</button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <Link href="/onboarding" className="btn-large white">Get Started</Link>
                  <Link href="/dashboard" className="btn-large outline">Open Dashboard</Link>
                </>
              )}
            </SignedOut>
            <SignedIn>
              <Link href="/onboarding" className="btn-large white">Get Started</Link>
              <Link href="/dashboard" className="btn-large outline">Open Dashboard</Link>
            </SignedIn>
          </div>
        </div>
      </section>
    </>
  );
}
