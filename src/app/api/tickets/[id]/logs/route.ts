import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const body = await req.json();

    const technician = await prisma.user.findFirst({
      where: {
        OR: [{ id: body.technicianId }, { role: "TECHNICIAN" }],
      },
    });

    if (!technician) {
      return NextResponse.json({ error: "Technician required to log work" }, { status: 400 });
    }

    let totalPartCost = 0;
    const partsUsed = body.partsUsed || []; // array of {partId, quantity, name, unitCost}

    // Deduct parts from inventory
    for (const part of partsUsed) {
      if (part.partId && part.quantity) {
        totalPartCost += (part.unitCost || 0) * part.quantity;
        await prisma.sparePart.update({
          where: { id: part.partId },
          data: {
            quantity: {
              decrement: part.quantity,
            },
          },
        });
      }
    }

    // Create log record
    const log = await prisma.workOrderLog.create({
      data: {
        ticketId,
        technicianId: technician.id,
        actionTaken: body.actionTaken || "Performed maintenance and diagnostic testing",
        laborMinutes: parseInt(body.laborMinutes || "0", 10),
        partsUsed: JSON.stringify(partsUsed),
        totalPartCost,
        notes: body.notes || null,
        beforePhoto: body.beforePhoto || null,
        afterPhoto: body.afterPhoto || null,
      },
      include: {
        technician: true,
      },
    });

    // Update ticket status to COMPLETED if marked
    if (body.markCompleted) {
      await prisma.maintenanceTicket.update({
        where: { id: ticketId },
        data: {
          status: "COMPLETED",
          resolvedAt: new Date(),
          actualCost: totalPartCost + (parseInt(body.laborMinutes || "0", 10) / 60) * 45, // $45/hr labor rate
        },
      });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    console.error("Error logging work order:", error);
    return NextResponse.json({ error: error.message || "Failed to log work" }, { status: 500 });
  }
}
