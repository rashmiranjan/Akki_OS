# 🦅 Akki OS - Personal Branding Operating System

> 24x7 autonomous AI system that manages your entire personal brand on LinkedIn & Twitter

## ⚡ Quick Start
```bash
git clone https://github.com/rashmiranjan/Akki_OS
cd Akki_OS
bash install.sh
```

## 🤖 9 AI Agents

| Agent | Role | Skill |
|-------|------|-------|
| 🦅 Jarvis | Orchestrator | All skills |
| 🔍 Fury | Researcher | apify-research |
| ✍️ Loki | Writer | linkedin-writer, twitter-writer |
| 📊 Shuri | Strategist | strategy-planner |
| 🚀 Atlas | Distributor | linkedin-post, twitter-post |
| 💬 Echo | Engagement | engagement-hunter |
| 💡 Oracle | Idea Generator | idea-generator |
| 📈 Pulse | Analytics | analytics-reader |
| 🎨 Vision | Visual Generator | browser-automation |

## 🛠️ Skills

| Skill | Purpose |
|-------|---------|
| apify-research | Market research (Reddit, LinkedIn, X) |
| linkedin-writer | LinkedIn post writing |
| twitter-writer | Twitter thread writing |
| linkedin-post | Auto publish to LinkedIn |
| twitter-post | Auto publish to Twitter |
| idea-generator | Content ideas from research |
| strategy-planner | 7-day content calendar |
| engagement-hunter | Reply suggestions |
| analytics-reader | Performance insights |
| convex-save | Data storage |
| webhook-server | Real-time notifications |
| browser-automation | Browser control |
| apify-scripts | Web scraping |
| db-helpers | Database helpers |

## 📋 Requirements

- Node.js 18+
- OpenClaw
- Convex account (free)
- Telegram Bot Token
- Gemini API Key (free)
- Apify account (free tier)

## 🗄️ Database Setup

Run `skills/convex-schema/schema.sql` in Convex SQL Editor

## 🏗️ Architecture
```
Telegram → OpenClaw Gateway → Agents → Skills → Convex → Dashboard
```

## 📁 Structure
```
akki-os/
├── agents/     # 9 AI agents (SOUL.md files)
├── skills/     # 14 reusable skills
├── workspace/  # Shared brain (SOUL, MEMORY, IDENTITY)
├── install.sh  # One command setup
└── .env.example
```


```
