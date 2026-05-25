import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Sparkles, ExternalLink } from 'lucide-react';
import {
  WEDDING_CEREMONY_FULLSCREEN,
  milestoneMapsHref,
  milestoneText,
} from '../milestoneConfig';

interface WeddingCeremonyFullscreenModalProps {
  onClose: () => void;
}

/**
 * Wedding ceremony popup — separate from **`EventModal`**, same translucent shell (backdrop + glass card).
 *
 * Edit **`src/app/milestoneConfig.ts`** → **`WEDDING_CEREMONY_FULLSCREEN`**.
 */
export function WeddingCeremonyFullscreenModal({ onClose }: WeddingCeremonyFullscreenModalProps) {
  const w = WEDDING_CEREMONY_FULLSCREEN;
  const mapsHref = milestoneMapsHref(w.mapsUrl);
  const hasMaps = !!mapsHref;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[58] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="pointer-events-auto absolute inset-0 bg-black/15 backdrop-blur-[1px]"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        aria-hidden
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={w.headline ?? 'Wedding ceremony'}
        className="relative max-h-[min(85dvh,32rem)] w-full max-w-[min(94vw,24rem)] overflow-y-auto rounded-2xl border border-white/45 bg-white/28 px-4 pb-4 pt-0 shadow-lg backdrop-blur-sm pointer-events-auto"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.42 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="-mx-4 sticky top-0 z-[1] mb-3 flex items-center justify-between gap-3 rounded-t-2xl border-b border-white/35 bg-white/25 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-rose-600" aria-hidden />
            <span className="truncate text-[10px] font-semibold tracking-[0.15em] text-gray-950 uppercase">
              Wedding
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/55 bg-white/40 px-3 py-1 text-[11px] font-semibold tracking-wide text-gray-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/60 touch-manipulation"
          >
            Done
          </button>
        </div>

        <div className="px-0.5 pb-1">
          {milestoneText(w.headline) ? (
            <h1 className="text-center font-serif text-lg font-semibold leading-tight tracking-tight text-gray-950">
              {w.headline!.trim()}
            </h1>
          ) : null}
          {milestoneText(w.subhead) ? (
            <p className="mt-2 text-center text-[11px] italic leading-snug text-gray-800">{w.subhead!.trim()}</p>
          ) : null}

          <div className="mx-auto mt-4 space-y-2 rounded-xl border border-white/35 bg-white/15 px-3 py-3 text-[11px] leading-snug text-gray-800 backdrop-blur-sm">
            {milestoneText(w.dateLine) ? (
              <div className="flex gap-2">
                <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-700" aria-hidden />
                <span>{w.dateLine!.trim()}</span>
              </div>
            ) : null}
            {milestoneText(w.timeLine) ? (
              <div className="flex gap-2">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-700" aria-hidden />
                <span>{w.timeLine!.trim()}</span>
              </div>
            ) : null}
            {milestoneText(w.venue) ? (
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-700" aria-hidden />
                <span>
                  {w.venue!.trim()}
                  {milestoneText(w.venueNote) ? (
                    <span className="mt-1 block text-[10px] text-gray-700">{w.venueNote!.trim()}</span>
                  ) : null}
                </span>
              </div>
            ) : null}
            {hasMaps ? (
              <div className="flex gap-2">
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-700" aria-hidden />
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-rose-800 underline decoration-rose-400/70 underline-offset-2 hover:text-rose-950"
                  onClick={(e) => e.stopPropagation()}
                >
                  {milestoneText(w.mapsLabel) ? w.mapsLabel!.trim() : 'Open venue in Google Maps'}
                </a>
              </div>
            ) : null}
          </div>

          {milestoneText(w.invitation) ? (
            <p className="mt-4 whitespace-pre-line text-[11px] leading-relaxed text-gray-800">{w.invitation!.trim()}</p>
          ) : null}

          {w.sections?.length ? (
            <div className="mt-5 space-y-4">
              {w.sections.map((block, i) =>
                milestoneText(block.body) ? (
                  <section key={i} className="border-l-2 border-rose-400/40 pl-3">
                    {milestoneText(block.title) ? (
                      <h2 className="text-[10px] font-semibold tracking-[0.18em] text-gray-950 uppercase">{block.title!.trim()}</h2>
                    ) : null}
                    <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-gray-800">{block.body.trim()}</p>
                  </section>
                ) : null,
              )}
            </div>
          ) : null}

          {milestoneText(w.dressCode) ? (
            <div className="mt-5 rounded-xl border border-white/35 bg-white/15 px-3 py-2.5 backdrop-blur-sm">
              <h2 className="text-[10px] font-semibold tracking-[0.18em] text-gray-950 uppercase">Attire</h2>
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-800">{w.dressCode!.trim()}</p>
            </div>
          ) : null}

          {milestoneText(w.rsvp) ? (
            <div className="mt-3 rounded-xl border border-white/35 bg-white/15 px-3 py-2.5 backdrop-blur-sm">
              <h2 className="text-[10px] font-semibold tracking-[0.18em] text-gray-950 uppercase">RSVP</h2>
              <p className="mt-1.5 whitespace-pre-line text-[11px] leading-relaxed text-gray-800">{w.rsvp!.trim()}</p>
            </div>
          ) : null}

          {milestoneText(w.footerNote) ? (
            <p className="mt-5 text-center text-[11px] italic leading-snug text-gray-700">{w.footerNote!.trim()}</p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
