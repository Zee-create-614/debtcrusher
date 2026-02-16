import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// --- Rate Limiting ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

const SYSTEM_PROMPT = `You are an expert credit repair specialist, FCRA attorney, and consumer credit advocate. You help consumers identify disputable items on their credit reports and generate legally compliant dispute letters.

You MUST respond with valid JSON only — no markdown, no code fences, no commentary outside the JSON object.

Analyze the user's credit report data and return a JSON object with exactly this structure:

{
  "items": [
    {
      "account": "account/creditor name",
      "type": "collections|late_payment|charge_off|bankruptcy|inquiry|other",
      "balance": 0,
      "status": "current status description",
      "dispute_reason": "detailed reason this item should be disputed",
      "dispute_type": "inaccuracy|not_mine|time_barred|duplicate|obsolete|mixed_file",
      "confidence": "high|medium|low",
      "estimated_score_impact": 10,
      "dispute_letters": {
        "equifax": "Full formal dispute letter addressed to Equifax, P.O. Box 740256, Atlanta, GA 30374",
        "experian": "Full formal dispute letter addressed to Experian, P.O. Box 4500, Allen, TX 75013",
        "transunion": "Full formal dispute letter addressed to TransUnion LLC, P.O. Box 2000, Chester, PA 19016"
      },
      "goodwill_letter": "Full goodwill letter text OR null if not applicable (only for late payments)",
      "pay_for_delete_letter": "Full pay-for-delete letter text OR null if not applicable (only for collections)"
    }
  ],
  "summary": "overall analysis paragraph",
  "total_disputable": 0,
  "estimated_total_score_improvement": 0,
  "tips": ["personalized tip 1", "personalized tip 2", ...]
}

Rules:
- Identify EVERY potentially disputable item
- Classify each dispute type accurately: inaccuracy (wrong info), not_mine (identity issue), time_barred (past 7-year reporting limit), duplicate (same debt reported twice), obsolete (should have fallen off), mixed_file (someone else's info on report)
- ALL dispute letters MUST be READY TO PRINT AND MAIL with the user's actual information filled in:
  - Use the user's actual name, address, city, state, zip code, and last 4 SSN provided
  - Be formal, professional, and complete
  - Reference the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq.
  - Include specific account details (account name, number if available, balance)
  - Request investigation and removal/correction
  - Include today's date at the top
  - Include the user's name and address in the "From" section
  - Include the bureau's address in the "To" section
  - Reference the bureau's 30-day investigation requirement under FCRA § 1681i
  - End with a signature line: "Signature: _______________" and "Printed Name: [user's actual name]"
  - Include the last 4 SSN where needed for identification
- Generate goodwill letters ONLY for late payment items (request removal as courtesy)
- Generate pay-for-delete letters ONLY for collection items (offer to pay in exchange for deletion)
- Confidence levels: high = clear violation/inaccuracy, medium = likely disputable, low = worth trying
- Estimated score impact: 5-15 points per item depending on severity (collections/charge-offs = 10-15, late payments = 5-10, inquiries = 3-5)
- Tips should be personalized based on what you see in their report
- Be aggressive in finding disputable items — consumers have the RIGHT to accurate reporting`;

export async function POST(request: Request) {
  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limited. Please wait before analyzing another report. Max 5 analyses per hour." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable." },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { input_type, image_base64, image_mime_type, report_text, items, state, user_info } = body as {
    input_type?: string;
    image_base64?: string;
    image_mime_type?: string;
    report_text?: string;
    items?: Array<{
      account_name: string;
      account_type: string;
      balance: number;
      date_opened: string;
      last_activity_date: string;
      status: string;
      notes: string;
    }>;
    state?: string;
    user_info?: {
      fullName: string;
      streetAddress: string;
      city: string;
      state: string;
      zipCode: string;
      last4ssn: string;
    };
  };

  const client = new Anthropic({ apiKey });
  let reportContent = "";

  // PDF extraction
  if (input_type === "image" && image_base64 && image_mime_type === "application/pdf") {
    try {
      const visionRes = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: image_base64 },
            },
            {
              type: "text",
              text: "Extract ALL information from this credit report. For each account, extract: account/creditor name, account type, balance, status, date opened, last activity date, payment history, and any remarks. Be thorough — include every negative item, collection, late payment, charge-off, inquiry, and derogatory mark you can find.",
            },
          ],
        }],
      });
      const visionText = visionRes.content.find((b) => b.type === "text");
      if (visionText && visionText.type === "text") {
        reportContent = visionText.text;
      }
    } catch (err) {
      console.error("PDF extraction error:", err);
      return NextResponse.json(
        { error: "Failed to read the PDF. Please try uploading screenshots of your credit report instead." },
        { status: 500 }
      );
    }
  // Vision extraction for image uploads
  } else if (input_type === "image" && image_base64 && image_mime_type) {
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
                text: "Extract ALL information from this credit report. For each account, extract: account/creditor name, account type, balance, status, date opened, last activity date, payment history, and any remarks. Be thorough — include every negative item, collection, late payment, charge-off, inquiry, and derogatory mark you can find.",
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
        { error: "Failed to read the uploaded image. Please try a clearer photo or use the paste/describe option." },
        { status: 500 }
      );
    }
  } else if (input_type === "text" && report_text) {
    reportContent = report_text;
  } else if (input_type === "manual" && items && items.length > 0) {
    reportContent = items
      .map(
        (item, i) =>
          `Item #${i + 1}:
  Account: ${item.account_name}
  Type: ${item.account_type}
  Balance: $${item.balance}
  Date Opened: ${item.date_opened || "Unknown"}
  Last Activity: ${item.last_activity_date || "Unknown"}
  Status: ${item.status || "Unknown"}
  Notes: ${item.notes || "None"}`
      )
      .join("\n\n");
  } else {
    return NextResponse.json({ error: "No credit report data provided." }, { status: 400 });
  }

  const userMessage = `Please analyze this credit report data and identify all disputable items. Generate dispute letters for each using the consumer's actual information.

CONSUMER INFORMATION:
Name: ${user_info?.fullName || "[Name not provided]"}
Address: ${user_info?.streetAddress || "[Address not provided]"}
City: ${user_info?.city || "[City not provided]"}
State: ${user_info?.state || state || "[State not provided]"}
ZIP: ${user_info?.zipCode || "[ZIP not provided]"}
Last 4 SSN: ${user_info?.last4ssn || "[SSN not provided]"}

TODAY'S DATE: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

CREDIT REPORT DATA:
${reportContent}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const analysis = JSON.parse(jsonStr);
    return NextResponse.json(analysis);
  } catch (err: unknown) {
    console.error("Credit repair analysis error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("JSON")) {
      return NextResponse.json({ error: "Failed to parse AI analysis. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ error: `Analysis failed: ${message}. Please try again.` }, { status: 500 });
  }
}
