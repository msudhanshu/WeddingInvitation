import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { animate } from 'motion';
import { LAYER_ASSETS } from '../layerAssets';
import { ImageWithFallback } from './ImageWithFallback';
import { buildLegSegmentKeyframes, SPLINE_ROUTE_MAX_LEG } from '../boatSplinePath';

interface BoatProps {
  position: number;
}

/** Keep in sync with sequential leg timing in `App.tsx`. */
export const BOAT_MOVE_DURATION_SEC = 2;

/** Inclusive: `0` = bride; `5` = groom dock (`SPLINE_ROUTE_MAX_LEG`). */
export const BOAT_MAX_LEG = SPLINE_ROUTE_MAX_LEG;

/** Perspective endpoints per leg (bride → 4 stops → groom dock); spline motion interpolates between leg endpoints. */
const BOAT_SCALES = [0.42, 0.56, 0.92, 1.2, 1.45, 2.0] as const;

/**
 * **`false`**: boat stays upright (`rotate(0deg)`). Position/scale still follow the spline.
 * **`true`**: heading comes from `kf.rotate` (computed in `boatSplinePath.ts` from path tangents).
 */
const BOAT_USE_SPLINE_ROTATION = false;

function parsePct(value: string): number {
  return Number(String(value).replace('%', '').trim()) || 0;
}

function lerpPct(a: string, b: string, t: number): string {
  const pa = parsePct(a);
  const pb = parsePct(b);
  return `${pa + (pb - pa) * t}%`;
}

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Shortest-path lerp for angles in degrees (handles wrap and `atan2` ±180° jumps). */
function lerpAngleDeg(a: number, b: number, t: number): number {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return a + d * t;
}

function applyKeyframeFrame(
  outer: HTMLDivElement,
  inner: HTMLDivElement,
  kf: ReturnType<typeof buildLegSegmentKeyframes>,
  frameIndex: number,
) {
  const i = Math.min(Math.max(0, frameIndex), kf.left.length - 1);
  outer.style.left = kf.left[i]!;
  outer.style.top = kf.top[i]!;
  const rot = BOAT_USE_SPLINE_ROTATION ? kf.rotate[i]! : 0;
  outer.style.transform = `rotate(${rot}deg)`;
  inner.style.transformOrigin = '50% 88%';
  inner.style.transform = `scale(${kf.scale[i]!})`;
}

export function Boat({ position }: BoatProps) {
  /**
   * Spline: **`src/app/boatSplinePath.ts`**.
   * `motion`/`framer-motion` does not reliably tween `%`-based **`left`/`top`** arrays; we drive the DOM with **`animate`** from `motion`.
   */
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  /** Completed leg (`boatPosition` from parent). Next segment starts here. */
  const settledLegRef = useRef(position);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) {
      return undefined;
    }

    const from = settledLegRef.current;
    const to = position;

    const kf = buildLegSegmentKeyframes(from, to, BOAT_SCALES);
    const n = kf.left.length;

    if (from === to || n < 2) {
      applyKeyframeFrame(outer, inner, kf, 0);
      settledLegRef.current = to;
      return undefined;
    }

    applyKeyframeFrame(outer, inner, kf, 0);

    const controls = animate(0, n - 1, {
      duration: BOAT_MOVE_DURATION_SEC,
      ease: 'linear',
      onComplete: () => {
        settledLegRef.current = to;
      },
      onUpdate: (latest) => {
        const i0 = Math.min(n - 1, Math.floor(latest));
        const i1 = Math.min(n - 1, i0 + 1);
        const f = i1 > i0 ? latest - i0 : 0;
        outer.style.left = lerpPct(kf.left[i0]!, kf.left[i1]!, f);
        outer.style.top = lerpPct(kf.top[i0]!, kf.top[i1]!, f);
        const r = BOAT_USE_SPLINE_ROTATION ? lerpAngleDeg(kf.rotate[i0]!, kf.rotate[i1]!, f) : 0;
        outer.style.transform = `rotate(${r}deg)`;
        const s = lerpNum(kf.scale[i0]!, kf.scale[i1]!, f);
        inner.style.transformOrigin = '50% 88%';
        inner.style.transform = `scale(${s})`;
      },
    });

    return () => {
      controls.stop();
      // If this segment is torn down before `onComplete` (new leg, remount, dev Strict Mode),
      // snap to the segment end and record the leg so the next effect doesn’t restart the same move.
      if (from !== to && n >= 2) {
        settledLegRef.current = to;
        applyKeyframeFrame(outer, inner, kf, n - 1);
      }
    };
    // Important: animate from `from` captured above; deps only `position` so we restart when parent leg changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally read settledLegRef at effect start only
  }, [position]);

  return (
    <div ref={outerRef} className="pointer-events-none absolute z-40" style={{ left: '0%', top: '0%' }}>
      <div
        ref={innerRef}
        className="inline-block"
        style={{
          transformOrigin: '50% 88%',
          willChange: 'transform',
          transform: 'scale(1)',
        }}
      >
        <div className="relative h-24 w-24">
          <ImageWithFallback
            src={LAYER_ASSETS.boat}
            alt=""
            draggable={false}
            className="relative z-[1] h-full w-full object-contain drop-shadow-2xl select-none"
          />

          <div className="-translate-x-1/2 absolute -bottom-4 left-1/2 h-8 w-32">
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-blue-300/40"
              animate={{
                scale: [1, 1.55, 2.05],
                opacity: [0.55, 0.22, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
