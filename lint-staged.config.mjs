/**
 * Pre-commit checks on staged files (docs/git/git-workflow.md §13).
 * Prettier resolves each file's nearest config (frontend/.prettierrc.json for
 * frontend files, root for docs), so formatting stays consistent per app.
 * ESLint runs in CI and via `npm --prefix frontend run lint`.
 */
export default {
  "*.{js,jsx,ts,tsx,css,json,md,yml,yaml}": ["prettier --write"],
};
