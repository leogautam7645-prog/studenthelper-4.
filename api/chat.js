// Vercel serverless function: POST /api/chat  (OpenAI version)
// Set OPENAI_API_KEY in Vercel → Project → Settings → Environment Variables.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

const apiKey = (process.env.OPENAI_API_KEY || "").trim().replace(/^["']|["']$/g, "");  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server." });
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const { subject, messages } = req.body || {};
  if (!subject || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Missing subject or messages." });
  }

  const cleanMessages = messages.slice(-20).map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content).slice(0, 4000)
  }));

  const systemPrompt =
    `You are StudentHelper, a friendly tutor for students. The current subject is ${subject}. ` +
    `Explain things step by step in simple language, check understanding, and encourage the student ` +
    `to think through problems instead of just giving final answers. Keep replies concise.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...cleanMessages]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "AI request failed." });
    }

    const reply = data?.choices?.[0]?.message?.content || "(No reply)";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "Could not reach the AI service." });
  }
}
