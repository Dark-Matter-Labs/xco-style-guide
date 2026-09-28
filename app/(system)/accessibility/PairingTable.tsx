import { formatRatio } from "@/lib/a11y/contrast";
import { measurePairings, type PairingResult } from "@/lib/a11y/gate";

const CELL = "font-mono font-medium text-[0.75rem] leading-[1.4] py-2 pr-4 align-top";
const HEAD = `${CELL} text-xco-ink-muted uppercase tracking-widest text-left font-medium`;

function Ratio({ r }: { r?: PairingResult }) {
  if (!r) return <span className="text-xco-ink-muted">—</span>;
  // Pass and fail are words and marks, not colours.
  return (
    <span className="text-xco-ink">
      {r.ok ? "✓" : "✗ fails"} {formatRatio(r.ratio)}
    </span>
  );
}

// The full registry, as the gate measures it. A row here cannot say pass
// while the build says fail: both call measurePairings().
export function PairingTable() {
  const results = measurePairings();
  const ids = Array.from(new Set(results.map((r) => r.pairing.id)));
  return (
    <div className="overflow-x-auto" tabIndex={0} aria-label="Every sanctioned colour pairing">
      <table className="w-full border-collapse min-w-[720px]">
        <caption className="sr-only">Every sanctioned colour pairing, measured in both registers</caption>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rule)" }}>
            <th scope="col" className={HEAD}>Pairing</th>
            <th scope="col" className={HEAD}>Where</th>
            <th scope="col" className={HEAD}>Bar</th>
            <th scope="col" className={HEAD}>Paper</th>
            <th scope="col" className={HEAD}>Ink</th>
          </tr>
        </thead>
        <tbody>
          {ids.map((id) => {
            const paper = results.find((r) => r.pairing.id === id && r.register === "paper");
            const ink = results.find((r) => r.pairing.id === id && r.register === "ink");
            const p = (paper ?? ink)!.pairing;
            return (
              <tr key={id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th scope="row" className={`${CELL} text-xco-ink text-left font-medium`}>{id}</th>
                <td className={`${CELL} text-xco-ink-muted`}>{p.where}</td>
                <td className={`${CELL} text-xco-ink-muted whitespace-nowrap`}>
                  {p.use} · {(paper ?? ink)!.min}:1
                </td>
                <td className={`${CELL} whitespace-nowrap`}><Ratio r={paper} /></td>
                <td className={`${CELL} whitespace-nowrap`}><Ratio r={ink} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
