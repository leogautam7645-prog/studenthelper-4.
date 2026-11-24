
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, subject, grade } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Please enter a question." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "AI key is not configured." });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: `You are StudentHelper, a friendly and patient AI tutor for grades 6–12.

Help students understand schoolwork in all subjects.

Subject: ${subject || "General"}
Student grade: ${grade || "Not specified"}

Explain answers clearly and step by step.
Use age-appropriate language.
Encourage learning instead of simply giving answers.
Never make up facts.`,
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({
        error: "The AI tutor could not respond. Please try again."
      });
    }

    const answer = data.output
      ?.flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return res.status(200).json({
      answer: answer || "I couldn't generate an answer. Please try again."
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
}
