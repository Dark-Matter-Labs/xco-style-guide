import { WIP } from "@/components/WIP";
import { CopyButton } from "@/components/CopyButton";
import { ToneLinter } from "./ToneLinter";
import { VoicePrinciples } from "./VoicePrinciples";
import { WritingPractice } from "./WritingPractice";
import { PlainRegister } from "./PlainRegister";
import { toneRegisters, promptTemplates } from "@/lib/tone-templates";
import { bannedWords, spellingCorrections, houseRules } from "@/lib/design-tokens";

export default function TonePage() {
  return (
    <div className="doc-wrap py-12 space-y-20">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">Tone of Voice</h1>
        <WIP variant="version" />
      </header>

      {/* The voice — the governing layer */}
      <VoicePrinciples />

      {/* What a writer does before a text goes out */}
      <WritingPractice />

      {/* How plain a text must be, by licence */}
      <PlainRegister />

      {/* How the voice is set */}
      <section className="max-w-2xl space-y-4" style={{ borderTop: "1.5px solid var(--xco-ink)" }}>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase pt-6">
          Setting the voice
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          One voice, three registers. The principles above hold everywhere; a
          register sets the voice for its surface — a paper, a post, a caption.
          Pick deliberately. The writing fails if the register is chosen by
          accident — an annotation that reads like a hunch, a method text that
          reads like an annotation, a hunch mistaken for a conclusion.
        </p>
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          Across all registers: declarative about the question, tentative about
          the answer — the conjecture made visible. Specific verbs, real
          numbers, named places where possible. Mark uncertainty inline — never
          drop a claim because it&apos;s uncertain, mark it and keep it.
        </p>
      </section>

      {/* House rules — non-negotiable, hold across every register */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-4">
          House Rules
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-8 max-w-2xl">
          Two rules hold everywhere, in every register, on every surface. These are
          errors, not preferences. The linter below enforces both.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {houseRules.map((r) => (
            <div
              key={r.id}
              className="p-6 space-y-4"
              style={{
                borderLeft: "3px solid var(--xco-dusk)",
                background: "var(--xco-paper-quiet)",
              }}
            >
              <p className="font-body text-[24px] text-xco-ink leading-[26px]">{r.rule}</p>

              <div className="space-y-1">
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  ✓ {r.correct}
                </p>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk-ink">
                  ✗ {r.incorrect}
                </p>
              </div>

              <p className="font-mono font-medium text-[0.75rem] leading-[1.5] text-xco-ink-muted">
                {r.why}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Three registers */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Three Registers
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {toneRegisters.map((reg) => (
            <div key={reg.id} className="space-y-6">
              <div>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink uppercase tracking-widest mb-1">
                  {reg.id}
                </p>
                <h3 className="doc-h2 text-xco-ink">{reg.label}</h3>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-1">
                  {reg.usage}
                </p>
              </div>

              <div className="pl-4">
                <p className="font-body text-[24px] text-xco-ink leading-[26px]">
                  {reg.rule}
                </p>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-1">
                  {reg.ruleDetail}
                </p>
              </div>

              <div className="space-y-5">
                {reg.examples.map((ex, i) => (
                  <div key={i} className="space-y-2">
                    <div className="space-y-1">
                      <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">✓ this</p>
                      <p className="font-body text-[24px] text-xco-ink leading-[26px]">
                        {ex.good}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink-muted">
                        ✗ not that
                      </p>
                      <p className="font-body text-[24px] text-xco-ink-muted line-through leading-[26px]">
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
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-6">
          Banned Words — All Registers
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {[...bannedWords].map((w) => (
            <span
              key={w}
              className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk-ink px-2 py-1"
            >
              {w.trim()}
            </span>
          ))}
        </div>
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          These words signal either vagueness (transformative, unprecedented),
          category error (ecosystem as metaphor, regenerative as adjective),
          or corporate register (unlock, leverage, empower). None of them
          earn their space.
        </p>
      </section>

      {/* Spelling — US English */}
      <section className="max-w-3xl">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-6">
          Spelling — US English Throughout
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-8">
          xCO writes in US English. The project name itself — Expanding
          Civilizational Optionality — uses the American -{`>`}ization spelling.
          Use -ize, not -ise. Use -or, not -our. Use -er, not -re.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-2">
          {[...spellingCorrections].map(({ british, american }) => (
            <div key={british} className="flex items-baseline gap-2">
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ocean-ink line-through">
                {british}
              </span>
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                → {american}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Prompt templates */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-2">
          Prompt Templates
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-8 max-w-xl">
          Copy into Claude or ChatGPT. Fill in the brief at the bottom.
          Each template opens with the voice principles and compass and the
          writing practices, then enforces its register, bans the banned words
          and requires uncertainty markers. It asks for the audience, signature
          and sources, and ends the draft with the pause.
        </p>
        <div className="space-y-8">
          {toneRegisters.map((reg) => (
            <div key={reg.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-body text-[24px] text-xco-ink leading-[26px]">{reg.label}</h3>
                <CopyButton
                  text={promptTemplates[reg.id]}
                  label="Copy template"
                />
              </div>
              <pre className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink p-5 overflow-x-auto whitespace-pre-wrap">
                {promptTemplates[reg.id]}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Linter */}
      <section className="pb-12">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-2">
          Linter
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-8 max-w-xl">
          Paste draft text. The linter flags banned words, spelling and brand
          casing, suggests which register the writing is closest to, takes a red
          pencil to it, and checks the plain register for the licence you pick —
          places to look, not errors.{" "}
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
