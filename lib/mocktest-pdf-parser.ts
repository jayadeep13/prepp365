export type ParsedQuestion = {
  text: string;
  options: string[];
  correctIndex: number;
  marks: number;
};

// The exact format admins must follow when typing/exporting a question paper
// to PDF. Shown in the admin UI next to the upload button.
export const MOCK_TEST_TEMPLATE = `Q1. What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid
Answer: B
Marks: 1

Q2. Which planet is known as the Red Planet?
A) Venus
B) Mars
C) Jupiter
Answer: B`;

const QUESTION_START = /^Q\s*\d+[.):]/i;
const OPTION_LINE = /^([A-Za-z])[.):]\s*(.+)$/;
const ANSWER_LINE = /^Answer\s*:\s*([A-Za-z])/i;
const MARKS_LINE = /^Marks?\s*:\s*(\d+(?:\.\d+)?)/i;

/**
 * Parses text extracted from an admin-authored PDF into structured questions.
 * Expects the MOCK_TEST_TEMPLATE format — one question per block starting
 * with "Q<number>.", lettered options, an "Answer: <letter>" line, and an
 * optional "Marks: <number>" line (defaults to 1).
 */
export function parseMockTestText(raw: string): { questions: ParsedQuestion[]; errors: string[] } {
  const errors: string[] = [];
  const questions: ParsedQuestion[] = [];

  const text = raw.replace(/\r\n/g, "\n");
  const blocks = text.split(/\n(?=\s*Q\s*\d+[.):])/i);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0 || !QUESTION_START.test(lines[0])) continue;

    const firstLineMatch = lines[0].match(/^Q\s*\d+[.):]\s*(.*)$/i);
    let questionText = firstLineMatch?.[1]?.trim() ?? "";
    const options: string[] = [];
    let answerLetter: string | null = null;
    let marks = 1;

    let i = 1;
    // Question text may wrap onto following lines until the first option marker.
    while (i < lines.length && !OPTION_LINE.test(lines[i]) && !ANSWER_LINE.test(lines[i])) {
      questionText += ` ${lines[i]}`;
      i++;
    }

    for (; i < lines.length; i++) {
      const answerMatch = lines[i].match(ANSWER_LINE);
      const marksMatch = lines[i].match(MARKS_LINE);
      const optionMatch = lines[i].match(OPTION_LINE);
      if (answerMatch) {
        answerLetter = answerMatch[1].toUpperCase();
      } else if (marksMatch) {
        marks = parseFloat(marksMatch[1]);
      } else if (optionMatch) {
        options.push(optionMatch[2].trim());
      }
    }

    const preview = questionText.slice(0, 60) || block.slice(0, 60).trim();
    if (!questionText) {
      errors.push(`Skipped a block with no question text near: "${preview}..."`);
      continue;
    }
    if (options.length < 2) {
      errors.push(`"${preview}..." — found fewer than 2 options, skipped.`);
      continue;
    }
    if (!answerLetter) {
      errors.push(`"${preview}..." — no "Answer: <letter>" line found, skipped.`);
      continue;
    }
    const correctIndex = answerLetter.charCodeAt(0) - "A".charCodeAt(0);
    if (correctIndex < 0 || correctIndex >= options.length) {
      errors.push(`"${preview}..." — answer letter "${answerLetter}" doesn't match any option, skipped.`);
      continue;
    }

    questions.push({ text: questionText.trim(), options, correctIndex, marks });
  }

  return { questions, errors };
}
