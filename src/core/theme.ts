export type UiTheme = "heaven";
export type UiColorScheme = "dark" | "light";
export type EffectiveColorScheme = "dark" | "light";

export function normalizeTheme(value: unknown): UiTheme {
  const t = String(value || "")
    .trim()
    .toLowerCase();
  if (t === "heaven") return "heaven";
  return "heaven";
}

export function windowBgForTheme(value: unknown): string {
  normalizeTheme(value);
  return "#0f1417";
}

export function normalizeColorScheme(value: unknown): UiColorScheme {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (v === "light" || v === "dark") return v as UiColorScheme;
  return "dark";
}

export function effectiveColorScheme(
  value: unknown,
  opts?: { systemScheme?: EffectiveColorScheme }
): EffectiveColorScheme {
  const pref = normalizeColorScheme(value);
  void opts;
  return pref;
}

export function windowBgForSettings(settings: unknown, opts?: { systemScheme?: EffectiveColorScheme }): string {
  const s = settings && typeof settings === "object" ? (settings as any) : {};
  const scheme = effectiveColorScheme(s.uiColorScheme, opts);
  if (scheme === "light") return "#eef2f6";
  return windowBgForTheme(s.uiTheme);
}
