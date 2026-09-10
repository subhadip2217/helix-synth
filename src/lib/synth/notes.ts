export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const WHITE_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function midiToName(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pc]}${octave}`;
}

export function isBlackKey(midi: number): boolean {
  return !WHITE_PCS.has(((midi % 12) + 12) % 12);
}

export function whitesBefore(midi: number, fromMidi: number): number {
  let count = 0;
  for (let m = fromMidi; m < midi; m++) {
    if (!isBlackKey(m)) count += 1;
  }
  return count;
}

export function countWhiteKeys(fromMidi: number, toMidiInclusive: number): number {
  let count = 0;
  for (let m = fromMidi; m <= toMidiInclusive; m++) {
    if (!isBlackKey(m)) count += 1;
  }
  return count;
}

/** MIDI of C in scientific pitch (C4 = 60). */
export function cMidi(octave: number): number {
  return (octave + 1) * 12;
}
