import { NextRequest, NextResponse } from "next/server";
import { generateProposalDraft } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { jobDescription } = await req.json();
    if (!jobDescription) return NextResponse.json({ error: "Job description required" }, { status: 400 });
    const result = await generateProposalDraft(jobDescription);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}
