"""
Pydantic Schemas for Smart Technical Support University
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    FACULTY = "FACULTY"
    STUDENT = "STUDENT"

class TicketStatus(str, Enum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN PROGRESS"
    WAITING_FOR_USER = "WAITING FOR USER"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class TicketPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class StudentRegistrationRequest(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100)
    universityEmail: EmailStr
    studentId: str = Field(..., min_length=3, max_length=30)
    department: str
    course: str
    yearSemester: str
    phoneNumber: str = Field(..., min_length=7, max_length=20)
    password: str = Field(..., min_length=8)
    confirmPassword: str

class FacultyRegistrationRequest(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100)
    officialUniversityEmail: EmailStr
    facultyId: str = Field(..., min_length=3, max_length=30)
    department: str
    designation: str
    phoneNumber: str = Field(..., min_length=7, max_length=20)
    password: str = Field(..., min_length=8)
    confirmPassword: str

class OTPVerificationRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class OTPResendRequest(BaseModel):
    email: EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    rememberMe: Optional[bool] = False

class TicketCreateRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=3000)
    category: str
    priority: TicketPriority = TicketPriority.MEDIUM
    attachments: Optional[List[str]] = []
    location: Optional[str] = None
    assetTag: Optional[str] = None

class TicketUpdateRequest(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assignedFacultyId: Optional[str] = None
    internalNote: Optional[str] = None
    resolutionDetails: Optional[str] = None

class TicketMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    attachments: Optional[List[str]] = []

class FeedbackRequest(BaseModel):
    ticketId: str
    rating: int = Field(..., ge=1, le=5)
    comment: str
    suggestions: Optional[str] = None

class AIAssistantQueryRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[Dict[str, str]]] = []
    currentTicketDraft: Optional[Dict[str, Any]] = None
