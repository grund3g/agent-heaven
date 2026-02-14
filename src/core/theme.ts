export type UiTheme = "heaven" | "nord" | "gruvbox" | "solarized" | "dracula" | "ocean";
export type UiColorScheme = "dark" | "light" | "system";
export type EffectiveColorScheme = "dark" | "light";

export function normalizeTheme(value: unknown): UiTheme {
  const t = String(value || "")
    .trim()
    .toLowerCase();
  if (t === "heaven" || t === "nord" || t === "gruvbox" || t === "solarized" || t === "dracula" || t === "ocean") {
    return t as UiTheme;
  }
  return "heaven";
}

export function windowBgForTheme(value: unknown): string {
  const t = normalizeTheme(value);
  if (t === "nord") return "#2e3440";
  if (t === "gruvbox") return "#282828";
  if (t === "solarized") return "#002b36";
  if (t === "dracula") return "#282a36";
  if (t === "ocean") return "#082234";
  return "#0f1417";
}

export function normalizeColorScheme(value: unknown): UiColorScheme {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (v === "light" || v === "dark" || v === "system") return v as UiColorScheme;
  return "dark";
}

export function effectiveColorScheme(
  value: unknown,
  opts?: { systemScheme?: EffectiveColorScheme }
): EffectiveColorScheme {
  const pref = normalizeColorScheme(value);
  if (pref !== "system") return pref;
  return opts && opts.systemScheme ? opts.systemScheme : "dark";
}

export function windowBgForSettings(settings: unknown, opts?: { systemScheme?: EffectiveColorScheme }): string {
  const s = settings && typeof settings === "object" ? (settings as any) : {};
  const scheme = effectiveColorScheme(s.uiColorScheme, opts);
  if (scheme === "light") return "#eef2f6";
  return windowBgForTheme(s.uiTheme);
}
