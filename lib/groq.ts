import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export type GenerateMessageParams = {
  scenario: string;
  tone: string;
  language: string;
  situation: string;
  clientName?: string;
  projectName?: string;
  amount?: string;
  deadline?: string;
};

export async function generateClientMessage(params: GenerateMessageParams) {
  const {
    scenario,
    tone,
    language,
    situation,
    clientName,
    projectName,
    amount,
    deadline,
  } = params;

  const contextParts = [
    clientName && `Client name: ${clientName}`,
    projectName && `Project: ${projectName}`,
    amount && `Amount: ${amount}`,
    deadline && `Deadline: ${deadline}`,
  ]
    .filter(Boolean)
    .join("\n");

  const languageInstruction =
    language === "urdu"
      ? "Write the message entirely in professional Urdu (not casual/SMS Urdu)."
      : language === "both"
      ? "Write the message in English first, then provide a professional Urdu translation below it separated by a horizontal line."
      : "Write the message in English.";

  const systemPrompt = `You are SoloDesk, a professional communication assistant for Pakistani freelancers.
Your job is to draft clear, professional messages for client situations.

RULES:
- Never sound desperate or overly apologetic
- Protect the freelancer's professional interests
- Keep messages concise (under 200 words for the main message)
- Maintain boundaries while preserving the client relationship
- ${languageInstruction}
- Tone: ${tone} (professional = balanced, firm = assertive, friendly = warm but clear, urgent = time-sensitive)
- Always output a subject line for email-type scenarios

OUTPUT FORMAT (strictly follow this):
SUBJECT: [subject line here, or NONE if not applicable]
---
[message body here]`;

  const userPrompt = `Scenario: ${scenario.replace(/_/g, " ")}
Situation: ${situation}
${contextParts ? `\nContext:\n${contextParts}` : ""}

Generate a professional message for this situation.`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const raw = completion.choices[0]?.message?.content || "";

  // Parse subject and body
  const lines = raw.split("\n");
  let subject: string | null = null;
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("SUBJECT:")) {
      const s = lines[i].replace("SUBJECT:", "").trim();
      subject = s === "NONE" ? null : s;
    }
    if (lines[i] === "---") {
      bodyStart = i + 1;
      break;
    }
  }

  const body = lines.slice(bodyStart).join("\n").trim();

  return { subject, body };
}

export async function generateProposalDraft(jobDescription: string) {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a proposal writing assistant for Pakistani freelancers. Generate a professional proposal based on a job description. 
Output valid JSON only with this structure:
{
  "overview": "string",
  "scope_items": [{"id": "1", "title": "string", "description": "string"}],
  "timeline_items": [{"id": "1", "milestone": "string", "duration": "string"}],
  "pricing_items": [{"id": "1", "description": "string", "amount": number}],
  "terms": "string"
}`,
      },
      {
        role: "user",
        content: `Job Description:\n${jobDescription}\n\nGenerate a professional proposal JSON.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 2048,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

export async function analyzeTone(message: string) {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a communication tone analyzer for freelancers. Analyze the given message and return JSON only:
{
  "score": number (0-100, where 100 is perfectly professional),
  "tone": "string (e.g. Professional, Passive-aggressive, Too formal, Too casual)",
  "issues": ["string"],
  "improved": "string (improved version of the message)"
}`,
      },
      {
        role: "user",
        content: `Analyze this message:\n\n${message}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}
