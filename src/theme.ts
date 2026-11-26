import { Platform } from 'react-native';
import { useCouple, type PartnerId } from '@/lib/couple';

const light = { bg: '#F3F4F6', card: '#FFFFFF', ink: '#16171B', muted: '#676C75', border: '#E4E6EA', danger: '#C8372F' };
const dark: Colors = { bg: '#121316', card: '#1E2024', ink: '#ECEDEF', muted: '#9A9FA8', border: '#2E3137', danger: '#FF6B61' };
export type Colors = typeof light;

// Each partner picks a thread color, so it's always obvious whose private space is open.
// All pass 4.5:1 under white text and 3:1 against the dark background.
export const palette = {
  teal: '#0E7C7B',
  violet: '#6E56CF',
  blue: '#2563C9',
  rose: '#C2366A',
  green: '#2E7D32',
  amber: '#B25E09',
};
export type ColorName = keyof typeof palette;

const ios = Platform.OS === 'ios';
// Built-in system fonts only. `family: undefined` on a non-default option means the platform lacks it, and it's hidden.
export const fonts = {
  system: { label: 'Default', family: undefined },
  serif: { label: 'Serif', family: ios ? 'ui-serif' : 'serif' },
  rounded: { label: 'Rounded', family: ios ? 'ui-rounded' : undefined },
  mono: { label: 'Mono', family: ios ? 'ui-monospace' : 'monospace' },
  hand: { label: 'Handwritten', family: ios ? 'Noteworthy' : 'cursive' },
} satisfies Record<string, { label: string; family: string | undefined }>;
export type FontName = keyof typeof fonts;

// Light or dark per partner: the unlocked one, or on the lock screen the one whose PIN is being entered.
export function useScheme(): 'light' | 'dark' {
  const { current, selected, settings } = useCouple();
  const who = current ?? selected;
  return who && settings[who].dark ? 'dark' : 'light';
}

export const useColors = () => (useScheme() === 'dark' ? dark : light);

// Builds a component's styles for both schemes once; the returned hook picks the active set.
export function themed<T>(make: (c: Colors) => T) {
  const both = { light: make(light), dark: make(dark) };
  return function useThemedStyles() {
    return both[useScheme()];
  };
}

export function useColorOf() {
  const { settings } = useCouple();
  return (id: PartnerId) => palette[settings[id].color];
}

export function useAccent() {
  const { current } = useCouple();
  const colorOf = useColorOf();
  const c = useColors();
  return current ? colorOf(current) : c.ink;
}

// The unlocked partner's writing font, applied to what they write and read (not to buttons or labels).
export function useFont() {
  const { current, settings } = useCouple();
  return current ? fonts[settings[current].font].family : undefined;
}

export const formatDate = (t: number) =>
  new Date(t).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
