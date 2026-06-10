import { NextResponse } from "next/server";
import { getNgrokUrl, setNgrokUrl } from "@/data/bac-data";

export async function GET() {
  const ngrokUrl = getNgrokUrl();
  return NextResponse.json({ ngrokUrl });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { ngrokUrl } = body;
  
  if (typeof ngrokUrl === "string") {
    setNgrokUrl(ngrokUrl);
    return NextResponse.json({ success: true, ngrokUrl });
  }
  
  return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
}
