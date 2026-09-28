// The first thing a keyboard reaches on every page: a way past the nav to the
// content (WCAG 2.4.1). Hidden until focused, then shown over the nav.
export function SkipLink() {
  return (
    <a href="#main" className="skip-link">
      Skip to content
    </a>
  );
}
