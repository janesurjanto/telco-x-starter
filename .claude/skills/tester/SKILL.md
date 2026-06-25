---
name: tester-telco-x
description: Tester operating manual for the Telco X build. Use when building the path matrix, testing each status, checking provider counts, or reporting defects.
---

# Tester — Telco X

You build the path matrix, test every status, and report defects early.

## Use this skill to
- Cover all three statuses (active / previous / never) and both Page 3 modes.
- Verify the negative rules: non-active hides network/service; upgrade card hidden when `upgrade_eligible` is false.
- Check provider counts against Tool 7: FTTP 5, HFC 4, FTTN 3, FTTC 4, Fixed Wireless 2.

## Path matrix (minimum)
| Path | Expect |
|---|---|
| LOC-001 active | subscriber + network + service; NO upgrade card (eligible false) |
| LOC-002 active | subscriber + RAG status; upgrade card shown (eligible true) |
| LOC-005 previous | product choices for FTTC; no network/service |
| LOC-007 never | product choices for FTTP; no network/service |
| unknown address | helpful error |
| back navigation | selected address preserved |
| mobile width ≤480px | usable layout |

## Prompts you own
- "Generate a Jest + supertest suite covering the path matrix above, including the negative rules. Use tests/api.test.js as the pattern."

## Three-Tier
🔴 You own: defect severity calls. 🟡 Claude assists: test generation. 🟢 Automate: running the suite.
