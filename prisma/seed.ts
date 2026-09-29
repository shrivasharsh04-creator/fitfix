import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Clearing existing data...");
  await prisma.workOrderLog.deleteMany();
  await prisma.pMExecution.deleteMany();
  await prisma.pMSchedule.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.user.deleteMany();
  await prisma.facility.deleteMany();

  console.log("🏢 Seeding Facility...");
  const facility = await prisma.facility.create({
    data: {
      id: "fac_metroflex_01",
      name: "MetroFlex Flagship Club - Downtown",
      address: "742 Evergreen Blvd, Metro Fitness District",
      timezone: "America/New_York",
    },
  });

  console.log("👥 Seeding Users & Roles...");
  const admin = await prisma.user.create({
    data: {
      id: "usr_admin_01",
      name: "Harsh Shrivas",
      email: "harsh.admin@metroflex.com",
      role: "ADMIN",
      phone: "+91 98765 43210",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      facilityId: facility.id,
    },
  });

  const tech1 = await prisma.user.create({
    data: {
      id: "usr_tech_01",
      name: "Alex Rivera",
      email: "alex.tech@metroflex.com",
      role: "TECHNICIAN",
      phone: "+1 (555) 014-9821",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      facilityId: facility.id,
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      id: "usr_tech_02",
      name: "Sam Chen",
      email: "sam.tech@metroflex.com",
      role: "TECHNICIAN",
      phone: "+1 (555) 018-7744",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      facilityId: facility.id,
    },
  });

  const staff = await prisma.user.create({
    data: {
      id: "usr_staff_01",
      name: "Jordan Taylor",
      email: "staff@metroflex.com",
      role: "STAFF",
      phone: "+1 (555) 012-3490",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      facilityId: facility.id,
    },
  });

  console.log("📦 Seeding Spare Parts Inventory...");
  const partBelt = await prisma.sparePart.create({
    data: {
      facilityId: facility.id,
      name: "Commercial Treadmill Drive Belt 3-Ply",
      sku: "BELT-LF-01",
      category: "Belts",
      quantity: 4,
      minThreshold: 2,
      unitCost: 85.0,
      supplier: "FitParts Direct OEM",
      locationRack: "Shelf A-02",
    },
  });

  const partCable = await prisma.sparePart.create({
    data: {
      facilityId: facility.id,
      name: "Heavy-Duty Aircraft Steel Cable 1/4\" (20ft)",
      sku: "CBL-HS-04",
      category: "Cables",
      quantity: 1, // Trigger low stock!
      minThreshold: 3,
      unitCost: 38.5,
      supplier: "ProCable Systems",
      locationRack: "Rack C-11",
    },
  });

  const partPulley = await prisma.sparePart.create({
    data: {
      facilityId: facility.id,
      name: "Sealed Bearing Deep-Groove Pulley 3.5\"",
      sku: "PUL-UNIV-35",
      category: "Pulleys",
      quantity: 12,
      minThreshold: 4,
      unitCost: 18.0,
      supplier: "ProCable Systems",
      locationRack: "Bin B-04",
    },
  });

  const partLube = await prisma.sparePart.create({
    data: {
      facilityId: facility.id,
      name: "100% Pure Silicone Deck Lubricant (500ml)",
      sku: "LUB-SIL-01",
      category: "Lubricants",
      quantity: 8,
      minThreshold: 3,
      unitCost: 24.0,
      supplier: "EcoLube Pro",
      locationRack: "Cabinet Chemical-01",
    },
  });

  const partPin = await prisma.sparePart.create({
    data: {
      facilityId: facility.id,
      name: "Magnetic Selector Weight Stack Pin (3/8\")",
      sku: "PIN-MAG-02",
      category: "Pins",
      quantity: 6,
      minThreshold: 2,
      unitCost: 14.5,
      supplier: "Hammer Strength OEM",
      locationRack: "Drawer D-01",
    },
  });

  const partBumper = await prisma.sparePart.create({
    data: {
      facilityId: facility.id,
      name: "Rubberized Weight Stack Cushion Bumper",
      sku: "BMP-RUB-01",
      category: "Upholstery",
      quantity: 0, // OUT OF STOCK
      minThreshold: 2,
      unitCost: 12.0,
      supplier: "GymCushion Corp",
      locationRack: "Bin B-09",
    },
  });

  console.log("🏋️ Seeding Gym Equipment...");
  const eq1 = await prisma.equipment.create({
    data: {
      qrCodeId: "FF-EQ-1001",
      name: "LifeFitness Discover SE3 HD Treadmill #1",
      category: "Cardio",
      brand: "LifeFitness",
      model: "Integrity Platinum SE3",
      serialNumber: "LF-TM-2024-9981",
      facilityId: facility.id,
      zone: "Cardio Deck North",
      purchaseDate: new Date("2024-03-15"),
      warrantyExpiry: new Date("2027-03-15"),
      purchaseCost: 8500.0,
      status: "OPERATIONAL",
      healthScore: 98,
      imageUrl: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&auto=format&fit=crop&q=80",
    },
  });

  const eq2 = await prisma.equipment.create({
    data: {
      qrCodeId: "FF-EQ-1002",
      name: "LifeFitness Discover SE3 HD Treadmill #2",
      category: "Cardio",
      brand: "LifeFitness",
      model: "Integrity Platinum SE3",
      serialNumber: "LF-TM-2024-9982",
      facilityId: facility.id,
      zone: "Cardio Deck North",
      purchaseDate: new Date("2024-03-15"),
      warrantyExpiry: new Date("2027-03-15"),
      purchaseCost: 8500.0,
      status: "OUT_OF_ORDER",
      healthScore: 42,
      imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80",
    },
  });

  const eq3 = await prisma.equipment.create({
    data: {
      qrCodeId: "FF-EQ-1003",
      name: "Hammer Strength Select Dual Cable Crossover",
      category: "Cables",
      brand: "Hammer Strength",
      model: "HS-DCC-PRO",
      serialNumber: "HS-CB-2023-4102",
      facilityId: facility.id,
      zone: "Functional Turf Area",
      purchaseDate: new Date("2023-08-20"),
      warrantyExpiry: new Date("2026-08-20"),
      purchaseCost: 6200.0,
      status: "UNDER_MAINTENANCE",
      healthScore: 58,
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
    },
  });

  const eq4 = await prisma.equipment.create({
    data: {
      qrCodeId: "FF-EQ-1004",
      name: "Precor Experience 885 Adaptive Motion Trainer",
      category: "Cardio",
      brand: "Precor",
      model: "AMT 885 Open Stride",
      serialNumber: "PR-AMT-2023-7721",
      facilityId: facility.id,
      zone: "Cardio Deck South",
      purchaseDate: new Date("2023-05-10"),
      warrantyExpiry: new Date("2026-05-10"),
      purchaseCost: 9200.0,
      status: "OPERATIONAL",
      healthScore: 91,
      imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
    },
  });

  const eq5 = await prisma.equipment.create({
    data: {
      qrCodeId: "FF-EQ-1005",
      name: "Rogue Monster RM-6 Olympic Power Rack #1",
      category: "Free Weights",
      brand: "Rogue Fitness",
      model: "RM-6 2.0 100\"",
      serialNumber: "RG-PR-2024-0014",
      facilityId: facility.id,
      zone: "Heavy Free Weights Zone",
      purchaseDate: new Date("2024-01-10"),
      warrantyExpiry: new Date("2034-01-10"),
      purchaseCost: 3100.0,
      status: "OPERATIONAL",
      healthScore: 100,
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    },
  });

  const eq6 = await prisma.equipment.create({
    data: {
      qrCodeId: "FF-EQ-1006",
      name: "Concept2 RowErg Model D PM5",
      category: "Cardio",
      brand: "Concept2",
      model: "RowErg Model D",
      serialNumber: "C2-ROW-2024-8841",
      facilityId: facility.id,
      zone: "HIIT & Rowing Bay",
      purchaseDate: new Date("2024-02-01"),
      warrantyExpiry: new Date("2029-02-01"),
      purchaseCost: 1150.0,
      status: "DEGRADED",
      healthScore: 74,
      imageUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&auto=format&fit=crop&q=80",
    },
  });

  const eq7 = await prisma.equipment.create({
    data: {
      qrCodeId: "FF-EQ-1007",
      name: "Cybex Plate Loaded 45° Linear Leg Press",
      category: "Strength",
      brand: "Cybex",
      model: "Plate Loaded 45LP",
      serialNumber: "CYB-LP-2022-1928",
      facilityId: facility.id,
      zone: "Heavy Free Weights Zone",
      purchaseDate: new Date("2022-11-15"),
      warrantyExpiry: new Date("2025-11-15"),
      purchaseCost: 4800.0,
      status: "OPERATIONAL",
      healthScore: 88,
      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
    },
  });

  const eq8 = await prisma.equipment.create({
    data: {
      qrCodeId: "FF-EQ-1008",
      name: "Matrix Climbmill C7xi Touchscreen Stepper",
      category: "Cardio",
      brand: "Matrix Fitness",
      model: "C7xi Touchscreen",
      serialNumber: "MX-CM-2023-3392",
      facilityId: facility.id,
      zone: "Cardio Deck South",
      purchaseDate: new Date("2023-09-01"),
      warrantyExpiry: new Date("2026-09-01"),
      purchaseCost: 10400.0,
      status: "OPERATIONAL",
      healthScore: 96,
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
    },
  });

  console.log("🎫 Seeding Maintenance Work Orders...");
  // Ticket 1: Treadmill #2 - Critical Motor Error
  const ticket1 = await prisma.maintenanceTicket.create({
    data: {
      ticketNumber: "WO-2026-0001",
      equipmentId: eq2.id,
      reportedById: staff.id,
      technicianId: tech1.id,
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      faultCategory: "Motor Failure",
      title: "Drive motor overheating & burning plastic odor under load",
      description: "Member reported sudden deceleration and odor at 8.5 mph. Motor controller board displays error code E-04 (Thermal Cutoff).",
      photoUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80"
      ]),
      costEstimate: 280.0,
      slaDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // In 24 hours
    },
  });

  await prisma.workOrderLog.create({
    data: {
      ticketId: ticket1.id,
      technicianId: tech1.id,
      actionTaken: "Opened motor housing hood, blew out dust accumulation, inspected drive motor brushes and heat sink.",
      laborMinutes: 35,
      partsUsed: JSON.stringify([]),
      totalPartCost: 0,
      notes: "Motor brushes worn down to 15%. Need replacement brush assembly or drive belt adjustment.",
    },
  });

  // Ticket 2: Cable Cross - Fraying cable
  const ticket2 = await prisma.maintenanceTicket.create({
    data: {
      ticketNumber: "WO-2026-0002",
      equipmentId: eq3.id,
      reportedById: staff.id,
      technicianId: tech2.id,
      priority: "HIGH",
      status: "PENDING_PARTS",
      faultCategory: "Snapped Cable",
      title: "Left upper pulley cable sheathing cracked & steel wire fraying",
      description: "Immediate safety hazard. Machine locked with OUT OF ORDER tag on left stack. Right stack is isolated.",
      photoUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80"
      ]),
      costEstimate: 75.0,
      slaDueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  // Ticket 3: Concept2 Rower - Chain friction
  const ticket3 = await prisma.maintenanceTicket.create({
    data: {
      ticketNumber: "WO-2026-0003",
      equipmentId: eq6.id,
      reporterName: "Gym Member (QR Scan)",
      reporterEmail: "david.member@gmail.com",
      technicianId: tech1.id,
      priority: "MEDIUM",
      status: "ASSIGNED",
      faultCategory: "Squeaking/Noise",
      title: "Rower chain stuttering and stiff return mechanism",
      description: "Chain feels dry and catches on the internal sprocket teeth on catch phase of stroke.",
      photoUrls: JSON.stringify([]),
      costEstimate: 30.0,
      slaDueDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
    },
  });

  // Ticket 4: Leg Press - Completed & Verified
  const ticket4 = await prisma.maintenanceTicket.create({
    data: {
      ticketNumber: "WO-2026-0004",
      equipmentId: eq7.id,
      reportedById: staff.id,
      technicianId: tech1.id,
      priority: "LOW",
      status: "VERIFIED",
      faultCategory: "Structural/Frame",
      title: "Secondary safety stop pin was sticking and needed lubrication",
      description: "Safety stop pin mechanism required excessive force to engage.",
      photoUrls: JSON.stringify([]),
      costEstimate: 20.0,
      actualCost: 24.0,
      resolvedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  });

  await prisma.workOrderLog.create({
    data: {
      ticketId: ticket4.id,
      technicianId: tech1.id,
      actionTaken: "Cleaned linear bearing track and lubricated spring loaded safety pins with Teflon spray.",
      laborMinutes: 25,
      partsUsed: JSON.stringify([
        { partId: partPin.id, name: partPin.name, quantity: 1, unitCost: 14.5 }
      ]),
      totalPartCost: 14.5,
      notes: "Smooth engagement verified under 500lb load test.",
    },
  });

  console.log("📅 Seeding Preventive Maintenance (PM) Schedules & Checklists...");
  const pm1 = await prisma.pMSchedule.create({
    data: {
      equipmentId: eq1.id,
      title: "Monthly Treadmill Belt Tensioning & Deck Lube",
      frequency: "MONTHLY",
      checklistSchema: JSON.stringify([
        { id: "c1", task: "Check walking belt tension and alignment center", required: true },
        { id: "c2", task: "Measure silicone lubrication under belt center line", required: true },
        { id: "c3", task: "Vacuum motor compartment and clean air filter vents", required: true },
        { id: "c4", task: "Test emergency lanyard safety cutoff switch", required: true },
        { id: "c5", task: "Calibrate incline elevation motor and speed sensor", required: false },
      ]),
      lastCompletedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      nextDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
      isActive: true,
    },
  });

  const pm2 = await prisma.pMSchedule.create({
    data: {
      equipmentId: eq3.id,
      title: "Bi-Weekly Cable & Weight Stack Safety Inspection",
      frequency: "BIWEEKLY",
      checklistSchema: JSON.stringify([
        { id: "c1", task: "Inspect full cable length for kinks, fraying, or coating peel", required: true },
        { id: "c2", task: "Inspect all swivel pulleys for bearing wobble or groove wear", required: true },
        { id: "c3", task: "Verify weight stack selector pin magnetism and lanyard cord", required: true },
        { id: "c4", task: "Wipe down chrome guide rods and apply silicone spray", required: true },
        { id: "c5", task: "Check frame anchor bolts for tightness", required: false },
      ]),
      lastCompletedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      nextDueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue by 2 days!
      isActive: true,
    },
  });

  const pm3 = await prisma.pMSchedule.create({
    data: {
      equipmentId: eq5.id,
      title: "Quarterly Olympic Power Rack & Barbell Safety Audit",
      frequency: "QUARTERLY",
      checklistSchema: JSON.stringify([
        { id: "c1", task: "Inspect J-cups UHMW plastic inserts for deep gouges", required: true },
        { id: "c2", task: "Verify safety spotter pin locks and upright bolts torque", required: true },
        { id: "c3", task: "Check pull-up bar welds and crossmember integrity", required: true },
      ]),
      lastCompletedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      nextDueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // PM Execution history
  await prisma.pMExecution.create({
    data: {
      scheduleId: pm1.id,
      technicianId: tech1.id,
      resultsJson: JSON.stringify([
        { id: "c1", task: "Check walking belt tension", passed: true, notes: "Tension within 5% tolerance" },
        { id: "c2", task: "Measure silicone lubrication", passed: true, notes: "Applied 30ml pure silicone" },
        { id: "c3", task: "Vacuum motor compartment", passed: true, notes: "Cleaned dust bunnies" },
        { id: "c4", task: "Test emergency lanyard safety cutoff switch", passed: true, notes: "Instant cutoff verified" },
      ]),
      passedAll: true,
      notes: "Machine in pristine condition. Deck smooth.",
      completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ FitFix Database Seeded Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
