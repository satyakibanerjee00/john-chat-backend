import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST is allowed"
    });
  }

  try {
    const { question, pageText } = req.body;

    if (!question || !pageText) {
      return res.status(400).json({
        error: "Question and page text are required"
      });
    }

    const safePageText = pageText.slice(0, 7000);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: `
You are John, a friendly walking and talking anime assistant on the Bloomora website.

Bloomora website topic:
- Flowers
- Gifts
- Gift combos
- Same-day delivery
- AI Gift Finder
- Products shown on the Bloomora page

Rules:
1. Answer only from the page content below.
2. If the question is outside Bloomora gifts and flowers, reply exactly:
"I can only answer questions about Bloomora gifts and flowers."
3. Keep the answer short, friendly and clear.

PAGE CONTENT:
${safePageText}

USER QUESTION:
${question}
`
    });

    return res.status(200).json({
      answer: response.output_text
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "AI backend failed. Check OPENAI_API_KEY in Vercel."
    });
  }
}
