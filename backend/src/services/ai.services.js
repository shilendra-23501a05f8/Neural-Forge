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
      model: 'gemini-3-flash-preview',
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

const jobSearchResultSchema = z.object({
  jobRole: z.string(),
  jobs: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      location: z.string(),
      link: z.string(),
      platform: z.enum(["LinkedIn", "Unstop", "Other"])
    })
  )
});

function cleanContentForStableModel(content) {
  if (!content) return content;
  if (typeof content === "string") return content;
  if (content.parts && Array.isArray(content.parts)) {
    const cleanParts = content.parts.map(part => {
      const newPart = {};
      if (part.text !== undefined) newPart.text = part.text;
      if (part.functionCall !== undefined) newPart.functionCall = part.functionCall;
      if (part.functionResponse !== undefined) newPart.functionResponse = part.functionResponse;
      return newPart;
    }).filter(part => Object.keys(part).length > 0);
    return { ...content, parts: cleanParts };
  }
  return content;
}

async function generateContentWithFallback({ model = "gemini-3-flash-preview", contents, config }) {
  try {
    return await ai.models.generateContent({ model, contents, config });
  } catch (error) {
    if (model === "gemini-3-flash-preview") {
      console.warn("gemini-3-flash-preview failed, falling back to gemini-2.5-flash. Error:", error.message);
      
      const cleanContents = Array.isArray(contents) 
        ? contents.map(item => cleanContentForStableModel(item))
        : cleanContentForStableModel(contents);

      return await ai.models.generateContent({ 
        model: "gemini-2.5-flash", 
        contents: cleanContents, 
        config 
      });
    }
    throw error;
  }
}

async function retrieveJobsAgentically({ jobRole }) {
  const jobService = require("./job.service");

  try {
    const prompt = `Find real job applications for: "${jobRole}". Use the fetchJobPostings tool to search LinkedIn and Unstop first.`;

    const config = {
      systemInstruction: "You are a career assistant Agent. You must search for jobs using the fetchJobPostings tool. Always invoke the tool first to fetch jobs, then format the fetched jobs as a clean JSON list.",
      tools: [
        {
          functionDeclarations: [
            {
              name: "fetchJobPostings",
              description: "Retrieves job postings from LinkedIn and Unstop for a specific job title.",
              parameters: {
                type: "OBJECT",
                properties: {
                  jobRole: { type: "STRING", description: "The job title to search (e.g. 'Node.js Developer')" }
                },
                required: ["jobRole"]
              }
            }
          ]
        }
      ]
    };

    // 1. Initial call to trigger tool use
    let response = await generateContentWithFallback({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: config
    });

    console.log("Gemini Agent Call 1 finished. Function Calls:", response.functionCalls);

    let finalOutput = "";

    // 2. Check for tool usage
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      
      if (call.name === "fetchJobPostings") {
        console.log("Agent executing tool: fetchJobPostings for", call.args.jobRole);
        
        // Execute the scraper tool
        const jobsFound = await jobService.fetchJobPostings(call.args.jobRole);
        console.log(`Tool retrieved ${jobsFound.length} jobs.`);

        // Send tool response to Gemini
        const secondResponse = await generateContentWithFallback({
          model: "gemini-3-flash-preview",
          contents: [
            { role: "user", parts: [{ text: prompt }] },
            response.candidates[0].content,
            { role: "user", parts: [{ functionResponse: { name: call.name, response: { jobs: jobsFound } } }] }
          ],
          config: {
            responseMimeType: "application/json",
            systemInstruction: `You are a career advisor agent. Analyze the jobs array supplied in the function response.
Filter out any job listings that are completely unrelated to the requested role: "${jobRole}".
Be reasonably flexible: keep titles like 'Full Stack Developer', 'Frontend Engineer', or 'Software Engineer' for a 'React Developer' request if they align with that track, but discard completely different roles (like 'Sales Manager', 'HR Recruiter', or 'AI Specialist' unless it specifically requires React).
Format the relevant jobs into a valid JSON object matching this schema:
{
  "jobRole": "${jobRole}",
  "jobs": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "link": "string",
      "platform": "LinkedIn" | "Unstop" | "Other"
    }
  ]
}`
          }
        });

        finalOutput = secondResponse.text;
      }
    } else {
      // Model returned text directly instead of function calling (e.g., if it didn't use the tool)
      console.log("Model did not request function calling. Running manual fallback.");
      const jobsFound = await jobService.fetchJobPostings(jobRole);
      
      const formatResponse = await generateContentWithFallback({
        model: "gemini-3-flash-preview",
        contents: `Format these jobs into the target JSON structure: ${JSON.stringify(jobsFound)}`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: `You are a career advisor agent. Parse and filter the job listings list.
Filter out any job listings that are completely unrelated to the requested role: "${jobRole}".
Format the relevant jobs into a valid JSON object matching this schema:
{
  "jobRole": "${jobRole}",
  "jobs": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "link": "string",
      "platform": "LinkedIn" | "Unstop" | "Other"
    }
  ]
}`
        }
      });
      finalOutput = formatResponse.text;
    }

    console.log("Gemini Agent final response:", finalOutput);
    const parsed = JSON.parse(finalOutput);
    const validated = jobSearchResultSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Agentic Job Search Error:", error);
    if (error instanceof z.ZodError) {
      console.error("Schema Validation Error:", error.issues);
    }
    throw error;
  }
}

module.exports = {
  generateInterviewReport,
  retrieveJobsAgentically
};