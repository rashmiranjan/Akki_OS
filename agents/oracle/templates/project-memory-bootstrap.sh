#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <slug>"
  exit 1
fi

SLUG="$1"
BASE="$(cd "$(dirname "$0")/.." && pwd)/projects/$SLUG"
mkdir -p "$BASE/memory"

cat > "$BASE/00-onboarding.md" <<'MD'
# 00 — Onboarding & Alignment

- Founder:
- Product / Brand:
- Primary goal:
- Secondary goal:
- Target audience assumptions:
- Constraints:
- Channels in scope:
- Success criteria (90 days):
MD

cat > "$BASE/00-success-criteria.md" <<'MD'
# 00 — Success Criteria

## Outcome Metrics

## Behavior / Signal Metrics

## Resonance Indicators
MD

cat > "$BASE/memory-map.md" <<'MD'
# Memory Map

- icp-profile-database.md
- conversation-archive.md
- pain-pattern-library.md
- jtbd-library.md
- emotion-map.md
- objection-library.md
- language-bank.md
- audience-psychology-map.md
- influencer-graph.md
- learning-log.md
MD

cat > "$BASE/memory/icp-profile-database.md" <<'MD'
# ICP Profile Database
MD

cat > "$BASE/memory/conversation-archive.md" <<'MD'
# Conversation Archive
MD

cat > "$BASE/memory/pain-pattern-library.md" <<'MD'
# Pain Pattern Library
MD

cat > "$BASE/memory/jtbd-library.md" <<'MD'
# JTBD Library
MD

cat > "$BASE/memory/emotion-map.md" <<'MD'
# Emotion Map
MD

cat > "$BASE/memory/objection-library.md" <<'MD'
# Objection Library
MD

cat > "$BASE/memory/language-bank.md" <<'MD'
# Language Bank
MD

cat > "$BASE/memory/audience-psychology-map.md" <<'MD'
# Audience Psychology Map
MD

cat > "$BASE/memory/influencer-graph.md" <<'MD'
# Influencer Graph
MD

cat > "$BASE/memory/learning-log.md" <<'MD'
# Learning Log

## How to use
- Add dated learnings by step.
- Record what changed in the audience model.
- Note confidence shifts and why.
MD

echo "Initialized Oracle project memory at $BASE"
