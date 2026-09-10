export const WAVEFORMS = ["sine", "triangle", "sawtooth", "square"] as const;

export type Waveform = (typeof WAVEFORMS)[number];

export type SynthParams = {
  waveform: Waveform;
  cutoff: number;
  resonance: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
};

export const DEFAULT_PARAMS: SynthParams = {
  waveform: "sawtooth",
  cutoff: 2400,
  resonance: 1.1,
  attack: 0.02,
  decay: 0.22,
  sustain: 0.62,
  release: 0.32,
  volume: 0.72,
};

export const PARAM_RANGE = {
  cutoff: { min: 80, max: 12000, log: true },
  resonance: { min: 0.2, max: 16, log: false },
  attack: { min: 0.005, max: 2, log: true },
  decay: { min: 0.02, max: 2, log: true },
  sustain: { min: 0, max: 1, log: false },
  release: { min: 0.02, max: 3.5, log: true },
  volume: { min: 0, max: 1, log: false },
} as const;

export const MIN_OCTAVE = 1;
export const MAX_OCTAVE = 6;
export const KEYBOARD_SPAN = 24;
export const MAX_VOICES = 12;
