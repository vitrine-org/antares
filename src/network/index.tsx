import { Index } from "solid-js";
import { mount, useSettings, useSize, useSystem } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { Icon } from "../shared/icons";
import { BODY } from "../shared/fonts";

// Download and upload in the System widget's grammar: a mark, then a label over a
// SemiBold value. The mark is the accent tile of the weather widget with an arrow.

function rate(bytesPerSec: number | undefined, units: string): string {
  if (bytesPerSec === undefined) return "–";
  const bits = units !== "bytes";
  let v = bits ? bytesPerSec * 8 : bytesPerSec;
  const names = bits ? ["bps", "Kbps", "Mbps", "Gbps"] : ["B/s", "KB/s", "MB/s", "GB/s"];
  let i = 0;
  while (v >= 1000 && i < names.length - 1) {
    v /= bits ? 1000 : 1024;
    i++;
  }
  return `${v >= 100 || i === 0 ? v.toFixed(0) : v.toFixed(1)} ${names[i]}`;
}

function Network() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, units: "bits", interval: 2 });
  const l = useLook(s);
  const size = useSize();
  const snap = useSystem(["network"], clamp(s().interval, 1, 10) * 1000);

  const stats = () => [
    { label: "Download", icon: "down" as const, text: rate(snap().network?.rxPerSec, s().units), solid: true },
    { label: "Upload", icon: "up" as const, text: rate(snap().network?.txPerSec, s().units), solid: false },
  ];

  const pad = () => (l().card ? 12 : 4);
  // Each stat is a tile plus about 6 em of label, as the System rings are.
  const tile = () => {
    const byW = (size().width - pad() * 2) / 2 / 3.3;
    return Math.floor(clamp(Math.min(byW, size().height - pad() * 2), 24, 110));
  };
  const fs = () => Math.max(10, Math.round(tile() * 0.28));

  return (
    <Surface l={l()} style={{ flexDirection: "row", alignItems: "center", padding: pad(), fontFamily: BODY }}>
      {(c) => (
        <Index each={stats()}>
          {(st) => (
            <view style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: Math.round(tile() * 0.35) }}>
              {/* Download on the solid accent tile, upload on its outline: the pair reads at a glance. */}
              <view
                style={{
                  width: tile(),
                  height: tile(),
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  ...(st().solid
                    ? { background: c.accent, ...(c.shadow ? { boxShadow: "0 2px 10px rgba(0, 0, 0, 0.28)" } : {}) }
                    : { border: `${Math.max(2, Math.round(tile() * 0.06))}px solid ${c.accent}` }),
                }}
              >
                <Icon name={st().icon} size={Math.round(tile() * 0.56)} color={st().solid ? c.onAccent : c.text} stroke={2} halo={st().solid ? null : c.halo} />
              </view>
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

mount(() => <Network />);
