// Vercel serverless function: POST /api/chat  (Groq version - free tier, no credit card)
// Set GROQ_API_KEY in Vercel -> Project -> Settings -> Environment Variables.
// Optional: set GROQ_MODEL to pick a specific model. If not set, one is picked automatically.

const GROQ_URL = "https://api.groq.com/openai/v1";
let cachedModel = null;

// Picks a chat model from your Groq account if GROQ_MODEL isn't set
async function pickModel(apiKey) {
  if (process.env.GROQ_MODEL) return process.env.GROQ_MODEL.trim();
  if (cachedModel) return cachedModel;

  const r = await fetch(`${GROQ_URL}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || "Could not load Groq models.");

  const skip = /whisper|tts|guard|embed|vision|audio|playai|orpheus/i;
  const ids = (data.data || []).map(m => m.id).filter(id => !skip.test(id));
  const preferred = ids.find(id => /llama/i.test(id)) || ids.find(id => /gpt-oss/i.test(id)) || ids[0];
  if (!preferred) throw new Error("No chat models found on your Groq account.");

  cachedModel = preferred;
  return cachedModel;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const apiKey = (process.env.GROQ_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY is not set on the server." });
  }

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
    const model = await pickModel(apiKey);

    const response = await fetch(`${GROQ_URL}/chat/completions`, {
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
      if (response.status === 429) {
        return res.status(429).json({ error: "Too many questions right now (free limit). Wait a minute and try again." });
      }
      return res.status(response.status).json({ error: data?.error?.message || "AI request failed." });
    }

    const reply = data?.choices?.[0]?.message?.content || "(No reply)";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Could not reach the AI service." });
  }
}
