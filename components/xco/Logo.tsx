import {
  logoGeometry,
  logoVariants,
  cPath,
  oPath,
  xPath,
  descriptor,
  descriptorMetrics,
  inkBounds,
  type LogoVariant,
} from "@/lib/logo";

interface LogoProps {
  variant?: LogoVariant;
  withDescriptor?: boolean;
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
  /** Accessible name. Shorten it where the full name is already spelled out beside the mark. */
  label?: string;
  className?: string;
}

export function Logo({
  variant = "ink",
  withDescriptor = false,
  height = 64,
  inline = false,
  color,
  label = "xCO — Expanding Civilizational Optionality",
  className = "",
}: LogoProps) {
  const v = logoVariants.find((x) => x.id === variant) ?? logoVariants[0];
  const { width, height: gh, stroke, pad, baseline } = logoGeometry;

  const d = descriptorMetrics;
  const totalHeight = gh + (withDescriptor ? d.space : 0);
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
      <path d={xPath()} fill={xFg} />
      <g fill="none" strokeWidth={stroke} strokeLinecap="butt">
        <path d={cPath()} stroke={fg} />
        <path d={oPath()} stroke={fg} />
      </g>
      {withDescriptor && !inline && (
        <text
          x={pad}
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
    </svg>
  );
}
