import { NextResponse } from "next/server";
import { getStandardById } from "@/data/bac-data";
import { analyzeWithAI, type UploadedFile } from "@/lib/ai-analyzer";
import { extractTextFromFile } from "@/lib/file-extractor";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const standardId = formData.get("standardId") as string;
    const criterionId = formData.get("criterionId") as string;

    if (!standardId || !criterionId) {
      return NextResponse.json(
        { error: "Missing standardId or criterionId" },
        { status: 400 }
      );
    }

    const standard = getStandardById(standardId);
    if (!standard) {
      return NextResponse.json(
        { error: "Standard not found" },
        { status: 404 }
      );
    }

    const criterion = standard.criteria.find((c) => c.id === criterionId);
    if (!criterion) {
      return NextResponse.json(
        { error: "Criterion not found" },
        { status: 404 }
      );
    }

    // Extract uploaded files
    const uploadedFiles: UploadedFile[] = [];
    const files = formData.getAll("files") as File[];

    for (const file of files) {
      const { text, fileName } = await extractTextFromFile(file);
      // Try to match file to a required file
      const matchedReq = criterion.requiredFiles.find(
        (req) =>
          fileName.toLowerCase().includes(req.toLowerCase()) ||
          req
            .toLowerCase()
            .includes(fileName.toLowerCase().replace(/\.[^.]+$/, ""))
      );
      uploadedFiles.push({
        fileName,
        text,
        matchedRequirement: matchedReq,
      });
    }

    // Get demo file contents for this standard
    const demoFileContents = standard.demoFiles
      .filter(
        (df) =>
          df.relatedCriteria.includes(criterionId) ||
          df.relatedCriteria.length === 0
      )
      .map((df) => df.content);

    // Run AI analysis
    const result = await analyzeWithAI(
      standard,
      criterion,
      uploadedFiles,
      demoFileContents
    );

    return NextResponse.json({ result });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: `Analysis failed: ${String(err)}` },
      { status: 500 }
    );
  }
}
