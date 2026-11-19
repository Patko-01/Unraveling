import type { Entry } from './couple';

const reflections = [
  'When you think about what happened, what did you need from them in that moment? Did you get a chance to say it?',
  "Fights are rarely about who's right. More often two people are protecting different needs. What do you think they might have been protecting?",
  "Before you talk to them, try finishing this sentence: \"I felt ___ when ___, because what matters to me is ___.\" It's much easier to hear than \"you always…\".",
  "You're both carrying parts of the same story. What's one thing you could ask them, with real curiosity, to understand their side better?",
];

// shortcut: canned replies that only use entry counts; replace with a server call that holds the API key and enforces the no-leak rule.
export async function askCoach(question: string, mine: Entry[], theirs: Entry[], partnerName: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 900));
  const myContext = `I've read your ${mine.length} ${mine.length === 1 ? 'entry' : 'entries'}`;
  const theirContext = theirs.length
    ? `, and ${partnerName} has shared their side too. I won't repeat what they wrote, but it helps me see the whole picture.`
    : `. ${partnerName} hasn't written anything yet, so for now I only know your side.`;
  return `${myContext}${theirContext}\n\n${reflections[question.length % reflections.length]}`;
}
