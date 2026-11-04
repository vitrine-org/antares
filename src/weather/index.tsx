import { mount, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { Icon, weatherIcon } from "../shared/icons";
import { describe, emptyMessage, unitSymbol, useWeather } from "../shared/weather";
import { BODY } from "../shared/fonts";

function Weather() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, city: "London", units: "celsius" });
  const l = useLook(s);
  const size = useSize();
  const w = useWeather(s);

  const pad = () => (l().card ? 12 : 4);
  // The accent tile is 3.75 em; the longest line about 24 em of Montserrat.
  const fs = () => Math.floor(clamp(Math.min((size().width - pad() * 2) / 29, (size().height - pad() * 2) / 4), 9, 20));
  const tile = () => Math.round(fs() * 3.75);
  const u = () => unitSymbol(s().units);
  const d = () => w.data();

  return (
    <Surface l={l()} shadow={s().shadow} style={{ flexDirection: "row", alignItems: "center", padding: pad(), gap: Math.round(fs() * 1.25), fontFamily: BODY }}>
      {(c) => (
        <>
          <view style={{ width: tile(), height: tile(), flexShrink: 0, background: c.accent, alignItems: "center", justifyContent: "center" }}>
            <Icon
              name={d() ? weatherIcon(d()!.code, d()!.isDay) : w.error() ? "off" : "loader"}
              size={Math.round(tile() * 0.66)}
              color={c.onAccent}
            />
          </view>
          <text style={{ flex: 1, fontSize: fs(), lineHeight: 1.25, color: c.text }}>
            {d() ? (
              <>
                {`Today weather in ${d()!.place}`}
                <br />
                {`is ${describe(d()!.code)} with temperature ${d()!.temp}${u()}`}
                <br />
                {`it feels like ${d()!.feels}${u()}, and humidity is ${d()!.humidity}%`}
                {w.error() ? (
                  <>
                    <br />
                    <span style={{ color: c.text2, fontSize: Math.round(fs() * 0.85) }}>Network unavailable</span>
                  </>
                ) : null}
              </>
            ) : (
              emptyMessage(w.error(), w.query())
            )}
          </text>
        </>
      )}
    </Surface>
  );
}

mount(() => <Weather />);
