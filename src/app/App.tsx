import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GrassBackground } from './components/GrassBackground';
import { ForestBackground } from './components/ForestBackground';
import { RiverPath } from './components/RiverPath';
import { LotusFlowers } from './components/LotusFlowers';
import { Boat, BOAT_MOVE_DURATION_SEC, BOAT_MAX_LEG } from './components/Boat';
import { Villages } from './components/Villages';
import { EventModal } from './components/EventModal';
import { WeddingCeremonyFullscreenModal } from './components/WeddingCeremonyFullscreenModal';
import { MobileInviteShell } from './components/MobileInviteShell';
import { cn } from './components/ui/utils';
import { GROOM_ADDRESS_LEG, WEDDING_CEREMONY_LEG, isLegMilestoneDateBeforeToday } from './milestoneConfig';

/** Toggle when you want the `river-bg` overlay back. */
const SHOW_RIVER_LAYER = false;

/** Set `true` to open event modals after each journey; keep `false` while tuning the scene. */
const ENABLE_EVENT_MODAL = true;

function clampBoatLeg(n: number): number {
  return Math.max(0, Math.min(BOAT_MAX_LEG, n));
}

export default function App() {
  /** Same as `boatPosition` at end of trip → `MILESTONES_BY_LEG` (0…5). */
  const [selectedMilestoneLeg, setSelectedMilestoneLeg] = useState<number | null>(null);
  const [boatPosition, setBoatPosition] = useState(0);

  const boatPositionRef = useRef(0);
  const navigationTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    boatPositionRef.current = boatPosition;
  }, [boatPosition]);

  useEffect(() => {
    return () => {
      navigationTimeoutsRef.current.forEach(clearTimeout);
      navigationTimeoutsRef.current = [];
    };
  }, []);

  const clearNavigation = () => {
    navigationTimeoutsRef.current.forEach(clearTimeout);
    navigationTimeoutsRef.current = [];
  };

  /**
   * Visits each leg in order (`from` excluded, `to` included), one move every {@link BOAT_MOVE_DURATION_SEC}s.
   * Same path forwards or backwards: always steps ±1 along the canal.
   */
  const navigateBoatSequential = (fromInput: number, toInput: number) => {
    const from = clampBoatLeg(fromInput);
    const to = clampBoatLeg(toInput);

    clearNavigation();

    if (from === to) {
      return;
    }

    const step = from < to ? 1 : -1;
    const segments: number[] = [];
    for (let p = from + step; step > 0 ? p <= to : p >= to; p += step) {
      segments.push(p);
    }

    const intervalMs = BOAT_MOVE_DURATION_SEC * 1000;

    segments.forEach((pos, idx) => {
      const tid = window.setTimeout(() => {
        boatPositionRef.current = pos;
        setBoatPosition(pos);
      }, idx * intervalMs);
      navigationTimeoutsRef.current.push(tid);
    });

    if (ENABLE_EVENT_MODAL && segments.length > 0) {
      const finalPos = segments[segments.length - 1]!;
      if (finalPos >= 0 && finalPos <= BOAT_MAX_LEG) {
        const modalTid = window.setTimeout(() => {
          boatPositionRef.current = finalPos;
          setSelectedMilestoneLeg(finalPos);
        }, segments.length * intervalMs);
        navigationTimeoutsRef.current.push(modalTid);
      }
    }
  };

  const handleLotusClick = (index: number) => {
    setSelectedMilestoneLeg(null);
    const target = clampBoatLeg(index + 1);
    navigateBoatSequential(boatPositionRef.current, target);
  };

  const handleBrideHomeClick = () => {
    setSelectedMilestoneLeg(null);
    navigateBoatSequential(boatPositionRef.current, 0);
  };

  const handleGroomHomeClick = () => {
    if (boatPositionRef.current >= BOAT_MAX_LEG) {
      setSelectedMilestoneLeg(GROOM_ADDRESS_LEG);
      return;
    }
    setSelectedMilestoneLeg(null);
    navigateBoatSequential(boatPositionRef.current, BOAT_MAX_LEG);
  };

  const handlePrevLeg = () => {
    setSelectedMilestoneLeg(null);
    navigateBoatSequential(boatPositionRef.current, boatPositionRef.current - 1);
  };

  const handleNextLeg = () => {
    setSelectedMilestoneLeg(null);
    navigateBoatSequential(boatPositionRef.current, boatPositionRef.current + 1);
  };

  const handleBackgroundNext = () => {
    setSelectedMilestoneLeg(null);
    handleNextLeg();
  };

  const handleCloseModal = () => {
    setSelectedMilestoneLeg(null);
  };

  const atFirstLeg = boatPosition <= 0;
  const atLastLeg = boatPosition >= BOAT_MAX_LEG;

  const sceneIsPastMilestone = useMemo(
    () => isLegMilestoneDateBeforeToday(boatPosition),
    [boatPosition],
  );

  return (
    <div className="min-h-[100dvh] w-full bg-zinc-950">
      <MobileInviteShell>
        <div className="relative h-full w-full overflow-hidden bg-[#8fb899]">
          <div
            className={cn(
              'absolute inset-0 overflow-hidden transition-[filter] duration-700 ease-in-out',
              sceneIsPastMilestone && 'grayscale saturate-0 brightness-[0.88] contrast-[0.94]',
            )}
          >
            <GrassBackground />

            <ForestBackground />

            {/* Empty sky / framing: tap advances one leg (flowers & houses sit above). */}
            <button
              type="button"
              aria-label="Next stop on journey"
              className="absolute inset-0 z-[14] border-0 bg-transparent p-0 touch-manipulation"
              onClick={handleBackgroundNext}
            />

            {SHOW_RIVER_LAYER && <RiverPath />}

            <Villages
              boatPosition={boatPosition}
              onBrideHomeClick={handleBrideHomeClick}
              onGroomHomeClick={handleGroomHomeClick}
            />

            <LotusFlowers onLotusClick={handleLotusClick} boatPosition={boatPosition} />

            <Boat position={boatPosition} />
          </div>

          {ENABLE_EVENT_MODAL && selectedMilestoneLeg === WEDDING_CEREMONY_LEG && (
            <WeddingCeremonyFullscreenModal onClose={handleCloseModal} />
          )}
          {ENABLE_EVENT_MODAL &&
            selectedMilestoneLeg !== null &&
            selectedMilestoneLeg !== WEDDING_CEREMONY_LEG && (
              <EventModal milestoneLeg={selectedMilestoneLeg} onClose={handleCloseModal} />
            )}

          {/* Above overlays — nav stays reachable. */}
          <button
            type="button"
            aria-label="Previous stop"
            disabled={atFirstLeg}
            className="-translate-y-1/2 absolute top-1/2 left-2 z-[70] rounded-full border-0 bg-white/90 p-2.5 shadow-xl backdrop-blur-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevLeg();
            }}
          >
            <ChevronLeft className="h-7 w-7 text-gray-800" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next stop"
            disabled={atLastLeg}
            className="-translate-y-1/2 absolute top-1/2 right-2 z-[70] rounded-full border-0 bg-white/90 p-2.5 shadow-xl backdrop-blur-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              handleNextLeg();
            }}
          >
            <ChevronRight className="h-7 w-7 text-gray-800" aria-hidden />
          </button>
        </div>
      </MobileInviteShell>
    </div>
  );
}
