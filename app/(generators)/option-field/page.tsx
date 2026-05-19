import { OptionFieldGenerator } from "./OptionFieldGenerator";

export default function OptionFieldPage() {
  return (
    <div className="space-y-10">
      <header className="pb-6 space-y-2">
        <h1 className="font-display text-[3rem] leading-[1.1]">Option Field</h1>
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          The xCO signature visual · variable-weight scanlines encoding civilizational option space
        </p>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7] max-w-2xl">
          A terrain of horizontal lines whose weight encodes the density of
          civilizational possibility — where the field is strong, where the
          frontier opens, where the fortress concentrates.
        </p>
      </header>
      <OptionFieldGenerator />
    </div>
  );
}
