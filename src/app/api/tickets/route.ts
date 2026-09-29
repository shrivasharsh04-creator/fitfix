import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const technicianId = searchParams.get("technicianId");
    const equipmentId = searchParams.get("equipmentId");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;
    if (technicianId && technicianId !== "ALL") where.technicianId = technicianId;
    if (equipmentId) where.equipmentId = equipmentId;

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      include: {
        equipment: true,
        reportedBy: true,
        technician: true,
        logs: {
          include: {
            technician: true,
          },
          orderBy: { loggedAt: "desc" },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify equipment exists
    const equipment = await prisma.equipment.findFirst({
      where: {
        OR: [{ id: body.equipmentId }, { qrCodeId: body.equipmentId }],
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: "Invalid equipment ID or QR code" }, { status: 404 });
    }

    const count = await prisma.maintenanceTicket.count();
    const ticketNumber = `WO-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    // Compute SLA due date based on priority
    let hoursToAdd = 72;
    if (body.priority === "CRITICAL") hoursToAdd = 12;
    else if (body.priority === "HIGH") hoursToAdd = 24;
    else if (body.priority === "MEDIUM") hoursToAdd = 48;
    const slaDueDate = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        ticketNumber,
        equipmentId: equipment.id,
        reportedById: body.reportedById || null,
        reporterName: body.reporterName || null,
        reporterEmail: body.reporterEmail || null,
        technicianId: body.technicianId || null,
        priority: body.priority || "MEDIUM",
        status: body.technicianId ? "ASSIGNED" : "REPORTED",
        faultCategory: body.faultCategory || "Other",
        title: body.title,
        description: body.description,
        photoUrls: body.photoUrls ? JSON.stringify(body.photoUrls) : "[]",
        costEstimate: body.costEstimate ? parseFloat(body.costEstimate) : null,
        slaDueDate,
      },
      include: {
        equipment: true,
        reportedBy: true,
        technician: true,
      },
    });

    // Update equipment status if high/critical
    if (body.priority === "CRITICAL") {
      await prisma.equipment.update({
        where: { id: equipment.id },
        data: {
          status: "OUT_OF_ORDER",
          healthScore: Math.min(equipment.healthScore, 40),
        },
      });
    } else if (body.priority === "HIGH") {
      await prisma.equipment.update({
        where: { id: equipment.id },
        data: {
          status: equipment.status === "OUT_OF_ORDER" ? "OUT_OF_ORDER" : "UNDER_MAINTENANCE",
          healthScore: Math.min(equipment.healthScore, 60),
        },
      });
    }

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    console.error("Error creating maintenance ticket:", error);
    return NextResponse.json({ error: error.message || "Failed to create ticket" }, { status: 500 });
  }
}
