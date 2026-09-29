import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const zone = searchParams.get("zone");
    const search = searchParams.get("search");

    const where: any = {};
    if (category && category !== "ALL") where.category = category;
    if (status && status !== "ALL") where.status = status;
    if (zone && zone !== "ALL") where.zone = zone;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { qrCodeId: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { serialNumber: { contains: search } },
      ];
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        facility: true,
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        pmSchedules: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const facility = await prisma.facility.findFirst();

    if (!facility) {
      return NextResponse.json({ error: "No facility found" }, { status: 400 });
    }

    const newEquipment = await prisma.equipment.create({
      data: {
        qrCodeId: body.qrCodeId || `FF-EQ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: body.name,
        category: body.category || "Cardio",
        brand: body.brand,
        model: body.model,
        serialNumber: body.serialNumber || `SN-${Date.now()}`,
        facilityId: facility.id,
        zone: body.zone || "Main Floor",
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
        purchaseCost: body.purchaseCost ? parseFloat(body.purchaseCost) : null,
        status: body.status || "OPERATIONAL",
        healthScore: 100,
        imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80",
      },
    });

    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating equipment:", error);
    return NextResponse.json({ error: error.message || "Failed to create equipment" }, { status: 500 });
  }
}
