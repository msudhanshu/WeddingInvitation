/**
 * Boat route as a Catmull–Rom spline through ordered knots (percent coords: left/top 0–100).
 *
 * • Add **`mileLeg: 0–5`** on real stops — bride → F1 → F2 → F3 → **wedding (F4)** → **groom dock**.
 * • Insert extra rows **without `mileLeg`** as “guide” pulls for a smoother bend.
 * • Keep **`mileLeg`** knots visually aligned with `Villages` / `LotusFlowers` (four lotus stops + groom dock).
 *
 * Knot order = travel direction.
 */

export type MileLeg = 0 | 1 | 2 | 3 | 4 | 5;

export interface BoatSplineKnot {
  /** Your label — only for readability in this file */
  id: string;
  /** Horizontal % from left of scene container */
  left: number;
  /** Vertical % from top */
  top: number;
  /** Optional heading in degrees — sample uses tangent blend if omitted */
  rotateDeg?: number;
  /** Omit on “fake” guide points — must have exactly one knot per mile 0…5 when set */
  mileLeg?: MileLeg;
}

/** Edit knots & fake waypoints between them here ---------------------------------------- */
export const BOAT_SPLINE_KNOTS: BoatSplineKnot[] = [
  // Bride vicinity (near Villages bride top-[2.5%] left-[6%])
  {
    id: 'bride-stop',
    mileLeg: 0,
    left: 52,
    top: 26,
    rotateDeg: 0,
  },
  { id: 'guide-bride-s', left: 50, top: 27 },
  // Flower 1 (Lotus anchor ~ left 35% top 35%)
  {
    id: 'flower-1-stop',
    mileLeg: 1,
    left: 40,
    top: 30,
    rotateDeg: 0,
  },
  { id: 'guide-between-12', left: 37, top: 35 },
  // Flower 2 (Lotus ~ 56%, 50%)
  {
    id: 'flower-2-stop',
    mileLeg: 2,
    left: 40,
    top: 40,
    rotateDeg: 0,
  },
  { id: 'guide-hook-west', left: 45, top: 45 },
  // Flower 3 (Lotus ~ 5%, 64% — boat hugs left bend)
  {
    id: 'flower-3-stop',
    mileLeg: 3,
    left: 20,
    top: 60,
    rotateDeg: 0,
  },
  { id: 'guide-towards-wedding', left: 22, top: 70 },
  // Flower 4 — wedding ceremony (near groom house; tune to match 4th lotus art)
  {
    id: 'flower-4-wedding-stop',
    mileLeg: 4,
    left: 26,
    top: 88,
    rotateDeg: 0,
  },
  { id: 'guide-wedding-to-dock', left: 70, top: 86 },
  // Groom dock (final leg — align with house / river mouth)
  {
    id: 'groom-dock-stop',
    mileLeg: 5,
    left: 70,
    top: 84,
    rotateDeg: 0,
  },
];

/** Curve fineness between each successive pair of knots (higher → smoother path, larger keyframes) */
export const SPLINE_SAMPLES_PER_SEGMENT = 28;

interface Pt {
  left: number;
  top: number;
  rotateDeg: number;
}

