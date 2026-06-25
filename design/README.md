# design/ — UX prototypes & design system

This is where the **UX designer** commits exported prototypes from **Claude Design**.

## The UX → Dev handoff
1. UX sets the design system (building on `../public/css/styles.css`).
2. UX prototypes a screen in **Claude Design**, then exports clean HTML here (e.g. `result.html`).
3. UX raises a **design-handoff** Issue (`.github/ISSUE_TEMPLATE/design-handoff.md`).
4. The engineer runs *"Fetch the issue and implement it"* — Claude Code wires the committed HTML
   into the Express app and binds it to the data.

The handoff is an **artifact, not a conversation**: committed HTML + an Issue.
RAG status must always carry a text label — never colour alone.

*(This folder starts empty — the prototype is the UX designer's deliverable to create.)*
