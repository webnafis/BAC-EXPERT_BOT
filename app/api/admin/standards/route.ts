import { NextResponse } from "next/server";
import { getStandards, addStandard } from "@/data/bac-data";

export async function GET() {
  const standards = getStandards();
  return NextResponse.json({ standards });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, code, description } = body;
  if (!title || !code || !description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  const newStandard = addStandard({
    code,
    title,
    description,
    criteria: [],
    demoFiles: [],
  });
  return NextResponse.json({ standard: newStandard });
}
