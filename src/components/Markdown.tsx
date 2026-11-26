import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { useHaptics } from '@/lib/haptics';
import { parseLine, splitInline, token } from '@/lib/markdown';
import { themed, useAccent, useColors, useFont } from '@/theme';

function Inline({ text }: { text: string }) {
  const styles = useStyles();
  return splitInline(text).map((part, i) => {
    if (i % 2 === 0) return part;
    const t = token(part);
    return (
      <Text key={i} style={styles[t.style]}>
        {t.body}
      </Text>
    );
  });
}

// Renders a note's Markdown. With `onToggle`, checklist items can be ticked in place (it gets the line index).
export function Markdown({ text, onToggle }: { text: string; onToggle?: (line: number) => void }) {
  const styles = useStyles();
  const c = useColors();
  const accent = useAccent();
  const fontFamily = useFont();
  const { tap } = useHaptics();
  return (
    <View style={styles.root}>
      {text.split('\n').map((line, i) => {
        const { block, body } = parseLine(line);
        const content = (
          <Text style={[styles.text, { fontFamily }, block === 'heading' && styles.heading, block === 'done' && styles.done]}>
            <Inline text={body} />
          </Text>
        );
        if (block === 'todo' || block === 'done')
          return (
            <Pressable
              key={i}
              style={styles.row}
              disabled={!onToggle}
              onPress={() => {
                tap();
                onToggle?.(i);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: block === 'done' }}>
              <View style={styles.check}>
                <Icon name={block === 'done' ? 'checked' : 'unchecked'} size={20} color={block === 'done' ? accent : c.muted} />
              </View>
              {content}
            </Pressable>
          );
        if (block === 'bullet')
          return (
            <View key={i} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: accent }]} />
              {content}
            </View>
          );
        if (block === 'quote')
          return (
            <View key={i} style={[styles.quote, { borderColor: accent }]}>
              {content}
            </View>
          );
        return line ? <View key={i}>{content}</View> : <View key={i} style={styles.blank} />;
      })}
    </View>
  );
}

const useStyles = themed((c) =>
  StyleSheet.create({
    root: { gap: 4 },
    text: { flexShrink: 1, color: c.ink, fontSize: 17, lineHeight: 25 },
    heading: { fontSize: 21, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3, marginTop: 6 },
    done: { color: c.muted, textDecorationLine: 'line-through' },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    check: { paddingTop: 2 },
    dot: { width: 6, height: 6, borderRadius: 3, marginTop: 10, marginLeft: 4 },
    quote: { borderLeftWidth: 3, paddingLeft: 12 },
    blank: { height: 8 },
    bold: { fontWeight: '700' },
    italic: { fontStyle: 'italic' },
    strike: { textDecorationLine: 'line-through' },
  }),
);
