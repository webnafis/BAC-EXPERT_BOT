import { NextResponse } from "next/server";
import { updateDemoFile, deleteDemoFile } from "@/data/bac-data";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ standardId: string; fileId: string }> }
) {
  const { standardId, fileId } = await params;
  const body = await req.json();
  const updated = updateDemoFile(standardId, fileId, body);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ demoFile: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ standardId: string; fileId: string }> }
) {
  const { standardId, fileId } = await params;
  const deleted = deleteDemoFile(standardId, fileId);
  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
