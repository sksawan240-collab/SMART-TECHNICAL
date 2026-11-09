/**
 * Pure ticket business rules and state machine logic
 * Decoupled from UI components for unit testing
 */

export type TicketStatus = 
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'WAITING FOR USER'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TicketTransitionContext {
  currentStatus: TicketStatus;
  targetStatus: TicketStatus;
  userRole: 'ADMIN' | 'FACULTY' | 'STUDENT';
  hasAssignedFaculty: boolean;
  hasResolutionDetails?: boolean;
}

/**
 * Validates if a ticket status transition is allowed based on role and rules.
 */
export function canTransitionTicketStatus(context: TicketTransitionContext): { allowed: boolean; reason?: string } {
  const { currentStatus, targetStatus, userRole, hasAssignedFaculty, hasResolutionDetails } = context;

  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  // Closed tickets cannot be changed except reopened by Admin or Student (if resolved)
  if (currentStatus === 'CLOSED') {
    if (targetStatus === 'OPEN' && (userRole === 'ADMIN' || userRole === 'STUDENT')) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Closed tickets must be reopened first.' };
  }

  // Student can only close their own resolved ticket or reopen it
  if (userRole === 'STUDENT') {
    if (currentStatus === 'RESOLVED' && targetStatus === 'CLOSED') {
      return { allowed: true };
    }
    if (currentStatus === 'RESOLVED' && targetStatus === 'OPEN') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Students can only close or reopen resolved tickets.' };
  }

  // Faculty can only progress tickets assigned to them
  if (userRole === 'FACULTY') {
    if (!hasAssignedFaculty) {
      return { allowed: false, reason: 'Ticket must be assigned to faculty first.' };
    }
    if (targetStatus === 'RESOLVED' && !hasResolutionDetails) {
      return { allowed: false, reason: 'Resolution details are required to resolve a ticket.' };
    }
    return { allowed: true };
  }

  // Admin has full authorized authority
  if (userRole === 'ADMIN') {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Unauthorized transition.' };
}

/**
 * Calculates SLA deadline in hours based on priority
 */
export function calculateSlaTargetHours(priority: TicketPriority): number {
  switch (priority) {
    case 'CRITICAL':
      return 4; // 4 hours
    case 'HIGH':
      return 12; // 12 hours
    case 'MEDIUM':
      return 24; // 24 hours
    case 'LOW':
      return 48; // 48 hours
    default:
      return 24;
  }
}

/**
 * Generates sequential ticket ID with zero-padded counter
 */
export function formatTicketId(sequence: number, year: number = 2026): string {
  const padded = String(sequence).padStart(6, '0');
  return `STSU-${year}-${padded}`;
}

/**
 * Recommends priority and category from symptom keywords
 */
export function recommendCategoryAndPriority(text: string): { category: string; priority: TicketPriority } {
  const lower = text.toLowerCase();
  
  if (lower.includes('firewall') || lower.includes('phishing') || lower.includes('hack') || lower.includes('breach')) {
    return { category: 'Cybersecurity', priority: 'CRITICAL' };
  }
  if (lower.includes('exam') || lower.includes('down') || lower.includes('crash') || lower.includes('blackout')) {
    return { category: 'Server Issues', priority: 'CRITICAL' };
  }
  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet') || lower.includes('network')) {
    return { category: 'Wi-Fi and Internet', priority: 'HIGH' };
  }
  if (lower.includes('projector') || lower.includes('screen') || lower.includes('audio') || lower.includes('mic')) {
    return { category: 'Projector Problems', priority: 'MEDIUM' };
  }
  if (lower.includes('printer') || lower.includes('paper') || lower.includes('toner')) {
    return { category: 'Printer Problems', priority: 'LOW' };
  }
  if (lower.includes('install') || lower.includes('matlab') || lower.includes('python') || lower.includes('autocad')) {
    return { category: 'Software Installation', priority: 'MEDIUM' };
  }
  if (lower.includes('password') || lower.includes('login') || lower.includes('portal') || lower.includes('access')) {
    return { category: 'Account Access', priority: 'HIGH' };
  }

  return { category: 'Other Technical Issues', priority: 'MEDIUM' };
}
