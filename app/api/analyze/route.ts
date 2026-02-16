import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSOL } from "../../data/sol";
import { commonOvercharges } from "../../data/common-overcharges";

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

// --- Helpers ---
function getDebtAgeYears(debtAge: string): number {
  switch (debtAge) {
    case "<1 year": return 0.5;
    case "1-3 years": return 2;
    case "3-5 years": return 4;
    case "5-7 years": return 6;
    case "7+ years": return 8;
    default: return 1;
  }
}

function buildOverchargesReference(): string {
  return commonOvercharges
    .map(c => `${c.code} "${c.description}" — Fair: $${c.fairPrice}, Typical Billed: $${c.typicalBilled}`)
    .join("\n");
}

const SYSTEM_PROMPT = `You are an expert medical bill analyst, debt negotiation specialist, and consumer rights attorney. You help consumers find overcharges in medical bills, fight debt collectors, and negotiate settlements.

You MUST respond with valid JSON only — no markdown, no code fences, no commentary outside the JSON object.

Given the user's bill/debt information, provide a detailed analysis as a JSON object with exactly these fields:

{
  "savings_found": number (estimated savings in dollars),
  "savings_percentage": number (percentage savings),
  "risk_level": "low" | "medium" | "high",
  "summary": "Brief 2-3 sentence summary of findings",
  "line_items": [
    {
      "description": "item description",
      "billed_amount": number,
      "fair_price": number,
      "status": "fair" | "overcharged" | "error" | "questionable",
      "note": "explanation"
    }
  ],
  "sol_expired": boolean,
  "sol_years": number,
  "sol_note": "explanation of SOL status",
  "fdcpa_violations": [
    {
      "violation": "description of potential violation",
      "statute": "FDCPA section reference (e.g. 15 U.S.C. § 1692g(a))",
      "damages": "potential damages amount"
    }
  ],
  "settlement_recommendation": {
    "offer_amount": number,
    "offer_percentage": number (cents on the dollar, e.g. 30 means 30 cents),
    "reasoning": "why this amount"
  },
  "letters": {
    "dispute_letter": "Full formal dispute letter ready to send",
    "debt_validation": "Full debt validation letter citing FDCPA 15 U.S.C. § 1692g (include if collections)",
    "settlement_offer": "Full settlement offer letter with specific dollar amount",
    "credit_dispute_equifax": "Credit bureau dispute letter addressed to Equifax, P.O. Box 740256, Atlanta, GA 30374",
    "credit_dispute_experian": "Credit bureau dispute letter addressed to Experian, P.O. Box 4500, Allen, TX 75013",
    "credit_dispute_transunion": "Credit bureau dispute letter addressed to TransUnion LLC, P.O. Box 2000, Chester, PA 19016"
  },
  "email_templates": {
    "debt_validation_email": "Professional email requesting debt validation under FDCPA - include subject line",
    "cease_desist_email": "Cease and desist email to stop collection calls/letters - include subject line", 
    "settlement_offer_email": "Settlement negotiation email with specific offer amount - include subject line",
    "hardship_letter_email": "Financial hardship explanation email - include subject line",
    "dispute_charges_email": "Email disputing specific charges or billing errors - include subject line"
  },
  "negotiation_script": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "key_findings": ["finding 1", "finding 2", ...]
}

Rules for your analysis:
- All letters must be formal, legally sound, and ready to print and mail
- Letters should reference specific statutes: FDCPA (15 U.S.C. § 1692 et seq.), FCRA (15 U.S.C. § 1681 et seq.)
- Include today's date in letters
- Settlement offers: older debt = lower offer (7+ years: 15-20%, 5-7 years: 20-25%, 3-5 years: 25-35%, 1-3 years: 35-45%, <1 year: 45-55%)
- Email templates must be professional but firm, ready to copy-paste-send
- Each email template must start with "Subject: [subject line]" followed by the email body
- Email templates should be conversational yet professional, avoiding overly legal language
- Include the consumer's name in email signatures
- For medical bills, cross-reference CPT codes against these known overcharges and fair prices:
COMMON CPT OVERCHARGES:
{OVERCHARGES_REF}

- For collections debt, ALWAYS generate a debt validation letter
- Include the consumer's state in statute of limitations calculations
- Each FDCPA violation can result in up to $1,000 statutory damages plus attorney fees
- If debt appears time-barred, prominently note this
- Negotiation script should be practical, step-by-step phone call guidance
- Be aggressive in finding savings — consumers are typically overcharged`;

