import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from '@/components/Icon';
import { useCouple, type PartnerId } from '@/lib/couple';
import { themed, useColorOf, useFont } from '@/theme';

export function Avatar({ id, size = 32, ring = false }: { id: PartnerId; size?: number; ring?: boolean }) {
  const styles = useStyles();
  const { partners } = useCouple();
  const color = useColorOf()(id);
  return (
    <View style={[styles.ring, { borderRadius: size, borderColor: ring ? color : 'transparent' }]}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{partners[id][0]}</Text>
      </View>
    </View>
  );
}

// Screen header: who's unlocked and a lock button, then the screen title with an optional action on the right.
export function ProfileBar({ title, children }: { title: string; children?: ReactNode }) {
  const styles = useStyles();
  const { partners, current, lock } = useCouple();
  const fontFamily = useFont();
  if (!current) return null;
  return (
    <View style={styles.bar}>
      <View style={styles.top}>
        <Avatar id={current} />
        <Text style={styles.name}>{partners[current]}</Text>
        <View style={styles.actions}>
          <IconButton icon="lock" variant="soft" size={36} label="Lock" onPress={() => lock()} />
        </View>
      </View>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { fontFamily }]} accessibilityRole="header">
          {title}
        </Text>
        {children}
      </View>
    </View>
  );
}

const useStyles = themed((c) =>
  StyleSheet.create({
    bar: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10, gap: 14 },
    top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    ring: { borderWidth: 2, padding: 2 },
    avatar: { alignItems: 'center', justifyContent: 'center' },
    initial: { color: '#fff', fontWeight: '600' },
    name: { fontSize: 16, fontWeight: '600', color: c.ink },
    actions: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.8, color: c.ink },
  }),
);
