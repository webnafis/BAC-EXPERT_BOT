import type { Standard, Criterion } from "@/data/bac-data";

export interface UploadedFile {
  fileName: string;
  text: string;
  matchedRequirement?: string;
}

export interface AnalysisResult {
  criterionCode: string;              // ← NEW
  criterionTitle: string;
  standardTitle: string;
  maxPossibleScore: number;           // ← NEW
  evaluationSummary: any; // ← NEW
  overallScore: number;
  overallFeedback: string;
  missingFiles: string[];
  fileResults: FileResult[];
  recommendedAction: "PASS" | "MINOR_REVISION" | "MAJOR_REVISION" | "FAIL"; // ← NEW
}
export interface FileResult {
  fileName: string;
  coveredFiles: string[];       // ← NEW
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  checklistResults: Record<string, boolean>; // ← NEW
}

const AI_BASE_URL = "https://frightful-negate-bony.ngrok-free.dev";

// ai-analyzer.ts

export function buildBACScoringPrompt(
  standard: Standard,
  criterion: Criterion,
  uploadedFiles: UploadedFile[],
  demoFileContents: string[]
): string {
  const maxScore = criterion.weight;
  const totalRequired = criterion.requiredFiles.length;

  const requiredFilesList = criterion.requiredFiles
    .map((f, i) => `  ${i + 1}. ${f}`)
    .join("\n");

  const uploadedFilesList =
    uploadedFiles.length > 0
      ? uploadedFiles
          .map(
            (f, i) => `
┌─────────────────────────────────────────────────┐
  UPLOADED FILE ${i + 1} of ${uploadedFiles.length}
  Name: "${f.fileName}"
  ${f.matchedRequirement
    ? `Declared as: "${f.matchedRequirement}"`
    : `Declared as: (not specified — auto-detect from content)`
  }
└─────────────────────────────────────────────────┘
${f.text.trim()}
══════════════════ END OF FILE ${i + 1} ══════════════════`
          )
          .join("\n\n")
      : "  ⚠ NO FILES UPLOADED BY USER.";

  const benchmarkSection =
    demoFileContents.length > 0
      ? `
╔══════════════════════════════════════════════════════════╗
║         BAC BENCHMARK DOCUMENTS (Quality Reference)      ║
╚══════════════════════════════════════════════════════════╝

IMPORTANT INSTRUCTIONS FOR USING BENCHMARKS:
- These documents represent what a well-prepared submission looks like
- Use them to calibrate your quality expectations ONLY
- Do NOT reward a user's document for looking similar to the benchmark
- Do NOT penalize a user's document for coming from a different institution
- The benchmark description tells you its known gaps — factor those in
- Evaluate user documents on content quality and BAC compliance, not style

${demoFileContents
  .map(
    (d, i) => `
── BENCHMARK ${i + 1} ──────────────────────────────────────
${d}
── END BENCHMARK ${i + 1} ──────────────────────────────────`
  )
  .join("\n")}`
      : `
╔══════════════════════════════════════════════════════════╗
║                  BAC BENCHMARK DOCUMENTS                  ║
╚══════════════════════════════════════════════════════════╝
  ⚠ No benchmark documents available for this criterion.
  Evaluate strictly based on BAC guidelines and expert knowledge.`;

  const s = {
    full: maxScore,
    good: Math.ceil(maxScore * 0.80),
    adequate: Math.ceil(maxScore * 0.65),
    weak: Math.ceil(maxScore * 0.50),
    poor: Math.ceil(maxScore * 0.35),
  };

  const weightTier = `CRITICAL : Non-negotiable for BAC accreditation. Any major gap MUST severely reduce the score.`;
      // : criterion.weight >= 7
      // ? `HIGH IMPORTANCE (weight ${criterion.weight}/10): Strong evidence required. Gaps should meaningfully reduce the score.`
      // : `MODERATE (weight ${criterion.weight}/10): Partial fulfillment is noted but all gaps must still be documented.`;

  // Checklist from admin-managed data
  const checklistItems = criterion.checklistItems && criterion.checklistItems.length > 0
    ? criterion.checklistItems
        .map((item, i) => `  ${i + 1}. [ ] ${item}`)
        .join("\n")
    : criterion.requiredFiles
        .map((f, i) => `  ${i + 1}. [ ] Content covering "${f}" is present and substantive`)
        .join("\n");

  // Checklist short labels for JSON keys (first 5 words of each item)
  const checklistKeys = (criterion.checklistItems && criterion.checklistItems.length > 0
    ? criterion.checklistItems
    : criterion.requiredFiles
  ).map((item) => item.split(" ").join(" "));

  const checklistSchemaExample = checklistKeys
    .map((key) => `        "${key}...": <true if met, false if not>`)
    .join(",\n");

  return `You are a senior BAC (Bangladesh Accreditation Council) accreditation panel evaluator with 15+ years of hands-on experience reviewing university engineering and CSE program documentation. You have assessed 200+ institutional submissions and are an authority on BAC's 10 Standards and 63 Criteria framework.

Your task is to perform a rigorous, structured evaluation of the uploaded document(s) against the specified BAC criterion and return a precise JSON evaluation report. Be strict, objective, and specific — vague or generic feedback is unacceptable.

╔══════════════════════════════════════════════════════════╗
║                    EVALUATION CONTEXT                    ║
╚══════════════════════════════════════════════════════════╝

STANDARD     : ${standard.code} — ${standard.title}
DESCRIPTION  : ${standard.description}

CRITERION    : ${criterion.code} — ${criterion.title}
DESCRIPTION  : ${criterion.description}
GUIDELINES   : ${criterion.guidelines}

WEIGHT       : ${criterion.weight}
IMPORTANCE   : ${weightTier}
MAX SCORE    : ${maxScore} points (score ceiling = criterion weight, NOT 100)

╔══════════════════════════════════════════════════════════╗
║         REQUIRED EVIDENCE (${totalRequired} items expected)
╚══════════════════════════════════════════════════════════╝

${requiredFilesList}

⚠ CONSOLIDATED DOCUMENT RULE:
Departments commonly submit ALL required evidence inside a SINGLE document.
This is acceptable and must NOT be penalized.
Judge coverage by CONTENT PRESENCE, not by file count or file name matching.

╔══════════════════════════════════════════════════════════╗
║           UPLOADED DOCUMENTS (${uploadedFiles.length} file(s) provided)
╚══════════════════════════════════════════════════════════╝

${uploadedFilesList}
${benchmarkSection}

╔══════════════════════════════════════════════════════════╗
║               EVALUATION STEPS (follow in order)        ║
╚══════════════════════════════════════════════════════════╝

STEP 1 — EVIDENCE COVERAGE CHECK
For each of the ${totalRequired} required evidence items, determine:
  a) Is the CONTENT of this evidence present in the uploaded document?
     → Look for actual data/information — not just a matching heading or title
  b) If present, is it COMPLETE and SUBSTANTIVE, or only superficially mentioned?
  c) If absent or insufficient → add to "missingFiles" array

All ${totalRequired} evidence items must exist within a single uploaded file.
Read the full content before declaring anything missing.

STEP 2 — CONTENT QUALITY ANALYSIS (per uploaded file)
Evaluate each uploaded file across 5 dimensions:
  a) Completeness  — Does it address all expected elements for this criterion?
  b) Specificity   — Are claims backed by data, names, dates, measurable targets?
  c) BAC Alignment — Does it directly satisfy what the criterion requires?
  d) Formality     — Is it officially structured, approved, professionally written?
  e) Benchmark Gap — How does quality compare to the reference benchmark?

STEP 3 — CRITERION CHECKLIST
Verify each checkpoint below for criterion ${criterion.code}.
Each unmet checkpoint MUST reduce the score and appear in improvements:

${checklistItems}

For each checklist item, record true (met) or false (not met) in "checklistResults".
Use the first few words of each item as the key.

STEP 4 — SCORING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORE RANGE: 0 to ${maxScore} — NOT 1 to 100
Maximum possible score = ${maxScore} (criterion weight)
the score
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORE SCALE (max = ${maxScore}):
  ${s.full}           : Exemplary — all evidence present, exceeds BAC expectations
  ${s.good}–${s.full - 1}        : Good — meets most requirements, minor gaps only
  ${s.adequate}–${s.good - 1}        : Adequate — basic requirements met, improvements needed
  ${s.weak}–${s.adequate - 1}        : Weak — significant gaps, major revision required
  ${s.poor}–${s.weak - 1}        : Poor — fundamental requirements not met
  0–${s.poor - 1}         : Critical — submission is irrelevant or empty

SCORE CALCULATION:
  → Start at ${maxScore} (full marks)
  → Deduct per missing required evidence item: ${maxScore} / ${totalRequired} = ${(maxScore / totalRequired).toFixed(1)} pts each
  → Deduct additionally for vague claims, missing approval evidence, low quality
  → Bonus: add back if content is exceptionally detailed beyond BAC requirements
  → Floor: 0 
  → Ceiling: ${maxScore} 

FILE SCORE vs OVERALL SCORE:
  Always ONE document is submitted, file score = overall score.

STEP 5 — FEEDBACK RULES
  ✘ NEVER write generic praise like "good document" or "well structured"
  ✘ NEVER write vague improvements like "add more detail"
  ✓ ALWAYS cite specific content from the uploaded file by name or short quote
  ✓ Improvements must state EXACTLY what to add, fix, or restructure
  ✓ Strengths must reference ACTUAL content that correctly satisfies BAC
  ✓ overallFeedback = 3–4 sentence expert verdict:
      — Quality summary referencing actual content
      — Most critical gap named specifically  
      — Clear pass / revise / fail recommendation for this criterion

╔══════════════════════════════════════════════════════════╗
║                    RESPONSE FORMAT                       ║
╚══════════════════════════════════════════════════════════╝

Return ONLY valid JSON. No markdown, no code fences, no text outside JSON.

{
  "criterionCode": "${criterion.code}",
  "criterionTitle": "${criterion.title}",
  "maxPossibleScore": ${maxScore},
  "evaluationSummary": {
    "filesUploaded": <integer>,
    "requiredEvidenceCount": ${totalRequired},
    "evidenceCoveredCount": <integer — how many of the ${totalRequired} required items were found>,
    "consolidatedDocument": <true if all evidence is in one file, false otherwise>,
    "missingCriticalElements": ["<specific missing element>", ...]
  },
  "overallScore": <integer between 0 and ${maxScore}>,
  "overallFeedback": "<3–5 sentence expert verdict citing actual content, naming the critical gap, stating PASS/REVISE/FAIL>",
  "missingFiles": ["<required evidence item absent or insufficient in uploaded content>", ...],
  "fileResults": [
    {
      "fileName": "<exact uploaded file name>",
      "coveredFiles": ["<which of the ${totalRequired} required items were found/covered exect from the list of evidences >", ...],
      "score": <integer between 0 and ${maxScore} same as overall score>,
      "feedback": "<2–5 sentences citing specific content and BAC alignment>",
      "strengths": ["<specific strength referencing actual document content>", ...],
      "improvements": ["<actionable: exactly what to add/fix/restructure>", ...],
      "checklistResults": {
${checklistSchemaExample}
      }
    }
  ],
  "recommendedAction": "<one of: PASS | MINOR_REVISION | MAJOR_REVISION | FAIL>"
}`;
}

