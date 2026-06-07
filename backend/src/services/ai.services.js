const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");


console.log(
  "API KEY LOADED:",
  !!process.env.GOOGLE_GEMINI_API_KEY
);

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY
});

const interviewReportSchema = z.object({
  title: z.string(),
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string()
    })
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string()
    })
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"])
    })
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string())
    })
  )
});
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription
}) {
  try {
    const prompt = `
You are an expert technical recruiter.

Analyze the candidate profile and job description.

Return ONLY valid JSON.

The JSON MUST EXACTLY follow this structure:

{
  "title": "string",
  "matchScore": 95,
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}
Requirements:
- matchScore between 0 and 100
- 5-7 technical questions
- 3-5 behavioral questions
- realistic skill gaps
- 7 day preparation plan
- title should be the job title
Resume:
${resume}
Self Description:
${selfDescription}
Job Description:
${jobDescription}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    console.log("RAW RESPONSE:");
    console.log(response.text);

    const parsedResponse = JSON.parse(response.text);
    const validatedResponse =
      interviewReportSchema.parse(parsedResponse);

    console.log(
      "Structured Output Success:",
      validatedResponse
    );
    return validatedResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    if (error instanceof z.ZodError) {
      console.error("Schema Validation Error:");
      console.error(error.issues);
    }
    throw error;
  }
}
module.exports = {
  generateInterviewReport
};