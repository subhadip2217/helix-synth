/**
 * Two-octave QWERTY map relative to the visible keyboard start (C of the
 * current octave). Lower row is octave 0, number/Q row is octave 1.
 */
export const COMPUTER_KEY_OFFSETS: Record<string, number> = {
  z: 0,
  s: 1,
  x: 2,
  d: 3,
  c: 4,
  v: 5,
  g: 6,
  b: 7,
  h: 8,
  n: 9,
  j: 10,
  m: 11,
  q: 12,
  "2": 13,
  w: 14,
  "3": 15,
  e: 16,
  r: 17,
  "5": 18,
  t: 19,
  "6": 20,
  y: 21,
  "7": 22,
  u: 23,
  i: 24,
};

const CODE_OFFSETS: Record<string, number> = {
  KeyZ: 0,
  KeyS: 1,
  KeyX: 2,
  KeyD: 3,
  KeyC: 4,
  KeyV: 5,
  KeyG: 6,
  KeyB: 7,
  KeyH: 8,
  KeyN: 9,
  KeyJ: 10,
  KeyM: 11,
  KeyQ: 12,
  Digit2: 13,
  KeyW: 14,
  Digit3: 15,
  KeyE: 16,
  KeyR: 17,
  Digit5: 18,
  KeyT: 19,
  Digit6: 20,
  KeyY: 21,
  Digit7: 22,
  KeyU: 23,
  KeyI: 24,
};

export const OFFSET_TO_COMPUTER_KEY: Record<number, string> = Object.fromEntries(
  Object.entries(COMPUTER_KEY_OFFSETS).map(([key, offset]) => [offset, key]),
);

export function computerKeyToOffset(code: string, key: string): number | null {
  if (code in CODE_OFFSETS) return CODE_OFFSETS[code]!;
  const k = key.length === 1 ? key.toLowerCase() : key.toLowerCase();
  return k in COMPUTER_KEY_OFFSETS ? COMPUTER_KEY_OFFSETS[k]! : null;
}
