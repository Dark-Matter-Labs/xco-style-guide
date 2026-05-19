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
    <section className="space-y-4 pb-12">
      <div>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">{title}</h2>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7] mt-1">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-xco-paper">
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
  const amplitude = 0;

  return (
    <div className="space-y-12">
      <PrimitiveCard
        title="Line"
        description="Two weights, no others. Structural (1.5px) carries the diagram. Texture (0.75px) carries density — hatching, grid, leaders. Both are crisp and precise."
        source={JitteredLineSource}
        preview={
          <>
            <line x1={20} y1={50} x2={380} y2={50} stroke={colors.ink.hex} strokeWidth={1.5} />
            <line x1={20} y1={90} x2={380} y2={90} stroke={colors.ink.hex} strokeWidth={0.75} strokeDasharray="4 4" />
            <text x={20} y={38} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.ink.hex}>structural (1.5px)</text>
            <text x={20} y={110} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.ink.hex}>texture (0.75px, dashed)</text>
          </>
        }
        viewBox="0 0 400 130"
      />

      <PrimitiveCard
        title="RiskNode"
        description="The triggering condition. Ember fill — the only node type that uses the accent colour. Used sparingly: one risk node per diagram."
        source={RiskNodeSource}
        preview={
          <>
            <RiskNode cx={200} cy={80} label="Arctic destabilisation" amplitude={amplitude} seed={10} />
            <text x={20} y={148} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.ink.hex}>ember fill / paper text / ink stroke</text>
          </>
        }
        viewBox="0 0 400 160"
      />

      <PrimitiveCard
        title="OptionNode"
        description="The response. Default node — white fill, ink border. Frontier and Fortress are both OptionNodes. Hatching optional to encode weight."
        source={OptionNodeSource}
        preview={
          <>
            <OptionNode cx={120} cy={80} label="Frontier" amplitude={amplitude} seed={20} />
            <OptionNode cx={280} cy={80} label="Fortress" amplitude={amplitude} seed={30} />
            <text x={20} y={148} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.ink.hex}>paper fill / ink stroke</text>
          </>
        }
        viewBox="0 0 400 160"
      />

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
            <text x={20} y={148} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.ink.hex}>cool stroke / dashed / paper fill</text>
          </>
        }
        viewBox="0 0 400 160"
      />

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
            <text x={20} y={148} fontSize={9} fontFamily="DM Mono, monospace" fill={colors.ink.hex}>3 contributions (cools / recharges / feeds) vs 1</text>
          </>
        }
        viewBox="0 0 400 160"
      />

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
