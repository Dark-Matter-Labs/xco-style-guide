"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

// Light / Dark, as two pressed states rather than one ambiguous toggle — the
// reader can see which mode is active, not just what the next one would be.
export function ModeSwitch() {
  const [reg, setReg] = useState<Mode>("light");

  useEffect(() => {
    setReg(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const set = (next: Mode) => {
    setReg(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.dataset.theme = next;
    try {
      localStorage.setItem("xco-theme", next);
    } catch {
      // Private browsing can reject writes; the choice still applies for
      // this page view, it just will not persist.
    }
  };

  return (
    <div className="doc-register" role="group" aria-label="Mode">
      <button type="button" data-reg="light" aria-pressed={reg === "light"} onClick={() => set("light")}>
        Light
      </button>
      <button type="button" data-reg="dark" aria-pressed={reg === "dark"} onClick={() => set("dark")}>
        Dark
      </button>
    </div>
  );
}
