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
 * • Groom wrapper: `motion.div` with right/bottom (search “GROOM POSITION”).
 * Tap-hit size: `TRANSPARENT_HIT_W` / `TRANSPARENT_HIT_H` on the invisible div inside `VillageTarget`.
 */

const TRANSPARENT_HIT_W = '4.75rem';
const TRANSPARENT_HIT_H = '4.75rem';

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
      className="flex cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      aria-label={villageLabel}
    >
      {/* Invisible tap target (no outline); size from TRANSPARENT_HIT_* above */}
      <div
        className="rounded-xl bg-transparent shrink-0"
        style={{
          width: TRANSPARENT_HIT_W,
          height: TRANSPARENT_HIT_H,
          touchAction: 'manipulation',
        }}
        aria-hidden
      />
      <div className="max-w-[9.5rem] rounded-lg border border-white/40 bg-black/35 px-2.5 py-1.5 backdrop-blur-sm">
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

      {/* GROOM POSITION — change right / bottom / scale here */}
      <motion.div
        className="absolute right-[8%] bottom-[5%] z-[42]"
        animate={atGroom ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={atGroom ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } : {}}
      >
        <VillageTarget onClick={onGroomHomeClick} villageLabel={milestoneChipTitle(groom, "Groom's village")} />
      </motion.div>
    </>
  );
}
