// Notes are stored as a small Markdown subset: readable as plain text, and what the coach (an LLM) reads natively.
export type Sel = { start: number; end: number };
export type Edit = { text: string; sel: Sel };
export type Block = 'todo' | 'done' | 'bullet' | 'heading' | 'quote' | 'text';

// Order matters: checklist prefixes are tried before the plain bullet, and '' (text) matches last.
const prefix: Record<Block, string> = { todo: '- [ ] ', done: '- [x] ', bullet: '- ', heading: '# ', quote: '> ', text: '' };
const blocks = Object.keys(prefix) as Block[];

export function parseLine(line: string) {
  const block = blocks.find((b) => line.startsWith(prefix[b]))!;
  return { block, body: line.slice(prefix[block].length) };
}

// Returns [plain, token, plain, token, ...]: odd items are **bold**, _italic_ or ~~strike~~.
export const splitInline = (s: string) => s.split(/(\*\*[^*\n]+\*\*|~~[^~\n]+~~|\b_[^_\n]+_\b)/);

export function token(part: string): { style: 'bold' | 'italic' | 'strike'; body: string } {
  if (part.startsWith('**')) return { style: 'bold', body: part.slice(2, -2) };
  if (part.startsWith('~~')) return { style: 'strike', body: part.slice(2, -2) };
  return { style: 'italic', body: part.slice(1, -1) };
}

export const plain = (text: string) =>
  text
    .split('\n')
    .map((l) => splitInline(parseLine(l).body).map((p, i) => (i % 2 ? token(p).body : p)).join(''))
    .filter(Boolean)
    .join(' ');

// Wraps the selection in `mark`, or unwraps it if it's already wrapped (marks inside or just outside the selection).
export function toggleWrap(text: string, { start, end }: Sel, mark: string): Edit {
  const n = mark.length;
  const inner = text.slice(start, end);
  if (inner.length >= 2 * n && inner.startsWith(mark) && inner.endsWith(mark))
    return { text: text.slice(0, start) + inner.slice(n, -n) + text.slice(end), sel: { start, end: end - 2 * n } };
  if (text.slice(Math.max(0, start - n), start) === mark && text.slice(end, end + n) === mark)
    return { text: text.slice(0, start - n) + inner + text.slice(end + n), sel: { start: start - n, end: end - n } };
  return { text: text.slice(0, start) + mark + inner + mark + text.slice(end), sel: { start: start + n, end: end + n } };
}

// Turns every line the selection touches into `block`, or back into plain text if the first one already is.
export function toggleLine(text: string, { start, end }: Sel, block: 'heading' | 'bullet' | 'todo' | 'quote'): Edit {
  const from = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
  const nl = text.indexOf('\n', end);
  const to = nl === -1 ? text.length : nl;
  const lines = text.slice(from, to).split('\n');
  const first = parseLine(lines[0]).block;
  const off = first === block || (block === 'todo' && first === 'done');
  const out = lines.map((l) => (off ? '' : prefix[block]) + parseLine(l).body);
  const seg = out.join('\n');
  const s = Math.max(from, start + out[0].length - lines[0].length);
  return { text: text.slice(0, from) + seg + text.slice(to), sel: { start: s, end: Math.max(s, end + seg.length - (to - from)) } };
}

export function toggleTodo(text: string, line: number) {
  const lines = text.split('\n');
  const { block, body } = parseLine(lines[line]);
  lines[line] = prefix[block === 'todo' ? 'done' : 'todo'] + body;
  return lines.join('\n');
}
