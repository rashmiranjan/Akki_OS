"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SignInButton, SignedIn, SignedOut, isClerkEnabled } from "@/auth/clerk";
import { UserMenu } from "@/components/organisms/UserMenu";

export function LandingShell({ children }: { children: ReactNode }) {
  const clerkEnabled = isClerkEnabled();

  return (
    <div className="landing-enterprise">
      <nav className="landing-nav" aria-label="Primary navigation">
        <div className="nav-container">
          <Link href="/" className="logo-section" aria-label="Akki OS home">
            <img src="/images/akki_logo.png" alt="Akki OS" className="h-9 w-9 object-contain" />
            <img src="/images/akki_text.png" alt="Akki.Ai" className="h-5 object-contain brightness-0" />
          </Link>

          <div className="nav-links">
            <Link href="#capabilities">Features</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/content">Content</Link>
            <Link href="/strategy">Strategy</Link>
          </div>

          <div className="nav-cta">
            <SignedOut>
              {clerkEnabled ? (
                <>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard">
                    <button type="button" className="btn-secondary">Sign In</button>
                  </SignInButton>
                  <SignInButton mode="modal" forceRedirectUrl="/onboarding" signUpForceRedirectUrl="/onboarding">
                    <button type="button" className="btn-primary">Get Started</button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
                  <Link href="/onboarding" className="btn-primary">Get Started</Link>
                </>
              )}
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
              <Link href="/content" className="btn-primary">Content</Link>
              <UserMenu />
            </SignedIn>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/images/akki_logo.png" alt="Akki OS" className="h-10 w-10 object-contain mb-2" />
            <h3>Akki OS</h3>
            <p>Your autonomous personal branding OS. Agents work 24/7 while you focus on building.</p>
            <div className="footer-tagline">Powered by AI Agents</div>
          </div>

          <div className="footer-column">
            <h4>Product</h4>
            <div className="footer-links">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/content">Content Library</Link>
              <Link href="/strategy">Strategy</Link>
              <Link href="#capabilities">Features</Link>
            </div>
          </div>

          <div className="footer-column">
            <h4>Agents</h4>
            <div className="footer-links">
              <Link href="/dashboard">Jarvis — Orchestrator</Link>
              <Link href="/dashboard">Loki — Writer</Link>
              <Link href="/dashboard">Fury — Researcher</Link>
              <Link href="/dashboard">Atlas — Publisher</Link>
            </div>
          </div>

          <div className="footer-column">
            <h4>Access</h4>
            <div className="footer-links">
              <SignedOut>
                {clerkEnabled ? (
                  <SignInButton mode="modal" forceRedirectUrl="/onboarding" signUpForceRedirectUrl="/onboarding">
                    <button type="button">Get Started</button>
                  </SignInButton>
                ) : (
                  <Link href="/onboarding">Get Started</Link>
                )}
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/content">Content</Link>
              </SignedIn>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} Akki OS. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <Link href="#capabilities">Features</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/strategy">Strategy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
