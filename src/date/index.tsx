import { formatDate, mount, useClock, useSettings } from "@vitrine/sdk";
import { Surface, useLook } from "../shared/look";
import { BODY, DISPLAY } from "../shared/fonts";
import { METROPOLIS_BLACK as METRO, MONTSERRAT_SEMIBOLD as SEMI } from "../shared/metrics";
import { bearings, flexAlign, legible, textWidth, useFit } from "../shared/fit";

// The original themes are English: dates are never translated.
const EN = "en-US";

// Reference design, in the original theme's CSS pixels: the weekday in Metropolis Black at
// 4.768rem after an accent dot, the date in Montserrat SemiBold at 1.25rem right below, both
// with a line height equal to the font size.
const BIG = 76.3;
const SMALL = 20;
const PAD = { bare: 8, card: 22 };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => "." + cap(formatDate(new Date(2024, 0, 1 + i), "dddd", EN)));
const DATES = Array.from({ length: 12 }, (_, i) => formatDate(new Date(2024, i, 28), "D MMMM", EN));

const ink = (f: typeof METRO, t: string, size: number) => {
  const [l, r] = bearings(f, t, size);
  return textWidth(f, t, size) - l - r;
};

function DateWidget() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, align: "left", showDate: true });
  const l = useLook(s);
  const now = useClock("minute");

  const day = () => "." + cap(formatDate(now(), "dddd", EN));
  const date = () => formatDate(now(), "D MMMM YYYY", EN);
  const year = () => formatDate(now(), "YYYY", EN);
  const pad = () => (l().card ? PAD.card : PAD.bare);
  // The weekday's line box starts above the capitals: crop it so the padding is optical.
  const top = (METRO.cap / 1000 - 0.8) * BIG;

  // Sized for the longest weekday and date, so the text never changes size with the day.
  const k = useFit((k) => {
    const small = legible(SMALL, k);
    const w = Math.max(...WEEKDAYS.map((t) => ink(METRO, t, BIG)), s().showDate ? Math.max(...DATES.map((t) => ink(SEMI, `${t} ${year()}`, small))) : 0);
    return { w: w + 2 * pad(), h: BIG + top + (s().showDate ? small : 0) + 2 * pad() };
  });
  const big = () => BIG * k();
  const small = () => legible(SMALL, k()) * k();
  const margins = (f: typeof METRO, t: string, size: number) => {
    const [bl, br] = bearings(f, t, size);
    return { marginLeft: -bl, marginRight: -br };
  };

  return (
    <Surface l={l()} k={k()} style={{ flexDirection: "column", justifyContent: "center", alignItems: flexAlign(s().align), padding: pad() * k() }}>
      {(c) => (
        <>
          <text
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: big(),
              lineHeight: 1,
              color: c.text,
              whiteSpace: "nowrap",
              marginTop: top * k(),
              ...margins(METRO, day(), big()),
            }}
          >
            <span style={{ color: c.accent }}>.</span>
            {day().slice(1)}
          </text>
          {s().showDate ? (
            <text style={{ fontFamily: BODY, fontWeight: 600, fontSize: small(), lineHeight: 1, color: c.text, whiteSpace: "nowrap", ...margins(SEMI, date(), small()) }}>
              {date()}
            </text>
          ) : null}
        </>
      )}
    </Surface>
  );
}

mount(() => <DateWidget />);
