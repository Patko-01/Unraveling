import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { useHaptics } from '@/lib/haptics';
import { themed } from '@/theme';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

type Props = { color: string; message: string; isError?: boolean; onComplete: (pin: string) => void };

// Four dots and a round keypad. Calls onComplete on the 4th digit, then clears itself.
export function PinPad({ color, message, isError, onComplete }: Props) {
  const styles = useStyles();
  const [pin, setPin] = useState('');
  const { tap } = useHaptics();

  function press(key: string) {
    tap();
    if (key === 'del') return setPin((p) => p.slice(0, -1));
    const next = pin + key;
    setPin(next.length < 4 ? next : '');
    if (next.length === 4) onComplete(next);
  }

  return (
    <View style={styles.root}>
      <View style={styles.dots} accessible accessibilityLabel={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i < pin.length && { backgroundColor: color, borderColor: color }]} />
        ))}
      </View>
      <Text style={[styles.message, isError && styles.error]} accessibilityLiveRegion="polite">
        {message}
      </Text>
      <View style={styles.keypad}>
        {keys.map((k) =>
          k === '' ? (
            <View key="blank" style={styles.key} />
          ) : (
            <Pressable
              key={k}
              onPress={() => press(k)}
              style={({ pressed }) => [styles.key, k !== 'del' && styles.keyFill, pressed && styles.keyPressed]}
              accessibilityRole="button"
              accessibilityLabel={k === 'del' ? 'Delete last digit' : k}>
              {k === 'del' ? <Icon name="backspace" size={24} /> : <Text style={styles.keyText}>{k}</Text>}
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const useStyles = themed((c) =>
  StyleSheet.create({
    root: { alignItems: 'center' },
    dots: { flexDirection: 'row', gap: 16 },
    dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: c.muted },
    message: { minHeight: 20, marginTop: 14, fontSize: 13, color: c.muted, textAlign: 'center' },
    error: { color: c.danger },
    keypad: { width: 3 * 68 + 2 * 22, flexDirection: 'row', flexWrap: 'wrap', rowGap: 14, columnGap: 22, marginTop: 18 },
    key: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
    keyFill: { backgroundColor: c.card },
    keyPressed: { backgroundColor: c.border },
    keyText: { fontSize: 26, fontWeight: '400', color: c.ink },
  }),
);
