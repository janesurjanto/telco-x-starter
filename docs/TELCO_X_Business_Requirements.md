# Telco-X — Business Requirements Document
**Version:** 1.0  
**Date:** 25 June 2026  
**Author:** Business Analyst Review (derived from DESIGN_SYSTEM.md + Acceptance Criteria)  
**Status:** Baselined — gaps identified and resolved

---

## 1. Purpose & Scope

This document defines the complete set of Business Requirements for the **Telco-X Service Availability Demo** — a responsive web application that allows a user to look up a service address, determine whether that address is an active subscriber or a prospective one, and view the appropriate detail screens for network status or available products.

The requirements are derived from:
- The project design system (`DESIGN_SYSTEM.md`)
- The UX operating manual (`ux-telco-x SKILL.md`)
- The ten Acceptance Criteria (AC-01 through AC-10) supplied by the Product Owner

---

## 2. Glossary

| Term | Definition |
|------|-----------|
| **Active address** | An address that has an existing subscriber account with live network services |
| **Non-active address** | An address that is in the coverage area but has no current subscriber |
| **RAG badge** | Red / Amber / Green status indicator, always paired with a text label (never colour alone) |
| **Provider** | A network or service provider associated with a plan or product |
| **Map pin** | A visual marker rendered on an embedded map component indicating the resolved address |
| **Unknown address** | A search input that cannot be resolved to any address in the data set |

---

## 3. Acceptance Criteria Traceability Matrix

| AC# | Acceptance Criterion | Linked BRs |
|-----|---------------------|-----------|
| AC-01 | All ten addresses can be searched or selected | BR-01, BR-02, BR-03 |
| AC-02 | Unknown address shows a helpful error | BR-04, BR-05 |
| AC-03 | Result page shows the right address + map pin | BR-06, BR-07 |
| AC-04 | Active shows subscriber, network & service | BR-08, BR-09, BR-10, BR-11 |
| AC-05 | Non-active shows valid product choices | BR-12, BR-13, BR-14 |
| AC-06 | Detail and provider views open correctly | BR-15, BR-16 |
| AC-07 | Provider names and count match the data | BR-17, BR-18 |
| AC-08 | Back navigation keeps the selected address | BR-19, BR-20 |
| AC-09 | Works on laptop and mobile, clearly labelled | BR-21, BR-22, BR-23 |
| AC-10 | Demo one active + one non-active journey | BR-24, BR-25 |

---

## 4. Business Requirements

### 4.1 Address Search & Selection (AC-01)

**BR-01 — Fixed Address Dataset**  
The application shall include a fixed dataset of exactly ten (10) pre-defined service addresses. These addresses shall be the only valid inputs the system resolves successfully.

**BR-02 — Free-Text Search**  
The application shall provide a free-text search field on the home/search screen. As the user types, the system shall offer auto-complete suggestions drawn from the ten addresses in the dataset. Selection of a suggestion shall navigate to the Result page for that address.

**BR-03 — Selectable Address List**  
In addition to free-text search, the application shall provide a browseable, selectable list of all ten addresses (e.g., a dropdown or address picker) so a user can select an address without typing. All ten addresses must be reachable via this mechanism.

---

### 4.2 Unknown Address Handling (AC-02)

**BR-04 — Unknown Address Detection**  
If the user submits a search query that does not match any of the ten addresses in the dataset, the system shall detect the non-match and shall not navigate away from the search screen.

**BR-05 — Helpful Error Message**  
When an unknown address is submitted, the system shall display an inline error message that:
- Is specific and actionable (e.g., "We couldn't find that address. Please check the spelling or choose from the list below.")
- Is announced programmatically via `role="alert"` so screen readers detect it immediately
- Does not clear the user's input, allowing them to correct and re-try
- Does not display a generic system error or empty state

---

### 4.3 Result Page — Address Header & Map (AC-03)

**BR-06 — Address Confirmation Header**  
On navigating to the Result page, the system shall display the resolved address in a clearly labelled header/title component at the top of the page. The displayed address must exactly match the address the user searched for or selected.

**BR-07 — Map Pin Component**  
The Result page shall include an embedded map view with a pin/marker placed at the geographic coordinates of the resolved address. The map pin must be visually distinct and the address must be readable alongside or within the map component. The map component shall be labelled accessibly (`aria-label` or equivalent).

