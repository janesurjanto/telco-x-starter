---
name: Design handoff
about: Wire a UX prototype (from Claude Design) into the app
title: "[Design] Wire <screen> into the app"
labels: design, feature
---

## Summary
Wire the UX <screen> design into the app.

## Background
The <screen> is designed and committed at `design/<file>.html`, built on our design
system. Wire it into the Express app so it renders, then bind it to the relevant data.

## Acceptance Criteria
- [ ] GET /<route> renders design/<file>.html
- [ ] The screen is populated from the correct endpoint(s)
- [ ] RAG status shows a text label, not colour alone
- [ ] Usable on a narrow mobile screen

## Out of Scope
- The endpoint(s) themselves — covered by their own Issue(s)
