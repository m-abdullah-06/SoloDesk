import { NextRequest, NextResponse } from "next/server";
import { generateClientMessage } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenario, tone, language, situation, clientName, projectName, amount, deadline } = body;

    if (!scenario || !tone || !language || !situation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await generateClientMessage({
      scenario,
      tone,
      language,
      situation,
      clientName,
      projectName,
      amount,
      deadline,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI communicate error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate message" },
      { status: 500 }
    );
  }
}
