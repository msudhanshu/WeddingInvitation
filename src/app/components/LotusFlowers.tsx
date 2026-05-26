import React, { Fragment } from 'react';
import { motion } from 'motion/react';
import { LAYER_ASSETS } from '../layerAssets';
import { ImageWithFallback } from './ImageWithFallback';
import { flowerMilestone, milestoneText } from '../milestoneConfig';

interface LotusFlowersProps {
  onLotusClick: (index: number) => void;
  /** Boat leg: `0` = start; anchored at stop `index + 1` for each flower */
  boatPosition: number;
}

/** Base scale only (farther milestones look smaller). */
function lotusIdleBaseScale(index: number): number {
  switch (index) {
    case 0:
      return 0.5;
    case 1:
      return 1.0;
    case 2:
      return 1.55;
    default:
      return 2.00;
  }
}

/** Idle + highlight when boat is anchored at this lotus (`boatPosition === index + 1`). */
function lotusScaleFor(index: number, boatPosition: number): number {
  const base = lotusIdleBaseScale(index);
  if (boatPosition === index + 1) {
    return base * 1.18;
  }
  return base;
}

function lotusBobY(index: number): [number, number, number] {
  if (index <= 1) return [0, -1 - index, 0];
  if (index === 2) return [0, -3, 0];
  return [0, 0, 0];
}

/** Vertical bob speed: farther lotus floats more slowly. */
function lotusBobDurationSec(index: number): number {
  return index <= 1 ? (index === 0 ? 4.5 : 3) : 3;
}

export function LotusFlowers({ onLotusClick, boatPosition }: LotusFlowersProps) {
  /** `left/top` percentages — tweak 4th (wedding lotus near groom corner). */
  const lotusPositions = [
    { top: '35%', left: '35%', z: 24 },
    { top: '42%', left: '58%', z: 30 },
    { top: '60%', left: '0%', z: 30 },
    { top: '75%', left: '46%', z: 41 },
  ];

  return (
    <Fragment>
      {lotusPositions.map((position, index) => {
        const m = flowerMilestone(index);

        return (
          <motion.div
            key={index}
            className="pointer-events-none absolute flex flex-col items-center"
            style={{ top: position.top, left: position.left, zIndex: position.z }}
            animate={{
              scale: lotusScaleFor(index, boatPosition),
              y: lotusBobY(index),
            }}
            transition={{
              y: {
                repeat: Infinity,
                duration: lotusBobDurationSec(index),
                ease: 'easeInOut',
                delay: index * 0.45,
              },
              scale: { duration: 0.3 },
            }}
          >
            <div className="relative flex h-16 w-16 flex-col items-center justify-center">
              <div className="relative h-full w-full">
                <ImageWithFallback
                  src={LAYER_ASSETS.flowers[index]}
                  alt=""
                  draggable={false}
                  className="relative z-[1] h-full w-full object-contain drop-shadow-2xl select-none"
                />
                <div className="animate-pulse absolute inset-0 rounded-full bg-pink-400/30 blur-xl" />
              </div>
              {/* Tight tap target (~bloom-sized); petals/glow extend outside — reduces accidental sails. */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLotusClick(index);
                }}
                aria-label={
                  milestoneText(m.title) ? `Go to ${m.title!.trim()}` : `Go to flower ${index + 1}`
                }
                className="pointer-events-auto absolute top-[46%] left-1/2 z-[2] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#8fb899]/80 active:outline-none [@media(min-width:600px)]:h-10 [@media(min-width:600px)]:w-10"
              />
            </div>
          </motion.div>
        );
      })}
    </Fragment>
  );
}
