interface SourceBlockProps {
  code: string;
  label?: string;
}

export function SourceBlock({ code, label }: SourceBlockProps) {
  return (
    <div className="space-y-1">
      {label && (
        <p className="font-mono text-xs text-xco-ink-muted uppercase tracking-wider">
          {label}
        </p>
      )}
      <pre className="font-mono text-xs text-xco-ink bg-xco-ink/[0.04] border border-xco-ink/[0.12] p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
