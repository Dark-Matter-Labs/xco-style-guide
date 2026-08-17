import { WIP } from "@/components/WIP";
import { Mark, Port, Callout, EpistemicTag, Chain, Thesis, Stat, StatGrid, Kicker } from "@/components/xco";
import { domainColors, spacingScale, motionTokens } from "@/lib/design-tokens";

type Domain = "bio" | "inst" | "tech" | "culture";

const DOMAINS: Domain[] = ["bio", "inst", "tech", "culture"];

export default function ComponentsPage() {
  return (
    <div className="space-y-24">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="font-display text-[60px] leading-[60px]">Components</h1>
        <WIP variant="version" />
      </header>

      <section className="max-w-2xl space-y-4">
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          A vocabulary for knowledge in motion. These components carry epistemic weight —
          they tag domains, signal confidence, make arguments visible as structure.
        </p>
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          Each component is minimal by design. Complexity is composition, not decoration.
          Pair them; let the layout do the work.
        </p>
      </section>

      {/* ── Domain system ──────────────────────────────────────────── */}
      <section className="space-y-16">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Domain system
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Four domains: biological, institutional, technological, cultural.
            Domain marks orientate — they say <em>where</em> this sits, not <em>what it means</em>.
            Never substitute domain colour for semantic meaning.
          </p>
        </div>

        {/* Mark */}
        <div className="space-y-8">
          <div className="space-y-1">
            <h3 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">Mark</h3>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
              Inline shape indicator. Circle for bio, square for inst, triangle for tech, diamond for culture.
              Shape is the primary channel — colour reinforces.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 items-end">
            {DOMAINS.map((domain) => (
              <div key={domain} className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="space-y-1 text-center">
                    <Mark domain={domain} size="xs" />
                    <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">xs</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <Mark domain={domain} size="sm" />
                    <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">sm</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <Mark domain={domain} size="md" />
                    <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">md</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <Mark domain={domain} size="lg" />
                    <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">lg</p>
                  </div>
                </div>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  {domain}
                </p>
              </div>
            ))}
          </div>

          <div
            className="p-4 font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted"
            style={{ background: "var(--xco-paper-quiet)" }}
          >
            {`<Mark domain="bio" size="sm" />`}
          </div>
        </div>

        {/* Port */}
        <div className="space-y-8">
          <div className="space-y-1">
            <h3 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">Port</h3>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
              Inline text tagged to a domain. Domain tint background with coloured left border.
              Use within running prose to annotate a concept as belonging to a domain.
            </p>
          </div>

          <div className="space-y-4">
            <p className="font-body text-[24px] text-xco-ink leading-[26px]">
              The intervention crosses three domains:{" "}
              <Port domain="bio">soil microbiome health</Port>
              {" "}is the substrate;{" "}
              <Port domain="inst">regulatory frameworks</Port>
              {" "}set the ceiling; and{" "}
              <Port domain="tech">sensing infrastructure</Port>
              {" "}provides the signal.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {DOMAINS.map((domain) => (
              <Port key={domain} domain={domain}>{domain}</Port>
            ))}
          </div>

          <div
            className="p-4 font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted"
            style={{ background: "var(--xco-paper-quiet)" }}
          >
            {`<Port domain="inst">regulatory frameworks</Port>`}
          </div>
        </div>

        {/* Callout */}
        <div className="space-y-8">
          <div className="space-y-1">
            <h3 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">Callout</h3>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
              Block-level domain annotation. Coloured left border, domain tint background.
              Use for observations, conditions, or constraints that belong to one domain.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl">
            <Callout domain="bio">
              Soil microbiome diversity functions as distributed intelligence: the more varied
              the microbial population, the more pathways exist for nutrient cycling and
              system recovery after stress.
            </Callout>
            <Callout domain="inst">
              Governance structures that encode optionality resist lock-in. A framework with
              reversible commitments preserves more future paths than one that mandates a
              single trajectory.
            </Callout>
            <Callout domain="tech">
              Infrastructure interoperability multiplies civilizational surface area. Each
              additional interconnect is not additive but multiplicative — it expands the
              space of possible combinations.
            </Callout>
            <Callout domain="culture">
              Narrative plurality is a civilizational resource. A culture that can hold
              contradictory stories about itself maintains the cognitive flexibility to
              adapt when dominant framings fail.
            </Callout>
          </div>

          <div
            className="p-4 font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted"
            style={{ background: "var(--xco-paper-quiet)" }}
          >
            {`<Callout domain="bio">\n  Soil microbiome diversity...\n</Callout>`}
          </div>
        </div>
      </section>

      {/* ── Epistemic system ───────────────────────────────────────── */}
      <section className="space-y-16">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Epistemic system
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            How confident are we? Epistemic tags make the claim&apos;s standing visible.
            Three levels — evidence, inference, assumption — coded by border style:
            solid, dotted, dashed.
          </p>
        </div>

        <div className="space-y-8">
          <h3 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">EpistemicTag</h3>

          <div className="flex flex-wrap gap-4 items-center">
            <EpistemicTag status="evidence" />
            <EpistemicTag status="inference" />
            <EpistemicTag status="assumption" />
          </div>

          <div className="space-y-4 max-w-3xl">
            {([
              {
                status: "evidence" as const,
                text: "Three longitudinal studies across 40 years confirm that institutional diversity correlates with system resilience under stress.",
              },
              {
                status: "inference" as const,
                text: "This likely reflects a selection effect: systems with more institutional variation have more redundant pathways when dominant structures fail.",
              },
              {
                status: "assumption" as const,
                text: "We assume continued access to distributed sensing data through the next programme cycle.",
              },
            ]).map(({ status, text }) => (
              <div key={status} className="flex items-start gap-3">
                <div className="pt-1 shrink-0">
                  <EpistemicTag status={status} />
                </div>
                <p className="font-body text-[24px] text-xco-ink leading-[26px]">{text}</p>
              </div>
            ))}
          </div>

          <div
            className="p-4 font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted"
            style={{ background: "var(--xco-paper-quiet)" }}
          >
            {`<EpistemicTag status="inference" />`}
          </div>
        </div>
      </section>

      {/* ── Content patterns ───────────────────────────────────────── */}
      <section className="space-y-16">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Content patterns
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Reusable structures for argument and data. Chain for process, Thesis for key claims,
            Stat for numbers that matter.
          </p>
        </div>

        {/* Thesis */}
        <div className="space-y-8">
          <div className="space-y-1">
            <h3 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">Thesis</h3>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
              Pull-quote for the central claim of a section or document. Dusk left border.
              Use once per document — the thesis is singular.
            </p>
          </div>

          <div className="max-w-3xl">
            <Thesis attribution="xCO core frame">
              The goal is not one good future. It is to keep more futures reachable.
            </Thesis>
          </div>

          <div
            className="p-4 font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted"
            style={{ background: "var(--xco-paper-quiet)" }}
          >
            {`<Thesis attribution="xCO core frame">\n  The goal is not one good future...\n</Thesis>`}
          </div>
        </div>

        {/* Chain */}
        <div className="space-y-8">
          <div className="space-y-1">
            <h3 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">Chain</h3>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
              Sequence of steps connected by arrows. For process flows, causal chains,
              intervention logic. Mono type, bordered steps.
            </p>
          </div>

          <div className="space-y-6">
            <Chain steps={["Observe", "Model", "Intervene", "Evaluate"]} />
            <Chain steps={["Signal", "Interpret", "Route", "Act", "Learn"]} />
            <Chain steps={["Draft", "Test", "Revise", "Publish"]} />
          </div>

          <div
            className="p-4 font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted"
            style={{ background: "var(--xco-paper-quiet)" }}
          >
            {`<Chain steps={["Observe", "Model", "Intervene", "Evaluate"]} />`}
          </div>
        </div>

        {/* Stat */}
        <div className="space-y-8">
          <div className="space-y-1">
            <h3 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">Stat / StatGrid</h3>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
              Large-number display. Display type for the value, mono for the label.
              Optional domain colour on the value. StatGrid for multi-stat layout.
            </p>
          </div>

          <StatGrid columns={3}>
            <Stat value="3.8B" label="people without reliable civic infrastructure" domain="inst" />
            <Stat value="72hr" label="mean institutional response time to acute stress" domain="bio" />
            <Stat value="6" label="semantic meanings in the xCO vocabulary" />
          </StatGrid>

          <div
            className="p-4 font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted"
            style={{ background: "var(--xco-paper-quiet)" }}
          >
            {`<StatGrid columns={3}>\n  <Stat value="3.8B" label="..." domain="inst" />\n</StatGrid>`}
          </div>
        </div>

        {/* Kicker */}
        <div className="space-y-8">
          <div className="space-y-1">
            <h3 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">Kicker</h3>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
              Section eyebrow label. Mono, small-caps, tracked out. Use before a heading to
              set context. Optional domain colour.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <Kicker>Framework</Kicker>
              <p className="font-display text-[36px] leading-[40px] text-xco-ink">Optionality as civilizational commons</p>
            </div>
            <div className="space-y-1">
              <Kicker domain="bio">Biological dimension</Kicker>
              <p className="font-display text-[36px] leading-[40px] text-xco-ink">What the soil already knows</p>
            </div>
            <div className="space-y-1">
              <Kicker domain="inst">Governance</Kicker>
              <p className="font-display text-[36px] leading-[40px] text-xco-ink">Structures that remain open</p>
            </div>
          </div>

          <div
            className="p-4 font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted"
            style={{ background: "var(--xco-paper-quiet)" }}
          >
            {`<Kicker domain="bio">Biological dimension</Kicker>`}
          </div>
        </div>
      </section>

      {/* ── Composed example ───────────────────────────────────────── */}
      <section className="space-y-8 pb-8">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Composed
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Components compose. A document fragment combining thesis, domain callouts,
            epistemic tags, and a stat grid.
          </p>
        </div>

        <div
          className="p-8 space-y-8 max-w-3xl"
          style={{ border: "1px solid var(--border-default)" }}
        >
          <div className="space-y-2">
            <Kicker>Field note — Aug 2026</Kicker>
            <h3 className="font-display text-[36px] leading-[40px] text-xco-ink">
              Distributed resilience, cross-domain
            </h3>
          </div>

          <Thesis>
            Resilience is not a property of systems. It is a property of the
            relationships between systems.
          </Thesis>

          <div className="flex items-start gap-3">
            <div className="pt-1 shrink-0">
              <EpistemicTag status="inference" />
            </div>
            <p className="font-body text-[24px] text-xco-ink leading-[26px]">
              The pattern across fourteen case studies suggests that systems which share{" "}
              <Port domain="inst">governance interfaces</Port>
              {" "}with adjacent{" "}
              <Port domain="bio">biological systems</Port>
              {" "}recover faster from shock.
            </p>
          </div>

          <div className="space-y-4">
            <Callout domain="bio">
              In six of fourteen cases, ecological restoration preceded — and may have
              enabled — institutional stabilisation. The causal direction remains unclear.
            </Callout>
            <Callout domain="inst">
              Governance structures with shorter feedback loops responded three times faster
              than hierarchical equivalents, across all environmental categories.
            </Callout>
          </div>

          <div>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted mb-6 uppercase tracking-widest text-[0.75rem]">
              Intervention logic
            </p>
            <Chain steps={["Map interfaces", "Stress-test", "Redesign", "Pilot", "Scale"]} />
          </div>

          <StatGrid columns={3}>
            <Stat value="14" label="case studies across three continents" />
            <Stat value="3×" label="faster recovery with shared governance" domain="inst" />
            <Stat value="6/14" label="cases where ecology preceded stability" domain="bio" />
          </StatGrid>
        </div>
      </section>

      {/* ── Spacing scale ──────────────────────────────────────────── */}
      <section className="space-y-8 pb-8">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Fibonacci spacing
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Seven steps based on the golden ratio (φ = 1.618). Use these for padding,
            gap, and margin — never ad-hoc pixel values.
          </p>
        </div>

        <div className="space-y-4">
          {spacingScale.map((step) => (
            <div key={step.step} className="flex items-center gap-6">
              <div
                className="shrink-0"
                style={{ width: `${step.px}px`, height: "20px", background: "var(--xco-ink)", opacity: 0.7 }}
              />
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink w-12">
                {step.px}px
              </span>
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
                {step.cssVar}
              </span>
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
                {step.usage}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Motion tokens ──────────────────────────────────────────── */}
      <section className="space-y-8 pb-16">
        <div className="space-y-2">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Motion
          </h2>
          <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl">
            Three durations + one easing curve. Motion should feel considered, not decorative.
            Default to fast unless the transition communicates something.
          </p>
        </div>

        <div className="space-y-4 max-w-2xl">
          {(["fast", "mid", "slow"] as const).map((key) => {
            const token = motionTokens[key];
            return (
              <div key={key} className="flex items-center gap-6">
                <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink w-16">
                  {token.ms}ms
                </span>
                <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted w-20">
                  {token.cssVar}
                </span>
                <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
                  {token.usage}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-6 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink w-16">ease</span>
            <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted w-20">--ease</span>
            <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
              {motionTokens.ease.value}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
