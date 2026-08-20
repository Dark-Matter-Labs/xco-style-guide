interface CellsProps {
  cols?: 2 | 3 | 4 | 5;
  children: React.ReactNode;
  className?: string;
}

// Hairline cell grid. A 1px gap over a rule-coloured ground with paper-filled
// cells draws every divider without any cell owning a border — so nothing
// double-borders where two grids meet.
export function Cells({ cols = 4, children, className = "" }: CellsProps) {
  const cls = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-3 lg:grid-cols-5",
  }[cols];
  return <div className={`doc-cells ${cls} ${className}`}>{children}</div>;
}
