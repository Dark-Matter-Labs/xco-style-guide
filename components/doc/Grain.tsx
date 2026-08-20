// The only texture in the system: a fixed 5px dot overlay, multiplied onto
// paper and screened onto ink. Decorative, so it is hidden from assistive tech
// and never intercepts pointer events.
export function Grain() {
  return <div className="doc-grain" aria-hidden="true" />;
}
