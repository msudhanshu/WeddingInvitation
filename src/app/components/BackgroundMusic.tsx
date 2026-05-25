import { useEffect, useRef } from 'react';

/** Copy served from `/public/media/bg-music.mp3` — plain path avoids brittle URL-encoding. */
const MUSIC_SRC = '/media/bg-music.mp3';

const PEAK_VOLUME = 0.55;

/** Ramp in at clip start / after loop rewind. */
const FADE_IN_SEC = 2.8;

/** Duck before EOF so rewind is masked. */
const FADE_OUT_SEC = 2.8;

/** Snap to loop when this close to the end (during near-silent tail). */
const LOOP_RESTART_EPS = 0.08;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Must match `removeEventListener` options from `addEventListener`. */
function teardownGestureListeners(handler: () => void) {
  window.removeEventListener('touchstart', handler, { capture: true });
  document.removeEventListener('pointerdown', handler, { capture: true });
  document.removeEventListener('click', handler, true);
  window.removeEventListener('keydown', handler);
}

/**
 * Looped background MP3 with soft head/tail. Browsers need a user gesture before audio —
 * listeners use **capture** so `stopPropagation()` on inner elements does not block unlock.
 */
export function BackgroundMusic() {
  const rafRef = useRef(0);

  useEffect(() => {
    let alive = true;
    const audio = new Audio(MUSIC_SRC);
    audio.loop = false;
    audio.preload = 'auto';
    audio.muted = false;

    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');

    let userStarted = false;

    function stopDriveLoop() {
      if (rafRef.current !== 0) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    }

    function driveVolumes() {
      if (!alive) return;

      rafRef.current = requestAnimationFrame(driveVolumes);

      if (!userStarted || audio.paused) return;

      const d = audio.duration;
      const t = audio.currentTime;

      const gainIntro = clamp01(t / FADE_IN_SEC);
      /** Until metadata is reliable, skip tail duck so we are not stuck at volume 0. */
      const hasTailFade = Number.isFinite(d) && d > FADE_IN_SEC + FADE_OUT_SEC * 0.4;
      const gainTail = hasTailFade ? clamp01((d - t) / FADE_OUT_SEC) : 1;
      audio.volume = PEAK_VOLUME * Math.min(gainIntro, gainTail);

      if (hasTailFade && d - t <= LOOP_RESTART_EPS) {
        audio.currentTime = 0;
      }
    }

    function startDriveIfPlaying() {
      if (!alive || !userStarted || audio.paused) return;
      stopDriveLoop();
      driveVolumes();
    }

    /** Invoke `play()` synchronously inside the gesture stack — do not `await` before it. */
    function requestStart() {
      if (userStarted || !alive) return;
      teardownGestureListeners(requestStart);
      userStarted = true;

      audio.volume = 0;
      void audio.play().catch(() => {
        userStarted = false;
      });
    }

    window.addEventListener('touchstart', requestStart, { capture: true, passive: true });
    document.addEventListener('pointerdown', requestStart, { capture: true, passive: true });
    document.addEventListener('click', requestStart, true);
    window.addEventListener('keydown', requestStart);

    audio.addEventListener('playing', () => startDriveIfPlaying());

    audio.addEventListener('pause', () => {
      if (!alive) return;
      stopDriveLoop();
    });

    audio.addEventListener('error', () => {
      // eslint-disable-next-line no-console
      console.warn('[BackgroundMusic] failed to load or decode:', MUSIC_SRC, audio.error);
    });

    return () => {
      alive = false;
      teardownGestureListeners(requestStart);
      stopDriveLoop();
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  return null;
}
