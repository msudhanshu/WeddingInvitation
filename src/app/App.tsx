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
import { BackgroundMusic } from './components/BackgroundMusic';
import { cn } from './components/ui/utils';
import { GROOM_ADDRESS_LEG, WEDDING_CEREMONY_LEG, isLegMilestoneDateBeforeToday } from './milestoneConfig';

/** Toggle when you want the `river-bg` overlay back. */
const SHOW_RIVER_LAYER = false;

/** Set `true` to open event modals after each journey; keep `false` while tuning the scene. */
const ENABLE_EVENT_MODAL = true;

/**
 * Simulated “next taps” until the wedding fullscreen opens — passive viewers still see the full ride.
 * Stops permanently once ceremony is visible; disables if the guest navigates manually (lotus/houses/prev).
 */
const ENABLE_AUTO_JOURNEY_TO_WEDDING = ENABLE_EVENT_MODAL;

/** Quiet time before the first auto-advance (after splash is dismissed). */
const AUTO_JOURNEY_FIRST_PAUSE_MS = 4500;

/** How long each milestone card stays visible before closing and sailing on. */
const AUTO_JOURNEY_MODAL_DWELL_MS = 4800;

/** Pause once docked at a stop before the next auto “tap”. */
const AUTO_JOURNEY_SCENE_PAUSE_MS = 1400;

function clampBoatLeg(n: number): number {
  return Math.max(0, Math.min(BOAT_MAX_LEG, n));
}

/** Close then reopen so React shows the modal again when tapping the same milestone. */
function reopenMilestoneModal(setLeg: (v: number | null) => void, leg: number) {
  setLeg(null);
  queueMicrotask(() => setLeg(leg));
}

function _noopNext(): void {}

function _noopClose(): void {}

