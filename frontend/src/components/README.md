# Components

Reusable UI building blocks shared across features.

- `ui/` — ShadCN design-system primitives (button, input, card, dialog…). Base layer.
- `layout/` — app shell: sidebar, top bar, breadcrumbs, page frames.
- `shared/` — cross-feature composite widgets (data-table, empty-state, stat-tile…).

Rule: components here are feature-agnostic. Feature-specific UI lives in `features/*/components`.
