interface DocThesisProps {
  children: React.ReactNode;
  className?: string;
}

// Pull-quote ruled in ink above and below. The v2 document uses full-width ink
// hairlines rather than a coloured left bar — the weight comes from the rules,
// not from an accent.
export function DocThesis({ children, className = "" }: DocThesisProps) {
  return (
    <div className={`doc-thesis doc-hang text-xco-ink ${className}`}>{children}</div>
  );
}
