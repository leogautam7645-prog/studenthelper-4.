
export default async function handler(request, response) {
  const allowedOrigin =
    "https://leogautam7645-prog.github.io";

  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { question } = request.body || {};

    if (typeof question !== "string" || !question.trim()) {
      return response.status(400).json({
        error: "Please enter a question."
      });
    }

    if (question.length > 4000) {
      return response.status(400).json({
        error: "Your question is too long."
      });
    }

    const aiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "You are StudentHelper, a friendly AI tutor for grades 6-12. Explain concepts clearly, use age-appropriate language, and show step-by-step explanations. Encourage learning rather than simply giving answers.",
          input: question
        })
      }
    );

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("OpenAI error:", data);
      return response.status(500).json({
        error: "The AI service could not answer right now."
      });
    }

    return response.status(200).json({
      success: true,
      answer: data.output_text
    });

  } catch (error) {
    console.error(error);
    return response.status(500).json({
      error: "Something went wrong."
    });
  }
}
