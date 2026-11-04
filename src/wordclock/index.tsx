import { mount, useClock, useSettings } from "@vitrine/sdk";
import { Surface, useLook } from "../shared/look";
import { numberWords, timeWords } from "../shared/words";
import { BODY } from "../shared/fonts";
import { MONTSERRAT_REGULAR as MONTSERRAT } from "../shared/metrics";
import { bearings, capTrim, flexAlign, textWidth, useFit } from "../shared/fit";

// Reference design, in the original theme's CSS pixels: "Time is One.Forty Seven" in
// Montserrat at 1.563rem, line height equal to the font size.
const F = 25;
const PAD = { bare: 8, card: 22 };

// Every hour and minute in words, to size the line for the longest time of the day.
const HOURS = Array.from({ length: 12 }, (_, i) => numberWords(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => numberWords(i));
const widestOf = (words: string[]) => Math.max(...words.map((w) => textWidth(MONTSERRAT, w, F)));

function WordClock() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, align: "left", prefix: true, accentMinutes: false });
  const l = useLook(s);
  const now = useClock("minute");

  const t = () => timeWords(now());
  const line = () => `${s().prefix ? "Time is " : ""}${t().hour}.${t().minute}`;
  const pad = () => (l().card ? PAD.card : PAD.bare);
  const trim = (size: number) => capTrim(MONTSERRAT, size, 1, 0.2);
  const k = useFit(() => {
    const w = (s().prefix ? textWidth(MONTSERRAT, "Time is ", F) : 0) + widestOf(HOURS) + textWidth(MONTSERRAT, ".", F) + widestOf(MINUTES);
    const tr = trim(F);
    return { w: w + 2 * pad(), h: F + tr.marginTop + tr.marginBottom + 2 * pad() };
  });
  const fs = () => F * k();

  return (
    <Surface l={l()} k={k()} style={{ flexDirection: "column", justifyContent: "center", alignItems: flexAlign(s().align), padding: pad() * k() }}>
      {(c) => (
        <text
          style={{
            fontFamily: BODY,
            fontSize: fs(),
            lineHeight: 1,
            color: c.text,
            whiteSpace: "nowrap",
            ...trim(fs()),
            marginLeft: -bearings(MONTSERRAT, line(), fs())[0],
            marginRight: -bearings(MONTSERRAT, line(), fs())[1],
          }}
        >
          {`${s().prefix ? "Time is " : ""}${t().hour}`}
          <span style={{ color: s().accentMinutes ? c.accent : c.text }}>{"." + t().minute}</span>
        </text>
      )}
    </Surface>
  );
}

mount(() => <WordClock />);
