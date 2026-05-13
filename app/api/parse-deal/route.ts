import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { dealNotes } = await request.json();

    if (!dealNotes || dealNotes.trim() === "") {
      return NextResponse.json(
        { error: "No deal notes provided" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a music industry settlement expert. Extract deal terms from this booker's note and return ONLY a JSON object with no explanation.

Deal note: "${dealNotes}"

Return this exact JSON structure:
{
  "guarantee": <number or null>,
  "percentage": <decimal between 0-1, e.g. 0.85 for 85%, or null>,
  "venueSplit": <decimal between 0-1, e.g. 0.15 for 15%, or null>,
  "expenseCap": <number or null>,
  "hospitalityCap": <number or null>,
  "walkoutPotThreshold": <number or null>,
  "walkoutPotPercentage": <decimal or null>,
  "notes": "<any ambiguous terms or assumptions you made>"
}

Examples of deal note patterns:
- "5000 g'tee vs 80/20 net" means guarantee=5000, percentage=0.80, venueSplit=0.20
- "expense cap 2300" means expenseCap=2300
- "hosp $600" means hospitalityCap=600
- "walkout pot: 100% of gross above $5500" means walkoutPotThreshold=5500, walkoutPotPercentage=1.0

Return ONLY the JSON object. No explanation. No markdown.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      parsed,
      rawResponse: responseText,
    });
  } catch (error) {
    console.error("Parse deal error:", error);
    return NextResponse.json(
      { error: "Failed to parse deal notes" },
      { status: 500 }
    );
  }
}