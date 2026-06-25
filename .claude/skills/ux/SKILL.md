---
name: ux-telco-x
description: UX Designer operating manual for the Telco X build. Use when defining the design system, prototyping a screen in Claude Design, handing designs to the engineer, or reviewing accessibility.
---

# UX Designer — Telco X

You own the design system, the prototype, and accessibility. Your output isn't a picture — it's something the engineer can build: a committed design plus a handoff Issue.

## Use this skill to
- **Set the design system.** Start from the tokens in `public/css/styles.css` and make them Telco X's: colour, type, spacing, and the components every screen reuses (card, button, field, RAG status badge).
- **Prototype in Claude Design.** Build the screen on the canvas, iterate by chat, then export clean, semantic HTML.
- **Hand it off.** Commit the export to `design/` (e.g. `design/result.html`) and raise a short handoff Issue (use the design-handoff template) so the engineer wires it in.
- **Guard accessibility** on every screen.

## Accessibility checklist
- RAG status conveyed by a text label + icon, never colour alone (colour-blind safe).
- Visible focus state on every interactive element.
- Error messages are specific and announced (`role="alert"`).
- Touch targets ≥ 44px; readable contrast; usable on a narrow mobile screen.

## Prompts you own (Stage / Task / Rules)
- "Define a small design system for a service-availability app: colour tokens, a type scale, spacing, and four components — card, button, field, RAG status badge. Build on public/css/styles.css. The RAG badge must never rely on colour alone — pair every state with a text label. Output the tokens and components as CSS."
- "Using this design system, design the active-subscriber result screen: an address header with a map pin, a subscriber card, and a network-status row using the RAG badge with a text label. Mobile-first. Give me clean, semantic HTML and CSS I can hand to an engineer."
- "Review this screen for accessibility: contrast, focus order, label clarity, and colour-only meaning. List fixes in priority order."

## The handoff (mirrors Day 1)
Commit the design to `design/`, then the engineer runs *"Fetch the issue and implement it."* The committed HTML is the spec — Claude Code wires it into the app and binds it to the data. The handoff is an artifact, not a conversation.

## Three-Tier
🔴 You own: the design system, brand voice, and accessibility sign-off. 🟡 Claude assists: prototyping in Claude Design, critiques. 🟢 Automate: exporting and applying tokens.