export default function App() {
  /** Same as `boatPosition` at end of trip → `MILESTONES_BY_LEG` (0…5). */
  const [selectedMilestoneLeg, setSelectedMilestoneLeg] = useState<number | null>(null);
  const [boatPosition, setBoatPosition] = useState(0);
  /** True while scripted multi-leg moves are running — chevrons stay disabled until the boat finishes. */
  const [navTransitLocked, setNavTransitLocked] = useState(false);

  const boatPositionRef = useRef(0);
  const navigationTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const navUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * On load the boat stays at bride (leg 0) with no popup. The first “next” (sky tap or →)
   * opens leg 0’s card before moving toward leg 1 so the bride stop isn’t skipped.
   */
  const brideIntroFromNextConsumedRef = useRef(false);

  const autopilotTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  /** Manual nav (flowers / villages / backward) disables simulated journey — overlay / → keep autopilot. */
  const suppressAutopilotRef = useRef(false);
  /** Wedding fullscreen reached once — never auto-advance beyond that invite. */
  const autopilotEndedAtWeddingRef = useRef(false);

  const handleNextLegRef = useRef(_noopNext);
  const handleCloseModalRef = useRef(_noopClose);

  function clearAutopilotTimers() {
    autopilotTimersRef.current.forEach(clearTimeout);
    autopilotTimersRef.current = [];
  }

  function suppressAutopilot() {
    suppressAutopilotRef.current = true;
    clearAutopilotTimers();
  }

  useEffect(() => {
    boatPositionRef.current = boatPosition;
  }, [boatPosition]);

  useEffect(() => {
    return () => {
      navigationTimeoutsRef.current.forEach(clearTimeout);
      navigationTimeoutsRef.current = [];
      if (navUnlockTimerRef.current !== null) {
        clearTimeout(navUnlockTimerRef.current);
        navUnlockTimerRef.current = null;
      }
      clearAutopilotTimers();
    };
  }, []);

  const clearNavigation = () => {
    navigationTimeoutsRef.current.forEach(clearTimeout);
    navigationTimeoutsRef.current = [];
    if (navUnlockTimerRef.current !== null) {
      clearTimeout(navUnlockTimerRef.current);
      navUnlockTimerRef.current = null;
    }
    setNavTransitLocked(false);
  };

  /**
   * Visits each leg in order (`from` excluded, `to` included), one move every {@link BOAT_MOVE_DURATION_SEC}s.
   * Same path forwards or backwards: always steps ±1 along the canal.
   */
  const navigateBoatSequential = (fromInput: number, toInput: number) => {
    const from = clampBoatLeg(fromInput);
    const to = clampBoatLeg(toInput);

    if (from !== to && from === 0 && to > 0) {
      brideIntroFromNextConsumedRef.current = true;
    }

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

    /** One interval per segment = one boat glide; lock chevrons for the whole trip. */
    setNavTransitLocked(true);
    if (navUnlockTimerRef.current !== null) clearTimeout(navUnlockTimerRef.current);
    const transitMs = segments.length * intervalMs;
    navUnlockTimerRef.current = window.setTimeout(() => {
      navUnlockTimerRef.current = null;
      setNavTransitLocked(false);
    }, transitMs);
  };

  const handleLotusClick = (index: number) => {
    suppressAutopilot();
    const target = clampBoatLeg(index + 1);
    if (boatPositionRef.current === target) {
      if (ENABLE_EVENT_MODAL) reopenMilestoneModal(setSelectedMilestoneLeg, target);
      return;
    }
    setSelectedMilestoneLeg(null);
    navigateBoatSequential(boatPositionRef.current, target);
  };

  const handleBrideHomeClick = () => {
    suppressAutopilot();
    if (boatPositionRef.current === 0) {
      if (ENABLE_EVENT_MODAL) {
        brideIntroFromNextConsumedRef.current = true;
        reopenMilestoneModal(setSelectedMilestoneLeg, 0);
      }
      return;
    }
    setSelectedMilestoneLeg(null);
    navigateBoatSequential(boatPositionRef.current, 0);
  };

  const handleGroomHomeClick = () => {
    suppressAutopilot();
    if (boatPositionRef.current >= BOAT_MAX_LEG) {
      if (ENABLE_EVENT_MODAL) reopenMilestoneModal(setSelectedMilestoneLeg, GROOM_ADDRESS_LEG);
      return;
    }
    setSelectedMilestoneLeg(null);
    navigateBoatSequential(boatPositionRef.current, BOAT_MAX_LEG);
  };

  const handlePrevLeg = () => {
    suppressAutopilot();
    setSelectedMilestoneLeg(null);
    navigateBoatSequential(boatPositionRef.current, boatPositionRef.current - 1);
  };

  const handleNextLeg = () => {
    if (
      ENABLE_EVENT_MODAL &&
      boatPositionRef.current === 0 &&
      !brideIntroFromNextConsumedRef.current
    ) {
      brideIntroFromNextConsumedRef.current = true;
      setSelectedMilestoneLeg(0);
      return;
    }
    setSelectedMilestoneLeg(null);
    navigateBoatSequential(boatPositionRef.current, boatPositionRef.current + 1);
  };

  const handleBackgroundNext = () => {
    handleNextLeg();
  };

  const handleCloseModal = () => {
    setSelectedMilestoneLeg(null);
  };

  useEffect(() => {
    handleNextLegRef.current = handleNextLeg;
    handleCloseModalRef.current = handleCloseModal;
  });

  /** Simulated progression: dwell on each milestone, then sail until wedding fullscreen stays open. */
  useEffect(() => {
    clearAutopilotTimers();
    if (!ENABLE_AUTO_JOURNEY_TO_WEDDING) return;
    if (suppressAutopilotRef.current || autopilotEndedAtWeddingRef.current) return;

    if (selectedMilestoneLeg === WEDDING_CEREMONY_LEG) {
      autopilotEndedAtWeddingRef.current = true;
      return;
    }

    function queue(delay: number, action: () => void) {
      const id = window.setTimeout(() => {
        autopilotTimersRef.current = autopilotTimersRef.current.filter((t) => t !== id);
        if (suppressAutopilotRef.current || autopilotEndedAtWeddingRef.current) return;
        action();
      }, delay);
      autopilotTimersRef.current.push(id);
    }

    if (selectedMilestoneLeg !== null) {
      queue(AUTO_JOURNEY_MODAL_DWELL_MS, () => handleCloseModalRef.current());
      return;
    }

    if (navTransitLocked) return;

    const pauseMs =
      boatPosition === 0 && !brideIntroFromNextConsumedRef.current
        ? AUTO_JOURNEY_FIRST_PAUSE_MS
        : AUTO_JOURNEY_SCENE_PAUSE_MS;

    queue(pauseMs, () => handleNextLegRef.current());
  }, [boatPosition, navTransitLocked, selectedMilestoneLeg]);

  const atFirstLeg = boatPosition <= 0;
  const atLastLeg = boatPosition >= BOAT_MAX_LEG;

  const sceneIsPastMilestone = useMemo(
    () => isLegMilestoneDateBeforeToday(boatPosition),
    [boatPosition],
  );

  return (
    <div className="min-h-[100dvh] w-full">
      <MobileInviteShell>
        <BackgroundMusic />
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
              disabled={navTransitLocked}
              className="absolute inset-0 z-[14] border-0 bg-transparent p-0 touch-manipulation disabled:pointer-events-none"
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
            disabled={atFirstLeg || navTransitLocked}
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
            disabled={atLastLeg || navTransitLocked}
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
