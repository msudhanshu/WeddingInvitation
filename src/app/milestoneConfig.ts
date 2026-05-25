/**
 * Journey legs: **0** bride · **1–4** river lotus milestones (Engagement … **Wedding**) · **5** groom dock (`boatPosition`).
 *
 * Popup: `title`, `date`, `time`, `location`, **`eventDateISO`**, `description`, **`mapsUrl`**, etc.
 * **`eventDateISO`** (`YYYY-MM-DD`) — calendar day per stop; scene turns **gray** when the boat is at that stop and that day is **before today**. Without ISO we try **`date`** text.
 *
 * **`Groom’s address`:** leg **5** — `EventModal` when you tap the **groom** village marker (**already docked**: opens immediately; otherwise the boat sails to the dock first).
 * **`Wedding Ceremony`:** leg **4** — rich invite copy in **`WEDDING_CEREMONY_FULLSCREEN`** (glass modal like other popups). Short title for journey / aria stays **`MILESTONES_BY_LEG[4].title`**.
 */

export type MilestoneAccent = 'rose' | 'pink' | 'amber' | 'orange' | 'red';

export interface MilestoneEventCopy {
  title?: string;
  /** Human-readable label (shown in popup / chips) */
  date?: string;
  /**
   * Calendar day for this stop (`YYYY-MM-DD`). Used so the river/forest scene can fade to grayscale
   * when you’re stationed here **after** that day has passed.
   */
  eventDateISO?: string;
  time?: string;
  location?: string;
  /** Google Maps (or Maps short link); omit/`''` to hide */
  mapsUrl?: string;
  /** Link label in the popup — default “Open in Google Maps” */
  mapsLabel?: string;
  description?: string;
  /** Visual accent — optional */
  color?: MilestoneAccent;
}

/** Rich copy for the wedding popup (`WeddingCeremonyFullscreenModal`). Omit / `''` hides a block. */
export interface WeddingCeremonyFullscreenCopy {
  headline?: string;
  subhead?: string;
  dateLine?: string;
  timeLine?: string;
  venue?: string;
  venueNote?: string;
  invitation?: string;
  sections?: ReadonlyArray<{ title?: string; body: string }>;
  dressCode?: string;
  rsvp?: string;
  footerNote?: string;
  mapsUrl?: string;
  mapsLabel?: string;
}

