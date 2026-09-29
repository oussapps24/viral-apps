/**
 * Tiny Web Audio music box. All melodies here are original (except "Happy
 * Birthday", which is public domain), so there's no licensing to worry about.
 */

type Note = [pitch: string | null, beats: number];

export type TrackId = "sweet" | "lullaby" | "birthday" | "dreamy";

type Track = { bpm: number; melody: Note[]; bass: Note[]; wave: OscillatorType };

// Original loops written for this app.
const TRACKS: Record<TrackId, Track> = {
  sweet: {
    bpm: 96,
    wave: "sine",
    melody: [
      ["E5", 1], ["G5", 1], ["A5", 1], ["G5", 0.5], ["E5", 0.5],
      ["D5", 1], ["E5", 1], ["C5", 2],
      ["E5", 1], ["G5", 1], ["C6", 1], ["B5", 0.5], ["A5", 0.5],
      ["G5", 2], [null, 1], ["G5", 1],
      ["A5", 1], ["G5", 1], ["E5", 1], ["D5", 1],
      ["C5", 1], ["D5", 1], ["E5", 2],
      ["D5", 1], ["C5", 1], ["A4", 1], ["C5", 1],
      ["C5", 3], [null, 1],
    ],
    bass: [
      ["C3", 4], ["G2", 4], ["A2", 4], ["E3", 4],
      ["F2", 4], ["C3", 4], ["G2", 4], ["C3", 4],
    ],
  },
  lullaby: {
    bpm: 72,
    wave: "triangle",
    melody: [
      ["G4", 1], ["B4", 1], ["D5", 1], ["B4", 1],
      ["C5", 1.5], ["B4", 0.5], ["A4", 2],
      ["A4", 1], ["C5", 1], ["E5", 1], ["C5", 1],
      ["B4", 3], [null, 1],
      ["G4", 1], ["B4", 1], ["D5", 1], ["G5", 1],
      ["F#5", 1.5], ["E5", 0.5], ["D5", 2],
      ["C5", 1], ["B4", 1], ["A4", 1], ["F#4", 1],
      ["G4", 3], [null, 1],
    ],
    bass: [
      ["G2", 4], ["C3", 4], ["A2", 4], ["G2", 4],
      ["E2", 4], ["D3", 4], ["D3", 4], ["G2", 4],
    ],
  },
  dreamy: {
    bpm: 84,
    wave: "sine",
    melody: [
      ["A4", 0.5], ["C5", 0.5], ["E5", 1], ["D5", 0.5], ["C5", 0.5], ["D5", 1],
      ["E5", 1], ["G5", 1], ["E5", 2],
      ["F5", 0.5], ["E5", 0.5], ["D5", 1], ["C5", 1], ["A4", 1],
      ["B4", 3], [null, 1],
      ["A4", 0.5], ["C5", 0.5], ["E5", 1], ["A5", 1], ["G5", 1],
      ["F5", 1], ["E5", 1], ["C5", 2],
      ["D5", 1], ["E5", 1], ["B4", 1], ["G4", 1],
      ["A4", 3], [null, 1],
    ],
    bass: [
      ["A2", 4], ["C3", 4], ["F2", 4], ["E2", 4],
      ["A2", 4], ["F2", 4], ["G2", 4], ["A2", 4],
    ],
  },
  birthday: {
    bpm: 100,
    wave: "triangle",
    melody: [
      [null, 1], [null, 1], ["C5", 0.75], ["C5", 0.25],
      ["D5", 1], ["C5", 1], ["F5", 1],
      ["E5", 2], ["C5", 0.75], ["C5", 0.25],
      ["D5", 1], ["C5", 1], ["G5", 1],
      ["F5", 2], ["C5", 0.75], ["C5", 0.25],
      ["C6", 1], ["A5", 1], ["F5", 1],
      ["E5", 1], ["D5", 1], ["A#5", 0.75], ["A#5", 0.25],
      ["A5", 1], ["F5", 1], ["G5", 1],
      ["F5", 3],
    ],
    bass: [
      ["F2", 3], ["F2", 3], ["C3", 3], ["C3", 3],
      ["F2", 3], ["A#2", 3], ["F2", 3], ["C3", 3], ["F2", 3],
    ],
  },
};

export const TRACK_IDS: TrackId[] = ["sweet", "lullaby", "dreamy", "birthday"];

export const TRACK_LABELS: Record<TrackId, string> = {
  sweet: "Sweet music box",
  lullaby: "Soft lullaby",
  dreamy: "Dreamy",
  birthday: "Happy Birthday",
};

/** Anything Stage can start and stop. */
export interface Player {
  playing: boolean;
  start(): void;
  stop(): void;
  dispose(): void;
}

/** Loops an uploaded audio file (mp3 etc.) set on the template in /admin. */
export class AudioLoop implements Player {
  private el: HTMLAudioElement | null = null;
  playing = false;
  constructor(private url: string) {}
  start() {
    this.el ??= Object.assign(new Audio(this.url), { loop: true, volume: 0.6, preload: "auto" });
    this.playing = true;
    void this.el.play().catch(() => (this.playing = false));
  }
  stop() {
    this.playing = false;
    this.el?.pause();
  }
  dispose() {
    this.stop();
    this.el = null;
  }
}

const NOTE_INDEX: Record<string, number> = {
  C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
};

function freq(pitch: string) {
  const m = /^([A-G]#?)(\d)$/.exec(pitch)!;
  const midi = (Number(m[2]) + 1) * 12 + NOTE_INDEX[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export class MusicBox implements Player {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextTimes = { melody: 0, bass: 0 };
  private idx = { melody: 0, bass: 0 };
  playing = false;

  constructor(private trackId: TrackId) {}

  /** Must be called from a user gesture (browsers block autoplay). */
  start() {
    if (this.playing) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx ??= new Ctx();
    void this.ctx.resume();
    if (!this.master) {
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.ctx.destination);
    }
    const t = this.ctx.currentTime + 0.05;
    this.nextTimes = { melody: t, bass: t };
    this.idx = { melody: 0, bass: 0 };
    this.playing = true;
    this.timer = setInterval(() => this.schedule(), 50);
  }

  stop() {
    this.playing = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.ctx) void this.ctx.suspend();
  }

  dispose() {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
  }

  private schedule() {
    const ctx = this.ctx!;
    const track = TRACKS[this.trackId];
    const beat = 60 / track.bpm;
    const horizon = ctx.currentTime + 0.25;
    for (const part of ["melody", "bass"] as const) {
      const notes = track[part];
      while (this.nextTimes[part] < horizon) {
        const [pitch, beats] = notes[this.idx[part]];
        const dur = beats * beat;
        if (pitch) this.voice(freq(pitch), this.nextTimes[part], dur, part === "bass" ? "sine" : track.wave, part === "bass" ? 0.45 : 0.6);
        this.nextTimes[part] += dur;
        this.idx[part] = (this.idx[part] + 1) % notes.length;
      }
    }
  }

  private voice(f: number, t: number, dur: number, wave: OscillatorType, vol: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = f;
    // Plucky music-box envelope.
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + Math.max(dur, 0.3) * 1.6);
    osc.connect(gain).connect(this.master!);
    osc.start(t);
    osc.stop(t + Math.max(dur, 0.3) * 1.7);
  }
}
