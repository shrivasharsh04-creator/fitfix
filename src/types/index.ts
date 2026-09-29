export type Role = "ADMIN" | "TECHNICIAN" | "STAFF" | "MEMBER";

export type EquipmentStatus =
  | "OPERATIONAL"
  | "DEGRADED"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_ORDER"
  | "DECOMMISSIONED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TicketStatus =
  | "REPORTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_PARTS"
  | "COMPLETED"
  | "VERIFIED";

export type PMFrequency =
  | "DAILY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "BIANNUAL"
  | "ANNUAL";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  facilityId?: string | null;
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  timezone: string;
}

export interface Equipment {
  id: string;
  qrCodeId: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  facilityId: string;
  facility?: Facility;
  zone: string;
  purchaseDate?: string | Date | null;
  warrantyExpiry?: string | Date | null;
  purchaseCost?: number | null;
  status: EquipmentStatus;
  healthScore: number;
  manualUrl?: string | null;
  imageUrl?: string | null;
  createdAt?: string | Date;
  tickets?: MaintenanceTicket[];
  pmSchedules?: PMSchedule[];
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  equipmentId: string;
  equipment?: Equipment;
  reportedById?: string | null;
  reportedBy?: User | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  technicianId?: string | null;
  technician?: User | null;
  priority: Priority;
  status: TicketStatus;
  faultCategory: string;
  title: string;
  description: string;
  photoUrls: string; // JSON array
  costEstimate?: number | null;
  actualCost?: number | null;
  slaDueDate?: string | Date | null;
  resolvedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  logs?: WorkOrderLog[];
}

export interface WorkOrderLog {
  id: string;
  ticketId: string;
  technicianId: string;
  technician?: User;
  actionTaken: string;
  laborMinutes: number;
  partsUsed?: string | null; // JSON string
  totalPartCost: number;
  notes?: string | null;
  beforePhoto?: string | null;
  afterPhoto?: string | null;
  loggedAt: string | Date;
}

export interface PMSchedule {
  id: string;
  equipmentId: string;
  equipment?: Equipment;
  title: string;
  frequency: PMFrequency;
  checklistSchema: string; // JSON array
  lastCompletedAt?: string | Date | null;
  nextDueDate: string | Date;
  isActive: boolean;
  executions?: PMExecution[];
}

export interface PMExecution {
  id: string;
  scheduleId: string;
  schedule?: PMSchedule;
  technicianId: string;
  technician?: User;
  resultsJson: string; // JSON array
  passedAll: boolean;
  notes?: string | null;
  completedAt: string | Date;
}

export interface SparePart {
  id: string;
  facilityId: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unitCost: number;
  supplier?: string | null;
  locationRack?: string | null;
  updatedAt: string | Date;
}
