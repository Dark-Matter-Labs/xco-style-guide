import { inkBounds, type LogoVariant } from "@/lib/logo";
import { lockupLayout, lockupMarkup, type Lockup } from "@/lib/logo-lockups";

interface LogoProps {
  variant?: LogoVariant;
  /** Which lockup. See lib/logo-lockups.ts. */
  lockup?: Lockup;
  /** Shorthand for lockup="stacked". */
  withDescriptor?: boolean;
  /** Shorthand for lockup="endorsed": the stack plus Dark Matter Labs' endorsement. */
  withEndorsement?: boolean;
  /** Rendered height in px. Width follows the lockup's ratio. */
  height?: number;
  /**
   * Crop to the ink, dropping the built-in clear space. For the mark set
   * inside a layout that already spaces it — the nav, a masthead. Height then
   * measures the ink rather than the padded frame.
   */
  inline?: boolean;
  /**
   * Override every glyph's colour, e.g. "currentColor" so the mark follows
   * light and dark mode. Without it, the variant's fixed colours are used.
   */
  color?: string;
  /** PROPOSAL: "serif" draws the x from Untitled Serif. See lib/serif-x.ts. */
  xStyle?: "mono" | "serif";
  /** Accessible name. Shorten it where the full name is already spelled out beside the mark. */
  label?: string;
  className?: string;
}

export function Logo({
  variant = "light",
  lockup,
  withDescriptor = false,
  withEndorsement = false,
  height = 64,
  inline = false,
  color,
  xStyle = "mono",
  label,
  className = "",
}: LogoProps) {
  // An inline mark is the logotype alone: the lockups carry their own clear space.
  const which: Lockup = inline
    ? "mark"
    : lockup ?? (withEndorsement ? "endorsed" : withDescriptor ? "stacked" : "mark");
  const layout = lockupLayout(which, variant, { color, xStyle });
  const box = inline
    ? { l: inkBounds.left, t: inkBounds.top, r: inkBounds.right, b: inkBounds.bottom }
    : layout.frame;
  const w = box.r - box.l;
  const h = box.b - box.t;

  return (
    <svg
      viewBox={`${box.l} ${box.t} ${w} ${h}`}
      height={height}
      width={(w / h) * height}
      role="img"
      aria-label={label ?? (which === "mark" ? "xCO — Expanding Civilizational Optionality" : layout.label)}
      className={className}
      dangerouslySetInnerHTML={{ __html: lockupMarkup(layout) }}
    />
  );
}
