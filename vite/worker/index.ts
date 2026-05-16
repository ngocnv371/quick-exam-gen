/**
 * Meant to be deployed as a Cloudflare Worker.
 * This worker exposes Hono endpoints for health, exam analysis, and exam variant generation.
 */
// import { withSupabase } from "jsr:@supabase/server@^1";
import { google, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

class ClientError extends Error {}

const ChoiceSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
});
const QuestionSchema = z.object({
  index: z.number(),
  text: z.string(),
  explanation: z.string(),
  type: z.enum(["multiple-choice", "open-ended"]),
  choices: z.array(ChoiceSchema).min(2).max(4).optional(),
});

const ExamSchema = z.object({
  subject: z.string(),
  title: z.string(),
  questions: z.array(QuestionSchema).min(1),
});

const ResultSchema = z.object({
  variants: z.array(ExamSchema).length(2),
});

const AnalyzeQuestionSchema = z.object({
  index: z.number(),
  text: z.string(),
  questionType: z.enum(["multiple-choice", "open-ended", "unknown"]),
  intendedPurpose: z.string(),
  testedSkills: z.array(z.string()).min(1),
});

const AnalyzeResultSchema = z.object({
  title: z.string(),
  subject: z.string(),
  overallIntent: z.string(),
  questions: z.array(AnalyzeQuestionSchema).min(1),
});

const SYSTEM_PROMPT =
  "You are an expert exam creator. Always return a structured exam matching the given schema.";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["authorization", "content-type"],
    maxAge: 3600,
  }),
);

const getAnalysisModel = (env: Env) => {
  const key = env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (typeof key !== "string" || !key.trim()) {
    throw new ClientError(
      "Missing or invalid GOOGLE_GENERATIVE_AI_API_KEY in environment variables",
    );
  }

  return google("gemini-3.1-flash-lite");
};

const getGenerativeModel = (env: Env) => {
  const key = env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (typeof key !== "string" || !key.trim()) {
    throw new ClientError(
      "Missing or invalid GOOGLE_GENERATIVE_AI_API_KEY in environment variables",
    );
  }

  // we use flash-lite for DEV
  return google("gemini-3.1-flash-lite"); // gemini-3.1-pro-preview
};

const parseJsonBody = async <T>(req: Request): Promise<T> => {
  return (await req.json().catch(() => {
    throw new ClientError("Invalid JSON payload");
  })) as T;
};

app.get("api/", (c) => {
  return c.json({ name: "Quick Exam Gen Worker version 1.0" });
});

app.post("api/analyze", async (c) => {
  try {
    const body = await parseJsonBody<{ content?: unknown }>(c.req.raw);
    const { content } = body;

    if (typeof content !== "string" || !content.trim()) {
      throw new ClientError("Request must include a non-empty content string");
    }

    const model = getAnalysisModel(c.env);
    const prompt = `Analyze the following exam content and extract a structured understanding of the exam.

Focus on:
- question list
- question type (multiple-choice, open-ended, or unknown)
- the intended purpose of each question (what it is trying to assess)
- tested skills for each question

Return the output strictly according to schema.

Exam Content:
${content}`;

    const result = await generateText({
      model,
      system:
        "You are an assessment design analyst. Extract exam structure and pedagogical intent from raw exam text.",
      prompt,
      providerOptions: {
        thinkingConfig: {
          includeThoughts: false,
          thinkingLevel: "low",
        },
      } satisfies GoogleLanguageModelOptions,
      output: Output.object({
        schema: AnalyzeResultSchema,
      }),
    });

    return c.json(result.output, 200);
  } catch (err) {
    if (err instanceof ClientError) {
      return c.json({ error: err.message }, 400);
    }

    console.error("analyze error:", err);
    return c.json(
      {
        error: "Failed to process analyze request",
        details: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
});

app.post("api/generate-variants", async (c) => {
  try {
    const body = await parseJsonBody<{ exam?: unknown; quantity?: unknown }>(
      c.req.raw,
    );
    const { exam, quantity } = body;

    if (typeof quantity !== "number" || quantity < 1 || quantity > 5) {
      throw new ClientError(
        "Quantity must be a number between 1 and 5 indicating how many variants to generate",
      );
    }

    if ((exam as { questions?: unknown[] })?.questions?.length === 0) {
      throw new ClientError("Request must include an exam");
    }

    const model = getGenerativeModel(c.env);

    const prompt = `Given the following source exam content, generate ${
      quantity ?? 2
    } distinct exam variants with the same format and key learning objectives, but with different wording, examples, and scenarios. 

For each variant:
- Keep the same subject, difficulty level, and question structure
- Maintain the same core knowledge being tested
- Replace examples and contexts with completely different ones (e.g., if a question uses "cookies", use "apples" or another entirely different context)
- Rephrase questions substantially while preserving the learning objective
- Shuffle question order
- Preserve question types (multiple-choice or open-ended)
- For multiple-choice questions, provide 4 answer choices labeled A, B, C, D
- Ensure correct answers remain correct in the new context

Source Exam Content:
${exam}
`;

    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      providerOptions: {
        thinkingConfig: {
          includeThoughts: false,
          thinkingLevel: "low",
        },
      } satisfies GoogleLanguageModelOptions,
      output: Output.object({
        schema: ResultSchema,
      }),
    });

    return c.json(result.output, 200);
  } catch (err) {
    if (err instanceof ClientError) {
      return c.json({ error: err.message }, 400);
    }

    console.error("generate variants error:", err);
    return c.json(
      {
        error: "Failed to process generate variants request",
        details: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
});

export default app;
