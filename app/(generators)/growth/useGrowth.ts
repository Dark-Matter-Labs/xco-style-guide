"use client";

import { useEffect, useRef, useState } from "react";
import { makeLine, rng, snapshot, stepLine, type GrowthParams } from "@/lib/growth/differential-line";
import { seedLine, type SeedSpec } from "@/lib/growth/seeds";

// Grows a line in the background of the page: slices of steps inside a time
// budget, so the controls stay responsive while it grows. Re-runs from
// scratch whenever the seed or the parameters change — the same inputs always
// grow the same line.
//
// Slices are scheduled with a MessageChannel, not requestAnimationFrame:
// growth is computation, and rAF stops in a background tab, which would leave
// a half-grown form behind a tab switch. Redraws are throttled separately.

const BUDGET_MS = 12;
const PUBLISH_MS = 50;        // at most ~20 preview redraws a second
const HISTORY_EVERY = 10;     // steps between saved outlines (rings, video)
const MAX_STEPS = 20000;      // a backstop; growth normally stops on size or margin

export interface GrowthRun {
  line: Float32Array;
  closed: boolean;
  history: Float32Array[];
  steps: number;
  nodes: number;
  done: boolean;
  stopped: null | "boundary" | "max-nodes" | "steps";
}

export function useGrowth(seed: SeedSpec, params: GrowthParams) {
  const runRef = useRef<GrowthRun | null>(null);
  const [version, setVersion] = useState(0);
  // Stable keys, so a re-render with equal inputs does not restart growth.
  const seedKey = JSON.stringify(seed);
  const paramKey = JSON.stringify(params);

  useEffect(() => {
    const s0 = JSON.parse(seedKey) as SeedSpec;
    const p = JSON.parse(paramKey) as GrowthParams;
    const { points, closed } = seedLine(s0);
    const state = makeLine(points, closed);
    const rand = rng(s0.seed);
    const history: Float32Array[] = [snapshot(state)];
    let live = true;
    let lastPublish = 0;
    const channel = new MessageChannel();
    const schedule = () => channel.port2.postMessage(null);

    const publish = (done: boolean, stopped: GrowthRun["stopped"]) => {
      runRef.current = { line: snapshot(state), closed, history, steps: state.steps, nodes: state.n, done, stopped };
      setVersion((v) => v + 1);
    };

    const tick = () => {
      if (!live) return;
      const t0 = performance.now();
      let going = true;
      while (going && performance.now() - t0 < BUDGET_MS) {
        going = stepLine(state, p, rand) && state.steps < MAX_STEPS;
        if (state.steps % HISTORY_EVERY === 0) history.push(snapshot(state));
      }
      if (going) {
        const now = performance.now();
        if (now - lastPublish > PUBLISH_MS) {
          lastPublish = now;
          publish(false, null);
        }
        schedule();
      } else {
        history.push(snapshot(state));
        publish(true, state.stopped ?? "steps");
      }
    };

    channel.port1.onmessage = tick;
    publish(false, null);
    schedule();
    return () => {
      live = false;
      channel.port1.onmessage = null;
      channel.port1.close();
    };
  }, [seedKey, paramKey]);

  return { run: runRef.current, version };
}
