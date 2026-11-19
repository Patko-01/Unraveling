import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileBar } from '@/components/ProfileBar';
import { useCouple } from '@/lib/couple';
import { colors } from '@/theme';

export default function Journal() {
  const { myEntries, addEntry } = useCouple();
  const [draft, setDraft] = useState('');
  const canSave = draft.trim().length > 0;

  function save() {
    if (!canSave) return;
    addEntry(draft.trim());
    setDraft('');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ProfileBar />
      <FlatList
        data={myEntries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="What happened today? How did it make you feel?"
              placeholderTextColor={colors.muted}
              multiline
              style={styles.input}
              accessibilityLabel="New journal entry"
            />
            <Pressable
              onPress={save}
              disabled={!canSave}
              style={[styles.button, !canSave && styles.buttonDisabled]}
              accessibilityRole="button">
              <Text style={styles.buttonText}>Save entry</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Only you can read your journal. The coach reads it too, so it understands your side when you talk.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={styles.body}>{item.text}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, gap: 12 },
  composer: { gap: 10, marginBottom: 8 },
  input: {
    minHeight: 120,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    fontSize: 16,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  button: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 24, lineHeight: 21 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 6 },
  date: { color: colors.muted, fontSize: 12 },
  body: { color: colors.ink, fontSize: 16, lineHeight: 23 },
});
