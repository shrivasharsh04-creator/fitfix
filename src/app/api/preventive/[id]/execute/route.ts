import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleId } = await params;
    const body = await req.json();

    const schedule = await prisma.pMSchedule.findUnique({
      where: { id: scheduleId },
      include: { equipment: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const technician = await prisma.user.findFirst({
      where: {
        OR: [{ id: body.technicianId }, { role: "TECHNICIAN" }],
      },
    });

    if (!technician) {
      return NextResponse.json({ error: "Technician required to submit execution" }, { status: 400 });
    }

    const results = body.results || []; // array of {task, passed, notes}
    const passedAll = results.every((r: any) => r.passed !== false);

    // Create execution record
    const execution = await prisma.pMExecution.create({
      data: {
        scheduleId,
        technicianId: technician.id,
        resultsJson: JSON.stringify(results),
        passedAll,
        notes: body.notes || null,
        completedAt: new Date(),
      },
      include: {
        technician: true,
      },
    });

    // Compute next due date based on frequency
    let daysToAdd = 30;
    switch (schedule.frequency) {
      case "DAILY":
        daysToAdd = 1;
        break;
      case "WEEKLY":
        daysToAdd = 7;
        break;
      case "BIWEEKLY":
        daysToAdd = 14;
        break;
      case "MONTHLY":
        daysToAdd = 30;
        break;
      case "QUARTERLY":
        daysToAdd = 90;
        break;
      case "BIANNUAL":
        daysToAdd = 180;
        break;
      case "ANNUAL":
        daysToAdd = 365;
        break;
    }

    const nextDueDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    await prisma.pMSchedule.update({
      where: { id: scheduleId },
      data: {
        lastCompletedAt: new Date(),
        nextDueDate,
      },
    });

    // Boost equipment health score after successful PM
    if (passedAll && schedule.equipment) {
      await prisma.equipment.update({
        where: { id: schedule.equipmentId },
        data: {
          healthScore: Math.min(100, schedule.equipment.healthScore + 10),
        },
      });
    }

    return NextResponse.json(execution, { status: 201 });
  } catch (error: any) {
    console.error("Error executing PM checklist:", error);
    return NextResponse.json({ error: error.message || "Failed to execute PM" }, { status: 500 });
  }
}
