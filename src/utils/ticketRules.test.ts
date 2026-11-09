import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionTicketStatus,
  calculateSlaTargetHours,
  formatTicketId,
  recommendCategoryAndPriority
} from './ticketRules';

test('formatTicketId formats correctly with 6-digit zero padding', () => {
  assert.equal(formatTicketId(1), 'STSU-2026-000001');
  assert.equal(formatTicketId(42), 'STSU-2026-000042');
  assert.equal(formatTicketId(1048), 'STSU-2026-001048');
});

test('calculateSlaTargetHours returns correct SLA target hours by priority', () => {
  assert.equal(calculateSlaTargetHours('CRITICAL'), 4);
  assert.equal(calculateSlaTargetHours('HIGH'), 12);
  assert.equal(calculateSlaTargetHours('MEDIUM'), 24);
  assert.equal(calculateSlaTargetHours('LOW'), 48);
});

test('recommendCategoryAndPriority maps network and security keywords', () => {
  const security = recommendCategoryAndPriority('Suspected phishing email or security breach on portal');
  assert.equal(security.category, 'Cybersecurity');
  assert.equal(security.priority, 'CRITICAL');

  const wifi = recommendCategoryAndPriority('Cannot connect to campus Wi-Fi in building B');
  assert.equal(wifi.category, 'Wi-Fi and Internet');
  assert.equal(wifi.priority, 'HIGH');

  const printer = recommendCategoryAndPriority('Paper jam in library printer');
  assert.equal(printer.category, 'Printer Problems');
  assert.equal(printer.priority, 'LOW');
});

test('canTransitionTicketStatus enforces faculty and student rules', () => {
  // Student cannot escalate directly
  const studentEscalate = canTransitionTicketStatus({
    currentStatus: 'OPEN',
    targetStatus: 'ESCALATED',
    userRole: 'STUDENT',
    hasAssignedFaculty: false
  });
  assert.equal(studentEscalate.allowed, false);

  // Student can close resolved ticket
  const studentClose = canTransitionTicketStatus({
    currentStatus: 'RESOLVED',
    targetStatus: 'CLOSED',
    userRole: 'STUDENT',
    hasAssignedFaculty: true
  });
  assert.equal(studentClose.allowed, true);

  // Faculty cannot resolve without resolution details
  const facultyResolveWithoutDetails = canTransitionTicketStatus({
    currentStatus: 'IN PROGRESS',
    targetStatus: 'RESOLVED',
    userRole: 'FACULTY',
    hasAssignedFaculty: true,
    hasResolutionDetails: false
  });
  assert.equal(facultyResolveWithoutDetails.allowed, false);

  // Faculty can resolve with resolution details
  const facultyResolveWithDetails = canTransitionTicketStatus({
    currentStatus: 'IN PROGRESS',
    targetStatus: 'RESOLVED',
    userRole: 'FACULTY',
    hasAssignedFaculty: true,
    hasResolutionDetails: true
  });
  assert.equal(facultyResolveWithDetails.allowed, true);

  // Admin has full authorization
  const adminEscalate = canTransitionTicketStatus({
    currentStatus: 'OPEN',
    targetStatus: 'ESCALATED',
    userRole: 'ADMIN',
    hasAssignedFaculty: false
  });
  assert.equal(adminEscalate.allowed, true);
});
