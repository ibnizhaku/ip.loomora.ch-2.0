/**
 * Parst @Mentions aus dem Nachrichtentext.
 * Unterstützt Formate:
 *   - @[Vorname Nachname](userId) - Bevorzugt
 *   - @Vorname Nachname - Plain-Text (wird später in DB aufgelöst)
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

/**
 * Extrahiert Plain-Text Mentions (@Name) aus dem Content
 */
export function parsePlainTextMentions(content: string): string[] {
  // Match @Vorname Nachname (mind. 2 Wörter, keine Klammern danach)
  const plainMentionRegex = /@([A-ZÄÖÜa-zäöüß]+(?:\s+[A-ZÄÖÜa-zäöüß]+)+)(?!\()/g;
  const names: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = plainMentionRegex.exec(content)) !== null) {
    const name = match[1].trim();
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }

  return names;
}
