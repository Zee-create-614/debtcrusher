import { NextRequest, NextResponse } from "next/server";

const LOB_API_KEY = process.env.LOB_API_KEY || "";
// Set LOB_API_KEY in your .env.local file (use Lob test key for development)
const LOB_API_URL = "https://api.lob.com/v1/letters";

// Simple in-memory rate limiting: 3 letters per hour per IP
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const hourAgo = now - 3600000;
  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => t > hourAgo);
  rateLimitMap.set(ip, timestamps);
  return timestamps.length < 3;
}

function recordRequest(ip: string) {
  const timestamps = rateLimitMap.get(ip) || [];
  timestamps.push(Date.now());
  rateLimitMap.set(ip, timestamps);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Maximum 3 letters per hour." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const {
      letter_content,
      to_name,
      to_address,
      to_city,
      to_state,
      to_zip,
      from_name,
      from_address,
      from_city,
      from_state,
      from_zip,
    } = body;

    if (!LOB_API_KEY) {
      return NextResponse.json({ error: "Lob API key not configured. Set LOB_API_KEY in environment variables." }, { status: 500 });
    }

    // Validate required fields
    if (!letter_content || !to_name || !to_address || !to_city || !to_state || !to_zip || !from_name || !from_address || !from_city || !from_state || !from_zip) {
      return NextResponse.json({ error: "All address fields and letter content are required." }, { status: 400 });
    }

    // Wrap plain text content in minimal HTML for Lob
    const htmlContent = `<html><head><meta charset="UTF-8"><style>body{font-family:'Courier New',monospace;font-size:11px;line-height:1.5;margin:1in;white-space:pre-wrap;}</style></head><body>${letter_content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</body></html>`;

    const lobPayload = {
      description: `DebtCrusher - ${body.letter_type || "Dispute Letter"}`,
      to: {
        name: to_name,
        address_line1: to_address,
        address_city: to_city,
        address_state: to_state,
        address_zip: to_zip,
      },
      from: {
        name: from_name,
        address_line1: from_address,
        address_city: from_city,
        address_state: from_state,
        address_zip: from_zip,
      },
      file: htmlContent,
      color: false,
      mail_type: "usps_first_class",
      extra_service: "certified",
      return_envelope: false,
    };

    const response = await fetch(LOB_API_URL, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(LOB_API_KEY + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lobPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Lob API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Failed to send letter via Lob." },
        { status: response.status }
      );
    }

    recordRequest(ip);

    return NextResponse.json({
      success: true,
      id: data.id,
      tracking_number: data.tracking_number || null,
      expected_delivery_date: data.expected_delivery_date || null,
      carrier: data.carrier || "USPS",
      url: data.url || null,
      send_date: data.send_date || null,
    });
  } catch (error) {
    console.error("Send letter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
