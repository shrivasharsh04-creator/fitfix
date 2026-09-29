import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const schedules = await prisma.pMSchedule.findMany({
      include: {
        equipment: {
          include: {
            facility: true,
          },
        },
        executions: {
          include: {
            technician: true,
          },
          orderBy: { completedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { nextDueDate: "asc" },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching PM schedules:", error);
    return NextResponse.json({ error: "Failed to fetch PM schedules" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newSchedule = await prisma.pMSchedule.create({
      data: {
        equipmentId: body.equipmentId,
        title: body.title,
        frequency: body.frequency || "MONTHLY",
        checklistSchema: JSON.stringify(body.checklist || []),
        nextDueDate: new Date(body.nextDueDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      include: {
        equipment: true,
      },
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error: any) {
    console.error("Error creating PM schedule:", error);
    return NextResponse.json({ error: error.message || "Failed to create schedule" }, { status: 500 });
  }
}
