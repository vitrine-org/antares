import { Index } from "solid-js";
import { formatDate, localeInfo, mount, useClock, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { BODY, DISPLAY } from "../shared/fonts";

// The month as Antares writes the weekday: “.November” in Metropolis Black, then a bare
// Montserrat grid where today sits on the accent tile of the weather widget.

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Cell {
  day: number; // 0 = blank
  past: boolean;
  today: boolean;
}

function Calendar() {
  const s = useSettings({
    theme: "dark",
    accent: "#448AFF",
    background: "none",
    shadow: true,
    firstDayOfWeek: "auto",
    showYear: false,
    dimPast: true,
  });
  const l = useLook(s);
  const size = useSize();
  const now = useClock("minute");

  const first = () => (s().firstDayOfWeek === "auto" ? localeInfo().firstDayOfWeek : Number(s().firstDayOfWeek)) || 0;
  const cells = (): Cell[] => {
    const d = now();
    const y = d.getFullYear();
    const m = d.getMonth();
    const lead = (new Date(y, m, 1).getDay() - first() + 7) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const out: Cell[] = [];
    for (let i = 0; i < lead; i++) out.push({ day: 0, past: false, today: false });
    for (let i = 1; i <= days; i++) out.push({ day: i, past: i < d.getDate(), today: i === d.getDate() });
    while (out.length % 7) out.push({ day: 0, past: false, today: false });
    return out;
  };
  const weeks = () => cells().length / 7;
  const month = () => cap(formatDate(now(), "MMMM"));

  const pad = () => (l().card ? 16 : 6);
  const innerW = () => size().width - pad() * 2;
  const innerH = () => size().height - pad() * 2;
  // Height in units of the day size: heading 2.3, weekday row 1.6, each week 1.9.
  const fs = () => {
    const byH = innerH() / (2.3 + 1.6 + weeks() * 1.9);
    const byW = innerW() / 7 / 1.9;
    return Math.floor(clamp(Math.min(byH, byW), 8, 40));
  };
  // Metropolis Black is wide: about 0.6 em per glyph, plus the dot.
  const head = () => Math.floor(Math.min(fs() * 2.2, innerW() / ((month().length + 0.6 + (s().showYear ? 5 : 0)) * 0.6)));
  const heads = () => {
    const names = localeInfo().daysShort;
    const n = innerW() / 7 > fs() * 2.2 ? 3 : 1;
    return Array.from({ length: 7 }, (_, i) => cap((names[(first() + i) % 7] ?? "").slice(0, n)));
  };
  const tile = () => Math.round(fs() * 1.75);

  return (
    <Surface l={l()} style={{ flexDirection: "column", justifyContent: "center", padding: pad(), fontFamily: BODY }}>
      {(c) => (
        <>
          <view style={{ height: fs() * 2.3, flexShrink: 0, flexDirection: "column", justifyContent: "flex-end" }}>
            <text style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: head(), lineHeight: 1, color: c.text, whiteSpace: "nowrap" }}>
              <span style={{ color: c.accent }}>.</span>
              {month()}
              {s().showYear ? <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: Math.round(head() * 0.4) }}>{"  " + now().getFullYear()}</span> : null}
            </text>
          </view>
          <view style={{ flexDirection: "row", height: fs() * 1.6, alignItems: "flex-end", paddingBottom: fs() * 0.25, flexShrink: 0 }}>
            <Index each={heads()}>
              {(h) => (
                <text style={{ flex: 1, fontWeight: 600, fontSize: Math.max(8, Math.round(fs() * 0.8)), color: c.text2, textAlign: "center", whiteSpace: "nowrap" }}>
                  {h()}
                </text>
              )}
            </Index>
          </view>
          <view style={{ flexDirection: "row", flexWrap: "wrap", flexShrink: 0 }}>
            <Index each={cells()}>
              {(cell) => (
                <view style={{ width: `${100 / 7}%`, height: fs() * 1.9, alignItems: "center", justifyContent: "center" }}>
                  {cell().today ? (
                    <view
                      style={{
                        position: "absolute",
                        width: tile(),
                        height: tile(),
                        background: c.accent,
                        ...(c.shadow ? { boxShadow: "0 2px 10px rgba(0, 0, 0, 0.28)" } : {}),
                      }}
                    />
                  ) : null}
                  {cell().day ? (
                    <text
                      style={{
                        fontSize: fs(),
                        fontWeight: cell().today ? 600 : 400,
                        lineHeight: 1,
                        color: cell().today ? c.onAccent : cell().past && s().dimPast ? c.text3 : c.text,
                        textShadow: cell().today ? "none" : undefined,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {String(cell().day)}
                    </text>
                  ) : null}
                </view>
              )}
            </Index>
          </view>
        </>
      )}
    </Surface>
  );
}

mount(() => <Calendar />);
