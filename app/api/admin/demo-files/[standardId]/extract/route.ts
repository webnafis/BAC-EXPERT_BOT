import { NextResponse } from "next/server";
import { getStandardById } from "@/data/bac-data";
import { extractTextFromFile } from "@/lib/file-extractor";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ standardId: string }> }
) {
  const { standardId } = await params;

  const standard = getStandardById(standardId);
  if (!standard) {
    return NextResponse.json({ error: "Standard not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const { text, fileName, error } = await extractTextFromFile(file);

  if (error) {
    return NextResponse.json(
      { error, fileName, text: text || undefined },
      { status: 400 }
    );
  }

  if (!text?.trim()) {
    return NextResponse.json(
      { error: "No text could be extracted from the file", fileName },
      { status: 400 }
    );
  }

  return NextResponse.json({ text, fileName });
}
