import { NativeTabs } from 'expo-router/native-tabs';
import { UnlockModal } from '@/components/UnlockModal';
import { CoupleProvider } from '@/lib/couple';

export default function RootLayout() {
  return (
    <CoupleProvider>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Journal</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="book" md="book" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="talk">
          <NativeTabs.Trigger.Label>Talk</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right" md="forum" />
        </NativeTabs.Trigger>
      </NativeTabs>
      <UnlockModal />
    </CoupleProvider>
  );
}
