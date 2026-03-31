const { GoogleGenAI } = require("@google/genai");

const FIELD_OPTIONS = [
  "primaryGoal",
  "primaryUsers",
  "keyWorkflow",
  "mustHaveFeature",
  "devicePriority",
  "notificationStyle",
  "dataType",
  "sharingNeeds",
  "privacyLevel",
  "automationNeed",
];

const FIELD_PRIORITIES = {
  reminder: ["notificationStyle", "primaryGoal", "automationNeed", "devicePriority", "privacyLevel"],
  booking: ["keyWorkflow", "primaryUsers", "mustHaveFeature", "devicePriority", "sharingNeeds"],
  inventory: ["dataType", "mustHaveFeature", "primaryUsers", "automationNeed", "devicePriority"],
  tasks: ["mustHaveFeature", "primaryUsers", "automationNeed", "devicePriority", "sharingNeeds"],
  website: ["primaryUsers", "mustHaveFeature", "primaryGoal", "devicePriority", "sharingNeeds"],
  generic: ["mustHaveFeature", "primaryUsers", "devicePriority", "primaryGoal", "automationNeed"],
};

const SINGLE_QUESTION_SCHEMA = {
  type: "object",
  properties: {
    question: {
      type: "object",
      properties: {
        field: { type: "string" },
        text: { type: "string" },
        options: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: { type: "string" },
        },
      },
      required: ["field", "text", "options"],
    },
  },
  required: ["question"],
};

function classifyIdea(idea) {
  const text = String(idea || "").toLowerCase();

  if (/(remind|reminder|alarm|notify|notification)/.test(text)) return "reminder";
  if (/(book|booking|appointment|salon|slot|reserve)/.test(text)) return "booking";
  if (/(inventory|stock|warehouse|product|restock)/.test(text)) return "inventory";
  if (/(task|todo|checklist|project)/.test(text)) return "tasks";
  if (/(website|portfolio|landing|showcase)/.test(text)) return "website";
  return "generic";
}

function fallbackFlowForIdea(idea) {
  const kind = classifyIdea(idea);

  if (kind === "reminder") {
    return [
      {
        field: "primaryGoal",
        text: "What kind of reminders should this app help you manage most?",
        options: [
          "Daily personal tasks",
          "Bills and payment dates",
          "Medicine or health reminders",
          "Study or work deadlines",
          "A mix of different reminders",
        ],
      },
      {
        field: "notificationStyle",
        text: "How should the app remind you at the right time?",
        options: [
          "Push notifications",
          "Alarm-style alerts",
          "Daily summary list",
          "Repeating reminder schedule",
          "Manual checklist without alerts",
        ],
      },
      {
        field: "devicePriority",
        text: "Where will you mostly use this reminders app?",
        options: [
          "On my phone",
          "On my laptop",
          "On both equally",
          "On a tablet",
          "I have not decided yet",
        ],
      },
    ];
  }

  if (kind === "booking") {
    return [
      {
        field: "primaryGoal",
        text: "What should users book through this app?",
        options: [
          "Appointments or services",
          "Classes or sessions",
          "Tables or seats",
          "Consultations",
          "A mix of booking types",
        ],
      },
      {
        field: "primaryUsers",
        text: "Who will use the booking flow most often?",
        options: [
          "Customers booking for themselves",
          "Staff creating bookings",
          "Both customers and staff",
          "Only admin users",
          "Not fully sure yet",
        ],
      },
      {
        field: "keyWorkflow",
        text: "What is the most important step in the booking process?",
        options: [
          "Choosing a service",
          "Picking a time slot",
          "Getting a confirmation message",
          "Managing cancellations or reschedules",
          "Collecting customer details",
        ],
      },
    ];
  }

  if (kind === "inventory") {
    return [
      {
        field: "primaryGoal",
        text: "What should this inventory app track most closely?",
        options: [
          "Product quantities",
          "Incoming and outgoing stock",
          "Low-stock alerts",
          "Supplier details",
          "A mix of all inventory needs",
        ],
      },
      {
        field: "primaryUsers",
        text: "Who will update the inventory most often?",
        options: [
          "Only me",
          "Store staff",
          "Warehouse staff",
          "Managers only",
          "Multiple team roles",
        ],
      },
      {
        field: "mustHaveFeature",
        text: "What feature would make the biggest difference first?",
        options: [
          "Fast stock entry",
          "Clear low-stock warnings",
          "Daily inventory reports",
          "Barcode or item lookup",
          "Simple product history",
        ],
      },
    ];
  }

  if (kind === "tasks") {
    return [
      {
        field: "primaryGoal",
        text: "What should this task app help you do best?",
        options: [
          "Capture tasks quickly",
          "Track deadlines",
          "Organize work into lists",
          "Monitor progress over time",
          "Keep personal and work tasks together",
        ],
      },
      {
        field: "primaryUsers",
        text: "Who will manage tasks inside the app?",
        options: [
          "Only me",
          "A small team",
          "A manager and team",
          "Clients and team together",
          "I am still deciding",
        ],
      },
      {
        field: "mustHaveFeature",
        text: "What should feel easiest in the first version?",
        options: [
          "Adding a task",
          "Marking tasks complete",
          "Sorting by priority",
          "Grouping tasks by project",
          "Seeing today's work at a glance",
        ],
      },
    ];
  }

  if (kind === "website") {
    return [
      {
        field: "primaryGoal",
        text: "What is the main job of this website?",
        options: [
          "Explain a service clearly",
          "Show a portfolio or work samples",
          "Collect leads or inquiries",
          "Share updates or content",
          "Support a personal brand",
        ],
      },
      {
        field: "primaryUsers",
        text: "Who is the website mainly trying to reach?",
        options: [
          "Potential customers",
          "Existing customers",
          "Employers or recruiters",
          "A public audience",
          "A small niche community",
        ],
      },
      {
        field: "mustHaveFeature",
        text: "What should visitors be able to do most easily?",
        options: [
          "Understand the offering quickly",
          "Contact you",
          "View examples or projects",
          "Read important information",
          "Take a clear next step",
        ],
      },
    ];
  }

  return [
    {
      field: "primaryGoal",
      text: "What is the main goal of this app?",
      options: [
        "Manage tasks or operations",
        "Show information clearly",
        "Handle customers or bookings",
        "Track records or inventory",
        "Something else",
      ],
    },
    {
      field: "primaryUsers",
      text: "Who will use this app most often?",
      options: ["Only me", "My team", "My customers", "Public users", "Not sure yet"],
    },
    {
      field: "devicePriority",
      text: "Where should this app work best?",
      options: ["Mobile phones", "Desktop or laptop", "Both equally", "Tablet focused", "Not decided yet"],
    },
  ];
}

