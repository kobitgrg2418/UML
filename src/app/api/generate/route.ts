import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateDiagrams, generateSingleDiagram, DiagramType } from "@/lib/generate";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { prompt, type } = body;

  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  if (type) {
    const code = generateSingleDiagram(prompt, type as DiagramType);
    return NextResponse.json({ type, code });
  }

  const diagrams = generateDiagrams(prompt);
  return NextResponse.json({ diagrams });
}