---

### 4.4 Active Subscriber View (AC-04)

**BR-08 — Active Status Detection**  
The application shall determine, from the dataset, whether the resolved address is an active subscriber. If active, the Result page shall render the Active Subscriber view.

**BR-09 — Subscriber Information Card**  
The Active view shall display a subscriber card containing at minimum: the subscriber account identifier (or name), the service address confirmed, and the account status (active).

**BR-10 — Network Status Display**  
The Active view shall display current network status information using the RAG (Red/Amber/Green) badge component. Each RAG badge must be paired with a text label (e.g., "Operational", "Degraded", "Outage") — colour alone is not sufficient. This satisfies colour-blind accessibility requirements.

**BR-11 — Service Summary Row**  
The Active view shall display a service summary row listing the active services provisioned at the address (e.g., broadband tier, voice, data speed). This row shall be visually distinct from the network status row.

---

### 4.5 Non-Active / Prospective Address View (AC-05)

**BR-12 — Non-Active Status Detection**  
If the resolved address is not an active subscriber, the Result page shall render the Non-Active / Prospective view.

**BR-13 — Available Product Choices**  
The Non-Active view shall display a list or set of cards showing the available products or plans that can be provisioned at the address. Each product card shall include at minimum: product name, provider name, and a brief description or key attribute (e.g., speed tier or price).

**BR-14 — Product Data Validity**  
All products displayed shall be drawn from the verified product/provider dataset associated with the address. No placeholder or dummy product data may appear in a production or demo build.

---

### 4.6 Detail & Provider Views (AC-06)

**BR-15 — Service Detail View**  
From the Active or Non-Active Result page, the user shall be able to open a Detail view for a specific service or product. This view shall open without full page reload (modal, drawer, or nested route are all acceptable) and shall display extended information about that item.

**BR-16 — Provider View**  
From the Non-Active Result page, the user shall be able to open a Provider view that lists all products/plans available from a specific provider at the resolved address. This view shall open and close correctly without data loss or navigation errors.

---

### 4.7 Provider Data Accuracy (AC-07)

**BR-17 — Provider Name Accuracy**  
All provider names displayed in the application shall exactly match the provider names in the underlying dataset. No truncation, abbreviation, or placeholder values are permitted.

**BR-18 — Provider Count Accuracy**  
The count of providers displayed on any screen (e.g., "3 providers available") shall exactly match the number of distinct providers in the dataset for that address. The count shall update correctly if the dataset changes.

---

### 4.8 Back Navigation & State Persistence (AC-08)

**BR-19 — Back Navigation**  
The application shall provide a Back navigation control on all secondary screens (Detail view, Provider view). Activating Back shall return the user to the Result page for the address they had selected.

**BR-20 — Address State Preservation**  
When the user navigates Back from a Detail or Provider view, the Result page shall retain the previously resolved address and its rendered state (Active or Non-Active view). The user shall not be returned to the search screen, and shall not need to re-search.

---

### 4.9 Responsive Design & Accessibility (AC-09)

**BR-21 — Responsive Layout**  
The application shall render correctly and be fully usable on:
- **Desktop / laptop:** minimum viewport width of 1024px
- **Mobile:** minimum viewport width of 375px (iPhone SE equivalent)

All components — search field, address list, result cards, map, RAG badges, navigation controls — shall reflow and remain legible at both breakpoints.

**BR-22 — Labelling & Clarity**  
All interactive elements shall be clearly labelled:
- Buttons must have visible text labels (icon-only buttons are not permitted unless accompanied by a visible tooltip and `aria-label`)
- Form fields must have associated `<label>` elements
- Navigation landmarks must use semantic HTML (`<nav>`, `<main>`, `<header>`) or ARIA equivalents

**BR-23 — Minimum Touch Target Size**  
All interactive elements (buttons, links, list items) shall have a minimum touch target size of 44×44px on mobile viewports, in accordance with WCAG 2.1 AA success criterion 2.5.5.

---

### 4.10 Demo Journey Coverage (AC-10)

**BR-24 — Active Journey Demo**  
The application shall support a complete, end-to-end demonstration of the Active Subscriber journey: search or select an active address → view address + map pin → view subscriber card, network RAG status, and service summary → open Detail view → return via Back navigation.

