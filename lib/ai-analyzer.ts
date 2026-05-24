import type { Standard, Criterion } from "@/data/bac-data";

export interface UploadedFile {
  fileName: string;
  text: string;
  matchedRequirement?: string;
}

export interface AnalysisResult {
  overallScore: number;
  overallFeedback: string;
  missingFiles: string[];
  fileResults: FileResult[];
  standardTitle: string;
  criterionTitle: string;
  criterionCode: string;
}

export interface FileResult {
  fileName: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

const AI_BASE_URL = "https://frightful-negate-bony.ngrok-free.dev";

export function buildBACScoringPrompt(
  standard: Standard,
  criterion: Criterion,
  uploadedFiles: UploadedFile[],
  demoFileContents: string[]
): string {
  const requiredFilesList = criterion.requiredFiles
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n");

  const uploadedFilesList = uploadedFiles
    .map(
      (f, i) =>
        `FILE ${i + 1}: "${f.fileName}"
--- CONTENT START ---
${f.text}
--- CONTENT END ---`
    )
    .join("\n\n");

  const demoContext =
    demoFileContents.length > 0
      ? `\n\nREFERENCE BENCHMARK (BAC-Approved Example Documents):
${demoFileContents
  .map(
    (d, i) => `BENCHMARK ${i + 1}:
${d}${d.length > 2000 ? "\n[truncated]" : ""}`
  )
  .join("\n\n")}`
      : "";

  // const missingFiles = criterion.requiredFiles.filter((req) => {
  //   return !uploadedFiles.some(
  //     (f) =>
  //       f.matchedRequirement === req ||
  //       f.fileName.toLowerCase().includes(req.toLowerCase())
  //   );
  // });

  // const missingList =
  //   missingFiles.length > 0
  //     ? `\nMISSING FILES (not uploaded by user):\n${missingFiles
  //         .map((f) => `- ${f}`)
  //         .join("\n")}`
  //     : "\nAll required files were uploaded.";
  const missingList = ""; // AI will determine missing files from content analysis

  return `You are an expert BAC (Bangladesh Accreditation Council) accreditation evaluator with 15+ years of experience evaluating university program documentation. Your task is to evaluate the provided documents against the specified BAC criterion and provide detailed, actionable feedback.

=== EVALUATION CONTEXT ===
STANDARD: ${standard.code} - ${standard.title}
CRITERION: ${criterion.code} - ${criterion.title}
CRITERION DESCRIPTION: ${criterion.description}
EVALUATION GUIDELINES: ${criterion.guidelines}
CRITERION WEIGHT: ${criterion.weight}/10

=== REQUIRED FILES FOR THIS CRITERION ===
${requiredFilesList}

=== UPLOADED DOCUMENTS FOR EVALUATION ===
${
  uploadedFiles.length > 0
    ? uploadedFilesList
    : "No files were uploaded by the user."
}
${demoContext}

=== EVALUATION INSTRUCTIONS ===
Analyze ALL uploaded documents thoroughly against the BAC criterion. Your evaluation must be STRICT but FAIR and follow BAC evaluation standards.

Return ONLY valid JSON (no markdown, no explanation outside JSON) in EXACTLY this format:
{
  "overallScore": <integer 1-100>,
  "overallFeedback": "<2-3 sentence expert summary of the overall submission quality and alignment with BAC criterion>",
  "missingFiles": [<list of required file names that are missing>],
  "fileResults": [
    {
      "fileName": "<exact file name>",
      "score": <integer 1-100>,
      "feedback": "<2-3 sentence specific feedback about this file's content quality and BAC alignment>",
      "strengths": ["<strength 1>", "<strength 2>", ...],
      "improvements": ["<specific improvement 1>", "<specific improvement 2>", ...]
    }
  ]
}

SCORING GUIDE:
- 90-100: Exemplary, exceeds BAC expectations with comprehensive content
- 75-89: Good, meets most BAC requirements with minor gaps
- 60-74: Satisfactory, meets basic requirements but needs improvement
- 45-59: Below standard, significant gaps requiring major revisions
- Below 45: Insufficient, fundamental requirements not met

Be specific in feedback. Reference actual content from the documents. Provide actionable improvement suggestions grounded in BAC standards. If no files were uploaded, score should reflect that (very low score). Based on the content of the uploaded files, determine which required files appear to be missing or inadequately represented. List these in the "missingFiles" array. The overallScore should account for missing required files by penalizing proportionally.`;
}

export async function analyzeWithAI(
  standard: Standard,
  criterion: Criterion,
  uploadedFiles: UploadedFile[],
  demoFileContents: string[]
): Promise<AnalysisResult> {
  const prompt = buildBACScoringPrompt(
    standard,
    criterion,
    uploadedFiles,
    demoFileContents
  );
  console.log(prompt);
  const response = await fetch(`${AI_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen2.5:7b",
      messages: [
        {
          role: "system",
          content:
            "You are a BAC accreditation expert evaluator. Always respond with valid JSON only, no markdown formatting, no code blocks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `AI server error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const aiText =
    data?.message?.content || data?.choices?.[0]?.message?.content || "";

  // Clean the response - remove markdown code blocks if present
  const cleanedText = aiText
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedText);

    // Validate and sanitize the response
    const result: AnalysisResult = {
      overallScore: Math.min(
        100,
        Math.max(1, Number(parsed.overallScore) || 50)
      ),
      overallFeedback:
        parsed.overallFeedback ||
        "Analysis complete. Please review individual file scores.",
      missingFiles: Array.isArray(parsed.missingFiles)
        ? parsed.missingFiles
        : [],
      fileResults: Array.isArray(parsed.fileResults)
        ? parsed.fileResults.map((f: FileResult) => ({
            fileName: f.fileName || "Unknown File",
            score: Math.min(100, Math.max(1, Number(f.score) || 50)),
            feedback: f.feedback || "No specific feedback available.",
            strengths: Array.isArray(f.strengths) ? f.strengths : [],
            improvements: Array.isArray(f.improvements) ? f.improvements : [],
          }))
        : [],
      standardTitle: standard.title,
      criterionTitle: criterion.title,
      criterionCode: criterion.code,
    };

    return result;
  } catch {
    // If parsing fails, return a structured error response
    throw new Error(
      `Failed to parse AI response. Raw response: ${cleanedText}`
    );
  }
}
