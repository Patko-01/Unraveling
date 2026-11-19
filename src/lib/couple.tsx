import { createContext, useContext, useState, type ReactNode } from 'react';
import { askCoach } from './coach';

export type PartnerId = 'a' | 'b';
export type Entry = { id: string; author: PartnerId; text: string; createdAt: number };
export type ChatMessage = { id: string; from: 'me' | 'coach'; text: string };

export const partnerIds: PartnerId[] = ['a', 'b'];
const partners: Record<PartnerId, string> = { a: 'Alex', b: 'Sam' }; // placeholder names
const other = (id: PartnerId): PartnerId => (id === 'a' ? 'b' : 'a');

let nextId = 0;
const newId = () => String(nextId++);

// shortcut: all state is in memory and PINs are plaintext, so a reload wipes everything; move to a backend with real auth before real users.
// Privacy rule: only the unlocked partner's own entries and chat leave this hook. Never expose the other partner's data to screens.
function useCoupleState() {
  const [current, setCurrent] = useState<PartnerId | null>(null);
  const [selected, setSelected] = useState<PartnerId | null>(null);
  const [pins, setPins] = useState<Partial<Record<PartnerId, string>>>({});
  const [entries, setEntries] = useState<Entry[]>([]);
  const [chats, setChats] = useState<Record<PartnerId, ChatMessage[]>>({ a: [], b: [] });
  const [thinkingFor, setThinkingFor] = useState<PartnerId | null>(null);

  function unlock(id: PartnerId, pin: string) {
    if (pins[id] === undefined) setPins((p) => ({ ...p, [id]: pin }));
    else if (pins[id] !== pin) return false;
    setCurrent(id);
    return true;
  }

  function lock(next: PartnerId | null = null) {
    setCurrent(null);
    setSelected(next);
  }

  function addEntry(text: string) {
    if (!current) return;
    setEntries((e) => [{ id: newId(), author: current, text, createdAt: Date.now() }, ...e]);
  }

  async function sendToCoach(text: string) {
    if (!current) return;
    const me = current;
    const push = (m: ChatMessage) => setChats((c) => ({ ...c, [me]: [...c[me], m] }));
    push({ id: newId(), from: 'me', text });
    setThinkingFor(me);
    try {
      const mine = entries.filter((e) => e.author === me);
      const theirs = entries.filter((e) => e.author === other(me));
      push({ id: newId(), from: 'coach', text: await askCoach(text, mine, theirs, partners[other(me)]) });
    } finally {
      setThinkingFor(null);
    }
  }

  return {
    partners,
    current,
    selected,
    select: setSelected,
    hasPin: (id: PartnerId) => pins[id] !== undefined,
    unlock,
    lock,
    myEntries: current ? entries.filter((e) => e.author === current) : [],
    myChat: current ? chats[current] : [],
    thinking: current !== null && thinkingFor === current,
    addEntry,
    sendToCoach,
  };
}

const CoupleContext = createContext<ReturnType<typeof useCoupleState> | null>(null);

export function CoupleProvider({ children }: { children: ReactNode }) {
  return <CoupleContext.Provider value={useCoupleState()}>{children}</CoupleContext.Provider>;
}

export function useCouple() {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCouple must be used inside CoupleProvider');
  return ctx;
}
