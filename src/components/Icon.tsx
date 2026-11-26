import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { Pressable } from 'react-native';
import { useHaptics } from '@/lib/haptics';
import { useAccent, useColors } from '@/theme';

// [iOS SF Symbol, Android/web Material Symbol]
const icons = {
  back: ['chevron.left', 'arrow_back_ios_new'],
  close: ['xmark', 'close'],
  forward: ['chevron.right', 'chevron_right'],
  bold: ['bold', 'format_bold'],
  italic: ['italic', 'format_italic'],
  strike: ['strikethrough', 'strikethrough_s'],
  heading: ['textformat.size.larger', 'title'],
  bullet: ['list.bullet', 'format_list_bulleted'],
  todo: ['checklist', 'checklist'],
  quote: ['text.quote', 'format_quote'],
  hideKeyboard: ['keyboard.chevron.compact.down', 'keyboard_hide'],
  trash: ['trash', 'delete'],
  edit: ['pencil', 'edit'],
  done: ['checkmark', 'check'],
  compose: ['square.and.pencil', 'edit_square'],
  lock: ['lock', 'lock'],
  send: ['arrow.up', 'arrow_upward'],
  backspace: ['delete.left', 'backspace'],
  unchecked: ['circle', 'radio_button_unchecked'],
  checked: ['checkmark.circle.fill', 'check_circle'],
} satisfies Record<string, [SFSymbol, AndroidSymbol]>;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color?: string }) {
  const c = useColors();
  const [ios, md] = icons[name];
  return <SymbolView name={{ ios, android: md, web: md }} size={size} tintColor={color ?? c.ink} />;
}

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  variant?: 'plain' | 'soft' | 'solid';
  size?: number;
  disabled?: boolean;
};

// Small round icon-only button. `label` is what screen readers announce.
export function IconButton({ icon, label, onPress, variant = 'plain', size = 40, disabled }: IconButtonProps) {
  const accent = useAccent();
  const c = useColors();
  const { tap } = useHaptics();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' },
        variant === 'solid' && { backgroundColor: accent },
        variant === 'soft' && { backgroundColor: c.card },
        pressed && { opacity: 0.6 },
        disabled && { opacity: 0.3 },
      ]}>
      <Icon name={icon} size={Math.round(size * 0.5)} color={variant === 'solid' ? '#fff' : c.ink} />
    </Pressable>
  );
}
