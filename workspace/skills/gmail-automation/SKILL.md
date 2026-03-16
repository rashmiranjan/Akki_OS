---
name: gmail-automation
description: Read and send Gmail messages using the currently configured runtime session.
---

# Gmail Automation Skill

## Purpose
Read and send Gmail messages only after the runtime has been configured with valid Google credentials and a browser session.

## Setup
Run the runtime's Gmail setup script and complete Google authentication.

## Usage
- Read messages
- Send a message
- Reuse the saved session for later Gmail actions

## Session
Use the browser-session location configured by the current runtime instead of assuming a machine-specific path.
