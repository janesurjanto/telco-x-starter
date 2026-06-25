# Telco X Starter — Day 2 Build Challenge

A minimal, runnable scaffold. **Page 1 works out of the box**; Pages 2 and 3, and the Tool 2–7
endpoints, are yours to build. The build work is deliberately left in — only the plumbing is done.

## Quick start
```bash
npm install
npm start          # http://localhost:3000
npm test           # Jest + supertest
```

## Layout
```
data/        the seven tool files tool1_locations.json … tool7_providers.json (read-only) + DATA_README.md
lib/data.js  data access layer (getters provided)
server.js    Express — 2 worked endpoints, 6 guided TODOs
public/      frontend — Page 1 works; Pages 2 & 3 are shells
design/      UX prototypes from Claude Design land here (the UX → Dev handoff)
tests/       Jest — worked tests + a skipped path-matrix block for the Tester
.claude/skills/  role operating manuals (BA, PM, Dev, UX, Tester)
.github/ISSUE_TEMPLATE/  feature + defect + design-handoff templates
```

## Your job
Build the three pages against the business rules and the ten acceptance criteria in the
Challenge Brief. Connect Tools 1–6 (Pages 1–2), then Tool 7 (Page 3 providers). Test every
status path, invalid search, mobile layout, and back navigation. Demo one active and one
non-active journey.

CLAUDE.md is the operating manual for Claude Code. Start there.
