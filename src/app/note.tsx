import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, type IconName } from '@/components/Icon';
import { Markdown } from '@/components/Markdown';
import { useCouple, type EntryPatch } from '@/lib/couple';
import { toggleLine, toggleTodo, toggleWrap, type Edit, type Sel } from '@/lib/markdown';
import { useHaptics } from '@/lib/haptics';
import { formatDate, themed, useAccent, useColors, useFont } from '@/theme';

const moods = [
  ['😊', 'Happy'],
  ['😌', 'Calm'],
  ['😕', 'Unsure'],
  ['😢', 'Sad'],
  ['😤', 'Frustrated'],
] as const;

const tools: { icon: IconName; label: string; apply: (text: string, sel: Sel) => Edit }[] = [
  { icon: 'bold', label: 'Bold', apply: (t, s) => toggleWrap(t, s, '**') },
  { icon: 'italic', label: 'Italic', apply: (t, s) => toggleWrap(t, s, '_') },
  { icon: 'strike', label: 'Strikethrough', apply: (t, s) => toggleWrap(t, s, '~~') },
  { icon: 'heading', label: 'Heading', apply: (t, s) => toggleLine(t, s, 'heading') },
  { icon: 'bullet', label: 'Bulleted list', apply: (t, s) => toggleLine(t, s, 'bullet') },
  { icon: 'todo', label: 'Checklist', apply: (t, s) => toggleLine(t, s, 'todo') },
  { icon: 'quote', label: 'Quote', apply: (t, s) => toggleLine(t, s, 'quote') },
];

export default function Note() {
  const styles = useStyles();
  const c = useColors();
  const params = useLocalSearchParams<{ id?: string }>();
  const { myEntries, addEntry, updateEntry, deleteEntry } = useCouple();
  const accent = useAccent();
  const fontFamily = useFont();
  const { tap } = useHaptics();
  const [id, setId] = useState(params.id);
  const entry = myEntries.find((e) => e.id === id);
  const [editing, setEditing] = useState(!params.id);
  const bodyRef = useRef<TextInputInstance>(null);
  const sel = useRef<Sel>({ start: 0, end: 0 });
  // Set only right after a toolbar edit to place the cursor, then released so typing isn't fought over.
  const [forcedSel, setForcedSel] = useState<Sel>();

  // Edits save as you type. A note left empty is removed when you leave it.
  const latest = useRef({ entry, deleteEntry });
  useEffect(() => {
    latest.current = { entry, deleteEntry };
  });
  useEffect(
    () => () => {
      const { entry: e, deleteEntry: del } = latest.current;
      if (e && !e.title.trim() && !e.text.trim()) del(e.id);
    },
    [],
  );

  function change(patch: EntryPatch) {
    if (entry) updateEntry(entry.id, patch);
    else setId(addEntry(patch));
  }

  function format(apply: (text: string, sel: Sel) => Edit) {
    const edit = apply(entry?.text ?? '', sel.current);
    change({ text: edit.text });
    sel.current = edit.sel;
    setForcedSel(edit.sel);
  }

  function done() {
    Keyboard.dismiss();
    if (entry) setEditing(false);
    else router.back();
  }

  function remove() {
    if (!entry) return;
    Alert.alert('Delete this entry?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEntry(entry.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        <View style={styles.header}>
          <IconButton icon="back" label="Back" onPress={() => router.back()} />
          <View style={styles.spacer} />
          {entry && <IconButton icon="trash" label="Delete entry" onPress={remove} />}
          {editing ? (
            <IconButton icon="done" variant="solid" label="Done" onPress={done} />
          ) : (
            <IconButton icon="edit" variant="solid" label="Edit" onPress={() => setEditing(true)} />
          )}
        </View>

        {editing ? (
          <>
            <TextInput
              value={entry?.title ?? ''}
              onChangeText={(title) => change({ title })}
              placeholder="Title"
              placeholderTextColor={c.muted}
              autoFocus={!entry}
              returnKeyType="next"
              onSubmitEditing={() => bodyRef.current?.focus()}
              style={[styles.page, styles.title, { fontFamily }]}
              accessibilityLabel="Title"
            />
            <View style={[styles.page, styles.meta]}>
              {moods.map(([emoji, name]) => {
                const on = entry?.mood === emoji;
                return (
                  <Pressable
                    key={emoji}
                    onPress={() => {
                      tap();
                      change({ mood: on ? undefined : emoji });
                    }}
                    style={[styles.mood, on && { backgroundColor: `${accent}22`, borderColor: accent }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Mood: ${name}`}
                    accessibilityState={{ selected: on }}>
                    <Text style={styles.moodEmoji}>{emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              ref={bodyRef}
              value={entry?.text ?? ''}
              onChangeText={(text) => {
                setForcedSel(undefined);
                change({ text });
              }}
              selection={forcedSel}
              onSelectionChange={(e) => {
                sel.current = e.nativeEvent.selection;
                setForcedSel(undefined);
              }}
              autoFocus={!!entry}
              multiline
              placeholder="What happened? How did it feel?"
              placeholderTextColor={c.muted}
              style={[styles.page, styles.body, { fontFamily }]}
              accessibilityLabel="Entry text"
            />
            <View style={styles.toolbar}>
              {tools.map((t) => (
                <IconButton key={t.icon} icon={t.icon} label={t.label} size={38} onPress={() => format(t.apply)} />
              ))}
              <View style={styles.spacer} />
              <IconButton icon="hideKeyboard" label="Hide keyboard" size={38} onPress={Keyboard.dismiss} />
            </View>
          </>
        ) : (
          <ScrollView contentContainerStyle={[styles.page, styles.read]}>
            <Text style={[styles.title, { fontFamily }]}>{entry?.title || 'Untitled'}</Text>
            <Text style={styles.date}>
              {entry ? formatDate(entry.createdAt) : ''}
              {entry?.mood ? `   ${entry.mood}` : ''}
            </Text>
            <Pressable onPress={() => setEditing(true)} style={styles.readBody} accessibilityHint="Opens the editor">
              {entry?.text ? (
                <Markdown text={entry.text} onToggle={(line) => change({ text: toggleTodo(entry.text, line) })} />
              ) : (
                <Text style={styles.placeholder}>Tap to write</Text>
              )}
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = themed((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.card },
    header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6 },
    spacer: { flex: 1 },
    page: { paddingHorizontal: 22 },
    title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.6, color: c.ink, paddingVertical: 6 },
    meta: { flexDirection: 'row', gap: 8, paddingVertical: 8 },
    mood: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1.5,
      borderColor: 'transparent',
      backgroundColor: c.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moodEmoji: { fontSize: 19 },
    body: { flex: 1, fontSize: 17, lineHeight: 25, color: c.ink, textAlignVertical: 'top', paddingTop: 10 },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    read: { paddingBottom: 48 },
    date: { fontSize: 13, color: c.muted, marginBottom: 18 },
    readBody: { minHeight: 200 },
    placeholder: { fontSize: 17, color: c.muted },
  }),
);
