import { WIP } from "@/components/WIP";
import { CopyButton } from "@/components/CopyButton";
import { ToneLinter } from "./ToneLinter";
import { toneRegisters, promptTemplates } from "@/lib/tone-templates";
import { bannedWords } from "@/lib/design-tokens";

export default function TonePage() {
  return (
    <div className="space-y-20">
      {/* Header */}
      <header className="flex items-baseline justify-between border-b border-xco-ink/[0.12] pb-6">
        <h1 className="font-display text-4xl">Tone of Voice</h1>
        <WIP variant="v0.1" />
      </header>

      {/* Principle */}
      <section className="max-w-2xl space-y-4">
        <p className="font-body text-lg text-xco-ink leading-relaxed">
          Three registers. Pick deliberately. The writing fails if the register
          is chosen by accident — an annotation that reads like a hunch, a
          method text that reads like an annotation, a hunch mistaken for a
          conclusion.
        </p>
        <p className="font-body text-xco-ink-muted leading-relaxed">
          Across all registers: declarative about the question, tentative about
          the answer. Specific verbs, real numbers, named places where possible.
          Mark uncertainty inline — never drop a claim because it's uncertain,
          mark it and keep it.
        </p>
      </section>

      {/* Three registers */}
      <section>
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-8">
          Three Registers
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-xco-ink/[0.12]">
          {toneRegisters.map((reg) => (
            <div key={reg.id} className="bg-xco-paper p-8 space-y-6">
              {/* Register header */}
              <div>
                <p className="font-mono text-xs text-xco-ink-muted uppercase tracking-widest mb-1">
                  {reg.id}
                </p>
                <h3 className="font-display text-2xl">{reg.label}</h3>
                <p className="font-mono text-xs text-xco-ink-muted italic mt-1">
                  {reg.usage}
                </p>
              </div>

              {/* Rule */}
              <div className="border-l-2 border-xco-ember pl-4">
                <p className="font-body text-base text-xco-ink italic leading-snug">
                  {reg.rule}
                </p>
                <p className="font-mono text-xs text-xco-ink-muted mt-1 leading-relaxed">
                  {reg.ruleDetail}
                </p>
              </div>

              {/* Examples */}
              <div className="space-y-5">
                {reg.examples.map((ex, i) => (
                  <div key={i} className="space-y-2">
                    <div className="space-y-1">
                      <p className="font-mono text-xs text-xco-ink-muted">✓ this</p>
                      <p className="font-body text-sm text-xco-ink leading-relaxed">
                        {ex.good}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-xs text-xco-ink-muted opacity-60">
                        ✗ not that
                      </p>
                      <p className="font-body text-sm text-xco-ink-muted line-through leading-relaxed opacity-60">
                        {ex.bad}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banned words */}
      <section className="max-w-3xl">
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-6">
          Banned Words — All Registers
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {[...bannedWords].map((w) => (
            <span
              key={w}
              className="font-mono text-xs text-xco-ember border border-xco-ember/40 px-2 py-1"
            >
              {w.trim()}
            </span>
          ))}
        </div>
        <p className="font-mono text-xs text-xco-ink-muted italic leading-relaxed">
          These words signal either vagueness (transformative, unprecedented),
          category error (ecosystem as metaphor, regenerative as adjective),
          or corporate register (unlock, leverage, empower). None of them
          earn their space.
        </p>
      </section>

      {/* Prompt templates */}
      <section>
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-2">
          Prompt Templates
        </h2>
        <p className="font-body text-xco-ink-muted mb-8 max-w-xl">
          Copy into Claude or ChatGPT. Fill in the brief at the bottom.
          Each template enforces the register, bans the banned words, and
          requires uncertainty markers.
        </p>
        <div className="space-y-8">
          {toneRegisters.map((reg) => (
            <div key={reg.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm text-xco-ink">{reg.label}</h3>
                <CopyButton
                  text={promptTemplates[reg.id]}
                  label="Copy template"
                />
              </div>
              <pre className="font-mono text-xs text-xco-ink bg-xco-ink/[0.03] border border-xco-ink/[0.12] p-5 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {promptTemplates[reg.id]}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Linter */}
      <section className="pb-12">
        <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-2">
          Linter
        </h2>
        <p className="font-body text-xco-ink-muted mb-8 max-w-xl">
          Paste draft text. The linter flags banned words and suggests which
          register the writing is closest to.{" "}
          <WIP
            variant="inference"
            label="[inference] register detection is heuristic, not NLP — treat suggestions as prompts, not verdicts"
          />
        </p>
        <ToneLinter />
      </section>
    </div>
  );
}
