import { formatRatio, contrastRatio, WCAG } from "@/lib/a11y/contrast";
import { colorIn, registers, type Register } from "@/lib/a11y/css-tokens";
import { TEXT_COLOURS, TEXT_SURFACES } from "@/lib/a11y/pairings";

const LABEL = "font-mono font-medium text-[0.75rem] leading-[1.4] uppercase tracking-widest";
const REGISTER_NAME: Record<Register, string> = { paper: "Paper register", ink: "Ink register" };

// Every text colour on every text surface, in both registers, measured at
// build time from the shipped CSS. Each cell is set in its real colours with
// fixed hex, so the ink register shows dark even when the page is on paper.
export function ContrastMatrix() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      {registers.map((register) => (
        <table key={register} className="w-full border-collapse">
          <caption className={`${LABEL} text-xco-ink text-left pb-3`}>{REGISTER_NAME[register]}</caption>
          <thead>
            <tr>
              <th scope="col" className={`${LABEL} text-xco-ink-muted text-left font-medium pb-2 pr-3`}>
                Text
              </th>
              {TEXT_SURFACES.map((s) => (
                <th key={s} scope="col" className={`${LABEL} text-xco-ink-muted text-left font-medium pb-2`}>
                  {s.replace("--xco-paper", "paper").replace("paper-", "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEXT_COLOURS.map(({ token, role }) => {
              const fg = colorIn(register, token);
              return (
                <tr key={token}>
                  <th scope="row" className="text-left font-normal align-top py-1 pr-3">
                    <span className="block font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink">{token.slice(2)}</span>
                    <span className="block font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">{role}</span>
                  </th>
                  {TEXT_SURFACES.map((surface) => {
                    const bg = colorIn(register, surface);
                    const ratio = contrastRatio(fg, bg);
                    const ok = ratio >= WCAG.text;
                    return (
                      <td key={surface} className="p-0 align-top py-1 pr-1">
                        <div className="px-3 py-2" style={{ background: bg, color: fg }}>
                          <span className="block font-body text-[20px] leading-[24px]">Aa</span>
                          <span className="block font-mono font-medium text-[0.75rem] leading-[1.4]">
                            {ok ? "✓" : "✗"} {formatRatio(ratio)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      ))}
    </div>
  );
}
