export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export type TicketStatus = 
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'WAITING FOR USER'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  studentId?: string;
  facultyId?: string;
  designation?: string;
  course?: string;
  yearSemester?: string;
  phoneNumber?: string;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
}

export interface TicketHistoryItem {
  action: string;
  timestamp: string;
  performedBy: string;
  details: string;
}

export interface Ticket {
  ticketId: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdByUserId: string;
  creatorName: string;
  creatorRole: string;
  department: string;
  assignedFacultyId: string;
  assignedFacultyName: string;
  createdAt: string;
  updatedAt: string;
  isWelcomeTicket?: boolean;
  slaHours: number;
  slaDeadline: string;
  location?: string;
  assetTag?: string;
  resolutionDetails?: string;
  resolvedAt?: string;
  history: TicketHistoryItem[];
  messages: TicketMessage[];
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  supportStaffCount: number;
  activeTicketsCount: number;
}

export interface ITAsset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  department: string;
  location: string;
  status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'DEFECTIVE' | 'DECOMMISSIONED';
  lastMaintenance: string;
}

export interface Laboratory {
  id: string;
  labCode: string;
  name: string;
  department: string;
  workstationCount: number;
  operationalStations: number;
  inChargeFaculty: string;
  status: 'ACTIVE' | 'MAINTENANCE_REQUIRED' | 'OFFLINE';
}

export interface SmartClassroom {
  id: string;
  roomNumber: string;
  building: string;
  projectorModel: string;
  smartBoardStatus: 'OPERATIONAL' | 'CALIBRATION_NEEDED' | 'OFFLINE';
  audioSystemStatus: 'OPERATIONAL' | 'DEFECTIVE';
  lastInspected: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'MAINTENANCE' | 'NETWORK' | 'ACADEMIC' | 'URGENT';
  targetAudience: 'ALL' | 'STUDENTS' | 'FACULTY';
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  details: string;
  timestamp: string;
}

export interface ToastNotification {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'TICKET_UPDATE';
  title: string;
  message: string;
  timestamp: string;
}
