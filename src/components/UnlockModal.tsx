import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { partnerIds, useCouple, type PartnerId } from '@/lib/couple';
import { colors } from '@/theme';

export function UnlockModal() {
  const { partners, current, selected, select, hasPin, unlock } = useCouple();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const isNew = selected !== null && !hasPin(selected);

  function choose(id: PartnerId) {
    select(id);
    setPin('');
    setError('');
  }

  function submit() {
    if (!selected || pin.length < 4) return;
    setError(unlock(selected, pin) ? '' : 'Wrong PIN. Try again.');
    setPin('');
  }

  return (
    // onRequestClose is a no-op so Android's back button can't skip the lock.
    <Modal visible={current === null} animationType="fade" onRequestClose={() => {}}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen}>
          <Text style={styles.title}>Unraveling</Text>
          <Text style={styles.subtitle}>Who&apos;s writing?</Text>
          <View style={styles.row}>
            {partnerIds.map((id) => (
              <Pressable
                key={id}
                onPress={() => choose(id)}
                style={[styles.person, selected === id && styles.personActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: selected === id }}>
                <Text style={[styles.personName, selected === id && styles.personNameActive]}>{partners[id]}</Text>
              </Pressable>
            ))}
          </View>

          {selected && (
            <View style={styles.pinBox}>
              <Text style={styles.label}>
                {isNew ? `Choose a 4-digit PIN for ${partners[selected]}` : `Enter ${partners[selected]}'s PIN`}
              </Text>
              <TextInput
                key={selected}
                value={pin}
                onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 4))}
                onSubmitEditing={submit}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                autoFocus
                style={styles.pin}
                accessibilityLabel="PIN"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                onPress={submit}
                disabled={pin.length < 4}
                style={[styles.button, pin.length < 4 && styles.buttonDisabled]}
                accessibilityRole="button">
                <Text style={styles.buttonText}>{isNew ? 'Set PIN' : 'Unlock'}</Text>
              </Pressable>
              {isNew && (
                <Text style={styles.hint}>Your partner won&apos;t be able to open your journal without it.</Text>
              )}
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  title: { fontSize: 34, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  subtitle: { fontSize: 17, color: colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 28 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  person: {
    flex: 1,
    maxWidth: 160,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  personActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  personName: { fontSize: 18, color: colors.ink, fontWeight: '500' },
  personNameActive: { color: colors.accent, fontWeight: '700' },
  pinBox: { marginTop: 32, alignItems: 'center', gap: 12 },
  label: { fontSize: 15, color: colors.ink },
  pin: {
    width: 160,
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: colors.accent,
    color: colors.ink,
  },
  error: { color: colors.danger },
  button: { backgroundColor: colors.accent, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 999 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});
