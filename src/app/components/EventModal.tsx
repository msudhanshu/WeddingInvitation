import { Fragment } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { MILESTONES_BY_LEG, milestoneMapsHref, milestoneText, type MilestoneAccent } from '../milestoneConfig';

interface EventModalProps {
  /** Matches `boatPosition` / milestone leg (inclusive **`0`**…**`5`**). */
  milestoneLeg: number;
  onClose: () => void;
}

/**
 * Renders `description`: newline = line break (`whitespace-pre-line`); segments between `**`…`**` = bold.
 */
function MilestoneFormattedDescription({ text }: { text: string }) {
  const chunks = text.trim().split('**');
  return (
    <>
      {chunks.map((chunk, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-gray-900">
            {chunk}
          </strong>
        ) : (
          <Fragment key={i}>{chunk}</Fragment>
        ),
      )}
    </>
  );
}

function accentCalendarClass(color: MilestoneAccent | undefined): string {
  switch (color) {
    case 'pink':
      return 'text-pink-600';
    case 'amber':
      return 'text-amber-600';
    case 'orange':
      return 'text-orange-600';
    case 'red':
      return 'text-red-600';
    case 'rose':
    default:
      return 'text-rose-600';
  }
}

/** Content + layout from `../milestoneConfig.ts` → `MILESTONES_BY_LEG`. Rows omitted when a field is missing or `''`. */
export function EventModal({ milestoneLeg, onClose }: EventModalProps) {
  const event = MILESTONES_BY_LEG[milestoneLeg];
  if (!event) {
    return null;
  }

  const hasTitle = milestoneText(event.title);
  const hasDate = milestoneText(event.date);
  const hasTime = milestoneText(event.time);
  const hasLocation = milestoneText(event.location);
  const mapsHref = milestoneMapsHref(event.mapsUrl);
  const hasMaps = !!mapsHref;
  const hasDescription = milestoneText(event.description);

  const hasHeader = hasTitle || hasDate;
  const hasMetaBlock = hasTime || hasLocation || hasMaps;
  const hasAnyCopy = hasHeader || hasMetaBlock || hasDescription;

  /** Longer copy → allow a wider cap (still `w-fit` so short strings stay narrow). */
  const mapsLineForWidth = hasMaps ? (milestoneText(event.mapsLabel) ? event.mapsLabel!.trim() : 'Open in Google Maps') : '';
  const joinedLength = [
    event.title,
    event.date,
    event.time,
    event.location,
    mapsLineForWidth,
    event.description,
  ]
    .filter(milestoneText)
    .join('').length;
  const widthCap =
    joinedLength > 220 ? 'max-w-[min(94vw,24rem)]' : joinedLength > 90 ? 'max-w-[min(92vw,20rem)]' : 'max-w-[min(90vw,18rem)]';

  const showDescDivider = hasDescription && (hasMetaBlock || hasHeader);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[52] flex items-center justify-center p-6"
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
        aria-label={hasTitle ? event.title!.trim() : 'Event details'}
        className={`relative w-fit min-w-[10.5rem] ${widthCap} rounded-2xl border border-white/45 bg-white/28 px-4 py-4 shadow-lg backdrop-blur-sm pointer-events-auto`}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.42 }}
        onClick={(e) => e.stopPropagation()}
      >
        {hasHeader ? (
          <div className="min-w-0 pt-0.5">
            <Calendar className={`mb-1 h-4 w-4 shrink-0 ${accentCalendarClass(event.color)}`} aria-hidden />
            {hasTitle ? <h2 className="text-sm font-bold leading-tight text-gray-950">{event.title!.trim()}</h2> : null}
            {hasDate ? (
              <p className="mt-0.5 text-[11px] font-medium text-gray-800">{event.date!.trim()}</p>
            ) : null}
          </div>
        ) : null}

        {(hasMetaBlock || hasDescription) && hasAnyCopy ? (
          <div className={`space-y-1.5 text-[11px] leading-snug text-gray-800 ${hasHeader ? 'mt-3' : 'mt-1'}`}>
            {hasTime ? (
              <div className="flex gap-2">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
                <span>{event.time!.trim()}</span>
              </div>
            ) : null}
            {hasLocation ? (
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
                <span>{event.location!.trim()}</span>
              </div>
            ) : null}
            {hasMaps ? (
              <div className="flex gap-2">
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600" aria-hidden />
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-rose-700 underline decoration-rose-400/80 underline-offset-2 hover:text-rose-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  {milestoneText(event.mapsLabel) ? event.mapsLabel!.trim() : 'Open in Google Maps'}
                </a>
              </div>
            ) : null}
            {hasDescription ? (
              <p
                className={`whitespace-pre-line text-[10px] leading-relaxed text-gray-700 ${showDescDivider ? 'border-t border-gray-400/30 pt-2' : 'pt-0.5'}`}
              >
                <MilestoneFormattedDescription text={event.description!} />
              </p>
            ) : null}
          </div>
        ) : null}

        {!hasAnyCopy ? <p className="mt-2 text-center text-[11px] text-gray-600">Details coming soon.</p> : null}
      </motion.div>
    </motion.div>
  );
}
