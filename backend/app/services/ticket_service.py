"""
Ticket Business Logic & Sequence Service for Smart Technical Support University
"""

import datetime
from typing import Dict, Any, List

class TicketSequenceManager:
    _current_sequence = 1000

    @classmethod
    def generate_ticket_id(cls, year: int = 2026) -> str:
        cls._current_sequence += 1
        return f"STSU-{year}-{cls._current_sequence:06d}"

    @classmethod
    def create_onboarding_ticket(cls, user_data: Dict[str, Any]) -> Dict[str, Any]:
        ticket_id = cls.generate_ticket_id()
        now = datetime.datetime.utcnow().isoformat() + "Z"
        
        role = user_data.get("role", "STUDENT")
        name = user_data.get("fullName", "University Member")
        email = user_data.get("email", "")
        dept = user_data.get("department", "General Academic")
        
        return {
            "ticketId": ticket_id,
            "title": f"Initial IT Onboarding & Access Verification for {name}",
            "description": (
                f"Automated system onboarding ticket created upon successful registration and OTP verification. "
                f"Role: {role}. Department: {dept}. University Email: {email}. "
                f"Please verify default access to campus Wi-Fi (STSU-Secure), Academic LMS, and IT laboratory stations."
            ),
            "category": "Account Access",
            "priority": "MEDIUM",
            "status": "OPEN",
            "createdByUserId": email,
            "creatorName": name,
            "creatorRole": role,
            "department": dept,
            "assignedFacultyId": "unassigned",
            "assignedFacultyName": "Unassigned (Central IT Pool)",
            "createdAt": now,
            "updatedAt": now,
            "isWelcomeTicket": True,
            "history": [
                {
                    "action": "TICKET_AUTO_GENERATED",
                    "timestamp": now,
                    "performedBy": "STSU Automated Registration Engine",
                    "details": f"Welcome ticket automatically generated for {name} ({role})"
                }
            ],
            "messages": [
                {
                    "senderName": "STSU Central IT Bot",
                    "senderRole": "SYSTEM",
                    "message": "Welcome to Smart Technical Support University! Our engineering team will review your account settings. You can reply here or create additional technical tickets at any time.",
                    "timestamp": now
                }
            ]
        }
