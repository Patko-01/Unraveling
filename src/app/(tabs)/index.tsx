import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '@/components/Icon';
import { ProfileBar } from '@/components/ProfileBar';
import { useCouple } from '@/lib/couple';
import { plain } from '@/lib/markdown';
import { formatDate, themed, useAccent, useFont } from '@/theme';

const open = (id?: string) => router.push(id ? { pathname: '/note', params: { id } } : '/note');

export default function Journal() {
  const styles = useStyles();
  const { myEntries } = useCouple();
  const accent = useAccent();
  const fontFamily = useFont();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ProfileBar title="Journal">
        <IconButton icon="compose" variant="solid" label="New entry" onPress={() => open()} />
      </ProfileBar>
      <FlatList
        data={myEntries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Start with today</Text>
            <Text style={styles.emptyText}>
              Only you can read this journal. The coach reads it too, so it understands your side when you talk.
            </Text>
            <Pressable
              onPress={() => open()}
              style={({ pressed }) => [styles.pill, { backgroundColor: accent }, pressed && styles.pressed]}
              accessibilityRole="button">
              <Text style={styles.pillText}>Write an entry</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const preview = plain(item.text);
          return (
            <Pressable
              onPress={() => open(item.id)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              accessibilityRole="button">
              <View style={styles.rowTop}>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                {item.mood ? <Text style={styles.mood}>{item.mood}</Text> : null}
              </View>
              <Text style={[styles.rowTitle, { fontFamily }]} numberOfLines={1}>
                {item.title || 'Untitled'}
              </Text>
              {preview ? (
                <Text style={[styles.preview, { fontFamily }]} numberOfLines={2}>
                  {preview}
                </Text>
              ) : null}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const useStyles = themed((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
    row: { backgroundColor: c.card, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 16, gap: 4 },
    pressed: { opacity: 0.7 },
    rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    date: { fontSize: 13, color: c.muted },
    mood: { fontSize: 16 },
    rowTitle: { fontSize: 18, fontWeight: '600', letterSpacing: -0.2, color: c.ink },
    preview: { fontSize: 15, lineHeight: 21, color: c.muted },
    empty: { alignItems: 'flex-start', paddingHorizontal: 4, paddingTop: 24, gap: 10 },
    emptyTitle: { fontSize: 20, fontWeight: '600', color: c.ink },
    emptyText: { fontSize: 15, lineHeight: 22, color: c.muted, maxWidth: 340 },
    pill: { marginTop: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999 },
    pillText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  }),
);
