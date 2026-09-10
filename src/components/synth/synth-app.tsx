import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Keyboard } from "@/components/synth/keyboard";
import { Knob } from "@/components/synth/knob";
import { Oscilloscope } from "@/components/synth/oscilloscope";
import { WaveformSelect } from "@/components/synth/waveform-select";
import { computerKeyToOffset } from "@/lib/synth/keymap";
import { midiToName } from "@/lib/synth/notes";
import { useSynthStore, visibleRange } from "@/lib/synth/store";
import { MAX_OCTAVE, MIN_OCTAVE, PARAM_RANGE } from "@/lib/synth/types";

function formatHz(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 1 : 2)}k`;
  return `${Math.round(v)}Hz`;
}

function formatMs(v: number) {
  if (v < 1) return `${Math.round(v * 1000)}ms`;
  return `${v.toFixed(2)}s`;
}

function formatPct(v: number) {
  return `${Math.round(v * 100)}%`;
}

function formatQ(v: number) {
  return v.toFixed(2);
}

export function SynthApp() {
  const enabled = useSynthStore((s) => s.enabled);
  const waveform = useSynthStore((s) => s.waveform);
  const cutoff = useSynthStore((s) => s.cutoff);
  const resonance = useSynthStore((s) => s.resonance);
  const attack = useSynthStore((s) => s.attack);
  const decay = useSynthStore((s) => s.decay);
  const sustain = useSynthStore((s) => s.sustain);
  const release = useSynthStore((s) => s.release);
  const volume = useSynthStore((s) => s.volume);
  const octave = useSynthStore((s) => s.octave);
  const activeNotes = useSynthStore((s) => s.activeNotes);

  const enable = useSynthStore((s) => s.enable);
  const noteOn = useSynthStore((s) => s.noteOn);
  const noteOff = useSynthStore((s) => s.noteOff);
  const panic = useSynthStore((s) => s.panic);
  const setWaveform = useSynthStore((s) => s.setWaveform);
  const setCutoff = useSynthStore((s) => s.setCutoff);
  const setResonance = useSynthStore((s) => s.setResonance);
  const setAttack = useSynthStore((s) => s.setAttack);
  const setDecay = useSynthStore((s) => s.setDecay);
  const setSustain = useSynthStore((s) => s.setSustain);
  const setRelease = useSynthStore((s) => s.setRelease);
  const setVolume = useSynthStore((s) => s.setVolume);
  const shiftOctave = useSynthStore((s) => s.shiftOctave);

  const heldKeys = useRef(new Set<string>());
  const octaveRef = useRef(octave);
  const enabledRef = useRef(enabled);
  octaveRef.current = octave;
  enabledRef.current = enabled;

  useEffect(() => {
    void useSynthStore.persist.rehydrate();
  }, []);

  const armAndPlay = useCallback(
    async (midi: number) => {
      if (!enabledRef.current) {
        const ok = await enable();
        if (!ok) return;
      }
      noteOn(midi);
    },
    [enable, noteOn],
  );

  const onScreenNoteOn = useCallback(
    (midi: number) => {
      void armAndPlay(midi);
    },
    [armAndPlay],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        shiftOctave(-1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        shiftOctave(1);
        return;
      }
      if (event.key === "Escape") {
        panic();
        return;
      }

      const offset = computerKeyToOffset(event.code, event.key);
      if (offset == null) return;
      event.preventDefault();
      if (event.repeat || heldKeys.current.has(event.code)) return;
      heldKeys.current.add(event.code);
      const midi = visibleRange(octaveRef.current).from + offset;
      void armAndPlay(midi);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const offset = computerKeyToOffset(event.code, event.key);
      if (offset == null) return;
      event.preventDefault();
      heldKeys.current.delete(event.code);
      const midi = visibleRange(octaveRef.current).from + offset;
      noteOff(midi);
    };

    const onBlur = () => {
      heldKeys.current.clear();
      panic();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
    };
  }, [armAndPlay, noteOff, panic, shiftOctave]);

  const range = visibleRange(octave);
  const voiceLabel =
    activeNotes.length === 0
      ? "Idle"
      : activeNotes.length === 1
        ? midiToName(activeNotes[0]!)
        : `${activeNotes.length} voices`;

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-3 py-4 sm:px-6 sm:py-8">
        <section className="relative rounded-2xl bg-surface p-3 shadow-[var(--shadow-chassis)] sm:p-5 md:p-6">
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5">
            <div className="min-w-0">
              <p className="font-mono text-2xs uppercase tracking-brand text-muted">Desktop instrument</p>
              <h1 className="mt-1 font-sans text-3xl font-semibold tracking-display text-fg sm:text-4xl">HELIX</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-md bg-elevated p-1 shadow-[var(--shadow-border)]">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Octave down"
                  disabled={octave <= MIN_OCTAVE}
                  onClick={() => shiftOctave(-1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="min-w-knob text-center">
                  <div className="font-mono text-2xs uppercase tracking-panel text-muted">Octave</div>
                  <div className="font-mono text-sm tabular-nums text-fg">{midiToName(range.from)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Octave up"
                  disabled={octave >= MAX_OCTAVE}
                  onClick={() => shiftOctave(1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              {!enabled ? (
                <Button variant="accent" data-testid="enable-audio" onClick={() => void enable()}>
                  <Power className="size-4" />
                  Enable audio
                </Button>
              ) : (
                <div className="flex h-11 items-center gap-2 rounded-md bg-elevated px-3 text-accent shadow-[var(--shadow-border)]">
                  <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
                  <span className="font-mono text-2xs uppercase tracking-panel">Live</span>
                </div>
              )}
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            <div className="flex min-h-40 flex-col gap-2">
              <Oscilloscope enabled={enabled} />
              <div className="flex items-center justify-between px-0.5">
                <span className="font-mono text-2xs uppercase tracking-panel text-muted">{voiceLabel}</span>
                <span className="font-mono text-2xs uppercase tracking-panel text-subtle">
                  {midiToName(range.from)} – {midiToName(range.to)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <WaveformSelect value={waveform} onChange={setWaveform} />
              <div className="flex flex-col gap-3">
                <span className="font-mono text-2xs font-medium uppercase tracking-brand text-muted">
                  Filter & envelope
                </span>
                <div className="flex flex-wrap justify-start gap-x-2 gap-y-4">
                  <Knob
                    label="Cutoff"
                    value={cutoff}
                    min={PARAM_RANGE.cutoff.min}
                    max={PARAM_RANGE.cutoff.max}
                    logarithmic
                    format={formatHz}
                    onChange={setCutoff}
                  />
                  <Knob
                    label="Reso"
                    value={resonance}
                    min={PARAM_RANGE.resonance.min}
                    max={PARAM_RANGE.resonance.max}
                    step={0.05}
                    format={formatQ}
                    onChange={setResonance}
                  />
                  <Knob
                    label="Attack"
                    value={attack}
                    min={PARAM_RANGE.attack.min}
                    max={PARAM_RANGE.attack.max}
                    logarithmic
                    format={formatMs}
                    onChange={setAttack}
                  />
                  <Knob
                    label="Decay"
                    value={decay}
                    min={PARAM_RANGE.decay.min}
                    max={PARAM_RANGE.decay.max}
                    logarithmic
                    format={formatMs}
                    onChange={setDecay}
                  />
                  <Knob
                    label="Sustain"
                    value={sustain}
                    min={PARAM_RANGE.sustain.min}
                    max={PARAM_RANGE.sustain.max}
                    step={0.01}
                    format={formatPct}
                    onChange={setSustain}
                  />
                  <Knob
                    label="Release"
                    value={release}
                    min={PARAM_RANGE.release.min}
                    max={PARAM_RANGE.release.max}
                    logarithmic
                    format={formatMs}
                    onChange={setRelease}
                  />
                  <Knob
                    label="Level"
                    value={volume}
                    min={PARAM_RANGE.volume.min}
                    max={PARAM_RANGE.volume.max}
                    step={0.01}
                    format={formatPct}
                    onChange={setVolume}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-5 sm:mt-6">
            <div className="overflow-x-auto overscroll-x-contain rounded-lg bg-bg p-2 sm:p-3">
              <Keyboard
                octave={octave}
                activeNotes={activeNotes}
                onNoteOn={onScreenNoteOn}
                onNoteOff={noteOff}
              />
            </div>
            <div
              className="pointer-events-none absolute inset-y-3 right-0 w-10 rounded-r-lg bg-linear-to-l from-bg to-transparent sm:hidden"
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 hidden text-pretty font-mono text-xs leading-relaxed tracking-wide text-subtle sm:block">
            Play with the keys or the computer keyboard (Z row + Q row). Enable audio first, or tap a key to start.
            Arrow up/down shifts octave. Esc silences all voices.
          </p>
          <p className="mt-3 text-pretty font-mono text-xs leading-relaxed tracking-wide text-subtle sm:hidden">
            Swipe the keys to play. Octave buttons shift the range.
          </p>
        </section>
      </main>
    </div>
  );
}
