import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileBar } from '@/components/ProfileBar';
import { useCouple, type ChatMessage } from '@/lib/couple';
import { colors } from '@/theme';

export default function Talk() {
  const { myChat, thinking, sendToCoach } = useCouple();
  const [draft, setDraft] = useState('');
  const list = useRef<FlatList<ChatMessage>>(null);
  const canSend = draft.trim().length > 0 && !thinking;

  function send() {
    if (!canSend) return;
    sendToCoach(draft.trim());
    setDraft('');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ProfileBar />
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={list}
          data={myChat}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => list.current?.scrollToEnd()}
          ListEmptyComponent={
            <Text style={styles.empty}>
              I read both of your journals so I understand you both, but I&apos;ll never tell you what your partner
              wrote. What&apos;s on your mind?
            </Text>
          }
          ListFooterComponent={thinking ? <Text style={styles.thinking}>Thinking…</Text> : undefined}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === 'me' ? styles.mine : styles.coach]}>
              <Text style={[styles.text, item.from === 'me' && styles.mineText]}>{item.text}</Text>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Tell me what happened…"
            placeholderTextColor={colors.muted}
            multiline
            style={styles.input}
            accessibilityLabel="Message to the coach"
          />
          <Pressable
            onPress={send}
            disabled={!canSend}
            style={[styles.send, !canSend && styles.sendDisabled]}
            accessibilityRole="button">
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 24, lineHeight: 21, paddingHorizontal: 12 },
  thinking: { color: colors.muted, fontStyle: 'italic', marginTop: 4 },
  bubble: { maxWidth: '85%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.accent },
  coach: { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  text: { color: colors.ink, fontSize: 16, lineHeight: 22 },
  mineText: { color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.ink,
  },
  send: { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999 },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: '#fff', fontWeight: '600' },
});
