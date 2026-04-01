import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

export interface ExamChoice {
  label: string;
  text: string;
}

interface BaseExamQuestion {
  number: number;
  text: string;
  explanation: string;
}

export interface MultipleChoiceQuestion extends BaseExamQuestion {
  type: "multiple-choice";
  choices: ExamChoice[];
  correctAnswer: string;
}

export interface OpenEndedQuestion extends BaseExamQuestion {
  type: "open-ended";
  answer: string;
}

export type ExamQuestion = MultipleChoiceQuestion | OpenEndedQuestion;

export interface ExamVariant {
  title: string;
  questions: ExamQuestion[];
}

export interface GenerateVariantsOptions {
  extractedContent: string;
  targetLanguage: string;
  variantCount: 2 | 4 | 6;
}

export async function generateExamVariants(
  options: GenerateVariantsOptions,
): Promise<ExamVariant[]> {
  const { extractedContent, targetLanguage, variantCount } = options;

  const prompt = `You are an expert exam creator. Given the following source content (which may be an exam, a set of study materials, or a question bank), generate ${variantCount} distinct exam variants.

Rules:
- Each variant must cover the same topics and difficulty level as the source.
- Shuffle the order of questions and answer choices between variants.
- Rephrase questions slightly so variants are not identical, while keeping the same meaning and correct answers.
- Preserve the original question type: if a question is multiple-choice in the source, keep it multiple-choice; if it requires working out (essay, calculation, short answer, etc.), keep it open-ended.
- For multiple-choice questions, provide exactly 4 answer choices labeled A, B, C, D.
- Output the result in ${targetLanguage}.
- Return a JSON array with exactly ${variantCount} objects. Each object must have:
  - "title": a short variant title (e.g. "Variant A", "Variant 1", etc.)
  - "questions": an array of question objects. Each question must have:
    - "number": the question index as an integer starting from 1
    - "type": either "multiple-choice" or "open-ended"
    - "text": the question text
    - "explanation": a brief explanation of the correct answer (1-2 sentences)
    - If type is "multiple-choice", also include:
      - "choices": an array of exactly 4 objects, each with "label" ("A"–"D") and "text"
      - "correctAnswer": the label of the correct choice (e.g. "A")
    - If type is "open-ended", also include:
      - "answer": the full model answer / worked solution
- Return ONLY valid JSON with no markdown fences, no explanations, no extra text.

Source content:
${extractedContent}`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip any accidental markdown fences
  const jsonText = text.startsWith("```")
    ? text.replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/, "").trim()
    : text;

  const parsed = JSON.parse(jsonText) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini returned unexpected format: expected a JSON array");
  }

  return parsed.map((item, i) => {
    const v = item as Record<string, unknown>;
    const rawQuestions = Array.isArray(v.questions) ? v.questions : [];
    return {
      title: typeof v.title === "string" ? v.title : `Variant ${i + 1}`,
      questions: rawQuestions.map((q, qi): ExamQuestion => {
        const question = q as Record<string, unknown>;
        const number = typeof question.number === "number" ? question.number : qi + 1;
        const text = typeof question.text === "string" ? question.text : "";
        const explanation = typeof question.explanation === "string" ? question.explanation : "";
        const isOpenEnded = question.type === "open-ended";
        if (isOpenEnded) {
          return {
            type: "open-ended",
            number,
            text,
            explanation,
            answer: typeof question.answer === "string" ? question.answer : "",
          };
        }
        const rawChoices = Array.isArray(question.choices) ? question.choices : [];
        return {
          type: "multiple-choice",
          number,
          text,
          explanation,
          choices: rawChoices.map((c) => {
            const choice = c as Record<string, unknown>;
            return {
              label: typeof choice.label === "string" ? choice.label : "",
              text: typeof choice.text === "string" ? choice.text : "",
            };
          }),
          correctAnswer: typeof question.correctAnswer === "string" ? question.correctAnswer : "",
        };
      }),
    };
  });
}