export async function POST(request: Request) {
  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limited. Please wait before analyzing another bill. Max 5 analyses per hour." },
      { status: 429 }
    );
  }

  // Validate API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable." },
      { status: 500 }
    );
  }

  // Parse input
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { type, description, amount, creditor, state, debt_age, bill_text, image_base64, image_mime_type, user_info } = body as {
    type?: string; description?: string; amount?: number; creditor?: string;
    state?: string; debt_age?: string; bill_text?: string;
    image_base64?: string; image_mime_type?: string;
    user_info?: {
      full_name: string;
      street_address: string;
      city: string;
      state: string;
      zip_code: string;
    };
  };

  // --- PDF or Vision: extract bill text ---
  let extractedBillText = bill_text || "";
  if (image_base64 && image_mime_type === "application/pdf") {
    try {
      const client = new Anthropic({ apiKey });
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
              text: "Extract ALL text, amounts, CPT/procedure codes, creditor/provider info, dates, patient info, account numbers, and line items from this medical bill or collection letter. Be thorough.",
            },
          ],
        }],
      });
      const visionText = visionRes.content.find(b => b.type === "text");
      if (visionText && visionText.type === "text") {
        extractedBillText = visionText.text;
      }
    } catch (err) {
      console.error("PDF extraction error:", err);
      return NextResponse.json(
        { error: "Failed to read the PDF. Please try uploading screenshots of your bill instead." },
        { status: 500 }
      );
    }
  } else if (image_base64 && image_mime_type) {
    try {
      const client = new Anthropic({ apiKey });
      const visionRes = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{
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
              text: "Extract ALL text, amounts, CPT/procedure codes, creditor/provider info, dates, patient info, account numbers, and line items from this medical bill or collection letter. Return the extracted information as structured plain text. Be thorough — include every dollar amount, every line item, every date, and every name/address you can find.",
            },
          ],
        }],
      });
      const visionText = visionRes.content.find(b => b.type === "text");
      if (visionText && visionText.type === "text") {
        extractedBillText = visionText.text;
      }
    } catch (err) {
      console.error("Vision extraction error:", err);
      return NextResponse.json(
        { error: "Failed to read the uploaded image. Please try a clearer photo or use the describe/paste option." },
        { status: 500 }
      );
    }
  }

  // Infer type from image if not provided
  const effectiveType = type || "Medical";

  if (!effectiveType && !extractedBillText) {
    return NextResponse.json({ error: "Please specify a debt type or upload an image." }, { status: 400 });
  }

  const debtAmount = amount || 0;
  const debtAgeYears = getDebtAgeYears(debt_age || "<1 year");
  const sol = getSOL(state || "OH");

  // Build user message
  const userMessage = `Please analyze this debt/bill and provide your full analysis as JSON.

DEBT INFORMATION:
- Type: ${effectiveType}
- Amount: $${debtAmount.toLocaleString()}
- Creditor/Provider: ${creditor || "Unknown"}
- State: ${state || "Unknown"} (SOL for written contracts: ${sol?.written || "unknown"} years, oral: ${sol?.oral || "unknown"} years)
- Debt Age: ${debt_age || "Unknown"} (approximately ${debtAgeYears} years)
- Description: ${description || "None provided"}
${extractedBillText ? `\nBILL TEXT / DETAILS:\n${extractedBillText}` : ""}

${user_info ? `USER INFORMATION (use this in all generated letters):
- Full Name: ${user_info.full_name}
- Address: ${user_info.street_address}, ${user_info.city}, ${user_info.state} ${user_info.zip_code}
` : ""}

IMPORTANT: All letters (dispute, validation, settlement, credit disputes) must be pre-filled with the user's name and address in proper business letter format.

Today's date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;

  const systemPrompt = SYSTEM_PROMPT.replace("{OVERCHARGES_REF}", buildOverchargesReference());

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text
    const textBlock = message.content.find(b => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON - strip markdown fences if present
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const analysis = JSON.parse(jsonStr);

    // Transform to match the frontend's expected shape
    const settlementPercent = (analysis.settlement_recommendation?.offer_percentage || 40) / 100;
    const settlementAmount = analysis.settlement_recommendation?.offer_amount || Math.round(debtAmount * settlementPercent);
    const totalSavings = analysis.savings_found || 0;
    const totalBilled = debtAmount || totalSavings * 2;
    const totalFair = totalBilled - totalSavings;

    const result = {
      summary: {
        totalBilled,
        totalFair,
        totalSavings,
        savingsPercent: analysis.savings_percentage || (totalBilled > 0 ? Math.round((totalSavings / totalBilled) * 100) : 0),
        settlementAmount,
        settlementPercent: analysis.settlement_recommendation?.offer_percentage || Math.round(settlementPercent * 100),
        riskLevel: analysis.risk_level || "medium",
        aiSummary: analysis.summary || "",
      },
      lineItems: (analysis.line_items || []).map((li: Record<string, unknown>) => ({
        code: "",
        description: li.description || "",
        billed: li.billed_amount || 0,
        fair: li.fair_price || 0,
        status: li.status || "questionable",
        savings: ((li.billed_amount as number) || 0) - ((li.fair_price as number) || 0),
        note: li.note || "",
      })),
      statuteOfLimitations: {
        state: sol?.state || state || "Unknown",
        yearsWritten: sol?.written || analysis.sol_years || 0,
        yearsOral: sol?.oral || 0,
        debtAge: debt_age || "<1 year",
        debtAgeYears,
        isExpired: analysis.sol_expired || false,
        message: analysis.sol_note || "",
      },
      fdcpaViolations: (analysis.fdcpa_violations || []).map((v: Record<string, unknown>) => ({
        violation: v.violation || "",
        statute: v.statute || "",
        severity: "high",
        damages: v.damages || "Up to $1,000 per violation",
      })),
      letters: {
        dispute: analysis.letters?.dispute_letter || "",
        validation: analysis.letters?.debt_validation || "",
        settlement: analysis.letters?.settlement_offer || "",
        creditDispute: {
          equifax: analysis.letters?.credit_dispute_equifax || "",
          experian: analysis.letters?.credit_dispute_experian || "",
          transunion: analysis.letters?.credit_dispute_transunion || "",
        },
      },
      emailTemplates: {
        debtValidation: analysis.email_templates?.debt_validation_email || "",
        ceaseDesist: analysis.email_templates?.cease_desist_email || "",
        settlementOffer: analysis.email_templates?.settlement_offer_email || "",
        hardshipLetter: analysis.email_templates?.hardship_letter_email || "",
        disputeCharges: analysis.email_templates?.dispute_charges_email || "",
      },
      negotiationScript: analysis.negotiation_script || [],
      keyFindings: analysis.key_findings || [],
      debtType: effectiveType,
      creditor: creditor || "Unknown",
      amount: debtAmount,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Analysis error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("JSON")) {
      return NextResponse.json(
        { error: "Failed to parse AI analysis. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Analysis failed: ${message}. Please try again.` },
      { status: 500 }
    );
  }
}