function fallbackNextQuestion(idea, history = []) {
  const fallback = fallbackFlowForIdea(idea);
  return fallback[history.length] || fallback[fallback.length - 1];
}

function formatQuestionWarning(error) {
  const message = String(error?.message || error || "");

  if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.toLowerCase().includes("quota")) {
    return "AI question generation is temporarily unavailable because the Gemini quota is exhausted. Using smart backup questions for now.";
  }

  if (message.toLowerCase().includes("invalid json")) {
    return "AI question generation returned an invalid response. Using smart backup questions for now.";
  }

  if (message.toLowerCase().includes("empty response")) {
    return "AI question generation returned an empty response. Using smart backup questions for now.";
  }

  return "AI question generation is unavailable right now. Using smart backup questions for now.";
}

function cleanQuestion(payload, index) {
  const question = payload?.question;

  if (!question || typeof question !== "object") {
    return null;
  }

  const options = Array.isArray(question.options)
    ? question.options.map((option) => String(option || "").trim()).filter(Boolean).slice(0, 5)
    : [];

  const text = String(question.text || "").trim();
  const field = String(question.field || "").trim();

  if (!text || options.length !== 5) {
    return null;
  }

  return {
    id: index + 1,
    field: FIELD_OPTIONS.includes(field) ? field : `question_${index + 1}`,
    text,
    options,
  };
}

async function generateNextQuestion({ idea, history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return { question: { ...fallbackNextQuestion(idea, history), id: history.length + 1 }, source: "fallback" };
  }

  const ai = new GoogleGenAI({ apiKey });
  const ideaKind = classifyIdea(idea);
  const preferredFields = FIELD_PRIORITIES[ideaKind] || FIELD_PRIORITIES.generic;

  const askedFields = history.map((item) => item.field).filter(Boolean);
  const askedQuestions = history.map((item, index) => {
    const answerText = item.answer ? `Answer: ${item.answer}` : "";
    return `${index + 1}. ${item.text} ${answerText}`.trim();
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "You are generating onboarding questions for an AI app builder.",
              "The end goal is to understand the user's app idea better and gather relevant details to build a simple app prototype based on their answers.",
              "The end users are beginners with app ideas but no coding experience, so the questions should be easy to understand and answer.",
              "The provided app idea may be vague or broad, so the questions should help clarify and specify the main goal, users, and features of the app so that we can generate a useful prototype.",
              "Generate exactly one next multiple-choice question for the app idea below.",
              "The next question must be highly relevant to the idea and should use previous answers when helpful.",
              "Do not repeat the same topic already asked.",
              "Avoid generic repeated patterns like always asking 'what is the goal' and 'who are the users' first unless the idea is too vague to proceed without them.",
              "Prefer concrete product-shaping questions about workflow, reminders, booking steps, inventory actions, alerts, data, or key features when the idea already suggests them.",
              "Keep the language simple and practical.",
              "Each question must have exactly 5 concise options.",
              `Idea category: ${ideaKind}.`,
              `Prefer these fields in this order when relevant: ${preferredFields.join(", ")}.`,
              `Choose one field for this next question from: ${FIELD_OPTIONS.join(", ")}.`,
              `App idea: ${idea}`,
              askedQuestions.length ? `Previous questions and selected answers:\n${askedQuestions.join("\n")}` : "No previous questions yet.",
              askedFields.length ? `Already used fields: ${askedFields.join(", ")}` : "No fields used yet.",
            ].join("\n"),
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: SINGLE_QUESTION_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 1000,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });

  const responseText =
    response?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";

  if (!responseText) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsed;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  const question = cleanQuestion(parsed, history.length);

  if (!question) {
    throw new Error("Gemini returned an unexpected question format.");
  }

  return { question, source: "gemini" };
}

module.exports = {
  fallbackNextQuestion,
  formatQuestionWarning,
  generateNextQuestion,
};
