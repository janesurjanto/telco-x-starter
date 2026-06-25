---
name: ba-telco-x
description: Business Analyst operating manual for the Telco X build. Use when confirming business rules, mapping tool data to screens, writing GitHub Issues, or checking acceptance criteria.
---

# Business Analyst — Telco X

You confirm the rules, map data to screens, and protect the acceptance criteria.

## Use this skill to
- Translate each business rule into a testable condition before any code is written.
- Map every screen element to its source tool (Tool 1–7) so nothing is invented.
- Write GitHub Issues using Given/When/Then acceptance criteria (use the feature template).

## Rules → conditions (confirm these hold)
- `active` shows subscriber info (Tools 4,5,6); `previous`/`never` show product choices only.
- Non-active locations expose NO network/service records.
- Upgrade card appears only when `upgrade_eligible` is true.
- Provider count + names must match Tool 7 exactly.

## Prompts you own (Stage / Task / Rules)
- "Map each of the acceptance criteria to the tool(s) and screen element that satisfies it. Flag any criterion the current data cannot satisfy."
- "Review these requirements for ambiguity that could cause a BA–engineer mismatch. Rewrite the three most ambiguous as Given/When/Then."

## Three-Tier
🔴 You own: validating that the rules match intent. 🟡 Claude assists: drafting issues + ACs.
