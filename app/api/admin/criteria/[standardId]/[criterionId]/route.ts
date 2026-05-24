import { NextResponse } from "next/server";
import { updateCriterion, deleteCriterion } from "@/data/bac-data";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ standardId: string; criterionId: string }> }
) {
  const { standardId, criterionId } = await params;
  const body = await req.json();
  const updated = updateCriterion(standardId, criterionId, body);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ criterion: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ standardId: string; criterionId: string }> }
) {
  const { standardId, criterionId } = await params;
  const deleted = deleteCriterion(standardId, criterionId);
  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
