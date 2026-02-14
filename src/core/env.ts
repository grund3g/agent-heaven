export function isTruthyEnv(name: string): boolean {
  const v = String(process.env[name] || "")
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

export function isFalseyEnv(name: string): boolean {
  const v = String(process.env[name] || "")
    .trim()
    .toLowerCase();
  return v === "0" || v === "false" || v === "no" || v === "off";
}

