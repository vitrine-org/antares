import { mount, useClock, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { timeWords } from "../shared/words";
import { BODY } from "../shared/fonts";

function WordClock() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, align: "left", prefix: true, accentMinutes: false });
  const l = useLook(s);
  const size = useSize();
  const now = useClock("minute");

  const t = () => timeWords(now());
  const pad = () => (l().card ? 16 : 6);
  // Montserrat Regular: about 0.6 em per glyph; leave room for the longest time of the day.
  const fs = () => {
    const longest = (s().prefix ? 8 : 0) + "Twelve.Twenty Seven".length;
    const byW = (size().width - pad() * 2) / (longest * 0.6);
    const byH = (size().height - pad() * 2) / 1.3;
    return Math.floor(clamp(Math.min(byW, byH), 11, 96));
  };
  const align = () => (s().align === "right" ? "flex-end" : s().align === "center" ? "center" : "flex-start");

  return (
    <Surface l={l()} shadow={s().shadow} style={{ flexDirection: "column", justifyContent: "center", alignItems: align(), padding: pad() }}>
      {(c) => (
        <text style={{ fontFamily: BODY, fontSize: fs(), lineHeight: 1.2, color: c.text, whiteSpace: "nowrap" }}>
          {`${s().prefix ? "Time is " : ""}${t().hour}`}
          <span style={{ color: s().accentMinutes ? c.accent : c.text }}>{"." + t().minute}</span>
        </text>
      )}
    </Surface>
  );
}

mount(() => <WordClock />);
