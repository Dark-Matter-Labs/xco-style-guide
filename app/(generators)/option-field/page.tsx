import { OptionFieldGenerator } from "./OptionFieldGenerator";

export default function OptionFieldPage() {
  return (
    <div className="space-y-10">
      <header className="border-b border-xco-ink/[0.12] pb-6 space-y-2">
        <h1 className="font-display text-4xl">Option Field</h1>
        <p className="font-mono text-xs text-xco-ink-muted">
          The xCO signature visual · variable-weight scanlines encoding civilizational option space
        </p>
        <p className="font-body text-[1.375rem] text-xco-ink leading-relaxed max-w-2xl">
          A terrain of horizontal lines whose weight encodes the density of
          civilizational possibility — where the field is strong, where the
          frontier opens, where the fortress concentrates.
        </p>
      </header>
      <OptionFieldGenerator />
    </div>
  );
}
