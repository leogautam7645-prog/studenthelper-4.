// Vercel serverless function: POST /api/chat
// Keeps your AI API key on the server so students can't see it.
// Set ANTHROPIC_API_KEY in Vercel → Project → Settings → Environment Variables.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server." });
  }

  const { subject, messages } = req.body || {};
  if (!subject || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Missing subject or messages." });
  }

  // Keep only the last 20 turns and only valid fields
  const cleanMessages = messages.slice(-20).map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content).slice(0, 4000)
  }));

  const system =
    `You are StudentHelper, a friendly tutor for students. The current subject is ${subject}. ` +
    `Explain things step by step in simple language, check understanding, and encourage the student ` +
    `to think through problems instead of just giving final answers. Keep replies concise. ` +
    `If a question is off-topic for ${subject}, gently help anyway or steer back to studying.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 1024,
        system,
        messages: cleanMessages
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "AI request failed." });
    }

    const reply = (data.content || [])
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("\n");

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "Could not reach the AI service." });
  }
}
