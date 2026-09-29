import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Can query by ID or QR code ID
    const equipment = await prisma.equipment.findFirst({
      where: {
        OR: [{ id: id }, { qrCodeId: id }],
      },
      include: {
        facility: true,
        tickets: {
          include: {
            reportedBy: true,
            technician: true,
            logs: {
              include: {
                technician: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        pmSchedules: {
          include: {
            executions: {
              include: { technician: true },
              orderBy: { completedAt: "desc" },
            },
          },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error fetching single equipment:", error);
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.equipment.update({
      where: { id },
      data: {
        ...body,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating equipment:", error);
    return NextResponse.json({ error: "Failed to update equipment" }, { status: 500 });
  }
}
