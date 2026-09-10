import { cn } from "@/lib/utils";
import { WAVEFORMS, type Waveform } from "@/lib/synth/types";

const LABELS: Record<Waveform, string> = {
  sine: "Sine",
  triangle: "Tri",
  sawtooth: "Saw",
  square: "Square",
};

function WaveIcon({ type }: { type: Waveform }) {
  const d =
    type === "sine"
      ? "M2 12c2.2-8 5.8-8 8 0s5.8 8 8 0"
      : type === "triangle"
        ? "M2 16 L8 6 L14 16 L20 6"
        : type === "sawtooth"
          ? "M2 16 L14 6 V16 L22 8"
          : "M3 16 V6 H11 V16 H19 V6";
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-9" aria-hidden="true" fill="none">
      <path d={d} className="stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type WaveformSelectProps = {
  value: Waveform;
  onChange: (wave: Waveform) => void;
};

export function WaveformSelect({ value, onChange }: WaveformSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-2xs font-medium uppercase tracking-brand text-muted">Wave</span>
      <div role="radiogroup" aria-label="Oscillator waveform" className="grid grid-cols-4 gap-1.5">
        {WAVEFORMS.map((wave) => {
          const on = wave === value;
          return (
            <button
              key={wave}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(wave)}
              className={cn(
                "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-sm px-1",
                "transition-[background-color,color,box-shadow]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
                "active:not-disabled:scale-[0.96]",
                on ? "bg-accent text-bg" : "bg-elevated text-muted shadow-[var(--shadow-border)] hover:text-fg",
              )}
            >
              <WaveIcon type={wave} />
              <span className="font-mono text-2xs uppercase tracking-panel">{LABELS[wave]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
