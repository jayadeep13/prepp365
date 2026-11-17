import { MatchTable } from "@/components/mock-tests/match-table";

/**
 * Renders exam question text that was stored as one paragraph, e.g.
 *   "Choose the correct statements: A. … B. … C. … Choose the correct answer from the options given below:"
 *   "Match List-I with List-II List-I A. Tiger B. Eagle List-II I. Bird II. Mammal Choose …"
 * Statement questions become a lettered list; match questions become a two-column table.
 * Plain questions render unchanged.
 */

type Series = "upper" | "roman" | "digit";
type Marker = { series: Series; index: number; start: number; end: number };

const ROMANS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
// A marker like "A.", "(A)", "B)", "I.", "(ii)", "1." preceded by start, space, colon, semicolon or Hindi danda.
const MARKER_RE = /(^|[\s:;।])(\(?([A-H]|[IVX]{1,4}|[ivx]{1,4}|\d{1,2})[.)])\s+/g;
const LIST_HEADER_RE = /\s*(?:List|Column|सूची|स्तंभ)\s*[-–]?\s*(?:I{1,2}|[12AB])\s*[:.]?\s*$/i;
const INSTRUCTION_RE =
  /\s+((?:Choose|Select|Identify|Pick|Mark)\b[^]*|(?:नीचे|निम्नलिखित विकल्पों|सही (?:उत्तर|विकल्प))[^]*)$/;
const MATCH_WORD_RE = /match|list\s*[-–]?\s*i|column|सुमेलित|मिलान|सूची/i;

function seriesOf(token: string, expect: Record<Series, number>): { series: Series; index: number } | null {
  // Ambiguity: "I"/"V"/"X" can be a letter or a roman numeral — accept whichever series expects it next.
  if (/^\d+$/.test(token)) {
    const n = Number(token) - 1;
    return n === expect.digit ? { series: "digit", index: n } : null;
  }
  const lower = token.toLowerCase();
  const romanIdx = ROMANS.indexOf(lower);
  if (romanIdx !== -1 && romanIdx === expect.roman) return { series: "roman", index: romanIdx };
  if (/^[A-H]$/.test(token)) {
    const n = token.charCodeAt(0) - 65;
    if (n === expect.upper) return { series: "upper", index: n };
  }
  return null;
}

function findMarkers(text: string): Marker[] {
  const expect: Record<Series, number> = { upper: 0, roman: 0, digit: 0 };
  const markers: Marker[] = [];
  for (const m of text.matchAll(MARKER_RE)) {
    const token = m[3];
    const hit = seriesOf(token, expect);
    if (!hit) continue;
    const start = (m.index ?? 0) + m[1].length;
    markers.push({ ...hit, start, end: (m.index ?? 0) + m[0].length });
    expect[hit.series] = hit.index + 1;
  }
  // A series only counts when it has at least two items (avoids "Option A. is…" false positives).
  const counts = markers.reduce<Record<string, number>>((acc, mk) => ((acc[mk.series] = (acc[mk.series] ?? 0) + 1), acc), {});
  return markers.filter((mk) => (counts[mk.series] ?? 0) >= 2);
}

type Parsed =
  | { kind: "plain" }
  | { kind: "statements"; intro: string; items: { label: string; text: string }[]; outro: string }
  | { kind: "match"; intro: string; left: string[]; right: string[]; outro: string };

const clean = (s: string) => s.replace(LIST_HEADER_RE, "").replace(/\s+/g, " ").trim();

export function parseQuestionText(text: string): Parsed {
  if (!text) return { kind: "plain" };
  const markers = findMarkers(text);
  if (markers.length < 2) return { kind: "plain" };

  let intro = text.slice(0, markers[0].start);
  const segments = markers.map((mk, i) => ({
    ...mk,
    text: text.slice(mk.end, i + 1 < markers.length ? markers[i + 1].start : text.length),
  }));

  // Pull a trailing "Choose the correct answer…" sentence off the last item.
  let outro = "";
  const last = segments[segments.length - 1];
  const instr = last.text.match(INSTRUCTION_RE);
  if (instr && instr.index !== undefined && instr.index > 0) {
    outro = instr[1].trim();
    last.text = last.text.slice(0, instr.index);
  }

  const letters = segments.filter((s) => s.series === "upper");
  const numbered = segments.filter((s) => s.series !== "upper");
  const isMatch = letters.length >= 2 && numbered.length >= 2 && MATCH_WORD_RE.test(text);

  intro = clean(intro.replace(/[:\s]+$/, "")) + (intro.trim().endsWith(":") ? ":" : "");

  if (isMatch) {
    return {
      kind: "match",
      intro,
      left: letters.map((s) => clean(s.text)),
      right: numbered.map((s) => clean(s.text)),
      outro,
    };
  }

  // Statement list — use the dominant series only, so stray markers don't become items.
  const main = letters.length >= numbered.length ? letters : numbered;
  return {
    kind: "statements",
    intro,
    items: main.map((s) => ({
      label: s.series === "upper" ? String.fromCharCode(65 + s.index) : s.series === "roman" ? ROMANS[s.index].toUpperCase() : String(s.index + 1),
      text: clean(s.text),
    })),
    outro,
  };
}

export function QuestionText({
  text,
  variant = "primary",
  hasStructuredMatch = false,
}: {
  text: string;
  /** primary = English question (large), secondary = Hindi translation (smaller, muted). */
  variant?: "primary" | "secondary" | "compact";
  /** The question already has a saved match table — don't build another from the text. */
  hasStructuredMatch?: boolean;
}) {
  const parsed = hasStructuredMatch ? ({ kind: "plain" } as const) : parseQuestionText(text);

  const textCls =
    variant === "primary"
      ? "font-display text-lg text-ink leading-relaxed"
      : variant === "secondary"
        ? "text-sm text-ink-soft leading-relaxed"
        : "text-sm text-ink font-medium";

  if (parsed.kind === "plain") {
    return <p className={`${textCls} whitespace-pre-line`}>{text}</p>;
  }

  const itemCls = variant === "primary" ? "text-base" : "text-sm";

  return (
    <div className={variant === "primary" ? "" : "mt-1"}>
      {parsed.intro && <p className={textCls}>{parsed.intro}</p>}

      {parsed.kind === "statements" ? (
        <ol className="mt-3 space-y-2">
          {parsed.items.map((it) => (
            <li
              key={it.label}
              className={`flex items-start gap-3 rounded-xl border border-surface-line bg-surface-tint/60 px-3.5 py-2.5 ${itemCls} text-ink leading-relaxed`}
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-purple-100 text-xs font-bold text-purple-700">
                {it.label}
              </span>
              <span>{it.text}</span>
            </li>
          ))}
        </ol>
      ) : (
        <MatchTable
          left={parsed.left.map((t) => ({ text: t }))}
          right={parsed.right.map((t) => ({ text: t }))}
          compact={variant !== "primary"}
        />
      )}

      {parsed.outro && (
        <p className={`mt-3 font-semibold ${variant === "primary" ? "text-base text-purple-800" : "text-sm text-purple-700"}`}>
          {parsed.outro}
        </p>
      )}
    </div>
  );
}
