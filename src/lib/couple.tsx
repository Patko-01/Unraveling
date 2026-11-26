import { router } from 'expo-router';
import { createContext, useContext, useEffect, useEffectEvent, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import type { ColorName, FontName } from '@/theme';
import { askCoach } from './coach';

export type PartnerId = 'a' | 'b';
export type Entry = { id: string; author: PartnerId; title: string; text: string; mood?: string; createdAt: number };
export type EntryPatch = Partial<Pick<Entry, 'title' | 'text' | 'mood'>>;
export type ChatMessage = { id: string; from: 'me' | 'coach'; text: string };

export const partnerIds: PartnerId[] = ['a', 'b'];
// Preferences, not writing: each partner's name and color also show on the lock screen.
export type Settings = { name: string; color: ColorName; font: FontName; dark: boolean; haptics: boolean; autoLock: boolean };
const defaults: Record<PartnerId, Settings> = {
  a: { name: 'Alex', color: 'teal', font: 'system', dark: false, haptics: true, autoLock: true },
  b: { name: 'Sam', color: 'violet', font: 'system', dark: false, haptics: true, autoLock: true },
};
export const other = (id: PartnerId): PartnerId => (id === 'a' ? 'b' : 'a');

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
  const [settings, setSettings] = useState(defaults);
  const partners: Record<PartnerId, string> = {
    a: settings.a.name.trim() || defaults.a.name,
    b: settings.b.name.trim() || defaults.b.name,
  };

  function unlock(id: PartnerId, pin: string) {
    if (pins[id] === undefined) setPins((p) => ({ ...p, [id]: pin }));
    else if (pins[id] !== pin) return false;
    setCurrent(id);
    return true;
  }

  function changePin(oldPin: string, newPin: string) {
    if (!current || pins[current] !== oldPin) return false;
    setPins((p) => ({ ...p, [current]: newPin }));
    return true;
  }

  function lock(next: PartnerId | null = null) {
    // Close any open note or PIN screen, so nothing of this partner's stays mounted under the lock screen.
    if (router.canDismiss()) router.dismissAll();
    setCurrent(null);
    setSelected(next);
  }

  const onBackground = useEffectEvent(() => {
    if (current && settings[current].autoLock) lock(current);
  });
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') onBackground();
    });
    return () => sub.remove();
  }, []);

  function updateSettings(patch: Partial<Settings>) {
    if (current) setSettings((s) => ({ ...s, [current]: { ...s[current], ...patch } }));
  }

  function addEntry(patch: EntryPatch) {
    if (!current) return;
    const id = newId();
    setEntries((e) => [{ id, author: current, title: '', text: '', createdAt: Date.now(), ...patch }, ...e]);
    return id;
  }

  // Both check the author too, so an id can never reach the other partner's entry.
  function updateEntry(id: string, patch: EntryPatch) {
    setEntries((es) => es.map((e) => (e.id === id && e.author === current ? { ...e, ...patch } : e)));
  }

  function deleteEntry(id: string) {
    setEntries((es) => es.filter((e) => !(e.id === id && e.author === current)));
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
    checkPin: (pin: string) => current !== null && pins[current] === pin,
    changePin,
    unlock,
    lock,
    settings,
    updateSettings,
    myEntries: current ? entries.filter((e) => e.author === current) : [],
    myChat: current ? chats[current] : [],
    thinking: current !== null && thinkingFor === current,
    addEntry,
    updateEntry,
    deleteEntry,
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
