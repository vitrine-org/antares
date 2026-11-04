import { Index } from "solid-js";
import { mount, useSettings, useSystem } from "@vitrine/sdk";
import { Surface, clamp, type Look, useLook } from "../shared/look";
import { BODY } from "../shared/fonts";
import { MONTSERRAT_REGULAR as REGULAR, MONTSERRAT_SEMIBOLD as SEMI } from "../shared/metrics";
import { legible, MIN_VALUE, textWidth, useFit } from "../shared/fit";
import { Tabular, tabularWidth } from "../shared/num";

// Reference design, in the original theme's CSS pixels: a 46 px ring (radius 20, stroke 6)
// 1rem from its label and value in Montserrat at 0.8rem (line height 1.2), each stat at least
// 120 px wide. Spare width spreads the stats out.
const RING = 46;
const R = 20;
const STROKE = 6;
const GAP = 16;
const TEXT = 12.8;
const LH = 1.2;
const MIN_STAT = 120;
const SPACING = 4;
const PAD = { bare: 8, card: 20 };

interface Stat {
  label: string;
  value: number; // 0..100
  text: string;
}

/** A full circle from 12 o'clock, clockwise, so a dash of length L fills L of it. */
const circle = (c: number, r: number) => `M ${c} ${c - r} A ${r} ${r} 0 1 1 ${c} ${c + r} A ${r} ${r} 0 1 1 ${c} ${c - r}`;

function Ring(props: { l: Look; v: number; k: number }) {
  const d = () => RING * props.k;
  const stroke = () => STROKE * props.k;
  const r = () => R * props.k;
  const c = () => d() / 2;
  const len = () => 2 * Math.PI * r();
  const v = () => clamp(props.v, 0, 100) / 100;
  return (
    <svg width={d()} height={d()} viewBox={`0 0 ${d()} ${d()}`}>
      {props.l.halo ? <path d={circle(c(), r())} fill="none" stroke={props.l.halo} strokeWidth={stroke() * 1.4} /> : null}
      <path d={circle(c(), r())} fill="none" stroke={props.l.track} strokeWidth={stroke()} />
      <path
        d={circle(c(), r())}
        fill="none"
        stroke={props.l.accent}
        strokeWidth={stroke()}
        strokeLinecap="round"
        strokeDasharray={`${len() * v()} ${len() + stroke() * 2}`}
        opacity={v() > 0.005 ? 1 : 0}
        style={{ transition: "stroke-dasharray 600ms ease" }}
      />
    </svg>
  );
}

const pct = (v: number) => `${v < 10 ? v.toFixed(1) : Math.round(v)}%`;

function System() {
  const s = useSettings({
    theme: "dark",
    accent: "#448AFF",
    background: "none",
    shadow: true,
    showBattery: true,
    showDisk: false,
    drive: "C",
    interval: 2,
  });
  const l = useLook(s);
  const snap = useSystem(["cpu", "memory", "battery", "drives"], clamp(s().interval, 1, 30) * 1000);

  const stats = (): Stat[] => {
    const { cpu, memory, battery, drives } = snap();
    const mem = memory && memory.total > 0 ? (memory.used / memory.total) * 100 : 0;
    const out: Stat[] = [
      { label: "CPU", value: cpu?.usage ?? 0, text: cpu ? pct(cpu.usage) : "–" },
      { label: "RAM", value: mem, text: memory ? `${Math.round(mem)}%` : "–" },
    ];
    if (s().showDisk) {
      const letter = (s().drive || "C").toUpperCase();
      const d = drives?.find((x) => x.name.toUpperCase().startsWith(letter + ":"));
      const v = d && d.total > 0 ? (d.used / d.total) * 100 : 0;
      out.push({ label: `Disk ${letter}:`, value: v, text: d ? `${Math.round(v)}%` : "–" });
    }
    if (s().showBattery && battery?.hasBattery) {
      const lv = battery.level ?? 0;
      out.push({ label: "Battery", value: lv, text: battery.charging ? "Charging" : `${Math.round(lv)}%` });
    }
    return out;
  };

  const pad = () => (l().card ? PAD.card : PAD.bare);
  const label = (k: number) => legible(TEXT, k);
  const value = (k: number) => legible(TEXT, k, MIN_VALUE);
  // Every stat as wide as the widest one can get ("100%", "Charging", the longest label).
  const statW = (k: number) => {
    const texts = Math.max(
      ...stats().map((st) => textWidth(REGULAR, st.label, label(k))),
      tabularWidth(SEMI, "100%", value(k)),
      textWidth(SEMI, "Charging", value(k)),
    );
    return Math.max(MIN_STAT, RING + GAP + texts);
  };
  const k = useFit((k) => {
    const n = stats().length;
    return { w: n * statW(k) + (n - 1) * SPACING + 2 * pad(), h: Math.max(RING, (label(k) + value(k)) * LH) + 2 * pad() };
  });

  return (
    <Surface l={l()} k={k()} style={{ flexDirection: "row", alignItems: "center", padding: pad() * k(), gap: SPACING * k(), fontFamily: BODY }}>
      {(c) => (
        <Index each={stats()}>
          {(st) => (
            <view style={{ flex: 1, minWidth: statW(k()) * k(), flexDirection: "row", alignItems: "center", gap: GAP * k() }}>
              <Ring l={c} v={st().value} k={k()} />
              <view style={{ flexDirection: "column" }}>
                <text style={{ fontSize: label(k()) * k(), lineHeight: LH, color: c.text, whiteSpace: "nowrap" }}>{st().label}</text>
                <Tabular f={SEMI} text={st().text} size={value(k()) * k()} style={{ fontWeight: 600, lineHeight: LH, color: c.text }} />
              </view>
            </view>
          )}
        </Index>
      )}
    </Surface>
  );
}

mount(() => <System />);
