// Greedy word wrap by character count, for SVG text that cannot measure itself.
// A word longer than the line keeps a line of its own. Canvas text that can be
// measured wraps by width instead (event-series/render/text.ts).

export function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (test.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
