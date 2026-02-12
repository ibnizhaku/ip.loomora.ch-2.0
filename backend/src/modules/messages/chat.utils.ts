/**
 * Parst @Mentions aus dem Nachrichtentext.
 * Unterstützt Formate:
 *   - @[Vorname Nachname](userId)
 *   - @[Name](userId)
 */
export function parseMentions(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const userIds: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(content)) !== null) {
    const userId = match[2];
    if (userId && !userIds.includes(userId)) {
      userIds.push(userId);
    }
  }

  return userIds;
}
