import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '@/components/Icon';
import { PinPad } from '@/components/PinPad';
import { useCouple } from '@/lib/couple';
import { useHaptics } from '@/lib/haptics';
import { themed, useAccent } from '@/theme';

const prompts = { old: 'Enter your current PIN', new: 'Choose a new PIN', confirm: 'Enter the new PIN again' };

export default function ChangePin() {
  const styles = useStyles();
  const { checkPin, changePin } = useCouple();
  const accent = useAccent();
  const haptics = useHaptics();
  const [step, setStep] = useState<keyof typeof prompts>('old');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');

  function fail(message: string) {
    haptics.error();
    setError(message);
  }

  function complete(pin: string) {
    setError('');
    if (step === 'old') {
      if (!checkPin(pin)) return fail('Wrong PIN. Try again.');
      setOldPin(pin);
      setStep('new');
    } else if (step === 'new') {
      setNewPin(pin);
      setStep('confirm');
    } else if (pin === newPin && changePin(oldPin, pin)) {
      router.back();
    } else {
      fail('The PINs didn’t match. Choose a new PIN again.');
      setStep('new');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <IconButton icon="close" variant="soft" size={36} label="Cancel" onPress={() => router.back()} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{prompts[step]}</Text>
        <PinPad key={step} color={accent} message={error || ' '} isError={!!error} onComplete={complete} />
      </View>
    </SafeAreaView>
  );
}

const useStyles = themed((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
    body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, paddingBottom: 48 },
    title: { fontSize: 22, fontWeight: '600', letterSpacing: -0.3, color: c.ink },
  }),
);
