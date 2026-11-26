import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { UnlockModal } from '@/components/UnlockModal';
import { CoupleProvider } from '@/lib/couple';
import { useColors, useScheme } from '@/theme';

function Root() {
  const scheme = useScheme();
  const c = useColors();
  // Native parts (tab bar, keyboard, alerts, switches) follow the partner's choice, not the phone's setting.
  useEffect(() => Appearance.setColorScheme(scheme), [scheme]);
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="pin" options={{ presentation: 'modal' }} />
      </Stack>
      <UnlockModal />
    </>
  );
}

export default function RootLayout() {
  return (
    <CoupleProvider>
      <Root />
    </CoupleProvider>
  );
}
