import { Index } from "solid-js";
import { mount, useSettings, useSize, useSystem } from "@vitrine/sdk";
import { Surface, clamp, type Look, useLook } from "../shared/look";
import { BODY } from "../shared/fonts";

interface Stat {
  label: string;
  value: number; // 0..100
  text: string;
}

/** A full circle from 12 o'clock, clockwise, so a dash of length L fills L of it. */
const circle = (c: number, r: number) => `M ${c} ${c - r} A ${r} ${r} 0 1 1 ${c} ${c + r} A ${r} ${r} 0 1 1 ${c} ${c - r}`;

function Ring(props: { l: Look; v: number; d: number }) {
  const stroke = () => props.d * (6 / 46);
  const r = () => props.d * (20 / 46);
  const c = () => props.d / 2;
  const len = () => 2 * Math.PI * r();
  const v = () => clamp(props.v, 0, 100) / 100;
  return (
    <svg width={props.d} height={props.d} viewBox={`0 0 ${props.d} ${props.d}`}>
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
  const size = useSize();
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

  const pad = () => (l().card ? 12 : 4);
  // Each stat is a ring plus about 4.5 em of label; the font follows the ring (0.8rem next to 46px in v1).
  const ring = () => {
    const n = stats().length;
    const byW = (size().width - pad() * 2) / n / 2.75;
    return Math.floor(clamp(Math.min(byW, size().height - pad() * 2), 24, 120));
  };
  const fs = () => Math.max(10, Math.round(ring() * 0.28));

  return (
    <Surface l={l()} shadow={s().shadow} style={{ flexDirection: "row", alignItems: "center", padding: pad(), fontFamily: BODY }}>
      {(c) => (
        <Index each={stats()}>
          {(st) => (
            <view style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: Math.round(ring() * 0.35) }}>
              <Ring l={c} v={st().value} d={ring()} />
              <text style={{ fontSize: fs(), lineHeight: 1.25, color: c.text, whiteSpace: "nowrap" }}>
                {st().label}
                <br />
                <span style={{ fontWeight: 600 }}>{st().text}</span>
              </text>
            </view>
          )}
        </Index>
      )}
    </Surface>
  );
}

mount(() => <System />);
