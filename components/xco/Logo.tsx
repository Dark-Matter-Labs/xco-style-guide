import {
  logoGeometry,
  logoVariants,
  cPath,
  oPath,
  xPaths,
  descriptor,
  descriptorMetrics,
  endorsementLabel,
  endorsementMetrics,
  lockupHeight,
  inkBounds,
  type LogoVariant,
} from "@/lib/logo";
import { dmStampPath, dmWordmarkPath } from "@/lib/dm-logo";
import { serifXPath } from "@/lib/serif-x";

interface LogoProps {
  variant?: LogoVariant;
  withDescriptor?: boolean;
  /** Add "AN INITIATIVE OF" + Dark Matter Labs' lockup. Implies the descriptor. */
  withEndorsement?: boolean;
  /** Rendered height in px. Width follows the mark's ratio. */
  height?: number;
  /**
   * Crop to the ink, dropping the built-in clear space. For the mark set
   * inside a layout that already spaces it — the nav, a masthead. Height then
   * measures the ink rather than the padded frame.
   */
  inline?: boolean;
  /**
   * Override every glyph's colour, e.g. "currentColor" so the mark follows the
   * Paper/Ink register. Without it, the variant's fixed colours are used.
   */
  color?: string;
  /** PROPOSAL: "serif" draws the x from Untitled Serif. See lib/serif-x.ts. */
  xStyle?: "mono" | "serif";
  /** Accessible name. Shorten it where the full name is already spelled out beside the mark. */
  label?: string;
  className?: string;
}

export function Logo({
  variant = "ink",
  withDescriptor = false,
  withEndorsement = false,
  height = 64,
  inline = false,
  color,
  xStyle = "mono",
  label = "xCO — Expanding Civilizational Optionality",
  className = "",
}: LogoProps) {
  const v = logoVariants.find((x) => x.id === variant) ?? logoVariants[0];
  const { width, stroke, baseline } = logoGeometry;

  const d = descriptorMetrics;
  const e = endorsementMetrics;
  const showDesc = withDescriptor || withEndorsement;
  const totalHeight = lockupHeight(showDesc, withEndorsement);
  const [x1, x2] = xPaths();
  const fg = color ?? v.fg;
  const xFg = color ?? v.xFg;

  // An inline mark has no descriptor: the descriptor belongs to the lockup,
  // and the lockup carries its own clear space.
  const box = inline
    ? {
        x: inkBounds.left,
        y: inkBounds.top,
        w: inkBounds.right - inkBounds.left,
        h: inkBounds.bottom - inkBounds.top,
      }
    : { x: 0, y: 0, w: width, h: totalHeight };

  return (
    <svg
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      height={height}
      width={(box.w / box.h) * height}
      role="img"
      aria-label={label}
      className={className}
    >
      <g fill="none" strokeWidth={stroke} strokeLinecap="butt">
        {xStyle === "mono" && <path d={x1} stroke={xFg} />}
        {xStyle === "mono" && <path d={x2} stroke={xFg} />}
        <path d={cPath()} stroke={fg} />
        <path d={oPath()} stroke={fg} />
      </g>
      {xStyle === "serif" && <path d={serifXPath} fill={xFg} />}
      {showDesc && !inline && (
        <text
          x={d.x}
          y={baseline + d.baselineGap}
          fontFamily="var(--font-dm-mono), DM Mono, monospace"
          fontSize={d.size}
          fontWeight={500}
          letterSpacing={d.tracking}
          fill={fg}
        >
          {descriptor}
        </text>
      )}
      {withEndorsement && !inline && (
        <>
          <text
            x={e.labelX}
            y={baseline + d.baselineGap + e.labelBaselineGap}
            fontFamily="var(--font-dm-mono), DM Mono, monospace"
            fontSize={e.labelSize}
            fontWeight={500}
            letterSpacing={e.labelTracking}
            fill={fg}
          >
            {endorsementLabel}
          </text>
          {/* DM's mark is never recoloured, so it ignores the color override. */}
          <g transform={e.dmTransform} fill={v.dmFg}>
            <path d={dmWordmarkPath} />
            <path fillRule="evenodd" clipRule="evenodd" d={dmStampPath} />
          </g>
        </>
      )}
    </svg>
  );
}
