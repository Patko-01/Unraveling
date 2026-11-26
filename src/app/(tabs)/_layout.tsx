import { NativeTabs } from 'expo-router/native-tabs';
import { useCouple } from '@/lib/couple';
import { useAccent, useColors } from '@/theme';

export default function TabsLayout() {
  const { current } = useCouple();
  const c = useColors();
  return (
    // Keyed by partner: the native tab bar and every tab screen are rebuilt on each unlock, so nothing from the
    // previous partner's session (their colors, unsent drafts, screen state) carries over.
    <NativeTabs key={current ?? 'locked'} tintColor={useAccent()} backgroundColor={c.card}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Journal</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book" md="book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="talk">
        <NativeTabs.Trigger.Label>Talk</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right" md="forum" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
