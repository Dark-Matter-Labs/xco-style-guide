// The xCO at Medulla series — 100 days, 18 September – 26 December 2026.
//
// Presets for the event-card generator, taken from the programme in the
// partnership summary (revised 16 September). Only two dates are fixed: the
// 18 September kick-off and 8 October. Every other date is a draft week, so
// those presets say so on the card ("tbc") rather than inventing a day — edit
// the fields once a date is settled. Times are only given where the programme
// gives them.
//
// Left out on purpose: the philanthropy dinner, which is closed and has no
// public page, and the optional low-fidelity formats, which are not yet
// events.

export const SERIES_NAME = "xCO at Medulla";
export const VENUE = "Medulla, Dresdener Str. 113B, Berlin";

export interface EventContent {
  /** Bracketed kind — what the evening opens: a position, a capability… */
  kicker: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
}

export interface ProgrammePreset {
  id: string;
  label: string;
  content: EventContent;
}

const at = (c: Omit<EventContent, "location">): EventContent => ({ ...c, location: VENUE });

export const programme: ProgrammePreset[] = [
  {
    id: "series",
    label: "Series announcement",
    content: at({
      kicker: "Pop-up studio",
      title: "xCO at Medulla",
      subtitle: "100 days of live positions, and what they are missing",
      date: "18 Sept – 26 Dec 2026",
      time: "Open studio",
    }),
  },
  {
    id: "field-assembly",
    label: "18 Sept — Field Assembly",
    content: at({
      kicker: "Frame",
      title: "Public Vitality Field Assembly",
      subtitle: "Kick-off — part of Public Vitality Camp",
      date: "Fri 18 September",
      time: "18:00",
    }),
  },
  {
    id: "cooling-cohort",
    label: "8 Oct — Cooling Cohort",
    content: at({
      kicker: "Position",
      title: "Nascent Cooling Cohort",
      subtitle: "Heat: Madrid, Mumbai, Berlin",
      date: "Thu 8 October",
      time: "Evening",
    }),
  },
  {
    id: "civic-power",
    label: "8 Oct — Civic Power (alt.)",
    content: at({
      kicker: "Position",
      title: "Civic Power Infrastructure",
      subtitle: "UK and Global",
      date: "Thu 8 October",
      time: "Evening",
    }),
  },
  {
    id: "metadesign",
    label: "Late Oct — Hackathon",
    content: at({
      kicker: "Capability",
      title: "Metadesign and Design Engineering",
      subtitle: "A hackathon for the missing tooling",
      date: "26–27 October (tbc)",
      time: "Full day & evening",
    }),
  },
  {
    id: "oceans",
    label: "Early Nov — Oceans",
    content: at({
      kicker: "Position",
      title: "Oceans Continuity Studio",
      subtitle: "A soft launch ahead of the December Funders Forum",
      date: "Early November (tbc)",
      time: "Evening",
    }),
  },
  {
    id: "curricula",
    label: "Early Dec — Curricula",
    content: at({
      kicker: "Capability",
      title: "Curricula for existential entrepreneurship",
      subtitle: "With Kaospilot",
      date: "Early December (tbc)",
      time: "Evening",
    }),
  },
];
