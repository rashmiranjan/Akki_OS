#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <slug>"
  exit 1
fi

SLUG="$1"
BASE="$(cd "$(dirname "$0")/.." && pwd)/projects/$SLUG"
mkdir -p "$BASE/memory"

cat > "$BASE/onboarding.md" <<'MD'
# Onboarding

- Founder:
- Startup/Product:
- Objective:
- Stage:
- Status: Active
MD

cat > "$BASE/memory-map.md" <<'MD'
# Memory Map

- founder-memory.md
- product-memory.md
- market-intelligence-memory.md
- customer-insight-memory.md
- knowledge-graph-memory.md
- learning-log.md
MD

cat > "$BASE/step-1-founder-understanding.md" <<'MD'
# Step 1 — Founder Understanding
MD

cat > "$BASE/step-2-product-understanding.md" <<'MD'
# Step 2 — Product Understanding
MD

cat > "$BASE/step-3-startup-context.md" <<'MD'
# Step 3 — Startup Context Analysis
MD

cat > "$BASE/step-4-customer-understanding.md" <<'MD'
# Step 4 — Customer Understanding
MD

cat > "$BASE/step-5-strategic-synthesis.md" <<'MD'
# Step 5 — Strategic Synthesis
MD

cat > "$BASE/memory/founder-memory.md" <<'MD'
# Founder Memory
MD

cat > "$BASE/memory/product-memory.md" <<'MD'
# Product Memory
MD

cat > "$BASE/memory/market-intelligence-memory.md" <<'MD'
# Market Intelligence Memory
MD

cat > "$BASE/memory/customer-insight-memory.md" <<'MD'
# Customer Insight Memory
MD

cat > "$BASE/memory/knowledge-graph-memory.md" <<'MD'
# Knowledge Graph Memory

Founder → Product → Market → Customers
MD

cat > "$BASE/memory/learning-log.md" <<'MD'
# Learning Log
MD

echo "Initialized Founder Intelligence workspace at $BASE"
