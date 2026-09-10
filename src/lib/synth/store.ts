import { create } from "zustand";
import { persist } from "zustand/middleware";
import { synth } from "./engine";
import {
  DEFAULT_PARAMS,
  KEYBOARD_SPAN,
  MAX_OCTAVE,
  MIN_OCTAVE,
  type SynthParams,
  type Waveform,
} from "./types";
import { cMidi } from "./notes";

type SynthState = SynthParams & {
  octave: number;
  enabled: boolean;
  activeNotes: number[];
  enable: () => Promise<boolean>;
  noteOn: (midi: number) => void;
  noteOff: (midi: number) => void;
  panic: () => void;
  setWaveform: (waveform: Waveform) => void;
  setCutoff: (cutoff: number) => void;
  setResonance: (resonance: number) => void;
  setAttack: (attack: number) => void;
  setDecay: (decay: number) => void;
  setSustain: (sustain: number) => void;
  setRelease: (release: number) => void;
  setVolume: (volume: number) => void;
  shiftOctave: (delta: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function addNote(notes: number[], midi: number) {
  return notes.includes(midi) ? notes : [...notes, midi];
}

function removeNote(notes: number[], midi: number) {
  return notes.filter((n) => n !== midi);
}

export function visibleRange(octave: number): { from: number; to: number } {
  const from = cMidi(octave);
  return { from, to: from + KEYBOARD_SPAN };
}

function pickParams(s: Pick<SynthState, keyof SynthParams>): SynthParams {
  return {
    waveform: s.waveform,
    cutoff: s.cutoff,
    resonance: s.resonance,
    attack: s.attack,
    decay: s.decay,
    sustain: s.sustain,
    release: s.release,
    volume: s.volume,
  };
}

export const useSynthStore = create<SynthState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PARAMS,
      octave: 3,
      enabled: false,
      activeNotes: [],

      enable: async () => {
        set({ enabled: true });
        try {
          const ok = await synth.enable();
          if (ok) {
            synth.setParams(pickParams(get()));
            return true;
          }
          set({ enabled: false });
          return false;
        } catch {
          set({ enabled: false });
          return false;
        }
      },

      noteOn: (midi) => {
        synth.noteOn(midi);
        set((s) => ({ activeNotes: addNote(s.activeNotes, midi) }));
      },

      noteOff: (midi) => {
        synth.noteOff(midi);
        set((s) => ({ activeNotes: removeNote(s.activeNotes, midi) }));
      },

      panic: () => {
        synth.allNotesOff();
        set({ activeNotes: [] });
      },

      setWaveform: (waveform) => {
        synth.setWaveform(waveform);
        set({ waveform });
      },
      setCutoff: (cutoff) => {
        synth.setParams({ cutoff });
        set({ cutoff });
      },
      setResonance: (resonance) => {
        synth.setParams({ resonance });
        set({ resonance });
      },
      setAttack: (attack) => {
        synth.setParams({ attack });
        set({ attack });
      },
      setDecay: (decay) => {
        synth.setParams({ decay });
        set({ decay });
      },
      setSustain: (value) => {
        synth.setParams({ sustain: value });
        set({ sustain: value });
      },
      setRelease: (release) => {
        synth.setParams({ release });
        set({ release });
      },
      setVolume: (volume) => {
        synth.setParams({ volume });
        set({ volume });
      },
      shiftOctave: (delta) => {
        const next = clamp(get().octave + delta, MIN_OCTAVE, MAX_OCTAVE);
        get().panic();
        set({ octave: next });
      },
    }),
    {
      name: "helix-synth",
      skipHydration: true,
      partialize: (s) => ({
        waveform: s.waveform,
        cutoff: s.cutoff,
        resonance: s.resonance,
        attack: s.attack,
        decay: s.decay,
        sustain: s.sustain,
        release: s.release,
        volume: s.volume,
        octave: s.octave,
      }),
    },
  ),
);
