import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// --- Rate Limiting ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `You are an expert credit repair verification specialist. Your job is to compare a consumer's NEW credit report against a list of items they originally disputed, and determine which items were successfully removed.

You MUST respond with valid JSON only — no markdown, no code fences, no commentary outside the JSON object.

Return this exact structure:

{
  "items": [
    {
      "original_item": "description of the originally disputed item",
      "status": "removed" | "still_present" | "inconclusive",
      "explanation": "brief explanation of why you determined this status",
      "estimated_score_impact": 0
    }
  ],
  "summary": "overall summary paragraph",
  "total_disputed": 0,
  "total_removed": 0,
  "total_still_present": 0,
  "total_inconclusive": 0,
  "estimated_score_improvement": 0,
  "eligible_for_refund": false
}

Rules:
- Compare each originally disputed item against the new credit report
- "removed" = the item no longer appears on the new report
- "still_present" = the item still appears with same or similar details
- "inconclusive" = cannot determine with confidence (e.g., not enough info)
- estimated_score_impact per item: 5-15 points for removed items, 0 for still present
- eligible_for_refund = true ONLY if total_removed === 0 (nothing was removed)
- Be thorough and fair in your assessment
- If the new report is unclear or partial, mark items as inconclusive rather than guessing`;

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limited. Max 5 verifications per hour." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured." },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { input_type, image_base64, image_mime_type, report_text, original_disputes } = body as {
    input_type?: string;
    image_base64?: string;
    image_mime_type?: string;
    report_text?: string;
    original_disputes?: string;
  };

  if (!original_disputes?.trim()) {
    return NextResponse.json({ error: "Please describe what you originally disputed." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  let reportContent = "";

  if (input_type === "image" && image_base64 && image_mime_type) {
    try {
      const visionRes = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: image_mime_type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                  data: image_base64,
                },
              },
              {
                type: "text",
                text: "Extract ALL information from this credit report. For each account, extract: account/creditor name, account type, balance, status, date opened, last activity date, payment history, and any remarks. Be thorough.",
              },
            ],
          },
        ],
      });
      const visionText = visionRes.content.find((b) => b.type === "text");
      if (visionText && visionText.type === "text") {
        reportContent = visionText.text;
      }
    } catch (err) {
      console.error("Vision extraction error:", err);
      return NextResponse.json(
        { error: "Failed to read the uploaded image. Please try a clearer photo or paste the report text." },
        { status: 500 }
      );
    }
  } else if (report_text?.trim()) {
    reportContent = report_text;
  } else {
    return NextResponse.json({ error: "No new credit report data provided." }, { status: 400 });
  }

  const userMessage = `Compare this NEW credit report against the items that were originally disputed. Determine what was removed.

ORIGINALLY DISPUTED ITEMS:
${original_disputes}

NEW CREDIT REPORT (after 60 days):
${reportContent}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response");
    }

    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const result = JSON.parse(jsonStr);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Verify error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Verification failed: ${message}` }, { status: 500 });
  }
}