function catmullRom1D(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/** Single Catmull–Rom segment from p1 → p2 (uses p0, p3 as tangents); t ∈ [0, 1]. */
function catmullRomPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pick<Pt, 'left' | 'top'> {
  return {
    left: catmullRom1D(p0.left, p1.left, p2.left, p3.left, t),
    top: catmullRom1D(p0.top, p1.top, p2.top, p3.top, t),
  };
}

/** Heading in degrees from (a → b). */
export function tangentRotateDeg(a: Pick<Pt, 'left' | 'top'>, b: Pick<Pt, 'left' | 'top'>): number {
  const dx = b.left - a.left;
  const dy = b.top - a.top;
  if (dx === 0 && dy === 0) return 0;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/** `a mod 360` in [0, 360). */
function normalizeDeg(d: number): number {
  const x = d % 360;
  return x < 0 ? x + 360 : x;
}

/**
 * Smallest signed step from `prevU` to `raw` (angles in degrees) without full spins.
 * Keeps consecutive headings continuous when `atan2` jumps ±180° between samples.
 */
function nextUnwrappedHeading(prevU: number, raw: number): number {
  const prevNorm = normalizeDeg(prevU);
  const rawNorm = normalizeDeg(raw);
  let delta = rawNorm - prevNorm;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return prevU + delta;
}

function unwrapHeadingSequenceDeg(rawHeadings: readonly number[]): number[] {
  if (rawHeadings.length === 0) return [];
  const out: number[] = [rawHeadings[0]!];
  for (let i = 1; i < rawHeadings.length; i++) {
    out.push(nextUnwrappedHeading(out[i - 1]!, rawHeadings[i]!));
  }
  return out;
}

/** Dense polyline through all knots via Catmull–Rom sampling. */
export function buildCatmullRomPolyline(knots: BoatSplineKnot[], subdivisions: number): Pt[] {
  if (knots.length < 2) {
    return knots.map((k) => ({
      left: k.left,
      top: k.top,
      rotateDeg: typeof k.rotateDeg === 'number' ? k.rotateDeg : 0,
    }));
  }

  const out: Pt[] = [];
  const ctrl: Pt[] = knots.map((k) => ({ left: k.left, top: k.top, rotateDeg: 0 }));
  let prevUnwrappedHeading: number | null = null;

  for (let seg = 0; seg <= knots.length - 2; seg++) {
    const p0 = ctrl[Math.max(0, seg - 1)]!;
    const p1 = ctrl[seg]!;
    const p2 = ctrl[seg + 1]!;
    const p3 = ctrl[Math.min(ctrl.length - 1, seg + 2)]!;

    for (let j = 0; j <= subdivisions; j++) {
      if (seg > 0 && j === 0) continue;
      const t = j / subdivisions;
      const { left, top } = catmullRomPoint(p0, p1, p2, p3, t);
      const rotRaw = tangentRotateDeg(
        catmullRomPoint(p0, p1, p2, p3, Math.max(0, t - 0.04)),
        catmullRomPoint(p0, p1, p2, p3, Math.min(1, t + 0.04)),
      );
      const rotPrev =
        prevUnwrappedHeading === null
          ? rotRaw
          : nextUnwrappedHeading(prevUnwrappedHeading, rotRaw);
      prevUnwrappedHeading = rotPrev;
      out.push({ left, top, rotateDeg: rotPrev });
    }
  }
  return out;
}

/** Nearest dense-sample index for each knot (snaps spline to authored milestone positions). */
function nearestDenseIndex(samples: Pt[], knots: BoatSplineKnot[]): number[] {
  return knots.map((k) => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const dx = samples[i]!.left - k.left;
      const dy = samples[i]!.top - k.top;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  });
}

const _polyline = buildCatmullRomPolyline(BOAT_SPLINE_KNOTS, SPLINE_SAMPLES_PER_SEGMENT);
const _nearestKnotDense = nearestDenseIndex(_polyline, BOAT_SPLINE_KNOTS);

/** For each knot index `i`, index into `_polyline` closest to knot `i` */
export const SAMPLE_INDEX_NEAR_KNOT: readonly number[] = _nearestKnotDense;

/** Max `boatPosition` / `mileLeg` index (inclusive). Keeps spline and `Boat.tsx` in sync. */
export const SPLINE_ROUTE_MAX_LEG = 5;

/** For each **`mileLeg`**, dense sample index boat should rest on — built from knots that declare `mileLeg` */
export const SPLINE_LEG_STOP_INDEX: readonly number[] = (() => {
  const stops: Record<number, number> = {};
  BOAT_SPLINE_KNOTS.forEach((kn, knotIdx) => {
    if (kn.mileLeg !== undefined && stops[kn.mileLeg] === undefined) {
      stops[kn.mileLeg] = _nearestKnotDense[knotIdx]!;
    }
  });
  const arr: number[] = [];
  for (let leg = 0; leg <= SPLINE_ROUTE_MAX_LEG; leg++) {
    if (stops[leg] === undefined) {
      throw new Error(`[boatSplinePath] Missing mileLeg ${leg} on exactly one knot in BOAT_SPLINE_KNOTS`);
    }
    arr.push(stops[leg]!);
  }
  /** Assert roughly forward along spline */
  for (let i = 1; i < arr.length; i++) {
    if (arr[i]! < arr[i - 1]!) {
      // eslint-disable-next-line no-console
      console.warn(
        '[boatSplinePath] SPLINE_LEG_STOP_INDEX is not monotone — spline may bend backward; reorder knots or guides.',
      );
      break;
    }
  }
  return arr;
})();

export const SPLINE_SAMPLES: readonly Pt[] = _polyline;

export interface KeyframeArrays {
  left: string[];
  top: string[];
  rotate: number[];
  scale: number[];
  times: number[];
}

/** Interpolate boat perspective scale across a leg segment. */
function scaleKeyframes(fromLeg: number, toLeg: number, steps: number, scales: readonly number[]): number[] {
  const a = scales[Math.min(Math.max(0, fromLeg), scales.length - 1)]!;
  const b = scales[Math.min(Math.max(0, toLeg), scales.length - 1)]!;
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    const u = steps <= 1 ? 1 : i / (steps - 1);
    out.push(a + (b - a) * u);
  }
  return out;
}

/** Build motion keyframes moving along spline between **`fromLeg`** and **`toLeg`**. */
export function buildLegSegmentKeyframes(
  fromLeg: number,
  toLeg: number,
  boatScales: readonly number[],
): KeyframeArrays {
  const clamp = (n: number) => Math.min(SPLINE_ROUTE_MAX_LEG, Math.max(0, n));
  const a = clamp(fromLeg);
  const b = clamp(toLeg);
  const i0 = SPLINE_LEG_STOP_INDEX[a]!;
  const i1 = SPLINE_LEG_STOP_INDEX[b]!;
  const reversed = i0 > i1;
  let slice =
    i0 <= i1 ? SPLINE_SAMPLES.slice(i0, i1 + 1) : SPLINE_SAMPLES.slice(i1, i0 + 1).reverse();

  if (slice.length < 2) {
    slice = [SPLINE_SAMPLES[i0]!];
  }

  /** Travel direction opposes stored tangent when moving backward along the polyline. */
  if (reversed && slice.length > 0) {
    slice = slice.map((p) => ({ ...p, rotateDeg: p.rotateDeg + 180 }));
  }

  const rotateUnwrapped = unwrapHeadingSequenceDeg(slice.map((p) => p.rotateDeg));
  slice = slice.map((p, i) => ({ ...p, rotateDeg: rotateUnwrapped[i]! }));

  const steps = slice.length;
  const left = slice.map((p) => `${p.left}%`);
  const top = slice.map((p) => `${p.top}%`);
  const rotate = slice.map((p) => p.rotateDeg);

  const times = slice.map((_, idx) => (steps <= 1 ? 0 : idx / (steps - 1)));
  const scale = scaleKeyframes(a, b, steps, boatScales);

  return { left, top, rotate, scale, times };
}
