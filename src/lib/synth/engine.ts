import { midiToFreq } from "./notes";
import { DEFAULT_PARAMS, MAX_VOICES, type SynthParams, type Waveform } from "./types";

type Voice = {
  midi: number;
  osc: OscillatorNode;
  filterA: BiquadFilterNode;
  filterB: BiquadFilterNode;
  amp: GainNode;
  startedAt: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private voices = new Map<number, Voice>();
  private params: SynthParams = { ...DEFAULT_PARAMS };
  private stopTimers = new Map<number, number>();

  get analyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  get running(): boolean {
    return this.ctx?.state === "running";
  }

  async enable(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (!this.ctx) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = this.params.volume;

      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.knee.value = 18;
      limiter.ratio.value = 3.5;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.12;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.35;

      master.connect(limiter);
      limiter.connect(analyser);
      analyser.connect(ctx.destination);

      this.ctx = ctx;
      this.master = master;
      this.limiter = limiter;
      this.analyser = analyser;
    }
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    this.applyMaster();
    return this.ctx.state === "running" || this.ctx.state === "suspended";
  }

  setParams(partial: Partial<SynthParams>) {
    this.params = { ...this.params, ...partial };
    this.applyMaster();
    this.applyVoices();
  }

  setWaveform(waveform: Waveform) {
    this.params.waveform = waveform;
    for (const voice of this.voices.values()) {
      voice.osc.type = waveform;
    }
  }

  noteOn(midi: number) {
    if (!this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") {
      void this.ctx.resume().then(() => this.startVoice(midi));
      return;
    }
    if (this.ctx.state !== "running") return;
    this.startVoice(midi);
  }

  private startVoice(midi: number) {
    if (!this.ctx || this.ctx.state !== "running" || !this.master) return;
    this.clearStopTimer(midi);
    if (this.voices.has(midi)) {
      this.hardStop(midi);
    }
    if (this.voices.size >= MAX_VOICES) {
      const oldest = [...this.voices.values()].sort((a, b) => a.startedAt - b.startedAt)[0];
      if (oldest) this.hardStop(oldest.midi);
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = this.params.waveform;
    osc.frequency.setValueAtTime(midiToFreq(midi), now);

    const filterA = this.ctx.createBiquadFilter();
    const filterB = this.ctx.createBiquadFilter();
    filterA.type = "lowpass";
    filterB.type = "lowpass";
    this.tuneFilter(filterA, filterB, now);

    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(0, now);
    const attack = Math.max(0.005, this.params.attack);
    const decay = Math.max(0.01, this.params.decay);
    amp.gain.linearRampToValueAtTime(1, now + attack);
    amp.gain.linearRampToValueAtTime(clamp(this.params.sustain, 0, 1), now + attack + decay);

    osc.connect(filterA);
    filterA.connect(filterB);
    filterB.connect(amp);
    amp.connect(this.master);
    osc.start(now);

    this.voices.set(midi, { midi, osc, filterA, filterB, amp, startedAt: now });
  }

  noteOff(midi: number) {
    const voice = this.voices.get(midi);
    if (!voice || !this.ctx) return;
    const now = this.ctx.currentTime;
    const release = Math.max(0.02, this.params.release);
    const gain = voice.amp.gain;
    const current = Math.max(gain.value, 0.0001);
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(current, now);
    gain.linearRampToValueAtTime(0.0001, now + release);

    this.clearStopTimer(midi);
    const handle = window.setTimeout(() => this.hardStop(midi), (release + 0.04) * 1000);
    this.stopTimers.set(midi, handle);
  }

  allNotesOff() {
    for (const midi of [...this.voices.keys()]) {
      this.hardStop(midi);
    }
  }

  dispose() {
    this.allNotesOff();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.limiter = null;
    this.analyser = null;
  }

  private applyMaster() {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(clamp(this.params.volume, 0, 1), now, 0.03);
  }

  private applyVoices() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const voice of this.voices.values()) {
      voice.osc.type = this.params.waveform;
      this.tuneFilter(voice.filterA, voice.filterB, now);
    }
  }

  private tuneFilter(a: BiquadFilterNode, b: BiquadFilterNode, now: number) {
    const cutoff = clamp(this.params.cutoff, 80, 18000);
    const q = clamp(this.params.resonance, 0.0001, 24);
    a.frequency.setTargetAtTime(cutoff, now, 0.02);
    b.frequency.setTargetAtTime(cutoff, now, 0.02);
    a.Q.setTargetAtTime(q, now, 0.02);
    b.Q.setTargetAtTime(0.707, now, 0.02);
  }

  private hardStop(midi: number) {
    const voice = this.voices.get(midi);
    this.clearStopTimer(midi);
    if (!voice) return;
    try {
      voice.osc.stop();
    } catch {
      /* already stopped */
    }
    voice.osc.disconnect();
    voice.filterA.disconnect();
    voice.filterB.disconnect();
    voice.amp.disconnect();
    this.voices.delete(midi);
  }

  private clearStopTimer(midi: number) {
    const handle = this.stopTimers.get(midi);
    if (handle != null) {
      window.clearTimeout(handle);
      this.stopTimers.delete(midi);
    }
  }
}

export const synth = new SynthEngine();
