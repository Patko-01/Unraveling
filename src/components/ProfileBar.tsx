import { Pressable, StyleSheet, Text, View } from 'react-native';
import { partnerIds, useCouple } from '@/lib/couple';
import { colors } from '@/theme';

export function ProfileBar() {
  const { partners, current, lock } = useCouple();
  return (
    <View style={styles.bar}>
      {partnerIds.map((id) => {
        const active = current === id;
        return (
          <Pressable
            key={id}
            onPress={() => !active && lock(id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityHint={active ? undefined : `Locks the app and asks for ${partners[id]}'s PIN`}>
            <Text style={[styles.name, active && styles.nameActive]}>{partners[id]}</Text>
          </Pressable>
        );
      })}
      <Pressable onPress={() => lock()} style={styles.lock} accessibilityRole="button">
        <Text style={styles.lockText}>Lock</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  name: { color: colors.ink, fontSize: 15, fontWeight: '500' },
  nameActive: { color: '#fff' },
  lock: { marginLeft: 'auto', padding: 8 },
  lockText: { color: colors.muted, fontSize: 15 },
});
