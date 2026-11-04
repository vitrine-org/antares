import { formatDate, mount, useClock, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { BODY, DISPLAY } from "../shared/fonts";

// Days to a date, laid out like the weather widget: the number on the accent tile in
// Metropolis Black, the event told in a Montserrat sentence beside it.

const DAY = 86_400_000;

/** The target from "YYYY-MM-DD" (yearly: the next one from today); with no date, New Year. */
function target(date: string, yearly: boolean, now: Date): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!m) return new Date(now.getFullYear() + 1, 0, 1);
  const t = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (yearly) {
    const next = new Date(now.getFullYear(), t.getMonth(), t.getDate());
    return next < today ? new Date(now.getFullYear() + 1, t.getMonth(), t.getDate()) : next;
  }
  return t;
}

function Countdown() {
  const s = useSettings({
    theme: "dark",
    accent: "#448AFF",
    background: "none",
    shadow: true,
    title: "",
    date: "",
    yearly: false,
  });
  const l = useLook(s);
  const size = useSize();
  const now = useClock("minute");

  const when = () => target(s().date, s().yearly, now());
  const days = () => {
    const d = now();
    const today = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return Math.round((when().getTime() - today) / DAY);
  };
  const name = () => s().title.trim() || (s().date.trim() ? formatDate(when(), "D MMMM") : "New Year");
  const sentence = () => {
    const n = Math.abs(days());
    const on = formatDate(when(), "dddd D MMMM");
    if (days() === 0) return ["is today", on];
    if (days() > 0) return [n === 1 ? "day to go" : "days to go", on];
    return [n === 1 ? "day ago" : "days ago", on];
  };

  const pad = () => (l().card ? 12 : 4);
  // The tile is 3.75 em as in the weather widget; the longest line about 15 em of Montserrat.
  const fs = () => Math.floor(clamp(Math.min((size().width - pad() * 2) / 19.5, (size().height - pad() * 2) / 3.9), 9, 30));
  const tile = () => Math.round(fs() * 3.75);
  const digits = () => String(Math.abs(days())).length;
  const num = () => Math.round(Math.min(tile() * 0.5, (tile() * 0.84) / (digits() * 0.66)));

  return (
    <Surface l={l()} style={{ flexDirection: "row", alignItems: "center", padding: pad(), gap: Math.round(fs() * 1.25), fontFamily: BODY }}>
      {(c) => (
        <>
          <view
            style={{
              width: tile(),
              height: tile(),
              flexShrink: 0,
              background: c.accent,
              alignItems: "center",
              justifyContent: "center",
              ...(c.shadow ? { boxShadow: "0 2px 10px rgba(0, 0, 0, 0.28)" } : {}),
            }}
          >
            <text style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: num(), lineHeight: 1, color: c.onAccent, whiteSpace: "nowrap" }}>
              {String(Math.abs(days()))}
            </text>
          </view>
          <view style={{ flex: 1, minWidth: 0, flexDirection: "column" }}>
            <text style={{ fontWeight: 600, fontSize: Math.round(fs() * 1.15), lineHeight: 1.25, color: c.text, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {name()}
            </text>
            <text style={{ fontSize: fs(), lineHeight: 1.3, color: c.text, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {sentence()[0]}
              <br />
              <span style={{ color: c.text2 }}>{sentence()[1]}</span>
            </text>
          </view>
        </>
      )}
    </Surface>
  );
}

mount(() => <Countdown />);
