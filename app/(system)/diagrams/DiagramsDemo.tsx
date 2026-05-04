"use client";

import { useState } from "react";
import {
  JitteredLine,
  JitteredLineSource,
  RiskNode,
  RiskNodeSource,
  OptionNode,
  OptionNodeSource,
  FieldNode,
  FieldNodeSource,
  MultiSolveTicks,
  MultiSolveTicksSource,
  ScaleRule,
  ScaleRuleSource,
  Annotation,
  AnnotationSource,
} from "@/lib/diagram-primitives";
import { SourceBlock } from "@/components/SourceBlock";
import { colors } from "@/lib/design-tokens";

interface PrimitiveCardProps {
  title: string;
  description: string;
  source: string;
  preview: React.ReactNode;
  viewBox?: string;
}

function PrimitiveCard({
  title,
  description,
  source,
  preview,
  viewBox = "0 0 400 160",
}: PrimitiveCardProps) {
  return (
    <section className="space-y-4 border-b border-xco-ink/[0.12] pb-12">
      <div>
        <h2 className="font-mono text-sm text-xco-ink">{title}</h2>
        <p className="font-body text-xco-ink-muted italic text-sm mt-1">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="border border-xco-ink/[0.12] bg-xco-paper">
          <svg
            viewBox={viewBox}
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {preview}
          </svg>
        </div>
        <SourceBlock code={source} label="usage" />
      </div>
    </section>
  );
}

export function DiagramsDemo() {
  const [amplitude, setAmplitude] = useState(1.8);

  return (
    <div className="space-y-12">
      {/* Jitter slider — the open question */}
      <section className="bg-xco-ink/[0.03] border border-xco-ink/[0.12] p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
            Jitter Amplitude
          </h2>
          <span className="font-mono text-sm text-xco-ember">{amplitude.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={8}
          step={0.1}
          value={amplitude}
          onChange={(e) => setAmplitude(Number(e.target.value))}
          className="w-full accent-xco-ember"
        />
        <div className="flex justify-between font-mono text-xs text-xco-ink-muted">
          <span>0.0 — looks like a rendering bug</span>
          <span>8.0 — looks decorative</span>
        </div>
        <p className="font-mono text-xs text-xco-flag">
          [open question] How much jitter is right? This slider is here so the team can argue about it.
          Default: 1.8.
        </p>
      </section>

      {/* JitteredLine */}
      <PrimitiveCard
        title="JitteredLine"
        description="The load-bearing primitive. Every line in an xCO diagram goes through this — non-smooth because the world is volatile, not because the designer wanted texture."
        source={JitteredLineSource}
        preview={
          <>
            <JitteredLine x1={20} y1={50} x2={380} y2={50} amplitude={amplitude} seed={42} />
            <JitteredLine x1={20} y1={90} x2={380} y2={90} amplitude={amplitude} annotation seed={7} />
            <text x={20} y={38} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.inkMuted.hex}>primary (1.5px)</text>
            <text x={20} y={110} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.inkMuted.hex}>annotation (0.5px, dashed)</text>
          </>
        }
        viewBox="0 0 400 130"
      />

      {/* RiskNode */}
      <PrimitiveCard
        title="RiskNode"
        description="The triggering condition. Filled with ember — the only node type that uses the accent colour. Used sparingly."
        source={RiskNodeSource}
        preview={
          <>
            <RiskNode cx={200} cy={80} label="Arctic destabilisation" amplitude={amplitude} seed={10} />
            <text x={20} y={148} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.inkMuted.hex}>ember fill / paper text / ink stroke</text>
          </>
        }
        viewBox="0 0 400 160"
      />

      {/* OptionNode */}
      <PrimitiveCard
        title="OptionNode"
        description="The response. The default node type — paper fill, ink border. Frontier and Fortress are both OptionNodes."
        source={OptionNodeSource}
        preview={
          <>
            <OptionNode cx={120} cy={80} label="Frontier" amplitude={amplitude} seed={20} />
            <OptionNode cx={280} cy={80} label="Fortress" amplitude={amplitude} seed={30} />
            <text x={20} y={148} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.inkMuted.hex}>paper fill / ink stroke</text>
          </>
        }
        viewBox="0 0 400 160"
      />

      {/* FieldNode */}
      <PrimitiveCard
        title="FieldNode"
        description="The systemic precondition. Cool-coloured dashed border — visually quieter, foundationally more important. Field is never a peer of Frontier and Fortress; it's what makes them possible."
        source={FieldNodeSource}
        preview={
          <>
            <FieldNode
              cx={200}
              cy={80}
              width={280}
              height={60}
              label="Field"
              sublabel="precondition"
              amplitude={amplitude}
              seed={40}
            />
            <text x={20} y={148} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.inkMuted.hex}>cool stroke / dashed / paper fill</text>
          </>
        }
        viewBox="0 0 400 160"
      />

      {/* MultiSolveTicks */}
      <PrimitiveCard
        title="MultiSolveTicks"
        description="The multi-solving signature. Stacked horizontal ticks beneath a node show how many distinct contributions it makes — the visual rhyme that runs through the entire portfolio system."
        source={MultiSolveTicksSource}
        preview={
          <>
            <OptionNode cx={120} cy={70} label={"Peri-urban\nfood forest"} amplitude={amplitude} seed={50} />
            <MultiSolveTicks cx={120} y={102} count={3} />
            <OptionNode cx={280} cy={70} label={"Mistifier\nnetwork"} amplitude={amplitude} seed={60} />
            <MultiSolveTicks cx={280} y={102} count={1} />
            <text x={20} y={148} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.inkMuted.hex}>3 contributions (cools / recharges / feeds) vs 1</text>
          </>
        }
        viewBox="0 0 400 160"
      />

      {/* ScaleRule */}
      <PrimitiveCard
        title="ScaleRule"
        description="Scale boundary marker. When a diagram crosses scales — macro, bioregional, urban, neighbourhood — draw this rule. The scale label lives in the left margin in DM Mono italic."
        source={ScaleRuleSource}
        preview={
          <>
            <ScaleRule y={40} label="macro" x={80} labelX={76} width={300} />
            <OptionNode cx={230} cy={90} label="peri-urban food forest" width={180} amplitude={amplitude} seed={70} />
            <ScaleRule y={135} label="bioregional" x={80} labelX={76} width={300} />
          </>
        }
        viewBox="0 0 400 160"
      />

      {/* Annotation */}
      <PrimitiveCard
        title="Annotation"
        description="Marginalia in DM Mono italic. Every diagram should permit and visibly invite these. This is what differentiates xCO diagrams from McKinsey diagrams — the working is visible."
        source={AnnotationSource}
        preview={
          <>
            <OptionNode cx={150} cy={70} label="Mistifier network" amplitude={amplitude} seed={80} />
            <Annotation
              x={20}
              y={130}
              text="[inference] governance assumes legionella testing — unverified with Madrid water authority"
              charsPerLine={55}
            />
          </>
        }
        viewBox="0 0 400 160"
      />
    </div>
  );
}
