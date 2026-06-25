# Telco X — Service Availability Prototype (Day 2 Build)

This is the starter for the Day 2 build challenge. You (Claude Code) are the build partner.
Plan, code, review, and test — but every merge is a human decision.

## What we're building
A responsive three-page web app for the fictional carrier **Telco X**:
- **Page 1** — Home & address search (`public/index.html`) — *worked example, runs already*
- **Page 2** — Address result (`public/result.html`) — *build it*
- **Page 3** — Details or providers (`public/details.html`) — *build it*

## Guardrails (do not break)
- De-identified sandbox: **never** use NBN/RSP terminology, logos, or process names. Generic tech terms (FTTP, HFC, FTTN, FTTC, Fixed Wireless, speed tier) are fine.
- No login, accounts, payments, live provider integration, or internet calls. Mock data only.
- **Keep all challenge data unchanged.** `lib/data.js` is read-only.

## Business rules
- `active` = existing subscriber. `previous` and `never` = non-subscribers.
- Map pin uses coordinates from Tool 1.
- Technology (Tool 2) selects the valid product set (Tool 3).
- Do **not** show network/service records for a non-active location.
- Do **not** show an upgrade card when `upgrade_eligible` is `false`.

## The seven tool files (in `data/`, see `data/DATA_README.md`)
`tool1_locations.json` … `tool7_providers.json` — bundled in this repo under `data/`:
Tool 1 locations · Tool 2 technology · Tool 3 products · Tool 4 subscriber (active) ·
Tool 5 network (active) · Tool 6 service (active) · Tool 7 providers.
Access them through `lib/data.js` getters; never read or edit the JSON directly.

## API contract
Worked: `GET /api/locations`, `GET /api/locations/:id`.
TODO (return 501 with hints until you implement them):
`…/:id/technology`, `/api/technology/:tech/products`, `…/:id/subscriber`,
`…/:id/network`, `…/:id/service`, `/api/technology/:tech/providers`.

## Run
`npm install` → `npm start` → http://localhost:3001 · Tests: `npm test`

## How we work (the GitHub arc)
Issue → Branch → Explore → Plan → Build → Tests → PR → AI Review → **Human Merge** (🔴 always human).
Before coding an issue: read it, confirm acceptance criteria, create a feature branch, then build.

## Design handoff (UX → Dev)
UX sets the design system, prototypes screens in **Claude Design**, and commits the exported HTML
to `design/` (e.g. `design/result.html`). The engineer then runs *"Fetch the issue and implement it"*
against a design-handoff Issue — the committed HTML is the spec, wired into the app and bound to the
data. RAG status always carries a text label, never colour alone.

## Three-Tier reminder
🔴 Human Decision · 🟡 AI Assist · 🟢 AI Automate. Note: operational RAG status on screen
(network/service health) is a *different* thing from this decision framework — same colours, different meaning.

## Role skills
Role operating manuals live in `.claude/skills/` (ba, pm, dev, ux, tester). Use the one for your seat.
