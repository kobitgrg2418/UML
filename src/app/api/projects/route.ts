import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as Record<string, string>).id;
  const projects = await prisma.project.findMany({
    where: { userId },
    include: { diagrams: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as Record<string, string>).id;
  const body = await req.json();

  const project = await prisma.project.create({
    data: {
      name: body.name || "Untitled Project",
      description: body.description || "",
      prompt: body.prompt || "",
      userId,
      diagrams: body.diagrams
        ? {
            create: body.diagrams.map((d: { type: string; code: string; label?: string }) => ({
              type: d.type,
              code: d.code,
              label: d.label || d.type,
            })),
          }
        : undefined,
    },
    include: { diagrams: true },
  });
  return NextResponse.json(project, { status: 201 });
}
