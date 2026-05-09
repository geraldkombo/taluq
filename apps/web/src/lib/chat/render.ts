/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */

export type ChatToken =
  | { kind: "text"; value: string }
  | { kind: "link"; value: string };

const LINK_RE = /(\/receipt\/[A-Za-z0-9_-]+|https:\/\/github\.com\/geraldkombo\/[0-9]+)/g;

export function tokenizeChatText(text: string): ChatToken[] {
  if (!text) return [{ kind: "text", value: "" }];
  const out: ChatToken[] = [];

  let lastIndex = 0;
  for (const match of text.matchAll(LINK_RE)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      out.push({ kind: "text", value: text.slice(lastIndex, idx) });
    }
    out.push({ kind: "link", value: match[0] });
    lastIndex = idx + match[0].length;
  }

  if (lastIndex < text.length) {
    out.push({ kind: "text", value: text.slice(lastIndex) });
  }

  if (out.length === 0) return [{ kind: "text", value: text }];
  return out;
}

