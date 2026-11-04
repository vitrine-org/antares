// Tabular figures for fonts whose digits have proportional widths: every digit gets the box of
// the widest one, so changing values do not shift the text around them.
import { For } from "solid-js";
import type { Style } from "@vitrine/sdk";
import type { FontData } from "./metrics";
import { textWidth } from "./fit";

const DIGITS = "0123456789";

/** Width in px of the widest digit of `f` at `size`. */
export const digitWidth = (f: FontData, size: number) => Math.max(...[...DIGITS].map((d) => textWidth(f, d, size)));

/** Width of `text` at `size` with tabular digits and `track` em of letter spacing. */
export const tabularWidth = (f: FontData, text: string, size: number, track = 0) =>
  [...text].reduce((a, ch) => a + (DIGITS.includes(ch) ? digitWidth(f, size) : textWidth(f, ch, size)) + track * size, 0) - track * size;

/**
 * `text` on one line with each digit centred in a box of the widest digit. `track` is letter
 * spacing in em; the spacing after the last character is cropped.
 */
export function Tabular(props: { f: FontData; text: string; size: number; track?: number; style: Style }) {
  const ls = () => (props.track ?? 0) * props.size;
  const runs = () => props.text.match(/\d|\D+/g) ?? [];
  return (
    <view style={{ flexDirection: "row", alignItems: "flex-start", flexShrink: 0, marginRight: -ls() }}>
      <For each={runs()}>
        {(r) =>
          DIGITS.includes(r) ? (
            <view style={{ width: digitWidth(props.f, props.size) + ls(), flexDirection: "row", justifyContent: "center" }}>
              <text style={{ ...props.style, fontSize: props.size, letterSpacing: 0, whiteSpace: "nowrap" }}>{r}</text>
            </view>
          ) : (
            <text style={{ ...props.style, fontSize: props.size, letterSpacing: ls(), whiteSpace: "nowrap" }}>{r}</text>
          )
        }
      </For>
    </view>
  );
}
