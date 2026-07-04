/**
 * Conventional Commits enforcement (docs/git/git-workflow.md §6).
 * Format: <type>(<scope>): <subject>
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "subject-case": [0], // allow flexible subject casing
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [0], // allow detailed multi-line bodies
    "footer-max-line-length": [0], // allow long footers (Co-Authored-By, links)
  },
};
