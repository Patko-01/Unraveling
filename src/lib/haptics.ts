import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useCouple } from '@/lib/couple';

const android = Platform.OS === 'android';

// Follows the unlocked partner's Vibration setting (on the lock screen, the partner whose PIN is being entered).
// Android uses the system's own key-click haptics: expo-haptics' selection vibration there is 50 ms at ~12% strength,
// which many phones can't produce at all. Android still mutes these when the phone's touch feedback is turned off.
export function useHaptics() {
  const { current, selected, settings } = useCouple();
  const who = current ?? selected;
  const on = who ? settings[who].haptics : true;
  return {
    tap: () =>
      on &&
      (android
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    error: () =>
      on &&
      (android
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  };
}