**BR-25 — Non-Active Journey Demo**  
The application shall support a complete, end-to-end demonstration of the Non-Active Prospective journey: search or select a non-active address → view address + map pin → view available products → open Provider view → return via Back navigation.

At least one address in the dataset shall be designated Active and at least one shall be designated Non-Active so both journeys are demonstrable simultaneously.

---

## 5. Gap Analysis & Resolutions

The following gaps were identified between the original Acceptance Criteria and the design system documentation. Each gap has been resolved by the requirements above.

| # | Gap Identified | Resolution |
|---|---------------|-----------|
| G-01 | No explicit requirement for auto-complete vs. dropdown list — AC-01 says "searched or selected" but didn't specify both mechanisms were needed simultaneously | BR-02 and BR-03 mandate both mechanisms, ensuring AC-01 is unambiguous |
| G-02 | AC-02 says "helpful error" but gave no specification of what "helpful" means in terms of content, ARIA, or input retention | BR-05 specifies message content standards, `role="alert"`, and input retention |
| G-03 | AC-03 references a "map pin" but no map provider, coordinate source, or accessibility requirement was specified | BR-07 adds `aria-label` requirement and specifies the pin must use dataset-supplied coordinates |
| G-04 | AC-04 lists "subscriber, network & service" but the RAG badge colour-only risk was not addressed in the ACs | BR-10 explicitly mandates text label pairing for every RAG badge, cross-referencing the UX skill accessibility rule |
| G-05 | AC-05 says "valid product choices" but no rule prevented placeholder/dummy data from appearing | BR-14 explicitly prohibits placeholder data in demo and production builds |
| G-06 | AC-06 says "open correctly" without specifying navigation pattern (modal vs. route) or whether data is lost on open/close | BR-15 and BR-16 specify "without full page reload" and "without data loss or navigation errors" |
| G-07 | AC-07 says provider names and count "match the data" but did not define what constitutes a match (truncation, abbreviation) | BR-17 prohibits truncation/abbreviation; BR-18 specifies the count derives from distinct providers per address |
| G-08 | AC-08 says "keeps the selected address" but did not specify whether the full rendered state (Active/Non-Active view) was also preserved | BR-20 explicitly preserves the full rendered state, not just the address string |
| G-09 | AC-09 says "clearly labelled" but gave no minimum standards for labelling, ARIA, or touch targets | BR-22 and BR-23 add semantic HTML requirements and 44×44px minimum touch targets |
| G-10 | AC-10 requires demo of both journeys but no requirement specified that both journey types must exist in the dataset | BR-25 mandates at minimum one Active and one Non-Active address in the dataset |

---

## 6. Non-Functional Requirements

The following non-functional requirements are implied by the acceptance criteria and design system but were not explicitly stated. They are included here to avoid implementation ambiguity.

**NFR-01 — Colour Contrast**  
All text shall meet WCAG 2.1 AA contrast ratios: minimum 4.5:1 for body text, 3:1 for large text and UI components.

**NFR-02 — Focus States**  
Every interactive element shall have a visible focus indicator (outline or equivalent) that is not suppressed by CSS `outline: none` without a replacement.

**NFR-03 — No Functional Dependency on Colour**  
No functional information (status, error, availability) shall be communicated by colour alone. A text label, icon, or pattern must always accompany colour-coded information.

**NFR-04 — Performance**  
The application shall load and become interactive within 3 seconds on a standard broadband connection (10 Mbps). Address search results shall appear within 500ms of user input (client-side filtering from the 10-address dataset).

**NFR-05 — Data Source Integrity**  
All displayed data (addresses, subscriber details, products, providers, network status) shall be sourced from a single, versioned data file or module. Hardcoded values scattered across components are not permitted.

---

## 7. Out of Scope

The following items are explicitly out of scope for this release:

- Real-time network monitoring or live API integration with a telco back-end
- User authentication or account management
- Address data beyond the ten pre-defined demo addresses
- Payment or ordering flows for products displayed on the Non-Active view
- Internationalisation (i18n) or multi-language support
- Automated testing suite (deferred to a future sprint)

---

## 8. Sign-Off

| Role | Name | Date |
|------|------|------|
| Product Owner | | |
| Business Analyst | | |
| UX Lead | | |
| Engineering Lead | | |
