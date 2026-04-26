const express = require("express");
const router = express.Router();
const https = require("https");

// ===============================
// 🔥 OpenAI-compatible caller
// ===============================
function callOpenAICompat(host, path, apiKey, model, system, user, extraHeaders = {}) {
  const body = JSON.stringify({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  const options = {
    hostname: host,
    path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      ...extraHeaders
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = "";

      res.on("data", chunk => (data += chunk));

      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.message?.content;
          if (!content) return reject(new Error("No response content"));
          resolve(content);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);

    // 🔥 timeout safety
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.write(body);
    req.end();
  });
}

// ===============================
// 🔥 Providers
// ===============================
const AI_PROVIDERS = [
  {
    name: "OpenRouter",
    call: async (system, user) => {
      return await callOpenAICompat(
        "openrouter.ai",
        "/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY,
        "openrouter/auto",
        system,
        user,
        { "HTTP-Referer": "http://localhost" }
      );
    }
  },
  {
    name: "Groq",
    call: async (system, user) => {
      return await callOpenAICompat(
        "api.groq.com",
        "/openai/v1/chat/completions",
        process.env.GROQ_API_KEY,
        "llama-3.3-70b-specdec",
        system,
        user
      );
    }
  }
];

// ===============================
// 🔥 PROMPTS (UPGRADED)
// ===============================
function buildPrompts(idea) {
  const system = `
You are a senior fullstack engineer and product UI designer.

You build COMPLETE, production-quality web apps.

STRICT RULES:
- NEVER output placeholder text like "It works", "Hello World"
- NEVER output incomplete apps
- MUST implement real working features
- MUST include clean UI (modern card layout, spacing, colors)
- MUST separate HTML, CSS, JS (no inline JS in HTML)
- MUST produce usable UX (not demo text)

Design expectations:
- Centered layout
- Clean typography (sans-serif, modern fonts)
- Proper spacing (padding, margins)
- Buttons styled (hover states, rounded corners)
- Inputs styled
- Beautiful Modern Dark Theme (deep dark backgrounds, glassmorphism layers, vibrant color accents)
- Card-based UI or dashboard style with subtle borders
- Professional aesthetics, no basic default browser styles

Return ONLY valid JSON.

Format:
{
  "frontend": {
    "index.html": "...",
    "style.css": "...",
    "script.js": "...",
    "server.js": "..."
  },
  "backend": {
    "server.js": "..."
  }
}
`;

  const user = `
Build a COMPLETE web app for:

"${idea}"

FEATURE REQUIREMENTS:
- Fully working functionality (no fake UI)
- Real user interaction
- Data handling (use localStorage if needed)
- Proper event handling
- Error handling
- Loading states if API used

UI REQUIREMENTS:
- Modern clean UI (like a real SaaS product)
- Centered layout with container
- Card design
- Styled buttons and inputs
- Responsive design

TECH REQUIREMENTS:
- index.html → structure
- style.css → styling (no inline styles)
- script.js → logic
- server.js → serves frontend on port 3001
- backend/server.js → Express API (port 5001)

STRICT:
- No placeholder text
- No lorem ipsum
- No minimal demos
- Must look like a real usable app
Frontend server MUST use Node's built-in http module.
DO NOT use express in frontend.

Return ONLY JSON.
`;

  return { system, user };
}

// ===============================
// 🔥 VALIDATION
// ===============================
function validateOutput(parsed) {
  const html = parsed?.frontend?.["index.html"] || "";

  if (!html) throw new Error("Missing HTML");

  if (html.length < 300) throw new Error("Too small UI");

  if (
    html.includes("It works") ||
    html.includes("Hello World") ||
    html.includes("lorem ipsum")
  ) {
    throw new Error("Placeholder detected");
  }

  return true;
}

// ===============================
// 🔥 CLEAN RESPONSE
// ===============================
function cleanAIResponse(result) {
  return String(result)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

// ===============================
// 🔥 ROUTE (PRO LEVEL)
// ===============================
router.post("/", async (req, res) => {
  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "idea required" });
  }

  const { system, user } = buildPrompts(idea);

  for (const provider of AI_PROVIDERS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`\n🔥 Trying ${provider.name} (attempt ${attempt + 1})`);

        const result = await provider.call(system, user);
        const cleaned = cleanAIResponse(result);

        const parsed = JSON.parse(cleaned);

        // 🔥 VALIDATION
        validateOutput(parsed);

        console.log(`✅ SUCCESS via ${provider.name}`);

        return res.json({
          success: true,
          provider: provider.name,
          files: parsed
        });

      } catch (err) {
        console.log(`❌ ${provider.name} attempt ${attempt + 1} failed:`, err.message);
      }
    }
  }

  // ❌ HARD FAIL (NO TRASH FALLBACK)
  return res.status(500).json({
    error: "AI generation failed after retries"
  });
});

module.exports = router;