type WindKind = 'petal' | 'leaf';

interface WindSpec {
  track: string;
  kind: WindKind;
  delaySec: number;
  leftPct: string;
  hue: string;
  sizeCls: string;
  skewCls?: string;
}

/**
 * Lightweight CSS blossoms & leaves drifting on the breeze (far → near via scale inside keyframes).
 * Sits above forest artwork, below the sky tap and river props.
 */
const SPECS: readonly WindSpec[] = [
  { track: 'wind-piece-01', kind: 'petal', delaySec: 0, leftPct: '8%', hue: 'from-rose-200/90 to-pink-300/70', sizeCls: 'h-4 w-2.5' },
  { track: 'wind-piece-04', kind: 'leaf', delaySec: 2.8, leftPct: '18%', hue: 'from-emerald-500/85 to-teal-600/65', sizeCls: 'h-5 w-3', skewCls: '-skew-x-[18deg]' },
  { track: 'wind-piece-02', kind: 'petal', delaySec: 4.5, leftPct: '52%', hue: 'from-pink-200/90 to-fuchsia-300/62', sizeCls: 'h-3 w-2' },
  { track: 'wind-piece-05', kind: 'leaf', delaySec: 1.3, leftPct: '66%', hue: 'from-green-600/82 to-emerald-800/72', sizeCls: 'h-4 w-2.5', skewCls: '-skew-x-12 rotate-12' },
  { track: 'wind-piece-03', kind: 'petal', delaySec: 6.8, leftPct: '74%', hue: 'from-amber-100/90 to-orange-300/72', sizeCls: 'h-3.5 w-2.5' },
  { track: 'wind-piece-06', kind: 'leaf', delaySec: 8.9, leftPct: '92%', hue: 'from-lime-600/70 to-green-700/76', sizeCls: 'h-4 w-2', skewCls: '-skew-x-[22deg]' },
  { track: 'wind-piece-02', kind: 'petal', delaySec: 11.2, leftPct: '28%', hue: 'from-pink-200/76 to-rose-300/64', sizeCls: 'h-2.5 w-2' },
  { track: 'wind-piece-01', kind: 'leaf', delaySec: 3.9, leftPct: '43%', hue: 'from-teal-500/74 to-green-700/74', sizeCls: 'h-5 w-2.5', skewCls: 'skew-x-[14deg] -rotate-[8deg]' },
  { track: 'wind-piece-05', kind: 'petal', delaySec: 14.8, leftPct: '82%', hue: 'from-orange-50/94 to-orange-400/74', sizeCls: 'h-4 w-2' },
];

export function WindDrift() {
  return (
    <div className="wind-drift-layer" aria-hidden>
      {SPECS.map((s, i) => {
        const motionCls = `wind-${s.kind} ${s.track} ${s.sizeCls}`;
        const style = { left: s.leftPct, animationDelay: `${s.delaySec}s` } as const;

        if (s.kind === 'leaf') {
          return (
            <div
              key={`${s.track}-${i}`}
              className={`${motionCls} skew-y-[-4deg] bg-linear-to-br ${s.hue} shadow-sm ${s.skewCls ?? ''}`}
              style={style}
            />
          );
        }

        return (
          <div
            key={`${s.track}-${i}`}
            className={`${motionCls} rotate-[-8deg] bg-linear-to-br ${s.hue} shadow-[inset_-1px_0_4px_rgb(255_255_255/0.55)]`}
            style={style}
          />
        );
      })}
    </div>
  );
}
