/*
 * 1) Setup OPENAI_API_KEY secret to get started.
 * 2) Call this endpoint with { prompt, model? } to generate a recipe object matching the schema below.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";
import { google, GoogleLanguageModelOptions } from "npm:@ai-sdk/google";
import { generateText, Output } from "npm:ai";
import { z } from "npm:zod";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Max-Age": "3600",
  Vary: "Access-Control-Request-Headers",
};

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

const SYSTEM_PROMPT =
  "You are an expert exam creator. Always return a structured exam matching the given schema.";

export default {
  fetch: withSupabase({ auth: "publishable", cors }, async (req, _ctx) => {
    try {
      const body = await req.json().catch(() => {
        throw new ClientError("Invalid JSON payload");
      }) as {
        exam?: unknown;
        quantity?: unknown;
      };

      const { exam, quantity } = body;

      if (typeof exam !== "string" || !exam.trim()) {
        throw new ClientError("Request must include a non-empty exam string");
      }

      const model = google("gemini-3.1-pro-preview", {
        apiKey: Deno.env.get("GEMINI_API_KEY"),
      } as GoogleLanguageModelOptions);

      const prompt = `Given the following source exam content, generate ${
        quantity ?? 2
      } distinct exam variants in the same subject and difficulty level. Shuffle question order and rephrase questions slightly while keeping the same meaning and correct answers. Preserve question types (multiple-choice or open-ended). For multiple-choice questions, provide 4 answer choices labeled A, B, C, D.

Source Exam Content:
${exam}
`;

      const result = await generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt,
        output: Output.object({
          schema: ResultSchema,
        }),
      });

      return Response.json(result.output, { status: 200 });
    } catch (err) {
      if (err instanceof ClientError) {
        return Response.json({ error: err.message }, { status: 400 });
      }

      console.error("generateText error:", err);
      console.error("Assistant chat error:", err);
      return Response.json({
        error: "Failed to process generateText request",
        details: err instanceof Error ? err.message : String(err),
      }, { status: 500 });
    }
  }),
};
