import { endorsementLabel, LOCKUP_FONT, LOCKUP_WEIGHT, logoVariants, stripMetrics, type LogoVariant } from "@/lib/logo";
import { dmStampPath, dmWordmarkPath } from "@/lib/dm-logo";

/**
 * The endorsement strip (CH-15) as an SVG group, for drawing inside a larger
 * SVG such as a cover. (x, y) is the top-left of the label's ink and DM's
 * stamp; `stamp` is the stamp's height in the parent's units. Clear space of
 * one stamp height lies outside that box and is the caller's to keep.
 */
export function EndorsementStrip({
  x,
  y,
  stamp,
  variant = "ink",
}: {
  x: number;
  y: number;
  stamp: number;
  variant?: LogoVariant;
}) {
  const m = stripMetrics;
  const v = logoVariants.find((l) => l.id === variant) ?? logoVariants[0];
  const k = stamp / m.stamp;
  // The strip's own clear space is one stamp (m.stamp units) on every side.
  return (
    <g transform={`translate(${x - m.stamp * k} ${y - m.stamp * k}) scale(${k})`} aria-label="An initiative of Dark Matter Labs" role="img">
      <text x={m.labelX} y={m.labelBaseline} fontFamily={LOCKUP_FONT} fontSize={m.labelSize} fontWeight={LOCKUP_WEIGHT} letterSpacing={m.labelTracking} fill={v.fg}>
        {endorsementLabel}
      </text>
      <g transform={`translate(${m.dm.x} ${m.dm.y}) scale(${m.dm.scale})`} fill={v.dmFg}>
        <path d={dmWordmarkPath} />
        <path fillRule="evenodd" clipRule="evenodd" d={dmStampPath} />
      </g>
    </g>
  );
}
