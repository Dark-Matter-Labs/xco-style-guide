import { WIP } from "@/components/WIP";
import { a11yRules, type Enforcement } from "@/lib/a11y/rules";
import { exemptions } from "@/lib/a11y/pairings";
import { WCAG } from "@/lib/a11y/contrast";
import { ContrastMatrix } from "./ContrastMatrix";
import { PairingTable } from "./PairingTable";

const H2 = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8";
const BODY = "font-body text-[24px] text-xco-ink leading-[26px]";
const SMALL = "font-mono font-medium text-[0.9375rem] leading-[1.6]";

const TIERS: { by: Enforcement; name: string; command: string; when: string; what: string }[] = [
  {
    by: "gate",
    name: "Gate",
    command: "npm run a11y",
    when: "Before every build — locally and on Vercel. A failure stops the deploy.",
    what: "Measures every sanctioned colour pairing in both registers, every text-colour utility in the source, faded text, removed focus rings, saturated accents set as text, the generated-asset palettes and the group marks. Checks the TypeScript token copy against the CSS.",
  },
  {
    by: "audit",
    name: "Audit",
    command: "npm run a11y:audit",
    when: "On every pull request, in CI, against the production build.",
    what: "Opens every page in Chromium in both registers and runs axe-core (WCAG 2.0–2.2 A/AA and best practice): rendered contrast, names and labels, landmarks, headings, target size. Then emulates reduced motion and fails any page where CSS still animates.",
  },
  {
    by: "review",
    name: "Review",
    command: "the checklist below",
    when: "When a new component, diagram or generator is added.",
    what: "What a machine cannot judge: whether colour is the only carrier, whether canvas motion can be paused, whether a posted asset has alt text.",
  },
];

const BY_LABEL: Record<Enforcement, string> = { gate: "gate", audit: "audit", review: "review" };

export default function AccessibilityPage() {
  const reviewItems = a11yRules.flatMap((r) => r.checks.filter((c) => c.by === "review").map((c) => ({ rule: r.title, how: c.how })));

  return (
    <div className="doc-wrap py-12 space-y-24">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">Accessibility</h1>
        <WIP variant="version" />
      </header>

      <section className="max-w-2xl space-y-4">
        <p className={BODY}>
          Accessibility is part of the system, not a pass at the end of it. A colour is only a
          token here once its pairings clear WCAG 2.2 AA in both registers; a component is only
          done once it can be read, named and reached by keyboard.
        </p>
        <p className={BODY}>
          Nothing on this page is a claim typed by hand. The ratios are measured from the CSS
          that ships, by the same functions that fail the build — so the page cannot say pass
          while the build says fail.
        </p>
      </section>

      <section aria-labelledby="enforcement">
        <h2 id="enforcement" className={H2}>How it is enforced</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((t) => (
            <div key={t.by} className="space-y-3 pt-4" style={{ borderTop: "1px solid var(--rule)" }}>
              <h3 className="doc-h2 text-xco-ink">{t.name}</h3>
              <p className={`${SMALL} text-xco-ink`}><code>{t.command}</code></p>
              <p className={`${SMALL} text-xco-ink-muted`}>{t.when}</p>
              <p className={`${SMALL} text-xco-ink`}>{t.what}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="rules">
        <h2 id="rules" className={H2}>The rules</h2>
        <ol className="space-y-10 max-w-4xl">
          {a11yRules.map((r, i) => (
            <li key={r.id} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 pt-4" style={{ borderTop: "1px solid var(--rule)" }}>
              <div className="space-y-1">
                <p className={`${SMALL} text-xco-ink-muted`}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className={`${SMALL} text-xco-ink uppercase tracking-widest`}>{r.title}</h3>
                <p className={`${SMALL} text-xco-ink-muted`}>WCAG {r.wcag.join(", ")}</p>
              </div>
              <div className="space-y-3">
                <p className={BODY}>{r.rule}</p>
                <ul className="space-y-1">
                  {r.checks.map((c) => (
                    <li key={c.how} className={`${SMALL} text-xco-ink flex gap-3`}>
                      <span className="text-xco-dusk-ink shrink-0 w-16">[{BY_LABEL[c.by]}]</span>
                      <span>{c.how}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="text-colours" className="space-y-8">
        <div className="max-w-2xl space-y-4">
          <h2 id="text-colours" className={H2}>Text colours</h2>
          <p className={BODY}>
            The six colours text may be set in, on the three surfaces text may sit on. Every
            cell clears {WCAG.text}:1. Structural paper is for rules and borders, never text;
            saturated dusk, ocean, teal and the domain colours are fills and strokes — their
            -ink forms are the text.
          </p>
        </div>
        <ContrastMatrix />
      </section>

      <section aria-labelledby="pairings" className="space-y-8">
        <div className="max-w-2xl space-y-4">
          <h2 id="pairings" className={H2}>Every pairing</h2>
          <p className={BODY}>
            The registry in <code className="font-mono text-[0.9375rem]">lib/a11y/pairings.ts</code>.
            Adding a colour to the system means adding its pairings there. A pairing that
            cannot pass is not an exception — it is not a pairing.
          </p>
        </div>
        <PairingTable />
      </section>

      <section aria-labelledby="exemptions">
        <h2 id="exemptions" className={H2}>Not held to a ratio</h2>
        <dl className="space-y-4 max-w-3xl">
          {exemptions.map((e) => (
            <div key={e.what} className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-2">
              <dt className={`${SMALL} text-xco-ink`}>{e.what}</dt>
              <dd className={`${SMALL} text-xco-ink-muted`}>{e.why}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="checklist">
        <h2 id="checklist" className={H2}>Before it ships</h2>
        <ul className="space-y-2 max-w-3xl">
          {reviewItems.map((item) => (
            <li key={item.how} className={`${SMALL} text-xco-ink flex gap-3`}>
              <span aria-hidden="true">□</span>
              <span>
                <span className="text-xco-ink-muted">{item.rule} — </span>
                {item.how}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
