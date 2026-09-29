import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.sparePart.update({
      where: { id },
      data: {
        ...body,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating spare part:", error);
    return NextResponse.json({ error: "Failed to update spare part" }, { status: 500 });
  }
}
