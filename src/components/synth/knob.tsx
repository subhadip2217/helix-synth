import { useCallback, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type KnobProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  logarithmic?: boolean;
  format?: (value: number) => string;
  onChange: (value: number) => void;
};

function toNorm(value: number, min: number, max: number, log: boolean) {
  if (log) {
    const a = Math.log(Math.max(min, 0.0001));
    const b = Math.log(Math.max(max, 0.0001));
    return (Math.log(Math.max(value, 0.0001)) - a) / (b - a);
  }
  return (value - min) / (max - min);
}

function fromNorm(t: number, min: number, max: number, log: boolean) {
  const clamped = Math.min(1, Math.max(0, t));
  if (log) {
    const a = Math.log(Math.max(min, 0.0001));
    const b = Math.log(Math.max(max, 0.0001));
    return Math.exp(a + clamped * (b - a));
  }
  return min + clamped * (max - min);
}

function snap(value: number, min: number, max: number, step?: number) {
  if (!step) return Math.min(max, Math.max(min, value));
  const snapped = Math.round(value / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

const START_ANGLE = -135;
const SWEEP = 270;

export function Knob({
  label,
  value,
  min,
  max,
  step,
  logarithmic = false,
  format,
  onChange,
}: KnobProps) {
  const id = useId();
  const drag = useRef<{ y: number; t: number } | null>(null);
  const t = toNorm(value, min, max, logarithmic);
  const angle = START_ANGLE + t * SWEEP;
  const display = format ? format(value) : value.toFixed(2);

  const commit = useCallback(
    (nextT: number) => {
      onChange(snap(fromNorm(nextT, min, max, logarithmic), min, max, step));
    },
    [logarithmic, max, min, onChange, step],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { y: event.clientY, t };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dy = drag.current.y - event.clientY;
    commit(drag.current.t + dy / 140);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const dir =
      event.key === "ArrowUp" || event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowDown" || event.key === "ArrowLeft"
          ? -1
          : event.key === "Home"
            ? "min"
            : event.key === "End"
              ? "max"
              : 0;
    if (dir === 0) return;
    event.preventDefault();
    if (dir === "min") {
      onChange(min);
      return;
    }
    if (dir === "max") {
      onChange(max);
      return;
    }
    const delta = (event.shiftKey ? 0.08 : 0.02) * dir;
    commit(t + delta);
  };

  return (
    <div className="flex w-knob flex-col items-center gap-2">
      <div
        id={id}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(3))}
        aria-valuetext={display}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          "relative size-16 touch-none select-none rounded-full",
          "outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
        )}
      >
        <svg viewBox="0 0 80 80" className="size-full" aria-hidden="true">
          <circle cx="40" cy="40" r="36" className="fill-elevated" />
          <circle cx="40" cy="40" r="34" className="fill-none stroke-border" strokeWidth="1.25" />
          {Array.from({ length: 11 }, (_, i) => {
            const a = ((START_ANGLE + (i / 10) * SWEEP) * Math.PI) / 180;
            const inner = 30;
            const outer = 34;
            return (
              <line
                key={i}
                x1={40 + Math.cos(a) * inner}
                y1={40 + Math.sin(a) * inner}
                x2={40 + Math.cos(a) * outer}
                y2={40 + Math.sin(a) * outer}
                className="stroke-subtle"
                strokeWidth={i === 0 || i === 10 || i === 5 ? 1.6 : 1}
              />
            );
          })}
          <circle cx="40" cy="40" r="22" className="fill-surface" />
          <circle cx="40" cy="40" r="21" className="fill-none stroke-border" strokeWidth="1" />
          <line
            x1="40"
            y1="40"
            x2={40 + Math.cos((angle * Math.PI) / 180) * 16}
            y2={40 + Math.sin((angle * Math.PI) / 180) * 16}
            className="stroke-accent"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="40" cy="40" r="3.2" className="fill-fg" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-mono text-2xs font-medium uppercase tracking-panel text-muted">{label}</span>
        <span className="font-mono text-xs tabular-nums text-fg">{display}</span>
      </div>
    </div>
  );
}
