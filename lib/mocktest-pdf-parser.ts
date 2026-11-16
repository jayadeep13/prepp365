export type MatchItem = { text: string; textHindi?: string };

export type ParsedQuestion = {
  text: string;
  textHindi?: string;
  options: string[];
  optionsHindi?: string[];
  correctIndex: number;
  /** Undefined when the file had no "Marks:" line — the editor fills in the test default. */
  marks?: number;
  /** Undefined when the file had no "Negative:" line — the editor fills in the test default. */
  negativeMarks?: number;
  matchLeft?: MatchItem[];
  matchRight?: MatchItem[];
};

// The exact format admins must follow when typing a question paper in Word
// (.docx — recommended, keeps Hindi intact) or exporting it to PDF. Shown in
// the admin UI next to the upload button. A Hindi line placed directly below
// its English question/option line is picked up as that line's translation.
export const MOCK_TEST_TEMPLATE = `Q1. What is the capital of France?
फ्रांस की राजधानी क्या है?
A) London
लंदन
B) Paris
पेरिस
C) Berlin
बर्लिन
D) Madrid
मैड्रिड
Answer: B
Marks: 2
Negative: 0.5

Q2. Match the following:
List-I | List-II
A. Tiger | 1. Bird
B. Eagle | 2. Reptile
C. Cobra | 3. Mammal
A) A-3, B-1, C-2
B) A-1, B-2, C-3
C) A-2, B-3, C-1
D) A-3, B-2, C-1
Answer: A

Q3. Which planet is known as the Red Planet?
A) Venus
B) Mars
C) Jupiter
Answer: B`;

const QUESTION_START = /^Q\s*\d+\s*[.):]/i;
// "A) text", "A. text", "A: text", "(a) text", "(A) text"
const OPTION_LINE = /^(?:\(([A-Za-z])\)|([A-Za-z])[.):])\s*(.+)$/;
const ANSWER_LINE = /^(?:Answer|Ans|Correct\s*Answer)\s*[:.\-]\s*\(?([A-Za-z])\)?/i;
const MARKS_LINE = /^Marks?\s*[:\-]\s*\+?(\d+(?:\.\d+)?)/i;
const NEGATIVE_LINE = /^(?:Negative(?:\s*Marks?)?|Minus)\s*[:\-]\s*-?(\d+(?:\.\d+)?)/i;
const DEVANAGARI_TEXT = /[ऀ-ॿ]/;

// Match-the-following helpers.
const MATCH_QUESTION = /match|list\s*[-–]?\s*i\b|column\s*[-–]?\s*(?:i\b|a\b|1\b)|सुमेलित|मिलान/i;
// A line made up only of column headers, e.g. "List-I", "List-I | List-II", "Column A   Column B".
const MATCH_HEADER = /^(?:(?:list|column|सूची|स्तंभ)\s*[-–]?\s*(?:i{1,2}|[12ab])\s*[|\t]?\s*)+$/i;
const MATCH_LEFT = /^\(?([A-Z])[.)]\s*(.+)$/;
const MATCH_RIGHT = /^\(?(\d{1,2}|i{1,3}|iv|v|vi{1,3}|ix|x)[.)]\s*(.+)$/;
const MATCH_COMBINED = /^\(?([A-Z])[.)]\s*(.+?)\s+\(?(\d{1,2}|i{1,3}|iv|v|vi{1,3})[.)]\s*(.+)$/;
// An option whose body is an answer code such as "A-2, B-1, C-3", "A→2 B→1" or "2 1 3 4".
const MAPPING_OPTION = /^(?:[A-Z]\s*[-–→:=>]+\s*\(?(?:\d{1,2}|[ivx]{1,4})\)?[\s,;]*){2,}$|^(?:\(?(?:\d{1,2}|[ivx]{1,4})\)?[\s,;-]+){1,}\(?(?:\d{1,2}|[ivx]{1,4})\)?$/i;

function optionMatch(line: string): { letter: string; body: string } | null {
  const m = line.match(OPTION_LINE);
  if (!m) return null;
  return { letter: (m[1] ?? m[2]).toUpperCase(), body: m[3].trim() };
}

function appendHindi(item: MatchItem, line: string) {
  item.textHindi = item.textHindi ? `${item.textHindi} ${line}` : line;
}

type BlockResult = { question?: ParsedQuestion; error?: string; usedMatch: boolean } | null;

