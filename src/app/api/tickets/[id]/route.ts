import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ticket = await prisma.maintenanceTicket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
      },
      include: {
        equipment: {
          include: {
            facility: true,
          },
        },
        reportedBy: true,
        technician: true,
        logs: {
          include: {
            technician: true,
          },
          orderBy: { loggedAt: "desc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching single ticket:", error);
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const currentTicket = await prisma.maintenanceTicket.findUnique({
      where: { id },
      include: { equipment: true },
    });

    if (!currentTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const updateData: any = { ...body };

    if (body.status === "COMPLETED" || body.status === "VERIFIED") {
      if (!currentTicket.resolvedAt) {
        updateData.resolvedAt = new Date();
      }

      // Check if there are other unresolved critical/high tickets on this machine
      const otherActiveTickets = await prisma.maintenanceTicket.count({
        where: {
          equipmentId: currentTicket.equipmentId,
          id: { not: id },
          status: { in: ["REPORTED", "ASSIGNED", "IN_PROGRESS", "PENDING_PARTS"] },
        },
      });

      if (otherActiveTickets === 0) {
        // Restore machine to operational status and high health
        await prisma.equipment.update({
          where: { id: currentTicket.equipmentId },
          data: {
            status: "OPERATIONAL",
            healthScore: 95,
          },
        });
      }
    }

    const updated = await prisma.maintenanceTicket.update({
      where: { id },
      data: updateData,
      include: {
        equipment: true,
        reportedBy: true,
        technician: true,
        logs: {
          include: { technician: true },
          orderBy: { loggedAt: "desc" },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ error: error.message || "Failed to update ticket" }, { status: 500 });
  }
}
