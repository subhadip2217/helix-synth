import { useEffect, useRef } from "react";
import { synth } from "@/lib/synth/engine";
import { cn } from "@/lib/utils";

type OscilloscopeProps = {
  enabled: boolean;
};

const SEGMENTS = 12;

export function Oscilloscope({ enabled }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const peakRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const timeData = new Uint8Array(2048);

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width: cssW, height: cssH } = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const styles = getComputedStyle(canvas);
      const bg = styles.getPropertyValue("--color-bg").trim() || "#0b0c0e";
      const accent = styles.getPropertyValue("--color-accent").trim() || "#7ec8c4";
      const grid = styles.getPropertyValue("--scope-grid").trim();
      const idle = styles.getPropertyValue("--scope-idle").trim();

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = grid;
      ctx.lineWidth = dpr;
      const cells = 8;
      for (let i = 1; i < cells; i++) {
        const x = (i / cells) * w;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      const analyser = synth.analyserNode;
      let rms = 0;
      if (enabled && analyser) {
        analyser.getByteTimeDomainData(timeData);
        ctx.beginPath();
        ctx.lineWidth = 1.5 * dpr;
        ctx.strokeStyle = accent;
        const n = timeData.length;
        let sum = 0;
        for (let i = 0; i < n; i++) {
          const v = (timeData[i]! - 128) / 128;
          sum += v * v;
          const x = (i / (n - 1)) * w;
          const y = h / 2 + v * (h * 0.42);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        rms = Math.sqrt(sum / n);
      } else {
        ctx.beginPath();
        ctx.lineWidth = 1.25 * dpr;
        ctx.strokeStyle = idle;
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      peakRef.current = Math.max(rms, peakRef.current * 0.94);
      const meter = meterRef.current;
      if (meter) {
        const level = Math.min(1, rms * 3.4);
        const peak = Math.min(1, peakRef.current * 3.4);
        const children = meter.children;
        const peakIndex = Math.round(peak * (SEGMENTS - 1));
        for (let i = 0; i < children.length; i++) {
          const hot = i >= SEGMENTS - 2;
          const lit = level >= (i + 1) / SEGMENTS || (i === peakIndex && peak > 0.04);
          children[i]?.classList.toggle("bg-accent", Boolean(lit && !hot));
          children[i]?.classList.toggle("bg-fg", Boolean(lit && hot));
          children[i]?.classList.toggle("bg-elevated", !lit);
        }
      }

      frame = window.requestAnimationFrame(draw);
    };

    frame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame);
  }, [enabled]);

  return (
    <div className="flex min-h-30 flex-1 gap-2">
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-md bg-bg shadow-[var(--shadow-border)]">
        <canvas ref={canvasRef} className="block size-full" aria-hidden="true" />
        <span className="pointer-events-none absolute left-3 top-2 font-mono text-2xs uppercase tracking-panel text-subtle">
          Scope
        </span>
      </div>
      <div
        ref={meterRef}
        className="flex w-3 flex-col-reverse gap-0.5 py-1"
        aria-label="Output level"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={1}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={cn("flex-1 rounded-sm bg-elevated")} />
        ))}
      </div>
    </div>
  );
}
