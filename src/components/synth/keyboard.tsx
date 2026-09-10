import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { OFFSET_TO_COMPUTER_KEY } from "@/lib/synth/keymap";
import { countWhiteKeys, isBlackKey, midiToName, whitesBefore } from "@/lib/synth/notes";
import { visibleRange } from "@/lib/synth/store";
import { KEYBOARD_SPAN } from "@/lib/synth/types";

type KeyboardProps = {
  octave: number;
  activeNotes: number[];
  onNoteOn: (midi: number) => void;
  onNoteOff: (midi: number) => void;
};

function midiFromPoint(clientX: number, clientY: number): number | null {
  const el = document.elementFromPoint(clientX, clientY);
  if (!(el instanceof HTMLElement)) return null;
  const key = el.closest("[data-midi]");
  if (!(key instanceof HTMLElement)) return null;
  const midi = Number(key.dataset.midi);
  return Number.isFinite(midi) ? midi : null;
}

export function Keyboard({ octave, activeNotes, onNoteOn, onNoteOff }: KeyboardProps) {
  const { from } = visibleRange(octave);
  const held = useRef<number | null>(null);
  const activeSet = new Set(activeNotes);
  const whiteCount = countWhiteKeys(from, from + KEYBOARD_SPAN);

  const press = useCallback(
    (midi: number) => {
      if (held.current === midi) return;
      if (held.current != null) onNoteOff(held.current);
      held.current = midi;
      onNoteOn(midi);
    },
    [onNoteOff, onNoteOn],
  );

  const release = useCallback(() => {
    if (held.current == null) return;
    onNoteOff(held.current);
    held.current = null;
  }, [onNoteOff]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const midi = midiFromPoint(event.clientX, event.clientY);
    if (midi == null) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    press(midi);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const midi = midiFromPoint(event.clientX, event.clientY);
    if (midi == null) return;
    press(midi);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    release();
  };

  const keys: number[] = [];
  for (let midi = from; midi <= from + KEYBOARD_SPAN; midi++) keys.push(midi);

  return (
    <div
      className="keybed relative isolate w-full select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
      role="group"
      aria-label="Piano keyboard"
    >
      <div className="absolute inset-0 flex">
        {keys
          .filter((midi) => !isBlackKey(midi))
          .map((midi) => {
            const offset = midi - from;
            const computerKey = OFFSET_TO_COMPUTER_KEY[offset];
            const on = activeSet.has(midi);
            const isRoot = midi % 12 === 0;
            return (
              <button
                key={midi}
                type="button"
                data-midi={midi}
                tabIndex={-1}
                aria-label={midiToName(midi)}
                aria-pressed={on}
                className={cn(
                  "relative flex h-full flex-1 flex-col items-center justify-end gap-1 rounded-b-md pb-2.5",
                  "transition-[background-color,transform,box-shadow]",
                  on
                    ? "z-10 translate-y-0.5 bg-accent text-bg shadow-inner"
                    : "bg-key-white text-key-white-fg shadow-[var(--shadow-key-white)]",
                )}
              >
                {computerKey ? (
                  <span className={cn("font-mono text-2xs uppercase tracking-wide", on ? "text-bg/70" : "text-subtle")}>
                    {computerKey}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "font-mono text-2xs tabular-nums",
                    on ? "text-bg" : isRoot ? "text-key-white-fg" : "text-subtle",
                  )}
                >
                  {isRoot ? midiToName(midi) : ""}
                </span>
              </button>
            );
          })}
      </div>
      {keys
        .filter((midi) => isBlackKey(midi))
        .map((midi) => {
          const whites = whitesBefore(midi, from);
          const leftPct = (whites / whiteCount) * 100;
          const widthPct = (0.62 / whiteCount) * 100;
          const offset = midi - from;
          const computerKey = OFFSET_TO_COMPUTER_KEY[offset];
          const on = activeSet.has(midi);
          return (
            <button
              key={midi}
              type="button"
              data-midi={midi}
              tabIndex={-1}
              aria-label={midiToName(midi)}
              aria-pressed={on}
              style={{
                left: `calc(${leftPct}% - ${widthPct / 2}%)`,
                width: `${widthPct}%`,
                height: "58%",
              }}
              className={cn(
                "absolute top-0 z-20 flex flex-col items-center justify-end rounded-b-md pb-2",
                "transition-[background-color,transform]",
                on
                  ? "translate-y-0.5 bg-accent text-bg"
                  : "bg-key-black text-key-black-fg shadow-[var(--shadow-key-black)]",
              )}
            >
              {computerKey ? (
                <span className={cn("font-mono text-2xs uppercase", on ? "text-bg/70" : "text-muted")}>
                  {computerKey}
                </span>
              ) : null}
            </button>
          );
        })}
      <span className="sr-only">
        Two octaves from {midiToName(from)} to {midiToName(from + KEYBOARD_SPAN)}
      </span>
    </div>
  );
}