/** Omit or `''` to skip that line in UI. */
export function milestoneText(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Safe `href` for `mapsUrl` — trims, adds `https://` when no scheme. */
export function milestoneMapsHref(url: string | undefined | null): string | undefined {
  if (!milestoneText(url)) return undefined;
  const t = url!.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return t;
  return `https://${t}`;
}

/**
 * Wedding ceremony invite — edit freely. Shown when the boat reaches leg **4** (4th lotus), in the same translucent style as **`EventModal`**.
 * `MILESTONES_BY_LEG[4]` still supplies the short name for the map journey / flower label.
 */
export const WEDDING_CEREMONY_FULLSCREEN: WeddingCeremonyFullscreenCopy = {
  headline: 'Wedding Ceremony',
  subhead: 'With love, we invite you to celebrate with us',
  dateLine: 'Sunday, June 22, 2026',
  timeLine: '10:00 AM – 2:00 PM',
  venue: "Groom's Family Estate",
  venueNote: 'Ceremony followed by lunch and reception',
  invitation:
    'We would be honoured by your presence as we begin our new chapter together.\n\n' +
    'Kindly save the date — detailed schedule and logistics will be shared closer to the day.',
  sections: [
    {
      title: 'Schedule',
      body: 'Morning ceremony · family portraits · reception',
    },
    {
      title: 'Gifts',
      body: 'Your presence is our greatest gift. No boxed gifts, please.',
    },
  ],
  dressCode: 'Traditional / festive — colours welcome',
  rsvp: 'Please RSVP by 1 June 2026 — contact us on the numbers shared in your invite.',
  footerNote: 'We can’t wait to celebrate with you.',
  // mapsUrl: 'https://maps.google.com/...',
};

/** `leg` matches `boatPosition`; same index selects modal content. */
export const MILESTONES_BY_LEG: readonly MilestoneEventCopy[] = [
  {
    title: "Bride's",
    eventDateISO: '2026-01-10',
    date: '10 January 2026',
    location: "Village- Mathura, Hajipur, Vaishali, Bihar",
    description: 'Daughter of : \n' +
    'Miss Lili Prabhakar and Prof Prabhat Prabhakar',
    // Example: uncomment and paste share link from Google Maps
    // mapsUrl: 'https://maps.google.com/?q=Hajipur+Vaishali+Bihar',
    color: 'rose',
  },
  {
    title: 'Engagement Ceremony',
    eventDateISO: '2026-03-13',
    date: 'March 13, 2026',
    time: '6:00 PM – 9:00 PM',
    location: 'Viswanatheeshwarar Shiva Temple, Vellore',
    //Lord Kasi 
    // mapsUrl: 'https://www.google.com/maps/place/Lord+Kasi+Viswanatheeshwarar+Shiva+Temple,+Puttuthakku/@12.9465979,79.2366972,20.15z/data=!4m14!1m7!3m6!1s0x3bad37e39798f9b7:0xd2161985a0f68bf7!2sRasna+Rooms!8m2!3d12.9410625!4d79.2371875!16s%2Fg%2F11fj0xknvc!3m5!1s0x3bad37d6e2a7e4f9:0xe86f0799fae8606e!8m2!3d12.9465566!4d79.2367613!16s%2Fg%2F11b6c57vhl?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D',
    color: 'pink',
  },
  {
    title: 'Haldi Ceremony',
    eventDateISO: '2026-06-19',
    date: 'June 19, 2026',
    time: '8:00 PM onwards',
    location: 'Village Community Hall',
    description: 'Blessings under the canopy.',
    color: 'amber',
  },
  {
    title: 'Mehendi Ceremony',
    eventDateISO: '2026-06-20',
    date: 'June 20, 2026',
    time: '4:00 PM – 8:00 PM',
    location: 'Village Community Hall',
    description: 'Henna, music, and festivities.',
    color: 'orange',
  },
  {
    title: 'Wedding Ceremony',
    eventDateISO: '2026-06-22',
    date: 'June 22, 2026',
    time: '10:00 AM – 2:00 PM',
    location: "Groom's Family Estate",
    description: 'The sacred ceremony and grand reception.',
    color: 'red',
  },
  {
    title: 'Groom’s',
    eventDateISO: '2026-06-23',
    date: 'June 23, 2026',
    location: 'Village- Pachapan-Par, Nadaul, Patna, Bihar',
    description: 'Son of : \n' +
    'Miss Dharmashila Devi and Engr R.P Prasad',
    // mapsUrl: 'https://maps.google.com/...',
    color: 'red',
  },
];

/** `MILESTONES_BY_LEG` index for groom-address popup. */
export const GROOM_ADDRESS_LEG = 5 as const;

/** Journey leg whose completion opens the rich wedding **`WEDDING_CEREMONY_FULLSCREEN`** modal (4th lotus stop). */
export const WEDDING_CEREMONY_LEG = 4 as const;

/** Lotus `flowerIndex` 0…3 → journey legs **1…4** (4th lotus = wedding). */
export function flowerMilestone(flowerIndex: number): MilestoneEventCopy {
  return MILESTONES_BY_LEG[flowerIndex + 1]!;
}

function startOfLocalDayMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Local midnight for the milestone's calendar day (`null` if unknown). */
export function milestoneEventDayTimestampMs(legIndex: number): number | null {
  const m = MILESTONES_BY_LEG[legIndex];
  if (!m) return null;
  let raw: string | undefined;
  if (milestoneText(m.eventDateISO)) raw = m.eventDateISO!.trim();
  else if (milestoneText(m.date)) raw = m.date!.trim();
  else return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const parts = raw.split('-').map((s) => Number(s));
    const y = parts[0];
    const mo = parts[1];
    const d = parts[2];
    if (y === undefined || mo === undefined || d === undefined) return null;
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return startOfLocalDayMs(dt);
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return startOfLocalDayMs(parsed);
}

/**
 * When the boat is at `legIndex`, render grass / forest / river / props in **grayscale** if this stop's
 * **`eventDateISO`** (else parsed **`date`**) is **strictly before** today's local calendar day.
 */
export function isLegMilestoneDateBeforeToday(legIndex: number, now: Date = new Date()): boolean {
  const eventDay = milestoneEventDayTimestampMs(legIndex);
  if (eventDay === null) return false;
  return eventDay < startOfLocalDayMs(now);
}
