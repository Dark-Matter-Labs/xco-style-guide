// The instruments, in one list: the generators' nav and the home page both
// read it, so neither can drop or reorder one on its own.

export const instruments = [
  { href: "/three-regimes",   label: "Three Regimes" },
  { href: "/option-field",    label: "Option Field" },
  { href: "/territory",       label: "Territory" },
  { href: "/social-card",     label: "Social Card" },
  { href: "/paper-cover",     label: "Paper Cover" },
  { href: "/event-series",    label: "Event Series" },
  { href: "/growth",          label: "Growth" },
  { href: "/chaos",           label: "Chaos" },
  { href: "/asemic",          label: "Asemic" },
  { href: "/notion",          label: "Notion" },
  { href: "/image-treatment", label: "Image Treatment" },
  { href: "/text-highlight",  label: "Text Highlight" },
  { href: "/design-export",   label: "Token Export" },
] as const;
