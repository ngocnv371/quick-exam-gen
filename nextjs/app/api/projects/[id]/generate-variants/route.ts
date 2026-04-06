import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateExamVariants, type ExamVariant } from "@/lib/gemini";
import { getCoinsBalance, getGenerationCost, deductCoins, creditCoins, CONTENT_TIERS } from "@/lib/billing";

const VALID_VARIANT_COUNTS = [2, 4, 6] as const;
type VariantCount = (typeof VALID_VARIANT_COUNTS)[number];

function isValidVariantCount(n: unknown): n is VariantCount {
  return VALID_VARIANT_COUNTS.includes(n as VariantCount);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse & validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { targetLanguage, variantCount } = body as Record<string, unknown>;

  if (typeof targetLanguage !== "string" || !targetLanguage.trim()) {
    return NextResponse.json({ error: "targetLanguage is required" }, { status: 400 });
  }

  const parsedCount = typeof variantCount === "number" ? variantCount : Number(variantCount);
  if (!isValidVariantCount(parsedCount)) {
    return NextResponse.json(
      { error: "variantCount must be 2, 4, or 6" },
      { status: 400 },
    );
  }

  // Fetch the project (ownership check + extract content needed for cost calculation)
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("id, metadata")
    .eq("id", id)
    .single();

  if (fetchError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const metadata = (project.metadata ?? {}) as Record<string, unknown>;
  const sourceFile = (metadata.sourceFile ?? {}) as Record<string, unknown>;
  const extractedText =
    typeof sourceFile.extractedText === "string"
      ? sourceFile.extractedText
      : typeof metadata.extractedText === "string"
        ? metadata.extractedText
        : "";

  if (!extractedText.trim()) {
    return NextResponse.json(
      { error: "No extracted content found. Upload and extract a file first." },
      { status: 422 },
    );
  }

  const maxContentChars = CONTENT_TIERS[CONTENT_TIERS.length - 1].maxChars;
  if (extractedText.length > maxContentChars) {
    return NextResponse.json(
      {
        error: `Extracted content is too large (${extractedText.length.toLocaleString()} characters). Please reduce the document to under ${maxContentChars.toLocaleString()} characters before generating variants.`,
      },
      { status: 422 },
    );
  }

  // Cost depends on content length — compute after we have the text.
  const cost = getGenerationCost(parsedCount, extractedText.length);
  const balance = await getCoinsBalance(supabase);
  if (balance < cost) {
    return NextResponse.json(
      { error: `Insufficient coins. This generation costs ${cost} coin(s) but your balance is ${balance}.` },
      { status: 402 },
    );
  }

  // Deduct coins upfront — reserve the cost before the expensive Gemini call.
  // Any subsequent failure re-credits the coins as a refund.
  try {
    await deductCoins(
      user.id,
      cost,
      project.id,
      `Generated ${parsedCount} exam variant(s)`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Coin deduction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Generate variants via Gemini — re-credit on failure
  let variants: ExamVariant[];
  try {
    variants = await generateExamVariants({
      extractedContent: extractedText,
      targetLanguage: targetLanguage.trim(),
      variantCount: parsedCount,
    });
  } catch (err) {
    await creditCoins(user.id, cost, `Refund: generation failed for project ${project.id}`).catch(console.error);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Persist variants in metadata — re-credit on failure
  const updatedMetadata: Record<string, unknown> = {
    ...metadata,
    examVariants: {
      generatedAt: new Date().toISOString(),
      targetLanguage: targetLanguage.trim(),
      variantCount: parsedCount,
      variants,
    },
  };

  const { error: updateError } = await supabase
    .from("projects")
    .update({ metadata: updatedMetadata })
    .eq("id", id);

  if (updateError) {
    await creditCoins(user.id, cost, `Refund: save failed for project ${project.id}`).catch(console.error);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const newBalance = await getCoinsBalance(supabase);
  return NextResponse.json({ variants, newBalance });
}
