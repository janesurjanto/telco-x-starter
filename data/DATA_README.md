# Telco X — Mock Tool Files (Data Dictionary)

Seven read-only mock data sources for the Day 2 build challenge. Treat each as a mock API.

| Tool | File | Scope | Key |
|---|---|---|---|
| 1 | tool1_locations.json | all 10 locations | `id` (LOC-00x) |
| 2 | tool2_technology.json | all 10 locations | `location_id` |
| 3 | tool3_products.json | catalogue | keyed by `technology` |
| 4 | tool4_subscriber.json | ACTIVE only (4) | `location_id` |
| 5 | tool5_network.json | ACTIVE only (4) | `location_id` |
| 6 | tool6_service.json | ACTIVE only (4) | `location_id` |
| 7 | tool7_providers.json | catalogue | keyed by `technology` |

## Status mix (AC 12 — at least one active + one non-active journey)
- **active (4):** LOC-001, LOC-002, LOC-003, LOC-004
- **previous (3):** LOC-005, LOC-006, LOC-009
- **never (3):** LOC-007, LOC-008, LOC-010

## Coverage notes
- All five technologies represented (FTTP, HFC, FTTN, FTTC, Fixed Wireless).
- `upgrade_eligible`: **true** at LOC-002, LOC-003; **false** at LOC-001, LOC-004 — exercises the "no upgrade card when false" rule.
- Network/service RAG spans green/amber/red across the 4 active locations.
- Non-active locations have NO entries in Tools 4/5/6 — enforces "do not show network/service records for a non-active location."
- Provider counts vary by technology (5/4/3/4/2) — gives the Tester a real count check for AC 8.
