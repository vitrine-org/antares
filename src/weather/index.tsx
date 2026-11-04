import { mount, useSettings } from "@vitrine/sdk";
import { Surface, useLook } from "../shared/look";
import { Icon, weatherIcon } from "../shared/icons";
import { describe, emptyMessage, unitSymbol, useWeather } from "../shared/weather";
import { BODY } from "../shared/fonts";
import { MONTSERRAT_REGULAR as MONTSERRAT } from "../shared/metrics";
import { legible, useFit, widest } from "../shared/fit";

// Reference design, in the original theme's CSS pixels: a 3rem accent tile with a 32 px icon,
// 1rem apart from three lines of Montserrat at 0.8rem (line height 1.2).
const TILE = 48;
const ICON = 32;
const GAP = 16;
const TEXT = 12.8;
const LH = 1.2;
const NOTE = 0.85; // "Network unavailable" under the reading, relative to TEXT
const PAD = { bare: 8, card: 20 };
const SAMPLE = ["Today weather in London", "is partly cloudy with temperature 20°C", "it feels like 20°C, and humidity is 100%"];

function Weather() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, city: "London", units: "celsius" });
  const l = useLook(s);
  const w = useWeather(s);
  const u = () => unitSymbol(s().units);
  const d = () => w.data();

  const lines = () =>
    d()
      ? [
          `Today weather in ${d()!.place}`,
          `is ${describe(d()!.code)} with temperature ${d()!.temp}${u()}`,
          `it feels like ${d()!.feels}${u()}, and humidity is ${d()!.humidity}%`,
        ]
      : [emptyMessage(w.error(), w.query())];
  const note = () => !!d() && !!w.error();

  const pad = () => (l().card ? PAD.card : PAD.bare);
  const k = useFit((k) => {
    const fs = legible(TEXT, k);
    const nfs = legible(TEXT * NOTE, k);
    const textW = Math.max(widest(MONTSERRAT, d() ? lines() : SAMPLE, fs), note() ? widest(MONTSERRAT, ["Network unavailable"], nfs) : 0);
    const textH = 3 * fs * LH + (note() ? nfs * LH : 0);
    return { w: TILE + GAP + textW + 2 * pad(), h: Math.max(TILE, textH) + 2 * pad() };
  });
  const fs = () => legible(TEXT, k()) * k();

  return (
    <Surface l={l()} k={k()} style={{ flexDirection: "row", alignItems: "center", padding: pad() * k(), gap: GAP * k(), fontFamily: BODY }}>
      {(c) => (
        <>
          <view
            style={{
              width: TILE * k(),
              height: TILE * k(),
              flexShrink: 0,
              background: c.accent,
              alignItems: "center",
              justifyContent: "center",
              ...(c.shadow ? { boxShadow: `0 ${2 * k()}px ${10 * k()}px rgba(0, 0, 0, 0.28)` } : {}),
            }}
          >
            <Icon name={d() ? weatherIcon(d()!.code, d()!.isDay) : w.error() ? "off" : "loader"} size={ICON * k()} color={c.onAccent} />
          </view>
          <text style={{ fontSize: fs(), lineHeight: LH, color: c.text, whiteSpace: "nowrap" }}>
            {lines().map((t, i) => (i ? [<br />, t] : t))}
            {note() ? (
              <>
                <br />
                <span style={{ color: c.text2, fontSize: legible(TEXT * NOTE, k()) * k() }}>Network unavailable</span>
              </>
            ) : null}
          </text>
        </>
      )}
    </Surface>
  );
}

mount(() => <Weather />);
