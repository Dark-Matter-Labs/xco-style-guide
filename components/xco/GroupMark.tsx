import { logoGeometry as g, cPath, xPaths } from "@/lib/logo";
import { paletteHex } from "@/lib/design-tokens";
import { groupColors, type GroupMark as Mark } from "@/lib/group-marks";

interface GroupMarkProps {
  mark: Mark;
  size?: number;
  /** Mask to a circle, as Signal does. */
  round?: boolean;
  /** Drop all hue, to show what the aperture channel carries alone. */
  greyscale?: boolean;
  className?: string;
}

const BOX = 1024;
const SAFE = 0.58;
const RING = 20;

const glyphW = g.cCx + g.cap / 2 - g.xLeft;
const scale = (BOX * SAFE) / Math.max(glyphW, g.cap);
const tx = BOX / 2 - (g.xLeft + glyphW / 2) * scale;
const ty = BOX / 2 - ((g.capTop + g.baseline) / 2) * scale;

export function groundHex(mark: Mark): string {
  return mark.ground.kind === "token"
    ? paletteHex[mark.ground.token]
    : groupColors[mark.ground.color].hex;
}

// Renders a group mark as live SVG from the same geometry and registry the
// PNG generator uses — so the documentation shows the actual mark rather than
// a picture of one that might be stale.
export function GroupMark({
  mark,
  size = 96,
  round = true,
  greyscale = false,
  className = "",
}: GroupMarkProps) {
  const bg = groundHex(mark);
  const c = paletteHex[mark.c];
  const x = paletteHex[mark.x];
  const [xa, xb] = xPaths();

  const stroke = (d: string, fg: string, key: string) => (
    <path
      key={key}
      d={d}
      fill="none"
      stroke={fg}
      strokeWidth={g.stroke}
      strokeLinecap="butt"
    />
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${BOX} ${BOX}`}
      className={className}
      role="img"
      aria-label={`${mark.name} — aperture ${mark.aperture} degrees`}
      style={greyscale ? { filter: "grayscale(1)" } : undefined}
    >
      <g>
        {/* The round ground is drawn as a circle rather than a clipped square.
            A clipPath would need an id, and the same mark appears more than
            once per page — duplicate ids are invalid and make every instance
            resolve to the first definition. Nothing needs clipping anyway:
            the lockup sits at 58% of the frame, well inside the circle. */}
        {round ? (
          <circle cx={BOX / 2} cy={BOX / 2} r={BOX / 2} fill={bg} />
        ) : (
          <rect width={BOX} height={BOX} fill={bg} />
        )}
        <circle
          cx={BOX / 2}
          cy={BOX / 2}
          r={BOX / 2 - RING / 2}
          fill="none"
          stroke={c}
          strokeWidth={RING}
          strokeOpacity={0.32}
        />
        <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
          {stroke(xa, x, "xa")}
          {stroke(xb, x, "xb")}
          {/* Only the C rotates — the x stays put so the lockup keeps reading
              left to right. */}
          <g transform={`rotate(${-mark.aperture} ${g.cCx} ${g.midY})`}>
            {stroke(cPath(), c, "c")}
          </g>
        </g>
      </g>
    </svg>
  );
}
