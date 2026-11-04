import { createEffect, createSignal } from "solid-js";
import { mount, prompt, useSettings, useSize, useStorage } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { BODY, DISPLAY } from "../shared/fonts";

// A note under a “.Title” heading in Metropolis Black. Click it to write; without the
// engine's text flyout the text comes from the settings.

const canPrompt = () => typeof (globalThis as any).__vitrine?.prompt === "function";

function Note() {
  const s = useSettings({
    theme: "dark",
    accent: "#448AFF",
    background: "none",
    shadow: true,
    title: "Note",
    text: "",
  });
  const l = useLook(s);
  const size = useSize();
  const [note, setNote] = useStorage<string | null>("note", null);
  const [seed, setSeed] = useStorage<string>("seed", "");
  const [hover, setHover] = createSignal(false);
  const editable = canPrompt();

  // Text typed into the settings replaces the note once; edits on the desktop then win.
  createEffect(() => {
    const raw = String(s().text ?? "");
    if (raw !== seed() || note() === null) {
      setSeed(raw);
      if (raw || note() === null) setNote(raw);
    }
  });
  const text = () => note() ?? "";
  const edit = async () => {
    if (!editable) return;
    const t = await prompt({ title: s().title || "Note", placeholder: "Write something to remember", value: text() });
    if (t !== null) setNote(t.trim());
  };

  const pad = () => (l().card ? 16 : 6);
  const title = () => s().title.trim() || "Note";
  const head = () => Math.floor(clamp(Math.min(size().height * 0.26, (size().width - pad() * 2) / ((title().length + 0.6) * 0.6)), 16, 72));
  const fs = () => Math.floor(clamp(Math.min(size().width / 17, head() * 0.36), 10, 22));
  const empty = () => (editable ? "Click to write a note" : "Write the note in the widget settings");

  return (
    <Surface l={l()} style={{ flexDirection: "column", padding: pad(), fontFamily: BODY }}>
      {(c) => (
        <view
          onClick={edit}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          style={{ flex: 1, flexDirection: "column", gap: Math.round(fs() * 0.5), minHeight: 0 }}
        >
          <text style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: head(), lineHeight: 1, color: c.text, whiteSpace: "nowrap" }}>
            <span style={{ color: c.accent }}>.</span>
            {title()}
          </text>
          <view style={{ flex: 1, minHeight: 0, overflow: "hidden", marginLeft: Math.round(head() * 0.04) }}>
            <text style={{ fontSize: fs(), lineHeight: 1.45, color: text() ? c.text : c.text2 }}>{text() || empty()}</text>
          </view>
          {editable ? (
            <text
              style={{
                fontWeight: 600,
                fontSize: Math.max(9, Math.round(fs() * 0.8)),
                color: c.accent,
                opacity: hover() ? 1 : 0,
                transition: "opacity 150ms ease",
                marginLeft: Math.round(head() * 0.04),
                whiteSpace: "nowrap",
              }}
            >
              Edit
            </text>
          ) : null}
        </view>
      )}
    </Surface>
  );
}

mount(() => <Note />);
