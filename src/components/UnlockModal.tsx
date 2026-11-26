import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PinPad } from '@/components/PinPad';
import { Avatar } from '@/components/ProfileBar';
import { partnerIds, useCouple, type PartnerId } from '@/lib/couple';
import { useHaptics } from '@/lib/haptics';
import { themed, useColorOf } from '@/theme';

export function UnlockModal() {
  const { partners, current, selected, select, hasPin, unlock } = useCouple();
  const styles = useStyles();
  const colorOf = useColorOf();
  const haptics = useHaptics();
  const [error, setError] = useState('');
  const isNew = selected !== null && !hasPin(selected);

  function choose(id: PartnerId) {
    select(id);
    setError('');
  }

  function complete(pin: string) {
    if (!selected) return;
    if (unlock(selected, pin)) return setError('');
    haptics.error();
    setError('Wrong PIN. Try again.');
  }

  return (
    // onRequestClose is a no-op so Android's back button can't skip the lock.
    <Modal visible={current === null} animationType="fade" onRequestClose={() => {}}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen}>
          <Text style={styles.brand}>Unraveling</Text>
          <Text style={styles.subtitle}>
            {!selected
              ? 'Who’s writing?'
              : isNew
                ? `Choose a 4-digit PIN, ${partners[selected]}`
                : `Enter your PIN, ${partners[selected]}`}
          </Text>

          <View style={styles.people}>
            {partnerIds.map((id) => (
              <Pressable
                key={id}
                onPress={() => choose(id)}
                style={[styles.person, selected !== null && selected !== id && styles.dim]}
                accessibilityRole="button"
                accessibilityLabel={partners[id]}
                accessibilityState={{ selected: selected === id }}>
                <Avatar id={id} size={64} ring={selected === id} />
                <Text style={styles.personName}>{partners[id]}</Text>
              </Pressable>
            ))}
          </View>

          {selected && (
            <View style={styles.pad}>
              <PinPad
                key={selected}
                color={colorOf(selected)}
                message={error || (isNew ? 'Your partner won’t be able to open your journal without it.' : ' ')}
                isError={!!error}
                onComplete={complete}
              />
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const useStyles = themed((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg, padding: 24, alignItems: 'center', justifyContent: 'center' },
    brand: { fontSize: 40, fontWeight: '700', letterSpacing: -1.4, color: c.ink },
    subtitle: { fontSize: 16, color: c.muted, marginTop: 6, marginBottom: 28 },
    people: { flexDirection: 'row', gap: 36 },
    person: { alignItems: 'center', gap: 8 },
    dim: { opacity: 0.4 },
    personName: { fontSize: 15, fontWeight: '600', color: c.ink },
    pad: { marginTop: 36 },
  }),
);