// Remove analyzeWithAI sanitizer — update to match new schema:
export async function analyzeWithAI(
  standard: Standard,
  criterion: Criterion,
  uploadedFiles: UploadedFile[],
  demoFileContents: string[]
): Promise<AnalysisResult> {
  const prompt = buildBACScoringPrompt(standard, criterion, uploadedFiles, demoFileContents);

  const response = await fetch(`${AI_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // model: "qwen2.5:7b",
      model: "qwen2.5:14b",
      messages: [
        {
          role: "system",
          content: "You are a BAC accreditation expert evaluator. Always respond with valid JSON only, no markdown formatting, no code blocks.",
        },
        { role: "user", content: prompt },
      ],
      stream: false,
      options: { temperature: 0, top_p: 1, top_k: 1, seed: 42, repeat_penalty: 1.0,},
    }),
  });

  if (!response.ok) throw new Error(`AI server error: ${response.status}`);

  const data = await response.json();
  const aiText = data?.message?.content || data?.choices?.[0]?.message?.content || "";
  const cleanedText = aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const parsed = JSON.parse(cleanedText);
    const maxScore = criterion.weight;

    const result: AnalysisResult = {
      criterionCode: parsed.criterionCode || criterion.code,
      criterionTitle: parsed.criterionTitle || criterion.title,
      standardTitle: standard.title,
      maxPossibleScore: maxScore,
      evaluationSummary: {
        filesUploaded: parsed.evaluationSummary?.filesUploaded ?? uploadedFiles.length,
        requiredEvidenceCount: criterion.requiredFiles.length,
        evidenceCoveredCount: parsed.evaluationSummary?.evidenceCoveredCount ?? 0,
        consolidatedDocument: parsed.evaluationSummary?.consolidatedDocument ?? false,
        missingCriticalElements: Array.isArray(parsed.evaluationSummary?.missingCriticalElements)
          ? parsed.evaluationSummary.missingCriticalElements
          : [],
      },
      overallScore: Math.min(maxScore, Math.max(0, Number(parsed.overallScore) ?? 0)),
      overallFeedback: parsed.overallFeedback || "Analysis complete.",
      missingFiles: Array.isArray(parsed.missingFiles) ? parsed.missingFiles : [],
      fileResults: Array.isArray(parsed.fileResults)
        ? parsed.fileResults.map((f: FileResult) => ({
            fileName: f.fileName || "Unknown File",
            coveredFiles: Array.isArray(f.coveredFiles) ? f.coveredFiles : [],
            score: Math.min(maxScore, Math.max(0, Number(f.score) || 0)),
            feedback: f.feedback || "",
            strengths: Array.isArray(f.strengths) ? f.strengths : [],
            improvements: Array.isArray(f.improvements) ? f.improvements : [],
            checklistResults: f.checklistResults && typeof f.checklistResults === "object"
              ? f.checklistResults
              : {},
          }))
        : [],
      recommendedAction: ["PASS", "MINOR_REVISION", "MAJOR_REVISION", "FAIL"].includes(parsed.recommendedAction)
        ? parsed.recommendedAction
        : "MAJOR_REVISION",
    };

    return result;
  } catch {
    throw new Error(`Failed to parse AI response: ${cleanedText}`);
  }
}
