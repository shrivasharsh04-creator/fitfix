import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const parts = await prisma.sparePart.findMany({
      include: { facility: true },
      orderBy: { quantity: "asc" },
    });

    return NextResponse.json(parts);
  } catch (error) {
    console.error("Error fetching spare parts:", error);
    return NextResponse.json({ error: "Failed to fetch spare parts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const facility = await prisma.facility.findFirst();

    if (!facility) {
      return NextResponse.json({ error: "No facility found" }, { status: 400 });
    }

    const newPart = await prisma.sparePart.create({
      data: {
        facilityId: facility.id,
        name: body.name,
        sku: body.sku || `SKU-${Date.now()}`,
        category: body.category || "General",
        quantity: parseInt(body.quantity || "0", 10),
        minThreshold: parseInt(body.minThreshold || "2", 10),
        unitCost: parseFloat(body.unitCost || "0"),
        supplier: body.supplier || null,
        locationRack: body.locationRack || null,
      },
    });

    return NextResponse.json(newPart, { status: 201 });
  } catch (error: any) {
    console.error("Error creating spare part:", error);
    return NextResponse.json({ error: error.message || "Failed to create spare part" }, { status: 500 });
  }
}
