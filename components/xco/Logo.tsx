import {
  logoGeometry,
  logoVariants,
  cPath,
  oPath,
  xPaths,
  descriptor,
  descriptorMetrics,
  type LogoVariant,
} from "@/lib/logo";

interface LogoProps {
  variant?: LogoVariant;
  withDescriptor?: boolean;
  /** Rendered height in px. Width follows the mark's ratio. */
  height?: number;
  className?: string;
}

export function Logo({
  variant = "ink",
  withDescriptor = false,
  height = 64,
  className = "",
}: LogoProps) {
  const v = logoVariants.find((x) => x.id === variant) ?? logoVariants[0];
  const { width, height: gh, stroke, pad, baseline } = logoGeometry;

  const d = descriptorMetrics;
  const totalHeight = gh + (withDescriptor ? d.space : 0);
  const [x1, x2] = xPaths();

  return (
    <svg
      viewBox={`0 0 ${width} ${totalHeight}`}
      height={height}
      width={(width / totalHeight) * height}
      role="img"
      aria-label="xCO — Expanding Civilizational Optionality"
      className={className}
    >
      <g fill="none" strokeWidth={stroke} strokeLinecap="butt">
        <path d={x1} stroke={v.xFg} />
        <path d={x2} stroke={v.xFg} />
        <path d={cPath()} stroke={v.fg} />
        <path d={oPath()} stroke={v.fg} />
      </g>
      {withDescriptor && (
        <text
          x={pad}
          y={baseline + d.baselineGap}
          fontFamily="var(--font-dm-mono), DM Mono, monospace"
          fontSize={d.size}
          fontWeight={500}
          letterSpacing={d.tracking}
          fill={v.fg}
        >
          {descriptor}
        </text>
      )}
    </svg>
  );
}
