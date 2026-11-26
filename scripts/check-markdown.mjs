// Self-check for the note formatting logic. Run: npm run check:markdown (Node 23.6+ strips the TS types).
import { deepStrictEqual as eq } from 'node:assert';
import { parseLine, plain, toggleLine, toggleTodo, toggleWrap } from '../src/lib/markdown.ts';

const sel = (start, end = start) => ({ start, end });

// Wrap a selection, unwrap it again (marks outside or inside the selection), and insert an empty pair at the caret.
eq(toggleWrap('a word', sel(2, 6), '**'), { text: 'a **word**', sel: sel(4, 8) });
eq(toggleWrap('a **word**', sel(4, 8), '**'), { text: 'a word', sel: sel(2, 6) });
eq(toggleWrap('a **word**', sel(2, 10), '**'), { text: 'a word', sel: sel(2, 6) });
eq(toggleWrap('hi', sel(2), '_'), { text: 'hi__', sel: sel(3) });
eq(toggleWrap('hi****', sel(4), '**'), { text: 'hi', sel: sel(2) });

// Line blocks: add, remove, switch kind, multi-line, and a caret at 0 in text that starts with a newline.
eq(toggleLine('one\ntwo', sel(5), 'bullet'), { text: 'one\n- two', sel: sel(7) });
eq(toggleLine('one\n- two', sel(7), 'bullet'), { text: 'one\ntwo', sel: sel(5) });
eq(toggleLine('- two', sel(3), 'todo'), { text: '- [ ] two', sel: sel(7) });
eq(toggleLine('- [x] done', sel(8), 'todo'), { text: 'done', sel: sel(2) });
eq(toggleLine('a\nb\nc', sel(0, 3), 'quote'), { text: '> a\n> b\nc', sel: sel(2, 7) });
eq(toggleLine('\nx', sel(0), 'heading'), { text: '# \nx', sel: sel(2) });
eq(toggleLine('# ab', sel(1), 'heading'), { text: 'ab', sel: sel(0) });

eq(toggleTodo('x\n- [ ] milk', 1), 'x\n- [x] milk');
eq(toggleTodo('- [x] milk', 0), '- [ ] milk');
eq(parseLine('- [ ] a').block, 'todo');
eq(parseLine('-x').block, 'text');
eq(plain('# Hi\n\n- **bold** and _it_ and snake_case_name'), 'Hi bold and it and snake_case_name');

console.log('markdown: all checks passed');
