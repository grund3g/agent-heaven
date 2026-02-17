export function normalizeBranchName(value: unknown): string {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return "";
  const stripped = s.startsWith("origin/") ? s.slice("origin/".length) : s;
  return stripped.slice(0, 200);
}

export function normalizeCheckoutMode(value: unknown): "" | "inplace" | "worktree" | "clone" {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!raw) return "";
  if (raw === "inplace" || raw === "in_place" || raw === "in-place" || raw === "project" || raw === "folder") return "inplace";
  if (raw === "worktree" || raw === "worktrees") return "worktree";
  if (raw === "clone" || raw === "checkout" || raw === "dedicated" || raw === "dedicated_checkout") return "clone";
  return "";
}
