const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function generateQuestionsFromIdea(userIdea) {
  const prompt = `You are an expert product manager and workflow designer. A user described their app idea: "${userIdea}".\n\nGenerate 4-5 clarifying multiple-choice questions that focus on requirements, users, platform, key features, and success criteria.\n\nImportant: Return only valid JSON and nothing else, formatted exactly like this:\n{\n  "clarityScore": 1-10,\n  "questions": [\n    {"id": "q1", "text": "...", "options": ["...", "...", "..."]},\n    ...\n  ]\n}\n\nFor each question option, include 3-5 succinct answer choices. Do not include narrative or extra text outside JSON. \n`;

  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
let content = response.data?.choices?.[0]?.message?.content;

// 🔥 Normalize content (VERY IMPORTANT)
if (Array.isArray(content)) {
  content = content.map(part => {
    if (typeof part === 'string') return part;
    if (typeof part === 'object' && part !== null) return part.text || '';
    return String(part);
  }).join('');
}

let questionsData;

if (typeof content === 'object' && content !== null) {
  questionsData = content;
} else if (typeof content === 'string') {
  if (!content.trim()) {
    throw new Error('OpenAI response missing content');
  }

  try {
    questionsData = JSON.parse(content);
  } catch {
    const jsonFragments = content.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/g);
    if (!jsonFragments || jsonFragments.length === 0) {
      throw new Error('Could not parse AI JSON output, raw: ' + content);
    }

    // prefer object with questions, fallback to first fragment
    const candidate = jsonFragments.find(fragment => /"questions"\s*:\s*\[/.test(fragment)) || jsonFragments[0];
    questionsData = JSON.parse(candidate);
  }
} else {
  throw new Error('OpenAI response missing content');
}

if (Array.isArray(questionsData)) {
  questionsData = {
    clarityScore: null,
    questions: questionsData
  };
} else if (questionsData && !Array.isArray(questionsData.questions)) {
  if (Array.isArray(questionsData.raw)) {
    questionsData.questions = questionsData.raw;
  } else if (Object.keys(questionsData).every(key => /^[0-9]+$/.test(key))) {
    questionsData.questions = Object.values(questionsData);
  }
}

// validation
if (!questionsData || !Array.isArray(questionsData.questions)) {
  throw new Error('Invalid questions payload from OpenAI - expected {questions:[...]} or raw array. Parsed value: ' + JSON.stringify(questionsData));
}

questionsData.questions.forEach((q, i) => {
  if (!q?.id || !q?.text || !Array.isArray(q.options) || q.options.length < 2) {
    throw new Error(`Invalid question format at index ${i}`);
  }
});

  return {
    ...questionsData,
    source: 'ai'
  };
}


module.exports = {
  generateQuestionsFromIdea
};
