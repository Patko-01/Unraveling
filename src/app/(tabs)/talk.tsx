import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '@/components/Icon';
import { Markdown } from '@/components/Markdown';
import { ProfileBar } from '@/components/ProfileBar';
import { useCouple, type ChatMessage } from '@/lib/couple';
import { themed, useAccent, useColors, useFont } from '@/theme';

const starters = ['We had a fight and I keep replaying it', 'I don’t feel heard lately', 'Help me start a hard conversation'];

export default function Talk() {
  const styles = useStyles();
  const c = useColors();
  const { myChat, thinking, sendToCoach } = useCouple();
  const accent = useAccent();
  const fontFamily = useFont();
  const [draft, setDraft] = useState('');
  const list = useRef<FlatList<ChatMessage>>(null);

  function send(text: string) {
    if (!text.trim() || thinking) return;
    sendToCoach(text.trim());
    setDraft('');
  }

  return (
    // Bottom edge keeps the composer clear of the tab bar; the keyboard view pads it above the keyboard (Android is edge-to-edge).
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        <ProfileBar title="Talk" />
        <FlatList
          ref={list}
          data={myChat}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => list.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.intro}>
              <Text style={styles.introText}>
                I read both of your journals so I understand you both, but I’ll never tell you what your partner wrote.
                What’s on your mind?
              </Text>
              {starters.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => send(s)}
                  style={({ pressed }) => [styles.starter, pressed && styles.pressed]}
                  accessibilityRole="button">
                  <Text style={styles.starterText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          }
          ListFooterComponent={
            thinking ? (
              <View style={[styles.bubble, styles.coach]} accessibilityLabel="Coach is typing">
                <Text style={styles.typing}>•••</Text>
              </View>
            ) : undefined
          }
          renderItem={({ item }) =>
            item.from === 'me' ? (
              <View style={[styles.bubble, styles.mine, { backgroundColor: accent }]}>
                <Text style={[styles.mineText, { fontFamily }]}>{item.text}</Text>
              </View>
            ) : (
              <View style={[styles.bubble, styles.coach]}>
                <Markdown text={item.text} />
              </View>
            )
          }
        />
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Tell me what happened…"
            placeholderTextColor={c.muted}
            multiline
            style={[styles.input, { fontFamily }]}
            accessibilityLabel="Message to the coach"
          />
          <IconButton icon="send" variant="solid" size={34} label="Send" disabled={!draft.trim() || thinking} onPress={() => send(draft)} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = themed((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    list: { paddingHorizontal: 16, paddingBottom: 12, gap: 8, flexGrow: 1 },
    intro: { gap: 8, paddingHorizontal: 4, paddingTop: 8 },
    introText: { fontSize: 17, lineHeight: 25, color: c.ink, marginBottom: 8 },
    starter: { alignSelf: 'flex-start', backgroundColor: c.card, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
    starterText: { fontSize: 15, color: c.ink },
    pressed: { opacity: 0.6 },
    bubble: { maxWidth: '85%', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11 },
    mine: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
    coach: { alignSelf: 'flex-start', backgroundColor: c.card, borderBottomLeftRadius: 6 },
    mineText: { color: '#fff', fontSize: 17, lineHeight: 24 },
    typing: { color: c.muted, fontSize: 17, letterSpacing: 2 },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 6,
      marginHorizontal: 12,
      marginBottom: 8,
      padding: 5,
      paddingLeft: 16,
      backgroundColor: c.card,
      borderRadius: 24,
    },
    input: { flex: 1, maxHeight: 120, paddingVertical: 7, fontSize: 16, color: c.ink },
  }),
);
