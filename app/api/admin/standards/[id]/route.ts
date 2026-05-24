import { NextResponse } from "next/server";
import {
  getStandardById,
  updateStandard,
  deleteStandard,
  addCriterion,
  addDemoFile,
} from "@/data/bac-data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const standard = getStandardById(id);
  if (!standard)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ standard });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const updated = updateStandard(id, body);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ standard: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteStandard(id);
  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (body.type === "add_criterion") {
    const { code, title, description, requiredFiles, guidelines, weight } =
      body;
    const criterion = addCriterion(id, {
      code,
      title,
      description,
      requiredFiles: requiredFiles || [],
      guidelines: guidelines || "",
      weight: weight || 5,
    });
    if (!criterion)
      return NextResponse.json(
        { error: "Standard not found" },
        { status: 404 }
      );
    return NextResponse.json({ criterion });
  }

  if (body.type === "add_demo_file") {
    const { name, description, content, relatedCriteria } = body;
    const demoFile = addDemoFile(id, {
      name,
      description,
      content,
      relatedCriteria: relatedCriteria || [],
    });
    if (!demoFile)
      return NextResponse.json(
        { error: "Standard not found" },
        { status: 404 }
      );
    return NextResponse.json({ demoFile });
  }

  return NextResponse.json({ error: "Unknown patch type" }, { status: 400 });
}
