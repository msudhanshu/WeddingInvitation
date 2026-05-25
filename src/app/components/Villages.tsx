import React from 'react';
import { motion } from 'motion/react';
import {
  GROOM_ADDRESS_LEG,
  MILESTONES_BY_LEG,
  milestoneText,
  type MilestoneEventCopy,
} from '../milestoneConfig';

function milestoneChipTitle(milestone: MilestoneEventCopy | undefined, fallback: string): string {
  if (milestone && milestoneText(milestone.title)) {
    return milestone.title!.trim();
  }
  return fallback;
}

interface VillagesProps {
  boatPosition: number;
  onBrideHomeClick: () => void;
  onGroomHomeClick: () => void;
}

/**
 * House “boxes” — positioning (edit here):
 * • Bride wrapper: `motion.div` below with top/left and optional scale (search “BRIDE POSITION”).
 * • Groom wrapper: `motion.div` — **bottom-right corner** (`max` + safe-area insets; search “GROOM POSITION”).
 * Tap-hit: large invisible block + label (`min` sizes below are tuned for mobile ~44pt+ targets).
 */

/** Minimum touch width/height for the clear sky area above the chip (iOS-friendly). */
const TRANSPARENT_HIT_W = 'min(10.5rem, 42vw)';
const TRANSPARENT_HIT_H = 'min(7.5rem, 32vw)';

function VillageTarget({
  onClick,
  villageLabel,
}: {
  onClick: () => void;
  villageLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex min-h-[11rem] min-w-[9.5rem] max-w-[12rem] cursor-pointer touch-manipulation flex-col items-stretch gap-2 border-0 bg-transparent p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      aria-label={villageLabel}
    >
      <div
        className="shrink-0 rounded-2xl bg-transparent"
        style={{
          width: TRANSPARENT_HIT_W,
          minWidth: '100%',
          height: TRANSPARENT_HIT_H,
          minHeight: '6.5rem',
          touchAction: 'manipulation',
        }}
        aria-hidden
      />
      <div className="max-w-[9.5rem] self-center rounded-lg border border-white/40 bg-black/35 px-2.5 py-1.5 backdrop-blur-sm">
        <p className="text-center text-[11px] font-semibold tracking-tight text-white drop-shadow">{villageLabel}</p>
      </div>
    </button>
  );
}

export function Villages({ boatPosition, onBrideHomeClick, onGroomHomeClick }: VillagesProps) {
  const bride = MILESTONES_BY_LEG[0];
  const groom = MILESTONES_BY_LEG[GROOM_ADDRESS_LEG];

  const atBride = boatPosition === 0;
  const atGroom = boatPosition >= 5;

  return (
    <>
      {/* BRIDE POSITION — change top / left / scale here */}
      <motion.div
        className="absolute top-[2.5%] left-[6%] z-[24] scale-[0.92] transform"
        animate={atBride ? { scale: [0.92, 0.97, 0.92] } : { scale: 0.92 }}
        transition={atBride ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } : {}}
      >
        <VillageTarget onClick={onBrideHomeClick} villageLabel={milestoneChipTitle(bride, "Bride's village")} />
      </motion.div>

      {/* GROOM POSITION — bottom-right corner (inset + safe areas; tune here) */}
      <motion.div
        className="absolute right-[max(0.5rem,env(safe-area-inset-right))] bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-[42]"
        animate={atGroom ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={atGroom ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } : {}}
      >
        <VillageTarget onClick={onGroomHomeClick} villageLabel={milestoneChipTitle(groom, "Groom's village")} />
      </motion.div>
    </>
  );
}
