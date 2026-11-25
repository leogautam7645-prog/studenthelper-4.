// Vercel serverless function: POST /api/chat
// Needs an environment variable named OPENAI_API_KEY in Vercel.
// Optional: set OPENAI_MODEL in Vercel to change the model without editing code.

const SYSTEM_PROMPT =
  "You are StudentHelper, a friendly study assistant for school students. " +
  "Explain things step by step in simple language, use short examples, and " +
  "check understanding with a quick follow-up question when helpful. " +
  "For homework, guide the student toward the answer rather than just giving it.";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res
      .status(500)
      .json({ error: "OPENAI_API_KEY is not set in Vercel environment variables." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const messages = Array.isArray(body && body.messages) ? body.messages : [];
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-20);

  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return res.status(400).json({ error: "Send at least one user message." });
  }

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + key,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...clean],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || "The AI service returned an error.";
      return res.status(r.status).json({ error: msg });
    }

    const reply =
      data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

    return res.status(200).json({ reply: reply || "(no answer returned)" });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
};