function parseBlock(block: string, allowMatch: boolean): BlockResult {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0 || !QUESTION_START.test(lines[0])) return null;

  const firstLineMatch = lines[0].match(/^Q\s*\d+\s*[.):]\s*(.*)$/i);
  let questionText = firstLineMatch?.[1]?.trim() ?? "";
  let questionTextHindi = "";
  const options: string[] = [];
  const optionsHindi: string[] = [];
  const matchLeft: MatchItem[] = [];
  const matchRight: MatchItem[] = [];
  let lastMatchItem: MatchItem | null = null;
  let answerLetter: string | null = null;
  let marks: number | undefined;
  let negativeMarks: number | undefined;

  let i = 1;
  const isControlLine = (l: string) => ANSWER_LINE.test(l) || MARKS_LINE.test(l) || NEGATIVE_LINE.test(l);

  // Question body: everything up to the first option. A Devanagari line here is the
  // question's Hindi translation. Match-the-following questions also carry a
  // two-column table here, whose rows look like options ("A. Tiger") — those are
  // only treated as the real options once their body is an answer code ("A-2, B-1").
  const isMatch = () => allowMatch && (MATCH_QUESTION.test(questionText) || MATCH_QUESTION.test(questionTextHindi));

  while (i < lines.length && !isControlLine(lines[i])) {
    const line = lines[i];

    if (isMatch()) {
      const opt = optionMatch(line);
      if (opt && MAPPING_OPTION.test(opt.body.replace(/\s+/g, " "))) break; // options start here

      if (MATCH_HEADER.test(line)) {
        i++;
        continue;
      }
      if (line.includes("|") || line.includes("\t")) {
        const [l, r] = line.split(/\s*[|\t]+\s*/);
        const left = l?.match(MATCH_LEFT);
        const right = r?.match(MATCH_RIGHT);
        if (left || right) {
          if (left) matchLeft.push((lastMatchItem = { text: left[2].trim() }));
          if (right) matchRight.push((lastMatchItem = { text: right[2].trim() }));
          i++;
          continue;
        }
      }
      const combined = line.match(MATCH_COMBINED);
      if (combined) {
        matchLeft.push({ text: combined[2].trim() });
        matchRight.push((lastMatchItem = { text: combined[4].trim() }));
        i++;
        continue;
      }
      const right = line.match(MATCH_RIGHT);
      if (right) {
        matchRight.push((lastMatchItem = { text: right[2].trim() }));
        i++;
        continue;
      }
      const left = line.match(MATCH_LEFT);
      if (left) {
        matchLeft.push((lastMatchItem = { text: left[2].trim() }));
        i++;
        continue;
      }
      if (DEVANAGARI_TEXT.test(line) && lastMatchItem) {
        appendHindi(lastMatchItem, line);
        i++;
        continue;
      }
    } else if (optionMatch(line)) {
      break;
    }

    if (DEVANAGARI_TEXT.test(line)) {
      questionTextHindi += questionTextHindi ? ` ${line}` : line;
    } else {
      questionText += questionText ? ` ${line}` : line;
    }
    i++;
  }

  for (; i < lines.length; i++) {
    const line = lines[i];
    const answerMatch = line.match(ANSWER_LINE);
    const marksMatch = line.match(MARKS_LINE);
    const negativeMatch = line.match(NEGATIVE_LINE);
    const opt = optionMatch(line);
    if (answerMatch) {
      answerLetter = answerMatch[1].toUpperCase();
    } else if (marksMatch) {
      marks = parseFloat(marksMatch[1]);
    } else if (negativeMatch) {
      negativeMarks = parseFloat(negativeMatch[1]);
    } else if (opt) {
      options.push(opt.body);
      optionsHindi.push("");
    } else if (DEVANAGARI_TEXT.test(line) && options.length > 0) {
      // An unlettered Devanagari line right after an option is that option's Hindi translation.
      const last = options.length - 1;
      optionsHindi[last] = optionsHindi[last] ? `${optionsHindi[last]} ${line}` : line;
    } else if (options.length > 0) {
      // Wrapped continuation of the previous option.
      options[options.length - 1] += ` ${line}`;
    }
  }

  const preview = questionText.slice(0, 60) || block.slice(0, 60).trim();
  if (!questionText) {
    return { error: `Skipped a block with no question text near: "${preview}..."`, usedMatch: matchLeft.length + matchRight.length > 0 };
  }
  if (options.length < 2) {
    return { error: `"${preview}..." — found fewer than 2 options, skipped.`, usedMatch: matchLeft.length + matchRight.length > 0 };
  }
  if (!answerLetter) {
    return { error: `"${preview}..." — no "Answer: <letter>" line found, skipped.`, usedMatch: matchLeft.length + matchRight.length > 0 };
  }
  const correctIndex = answerLetter.charCodeAt(0) - "A".charCodeAt(0);
  if (correctIndex < 0 || correctIndex >= options.length) {
    return { error: `"${preview}..." — answer letter "${answerLetter}" doesn't match any option, skipped.`, usedMatch: matchLeft.length + matchRight.length > 0 };
  }

  const hasMatch = matchLeft.length > 0 || matchRight.length > 0;
  return {
    usedMatch: hasMatch,
    question: {
    text: questionText.trim(),
    textHindi: questionTextHindi.trim() || undefined,
    options,
    optionsHindi: optionsHindi.some(Boolean) ? optionsHindi : undefined,
    correctIndex,
    marks,
    negativeMarks,
    matchLeft: hasMatch ? matchLeft : undefined,
    matchRight: hasMatch ? matchRight : undefined,
    },
  };
}

/**
 * Parses text extracted from an admin-authored PDF / Word file into
 * structured questions. Expects the MOCK_TEST_TEMPLATE format — one question
 * per block starting with "Q<number>.", lettered options, an "Answer: <letter>"
 * line, and optional "Marks: <n>" / "Negative: <n>" lines.
 */
export function parseMockTestText(raw: string): { questions: ParsedQuestion[]; errors: string[] } {
  const errors: string[] = [];
  const questions: ParsedQuestion[] = [];

  const text = raw.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");
  const blocks = text.split(/\n(?=\s*Q\s*\d+\s*[.):])/i);

  for (const block of blocks) {
    let result = parseBlock(block, true);
    // A normal question that merely mentions "match" (e.g. "Who won the match?") —
    // retry it as a plain MCQ if the match-table reading didn't work out.
    if (result?.error && result.usedMatch) result = parseBlock(block, false) ?? result;
    if (!result) continue;
    if (result.error) errors.push(result.error);
    else if (result.question) questions.push(result.question);
  }

  return { questions, errors };
}
