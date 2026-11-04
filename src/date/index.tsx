import { formatDate, mount, useClock, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { BODY, DISPLAY } from "../shared/fonts";

// The original themes are English: dates are never translated.
const EN = "en-US";

// Metropolis Black is wide: about 0.6 em per lowercase glyph.
const GLYPH = 0.6;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function DateWidget() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, align: "left", showDate: true });
  const l = useLook(s);
  const size = useSize();
  const now = useClock("minute");

  // Longest weekday / date line of the current language, so the size never changes with the day.
  const longest = (fmt: string, n: number, step: (i: number) => Date) => {
    let w = "";
    for (let i = 0; i < n; i++) {
      const t = formatDate(step(i), fmt, EN);
      if (t.length > w.length) w = t;
    }
    return w;
  };
  const widest = () => longest("dddd", 7, (i) => new Date(2024, 0, 1 + i)).length;
  const widestDate = () => longest("D MMMM YYYY", 12, (i) => new Date(2024, i, 28)).length;

  const day = () => cap(formatDate(now(), "dddd", EN));
  const date = () => formatDate(now(), "D MMMM YYYY", EN);
  const pad = () => (l().card ? 16 : 6);
  const big = () => {
    const avail = size().width - pad() * 2;
    const byDay = avail / ((widest() + 1.5) * GLYPH);
    const byDate = s().showDate ? avail / (widestDate() * GLYPH * 0.262 + 0.2) : Infinity;
    const byW = Math.min(byDay, byDate);
    const byH = (size().height - pad() * 2) / (s().showDate ? 1.32 : 1.05);
    return Math.floor(clamp(Math.min(byW, byH), 18, 200));
  };
  const small = () => Math.max(11, Math.round(big() * 0.262));
  const align = () => (s().align === "right" ? "flex-end" : s().align === "center" ? "center" : "flex-start");

  return (
    <Surface l={l()} shadow={s().shadow} style={{ flexDirection: "column", justifyContent: "center", alignItems: align(), padding: pad() }}>
      {(c) => (
        <>
          <text style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: big(), lineHeight: 1, color: c.text, whiteSpace: "nowrap" }}>
            <span style={{ color: c.accent }}>.</span>
            {day()}
          </text>
          {s().showDate ? (
            <text style={{ fontFamily: BODY, fontWeight: 600, fontSize: small(), lineHeight: 1.2, color: c.text, whiteSpace: "nowrap", marginLeft: s().align === "left" ? Math.round(big() * 0.04) : 0 }}>
              {date()}
            </text>
          ) : null}
        </>
      )}
    </Surface>
  );
}

mount(() => <DateWidget />);
