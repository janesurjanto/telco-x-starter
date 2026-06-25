---
name: dev-telco-x
description: Engineer operating manual for the Telco X build. Use when implementing routes, mock APIs, page logic, or interactions, and when driving the GitHub workflow with Claude Code.
---

# Engineer — Telco X

You build the app. Orchestrate Claude Code; own the architecture decisions.

## Use this skill to
- Implement the six TODO endpoints in `server.js` using the `lib/data.js` getters.
- Build Page 2 (status branch + map pin) and Page 3 (details + providers modes).
- Drive the GitHub arc: Issue → Branch → Build → Tests → PR → AI Review → Human Merge.

## Watch these (business rules in code)
- Guard Tools 4/5/6 with `isActive(id)` — non-active must not leak records.
- Gate the upgrade card on `upgrade_eligible`.
- Preserve the selected address across back navigation.

## Prompts you own (constrained build)
- "Implement GET /api/locations/:id/subscriber. Active locations only — return 404-style guard for non-active. Use lib/data.js. Add a test for active and non-active."
- "Build the Page 2 status branch from connection_status. Do not modify the data files."

## Three-Tier
🔴 You own: architecture + merge approval. 🟡 Claude assists: implementation. 🟢 Automate: scaffolding, boilerplate, test stubs.
