import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { ProfileBar } from '@/components/ProfileBar';
import { useCouple, type Settings as Prefs } from '@/lib/couple';
import { useHaptics } from '@/lib/haptics';
import { fonts, palette, themed, useAccent, useColors, type ColorName, type FontName } from '@/theme';

const colorNames = Object.keys(palette) as ColorName[];
const fontNames = (Object.keys(fonts) as FontName[]).filter((f) => f === 'system' || fonts[f].family);

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

export default function Settings() {
  const styles = useStyles();
  const c = useColors();
  const { current, settings, updateSettings } = useCouple();
  const accent = useAccent();
  const { tap } = useHaptics();
  if (!current) return null;
  const mine = settings[current];

  function pick(patch: Partial<Prefs>) {
    tap();
    updateSettings(patch);
  }

  const toggle = (label: string, key: 'dark' | 'haptics' | 'autoLock', first?: boolean) => (
    <View style={[styles.row, !first && styles.divider]}>
      <Text style={styles.rowText}>{label}</Text>
      <Switch
        value={mine[key]}
        onValueChange={(v) => updateSettings({ [key]: v })}
        trackColor={{ false: c.border, true: accent }}
        ios_backgroundColor={c.border}
        accessibilityLabel={label}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ProfileBar title="Settings" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section title="Your name">
          <TextInput
            value={mine.name}
            onChangeText={(name) => updateSettings({ name })}
            maxLength={20}
            autoCorrect={false}
            returnKeyType="done"
            style={[styles.row, styles.rowText]}
            accessibilityLabel="Your name"
          />
        </Section>

        <Section title="Appearance">
          <View style={[styles.row, styles.swatches]}>
            {colorNames.map((name) => (
              <Pressable
                key={name}
                onPress={() => pick({ color: name })}
                style={[styles.swatch, { backgroundColor: palette[name] }]}
                accessibilityRole="radio"
                accessibilityLabel={name}
                accessibilityState={{ checked: mine.color === name }}>
                {mine.color === name && <Icon name="done" size={18} color="#fff" />}
              </Pressable>
            ))}
          </View>
          {toggle('Dark mode', 'dark')}
        </Section>

        <Section title="Writing font">
          {fontNames.map((f, i) => (
            <Pressable
              key={f}
              onPress={() => pick({ font: f })}
              style={({ pressed }) => [styles.row, i > 0 && styles.divider, pressed && styles.pressed]}
              accessibilityRole="radio"
              accessibilityState={{ checked: mine.font === f }}>
              <Text style={[styles.rowText, { fontFamily: fonts[f].family }]}>{fonts[f].label}</Text>
              {mine.font === f && <Icon name="done" size={18} color={accent} />}
            </Pressable>
          ))}
        </Section>

        <Section title="General">
          {toggle('Vibration', 'haptics', true)}
          {toggle('Lock when I leave the app', 'autoLock')}
        </Section>

        <Section title="Security">
          <Pressable
            onPress={() => router.push('/pin')}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            accessibilityRole="button">
            <Text style={styles.rowText}>Change PIN</Text>
            <Icon name="forward" size={16} color={c.muted} />
          </Pressable>
        </Section>

        <Text style={styles.footer}>
          Your name and color show on the lock screen. Your journal and coach chats stay private to you.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = themed((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    content: { paddingHorizontal: 16, paddingBottom: 32, gap: 22 },
    section: { gap: 8 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: c.muted, paddingHorizontal: 6 },
    group: { backgroundColor: c.card, borderRadius: 18, overflow: 'hidden' },
    row: {
      minHeight: 52,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    divider: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.border },
    pressed: { backgroundColor: c.bg },
    rowText: { fontSize: 16, color: c.ink },
    swatches: { justifyContent: 'flex-start', gap: 12, paddingVertical: 14, flexWrap: 'wrap' },
    swatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    footer: { fontSize: 13, lineHeight: 18, color: c.muted, paddingHorizontal: 6 },
  }),
);
