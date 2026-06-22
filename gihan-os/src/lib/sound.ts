"use client";

class SoundSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  play(type: "beep" | "laser" | "success" | "click" | "reply") {
    try {
      this.init();
      if (!this.ctx) return;

      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      if (type === "click") {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "beep") {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(950, now);

        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "reply") {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(1050, now + 0.06);

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === "laser") {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);

        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === "success") {
        const notes = [
          { note: 523.25, start: 0, dur: 0.08 }, // C5
          { note: 659.25, start: 0.08, dur: 0.12 }, // E5
        ];

        notes.forEach((item) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.type = "sine";
          osc.frequency.setValueAtTime(item.note, now + item.start);

          gain.gain.setValueAtTime(0.025, now + item.start);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + item.start + item.dur
          );

          osc.start(now + item.start);
          osc.stop(now + item.start + item.dur);
        });
      }
    } catch (e) {
      console.warn("Sound synthesis deactivated:", e);
    }
  }
}

export const sound = new SoundSynth();
