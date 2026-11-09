import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  canTransitionTicketStatus,
  calculateSlaTargetHours,
  formatTicketId,
  recommendCategoryAndPriority,
  TicketStatus,
  TicketPriority
} from './src/utils/ticketRules';
import {
  connectMongo,
  getMongoDbHealth,
  isMongoDbConnected,
  UserModel,
  TicketModel,
  AuditLogModel
} from './src/database/mongo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'university_db.json');

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const aiClient = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// Ensure database file exists with initial structure
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT';
    department: string;
    studentId?: string;
    course?: string;
    yearSemester?: string;
    facultyId?: string;
    designation?: string;
    phoneNumber?: string;
    passwordHash: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
    failedLoginAttempts: number;
    lockedUntil?: string | null;
  }>;
  otps: Array<{
    email: string;
    otp: string;
    expiresAt: number;
    attempts: number;
    payload: any;
  }>;
  tickets: Array<{
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
    history: Array<{
      action: string;
      timestamp: string;
      performedBy: string;
      details: string;
    }>;
    messages: Array<{
      id: string;
      senderId: string;
      senderName: string;
      senderRole: string;
      message: string;
      timestamp: string;
    }>;
    feedback?: {
      rating: number;
      comment: string;
      submittedAt: string;
    };
  }>;
  departments: Array<{
    id: string;
    name: string;
    code: string;
    headOfDepartment: string;
    supportStaffCount: number;
    activeTicketsCount: number;
  }>;
  assets: Array<{
    id: string;
    assetTag: string;
    name: string;
    category: string;
    department: string;
    location: string;
    status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'DEFECTIVE' | 'DECOMMISSIONED';
    assignedTo?: string;
    lastMaintenance: string;
  }>;
  laboratories: Array<{
    id: string;
    labCode: string;
    name: string;
    department: string;
    workstationCount: number;
    operationalStations: number;
    inChargeFaculty: string;
    status: 'ACTIVE' | 'MAINTENANCE_REQUIRED' | 'OFFLINE';
  }>;
  classrooms: Array<{
    id: string;
    roomNumber: string;
    building: string;
    projectorModel: string;
    smartBoardStatus: 'OPERATIONAL' | 'CALIBRATION_NEEDED' | 'OFFLINE';
    audioSystemStatus: 'OPERATIONAL' | 'DEFECTIVE';
    lastInspected: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    category: 'MAINTENANCE' | 'NETWORK' | 'ACADEMIC' | 'URGENT';
    targetAudience: 'ALL' | 'STUDENTS' | 'FACULTY';
    createdBy: string;
    createdAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    userId: string;
    userEmail: string;
    ipAddress?: string;
    details: string;
    timestamp: string;
  }>;
  systemSettings: {
    universityName: string;
    supportEmail: string;
    emergencyExtension: string;
    allowStudentTicketCreation: boolean;
    slaCriticalHours: number;
    slaHighHours: number;
    slaMediumHours: number;
    slaLowHours: number;
    smtpStatus: string;
  };
  ticketSequence: number;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_stsu_salt_2026').digest('hex');
}

function getInitialDb(): DatabaseSchema {
  const now = new Date().toISOString();
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@stsu.edu').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';

  return {
    users: [
      {
        id: 'usr_admin_master',
        email: adminEmail,
        fullName: process.env.ADMIN_NAME || 'Chief Information Officer',
        role: 'ADMIN',
        department: 'Central IT Operations',
        designation: 'Director of Academic Technology',
        phoneNumber: '+1 (555) 019-4400',
        passwordHash: hashPassword(adminPassword),
        isVerified: true,
        isActive: true,
        createdAt: now,
        failedLoginAttempts: 0
      }
    ],
    otps: [],
    tickets: [],
    departments: [
      {
        id: 'dept_01',
        name: 'Computer Science & Engineering',
        code: 'CSE',
        headOfDepartment: 'Department Chair',
        supportStaffCount: 0,
        activeTicketsCount: 0
      },
      {
        id: 'dept_02',
        name: 'Information Technology',
        code: 'IT',
        headOfDepartment: 'Department Chair',
        supportStaffCount: 0,
        activeTicketsCount: 0
      },
      {
        id: 'dept_03',
        name: 'Central IT Infrastructure',
        code: 'CIT',
        headOfDepartment: 'Chief Information Officer',
        supportStaffCount: 0,
        activeTicketsCount: 0
      },
      {
        id: 'dept_04',
        name: 'Electronics & Communication',
        code: 'ECE',
        headOfDepartment: 'Department Chair',
        supportStaffCount: 0,
        activeTicketsCount: 0
      }
    ],
    assets: [],
    laboratories: [],
    classrooms: [],
    announcements: [],
    auditLogs: [],
    systemSettings: {
      universityName: 'Smart Technical Support University',
      supportEmail: 'support@stsu.edu',
      emergencyExtension: '4400',
      allowStudentTicketCreation: true,
      slaCriticalHours: 4,
      slaHighHours: 12,
      slaMediumHours: 24,
      slaLowHours: 48,
      smtpStatus: 'Ready for SMTP Relay'
    },
    ticketSequence: 0
  };
}

let cachedDb: DatabaseSchema | null = null;

function readDb(): DatabaseSchema {
  if (cachedDb) return cachedDb;
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(data);
      return cachedDb!;
    }
  } catch (err) {
    console.error('Error reading DB, using initial state:', err);
  }
  const init = getInitialDb();
  writeDb(init);
  return init;
}

function writeDb(data: DatabaseSchema): void {
  cachedDb = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to DB file:', err);
  }
}

// Global SSE clients
const sseClients: Array<{ id: string; res: Response }> = [];

function broadcastSSE(type: string, data: any) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

// Express setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Real-Time Notification Stream (SSE)
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = crypto.randomUUID();
  sseClients.push({ id: clientId, res });

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.findIndex(c => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// HTML Email preview endpoints
app.get('/api/email/preview-otp', (req: Request, res: Response) => {
  const { get_otp_email_html } = require('./backend/app/email/templates/html_templates.py'); // Or TS equivalent
  const name = (req.query.name as string) || 'Alex Chen';
  const otp = (req.query.otp as string) || '849201';
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <div style="background:#000; padding:20px; text-align:center; color:#fff;">
      <h3>Previewing STSU OTP Email Template</h3>
    </div>
    <div style="background:#0b0f19; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#111827; border:1px solid #1f2937; border-radius:16px; overflow:hidden;">
        <div style="background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%); padding:32px 30px; text-align:center;">
          <h1 style="margin:0; color:#fff; font-size:24px; font-weight:800;">SMART TECHNICAL SUPPORT UNIVERSITY</h1>
          <p style="margin:8px 0 0 0; color:#e0f2fe; font-size:13px; text-transform:uppercase;">Secure Account Authentication</p>
        </div>
        <div style="padding:36px 32px; color:#f1f5f9;">
          <h2 style="margin:0 0 16px 0; color:#fff;">Hello ${name},</h2>
          <p style="color:#94a3b8; font-size:15px; line-height:1.6;">Thank you for registering. Use this verification code:</p>
          <div style="text-align:center; margin:28px 0;">
            <div style="background:#1e293b; border:2px dashed #3b82f6; border-radius:12px; padding:20px 32px; display:inline-block;">
              <span style="font-family:monospace; font-size:38px; font-weight:800; color:#38bdf8; letter-spacing:10px;">${otp}</span>
            </div>
          </div>
          <p style="color:#cbd5e1; font-size:14px;">⏰ Code expires in 5 minutes.</p>
        </div>
      </div>
    </div>
  `);
});

app.get('/api/email/preview-welcome', (req: Request, res: Response) => {
  const name = (req.query.name as string) || 'Alex Chen';
  const ticketId = (req.query.ticketId as string) || 'STSU-2026-000001';
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <div style="background:#000; padding:20px; text-align:center; color:#fff;">
      <h3>Previewing STSU Welcome Onboarding Email Template</h3>
    </div>
    <div style="background:#0b0f19; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#111827; border:1px solid #1f2937; border-radius:16px; overflow:hidden;">
        <div style="background:linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%); padding:36px 32px; text-align:center;">
          <span style="background:rgba(255, 255, 255, 0.2); color:#fff; padding:4px 12px; border-radius:9999px; font-size:11px; font-weight:700;">ACCOUNT ACTIVATED</span>
          <h1 style="margin:12px 0 0 0; color:#fff; font-size:26px; font-weight:800;">Welcome to STSU Technical Platform</h1>
        </div>
        <div style="padding:36px 32px; color:#f1f5f9;">
          <h2 style="margin:0 0 14px 0; color:#fff;">Welcome aboard, ${name}!</h2>
          <p style="color:#94a3b8; font-size:15px;">Your account is active. Your first support ticket has been created:</p>
          <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:24px; margin:20px 0;">
            <div style="color:#10b981; font-weight:700; font-size:12px;">🎫 AUTOMATED ONBOARDING TICKET</div>
            <div style="color:#60a5fa; font-family:monospace; font-weight:700; font-size:18px; margin:8px 0;">${ticketId}</div>
            <div style="color:#cbd5e1; font-size:14px;">Category: Account Access & Onboarding</div>
            <div style="color:#cbd5e1; font-size:14px;">Status: OPEN</div>
          </div>
        </div>
      </div>
    </div>
  `);
});

// Real Database-driven Landing Page Statistics
app.get('/api/stats/landing', (req: Request, res: Response) => {
  const db = readDb();
  const totalUsers = db.users.filter(u => u.role === 'STUDENT' && u.isVerified).length;
  const totalFaculty = db.users.filter(u => u.role === 'FACULTY' && u.isVerified).length;
  const totalTickets = db.tickets.length;
  const resolvedTickets = db.tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const openTickets = db.tickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN PROGRESS').length;
  const activeLabs = db.laboratories.filter(l => l.status === 'ACTIVE').length;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;

  res.json({
    totalUsers,
    totalFaculty,
    totalTickets,
    resolvedTickets,
    openTickets,
    activeLabs,
    resolutionRate,
    departmentsCount: db.departments.length,
    departments: db.departments,
    laboratories: db.laboratories,
    classrooms: db.classrooms,
    systemSettings: db.systemSettings,
    activeAnnouncements: db.announcements.slice(0, 3),
    database: {
      provider: isMongoDbConnected() ? 'MongoDB Atlas' : 'Local Fallback',
      isConnected: isMongoDbConnected()
    }
  });
});

// Student Registration (Direct Password-Based Registration)
app.post('/api/auth/register-student', async (req: Request, res: Response) => {
  const { fullName, universityEmail, studentId, department, course, yearSemester, phoneNumber, password, confirmPassword } = req.body;

  if (!fullName || !universityEmail || !studentId || !department || !password) {
    return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const emailClean = universityEmail.toLowerCase().trim();
  const db = readDb();

  // Check if account already exists (Check MongoDB Atlas first, then local ledger)
  let existingUser = db.users.find(u => u.email.toLowerCase() === emailClean);
  if (!existingUser && isMongoDbConnected()) {
    try {
      existingUser = (await UserModel.findOne({ email: emailClean }).lean()) as any;
    } catch (err: any) {
      console.warn('⚠️  MongoDB query notice during check:', err.message);
    }
  }

  if (existingUser) {
    return res.status(409).json({ error: 'An account already exists with this university email.' });
  }

  const now = new Date().toISOString();
  const userId = `usr_student_${Date.now()}`;
  const newUser = {
    id: userId,
    email: emailClean,
    fullName: fullName.trim(),
    role: 'STUDENT' as const,
    department,
    studentId: studentId.trim(),
    course: course ? course.trim() : 'B.Tech Computer Science',
    yearSemester: yearSemester || 'Year 1 / Semester 1',
    phoneNumber: phoneNumber ? phoneNumber.trim() : '',
    passwordHash: hashPassword(password),
    isVerified: true,
    isActive: true,
    createdAt: now,
    failedLoginAttempts: 0
  };

  // AUTOMATIC WELCOME ONBOARDING TICKET GENERATION
  db.ticketSequence += 1;
  const ticketId = formatTicketId(db.ticketSequence);

  const facultyInDept = db.users.find(u => u.role === 'FACULTY' && u.department === department);
  const assignedFacultyId = facultyInDept ? facultyInDept.email : 'Central IT Helpdesk';
  const assignedFacultyName = facultyInDept ? facultyInDept.fullName : 'Central Support Pool';

  const welcomeTicket = {
    ticketId,
    title: `Onboarding & Academic IT Access Setup for ${fullName.trim()}`,
    description: `Automated onboarding ticket created upon student registration. Please verify central credentials, campus Wi-Fi (STSU-Secure), and academic lab allocations for ${fullName.trim()} (STUDENT).`,
    category: 'Account Access',
    priority: 'MEDIUM' as TicketPriority,
    status: 'OPEN' as TicketStatus,
    createdByUserId: emailClean,
    creatorName: fullName.trim(),
    creatorRole: 'STUDENT',
    department,
    assignedFacultyId,
    assignedFacultyName,
    createdAt: now,
    updatedAt: now,
    isWelcomeTicket: true,
    slaHours: 24,
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    history: [
      {
        action: 'TICKET_AUTO_GENERATED',
        timestamp: now,
        performedBy: 'STSU Automated Registration Engine',
        details: 'Initial onboarding ticket generated automatically upon registration.'
      }
    ],
    messages: [
      {
        id: `msg_welcome_${Date.now()}`,
        senderId: 'system@stsu.edu',
        senderName: 'STSU Central IT Support Engine',
        senderRole: 'SYSTEM',
        message: `Welcome to Smart Technical Support University! Your account has been created. A technical administrator has been notified to ensure your digital campus access is seamless.`,
        timestamp: now
      }
    ]
  };

  // 1. SAVE DIRECTLY TO MONGODB ATLAS
  if (isMongoDbConnected()) {
    try {
      await UserModel.findOneAndUpdate(
        { email: emailClean },
        { $set: newUser },
        { upsert: true, new: true }
      );
      console.log(`🍃 [MongoDB] User saved to MongoDB Atlas: ${newUser.email} (${newUser.fullName})`);
    } catch (err: any) {
      console.error('❌ Failed saving user to MongoDB Atlas:', err.message);
    }

    try {
      await TicketModel.findOneAndUpdate(
        { ticketId: welcomeTicket.ticketId },
        { $set: welcomeTicket },
        { upsert: true, new: true }
      );
      console.log(`🍃 [MongoDB] Welcome ticket saved to MongoDB Atlas: ${welcomeTicket.ticketId}`);
    } catch (err: any) {
      console.error('❌ Failed saving welcome ticket to MongoDB Atlas:', err.message);
    }
  }

  // 2. Also keep local ledger in sync
  db.users.push(newUser);
  db.tickets.unshift(welcomeTicket);

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'USER_REGISTERED',
    userId,
    userEmail: emailClean,
    details: `${fullName.trim()} registered account as STUDENT. Auto ticket: ${ticketId}`,
    timestamp: now
  });

  writeDb(db);

  broadcastSSE('NEW_TICKET', welcomeTicket);
  broadcastSSE('USER_REGISTERED', { email: newUser.email, role: newUser.role, name: newUser.fullName });

  const token = `stsu_jwt_${crypto.randomBytes(32).toString('hex')}`;

  res.json({
    success: true,
    message: 'Student account registered successfully. You can now sign in with your password.',
    token,
    user: newUser
  });
});

// Faculty Registration (Direct Password-Based Registration)
app.post('/api/auth/register-faculty', async (req: Request, res: Response) => {
  const { fullName, officialUniversityEmail, facultyId, department, designation, phoneNumber, password, confirmPassword } = req.body;

  if (!fullName || !officialUniversityEmail || !facultyId || !department || !password) {
    return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const emailClean = officialUniversityEmail.toLowerCase().trim();
  const db = readDb();

  // Check if account already exists (Check MongoDB Atlas first, then local ledger)
  let existingUser = db.users.find(u => u.email.toLowerCase() === emailClean);
  if (!existingUser && isMongoDbConnected()) {
    try {
      existingUser = (await UserModel.findOne({ email: emailClean }).lean()) as any;
    } catch (err: any) {
      console.warn('⚠️  MongoDB query notice during check:', err.message);
    }
  }

  if (existingUser) {
    return res.status(409).json({ error: 'An active faculty account already exists with this official email.' });
  }

  const now = new Date().toISOString();
  const userId = `usr_faculty_${Date.now()}`;
  const newUser = {
    id: userId,
    email: emailClean,
    fullName: fullName.trim(),
    role: 'FACULTY' as const,
    facultyId: facultyId.trim(),
    department,
    designation: designation ? designation.trim() : 'Assistant Professor',
    phoneNumber: phoneNumber ? phoneNumber.trim() : '',
    passwordHash: hashPassword(password),
    isVerified: true,
    isActive: true,
    createdAt: now,
    failedLoginAttempts: 0
  };

  db.ticketSequence += 1;
  const ticketId = formatTicketId(db.ticketSequence);

  const welcomeTicket = {
    ticketId,
    title: `Onboarding & Academic IT Access Setup for ${fullName.trim()} (Faculty)`,
    description: `Automated onboarding ticket created upon faculty registration. Setup academic smart classroom access, digital podium, and departmental resources for ${fullName.trim()}.`,
    category: 'Account Access',
    priority: 'MEDIUM' as TicketPriority,
    status: 'OPEN' as TicketStatus,
    createdByUserId: emailClean,
    creatorName: fullName.trim(),
    creatorRole: 'FACULTY',
    department,
    assignedFacultyId: emailClean,
    assignedFacultyName: fullName.trim(),
    createdAt: now,
    updatedAt: now,
    isWelcomeTicket: true,
    slaHours: 24,
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    history: [
      {
        action: 'TICKET_AUTO_GENERATED',
        timestamp: now,
        performedBy: 'STSU Automated Registration Engine',
        details: 'Initial faculty onboarding ticket generated automatically upon registration.'
      }
    ],
    messages: [
      {
        id: `msg_welcome_${Date.now()}`,
        senderId: 'system@stsu.edu',
        senderName: 'STSU Central IT Support Engine',
        senderRole: 'SYSTEM',
        message: `Welcome to Smart Technical Support University! Your faculty profile has been activated.`,
        timestamp: now
      }
    ]
  };

  // 1. SAVE DIRECTLY TO MONGODB ATLAS
  if (isMongoDbConnected()) {
    try {
      await UserModel.findOneAndUpdate(
        { email: emailClean },
        { $set: newUser },
        { upsert: true, new: true }
      );
      console.log(`🍃 [MongoDB] Faculty user saved to MongoDB Atlas: ${newUser.email} (${newUser.fullName})`);
    } catch (err: any) {
      console.error('❌ Failed saving faculty to MongoDB Atlas:', err.message);
    }

    try {
      await TicketModel.findOneAndUpdate(
        { ticketId: welcomeTicket.ticketId },
        { $set: welcomeTicket },
        { upsert: true, new: true }
      );
      console.log(`🍃 [MongoDB] Faculty welcome ticket saved to MongoDB Atlas: ${welcomeTicket.ticketId}`);
    } catch (err: any) {
      console.error('❌ Failed saving faculty welcome ticket to MongoDB Atlas:', err.message);
    }
  }

  // 2. Also keep local ledger in sync
  db.users.push(newUser);
  db.tickets.unshift(welcomeTicket);

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'USER_REGISTERED',
    userId,
    userEmail: emailClean,
    details: `${fullName.trim()} registered account as FACULTY. Auto ticket: ${ticketId}`,
    timestamp: now
  });

  writeDb(db);

  broadcastSSE('NEW_TICKET', welcomeTicket);
  broadcastSSE('USER_REGISTERED', { email: newUser.email, role: newUser.role, name: newUser.fullName });

  const token = `stsu_jwt_${crypto.randomBytes(32).toString('hex')}`;

  res.json({
    success: true,
    message: 'Faculty account registered successfully. You can now sign in with your password.',
    token,
    user: newUser
  });
});

// OTP Verification & Automated Welcome Ticket Generation
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
  }

  const db = readDb();
  const otpRecord = db.otps.find(o => o.email.toLowerCase() === email.toLowerCase());

  if (!otpRecord) {
    return res.status(404).json({ error: 'No verification pending for this email. Please register again.' });
  }

  if (Date.now() > otpRecord.expiresAt) {
    return res.status(400).json({ error: 'This verification code has expired (5 minute limit). Please request a new code.' });
  }

  if (otpRecord.attempts >= 5) {
    return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new verification code.' });
  }

  if (otpRecord.otp !== otp.trim()) {
    otpRecord.attempts += 1;
    writeDb(db);
    return res.status(400).json({ error: `Invalid verification code. ${5 - otpRecord.attempts} attempts remaining.` });
  }

  // OTP Verified! Create or activate user
  const payload = otpRecord.payload;
  const now = new Date().toISOString();
  const userId = `usr_${payload.role.toLowerCase()}_${Date.now()}`;

  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    fullName: payload.fullName,
    role: payload.role as 'ADMIN' | 'FACULTY' | 'STUDENT',
    department: payload.department,
    studentId: payload.studentId,
    course: payload.course,
    yearSemester: payload.yearSemester,
    facultyId: payload.facultyId,
    designation: payload.designation,
    phoneNumber: payload.phoneNumber,
    passwordHash: payload.passwordHash,
    isVerified: true,
    isActive: true,
    createdAt: now,
    failedLoginAttempts: 0
  };

  db.users.push(newUser);

  // AUTOMATIC WELCOME TICKET GENERATION (Mandatory Section 8)
  db.ticketSequence += 1;
  const ticketId = formatTicketId(db.ticketSequence);

  // Find a faculty member from the user's department if available
  const facultyInDept = db.users.find(u => u.role === 'FACULTY' && u.department === payload.department);
  const assignedFacultyId = facultyInDept ? facultyInDept.email : 'Central IT Helpdesk';
  const assignedFacultyName = facultyInDept ? facultyInDept.fullName : 'Central Support Pool';

  const welcomeTicket = {
    ticketId,
    title: `Onboarding & Academic IT Access Setup for ${payload.fullName}`,
    description: `Automated onboarding ticket created upon successful registration and OTP verification. Please verify central credentials, campus Wi-Fi (STSU-Secure), and academic lab allocations for ${payload.fullName} (${payload.role}).`,
    category: 'Account Access',
    priority: 'MEDIUM' as TicketPriority,
    status: 'OPEN' as TicketStatus,
    createdByUserId: email.toLowerCase(),
    creatorName: payload.fullName,
    creatorRole: payload.role,
    department: payload.department,
    assignedFacultyId,
    assignedFacultyName,
    createdAt: now,
    updatedAt: now,
    isWelcomeTicket: true,
    slaHours: 24,
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    history: [
      {
        action: 'TICKET_AUTO_GENERATED',
        timestamp: now,
        performedBy: 'STSU Automated Registration Engine',
        details: `Initial onboarding ticket generated automatically after OTP verification.`
      }
    ],
    messages: [
      {
        id: `msg_welcome_${Date.now()}`,
        senderId: 'system@stsu.edu',
        senderName: 'STSU Central IT Support Engine',
        senderRole: 'SYSTEM',
        message: `Welcome to Smart Technical Support University! Your account has been activated. A technical administrator has been notified to ensure your digital campus access is seamless.`,
        timestamp: now
      }
    ]
  };

  db.tickets.unshift(welcomeTicket);

  // Audit log
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'USER_REGISTERED_AND_VERIFIED',
    userId,
    userEmail: email.toLowerCase(),
    details: `${payload.fullName} verified OTP and activated account as ${payload.role}. Auto ticket: ${ticketId}`,
    timestamp: now
  });

  // Remove verified OTP
  db.otps = db.otps.filter(o => o.email.toLowerCase() !== email.toLowerCase());

  writeDb(db);

  // Broadcast real-time event to connected dashboards
  broadcastSSE('NEW_TICKET', welcomeTicket);
  broadcastSSE('USER_REGISTERED', { email: newUser.email, role: newUser.role, name: newUser.fullName });

  // Issue simulated JWT token
  const token = `stsu_jwt_${crypto.randomBytes(32).toString('hex')}`;

  res.json({
    success: true,
    message: 'Account verified and activated successfully!',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      department: newUser.department,
      studentId: newUser.studentId,
      facultyId: newUser.facultyId,
      designation: newUser.designation
    },
    welcomeTicket: {
      ticketId: welcomeTicket.ticketId,
      title: welcomeTicket.title,
      status: welcomeTicket.status,
      assignedFacultyName: welcomeTicket.assignedFacultyName
    }
  });
});

// Resend OTP
app.post('/api/auth/resend-otp', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const db = readDb();
  const existing = db.otps.find(o => o.email.toLowerCase() === email.toLowerCase());
  if (!existing) {
    return res.status(404).json({ error: 'No pending registration found for this email.' });
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  existing.otp = newOtp;
  existing.expiresAt = Date.now() + 5 * 60 * 1000;
  existing.attempts = 0;

  writeDb(db);

  res.json({
    success: true,
    message: `A fresh verification code has been dispatched to ${email}.`,
    devOtp: newOtp
  });
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const emailClean = email.toLowerCase().trim();
  const db = readDb();
  let user: any = null;

  // 1. First fetch user from MongoDB Atlas
  if (isMongoDbConnected()) {
    try {
      user = await UserModel.findOne({ email: emailClean }).lean();
      if (user) {
        console.log(`🍃 [MongoDB] User found in MongoDB Atlas: ${user.email} (${user.role})`);
      }
    } catch (err: any) {
      console.warn('⚠️  MongoDB query notice during login:', err.message);
    }
  }

  // 2. Fallback to local memory/ledger
  if (!user) {
    user = db.users.find(u => u.email.toLowerCase() === emailClean);
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid university credentials.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account has been deactivated. Please contact Central IT Operations.' });
  }

  const providedHash = hashPassword(password);
  if (user.passwordHash !== providedHash) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    writeDb(db);
    if (isMongoDbConnected()) {
      try {
        await UserModel.updateOne({ email: emailClean }, { $inc: { failedLoginAttempts: 1 } });
      } catch (e) {}
    }
    return res.status(401).json({ error: 'Invalid university credentials.' });
  }

  // Reset failed attempts
  user.failedLoginAttempts = 0;
  if (isMongoDbConnected()) {
    try {
      await UserModel.updateOne({ email: emailClean }, { $set: { failedLoginAttempts: 0 } });
    } catch (e) {}
  }
  
  // Log audit
  const auditEntry = {
    id: `log_${Date.now()}`,
    action: 'USER_LOGIN',
    userId: user.id,
    userEmail: user.email,
    details: `Successful login as ${user.role}`,
    timestamp: new Date().toISOString()
  };

  db.auditLogs.unshift(auditEntry);
  writeDb(db);

  if (isMongoDbConnected()) {
    try {
      await AuditLogModel.create(auditEntry);
    } catch (e) {}
  }

  const token = `stsu_jwt_${crypto.randomBytes(32).toString('hex')}`;

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      facultyId: user.facultyId,
      designation: user.designation,
      course: user.course,
      yearSemester: user.yearSemester,
      phoneNumber: user.phoneNumber
    }
  });
});

// Get Current User
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const email = req.headers['x-user-email'] as string;
  if (!email) return res.status(401).json({ error: 'Authentication required.' });

  const emailClean = email.toLowerCase().trim();
  let user: any = null;

  if (isMongoDbConnected()) {
    try {
      user = await UserModel.findOne({ email: emailClean }).lean();
    } catch (e) {}
  }

  if (!user) {
    const db = readDb();
    user = db.users.find(u => u.email.toLowerCase() === emailClean);
  }

  if (!user) return res.status(404).json({ error: 'User not found.' });

  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    department: user.department,
    studentId: user.studentId,
    facultyId: user.facultyId,
    designation: user.designation,
    course: user.course,
    yearSemester: user.yearSemester,
    phoneNumber: user.phoneNumber
  });
});

// Tickets: List
app.get('/api/tickets', async (req: Request, res: Response) => {
  const userRole = (req.query.role as string) || 'STUDENT';
  const userEmail = ((req.query.email as string) || '').toLowerCase().trim();
  const statusFilter = req.query.status as string;
  const categoryFilter = req.query.category as string;
  const priorityFilter = req.query.priority as string;
  const searchQuery = ((req.query.q as string) || '').toLowerCase();

  let list: any[] = [];

  // Query MongoDB Atlas
  if (isMongoDbConnected()) {
    try {
      const query: any = {};
      if (userRole === 'STUDENT' && userEmail) {
        query.createdByUserId = userEmail;
      } else if (userRole === 'FACULTY' && userEmail) {
        query.$or = [{ assignedFacultyId: userEmail }, { assignedFacultyId: 'unassigned' }];
      }
      if (statusFilter && statusFilter !== 'ALL') query.status = statusFilter;
      if (categoryFilter && categoryFilter !== 'ALL') query.category = categoryFilter;
      if (priorityFilter && priorityFilter !== 'ALL') query.priority = priorityFilter;

      list = await TicketModel.find(query).sort({ createdAt: -1 }).lean();
    } catch (err: any) {
      console.warn('⚠️  MongoDB query notice for tickets:', err.message);
    }
  }

  // Fallback to local ledger if empty or offline
  if (list.length === 0) {
    const db = readDb();
    list = db.tickets;

    // Role filtering
    if (userRole === 'STUDENT') {
      list = list.filter(t => t.createdByUserId.toLowerCase() === userEmail);
    } else if (userRole === 'FACULTY') {
      list = list.filter(t => t.assignedFacultyId.toLowerCase() === userEmail || t.assignedFacultyId === 'unassigned');
    }

    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter(t => t.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== 'ALL') {
      list = list.filter(t => t.category === categoryFilter);
    }

    if (priorityFilter && priorityFilter !== 'ALL') {
      list = list.filter(t => t.priority === priorityFilter);
    }
  }

  if (searchQuery) {
    list = list.filter((t: any) => 
      t.ticketId?.toLowerCase().includes(searchQuery) ||
      t.title?.toLowerCase().includes(searchQuery) ||
      t.description?.toLowerCase().includes(searchQuery) ||
      t.creatorName?.toLowerCase().includes(searchQuery)
    );
  }

  res.json(list);
});

// Tickets: Create
app.post('/api/tickets', async (req: Request, res: Response) => {
  const { title, description, category, priority, attachments, location, assetTag, creatorEmail, creatorName, creatorRole, department } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description, and category are required.' });
  }

  const db = readDb();
  db.ticketSequence += 1;
  const ticketId = formatTicketId(db.ticketSequence);
  const now = new Date().toISOString();
  const slaTargetHours = calculateSlaTargetHours(priority || 'MEDIUM');
  const slaDeadline = new Date(Date.now() + slaTargetHours * 3600 * 1000).toISOString();

  // Route ticket to faculty in department
  const facultyMember = db.users.find(u => u.role === 'FACULTY' && u.department === department);

  const newTicket = {
    ticketId,
    title: title.trim(),
    description: description.trim(),
    category,
    priority: (priority || 'MEDIUM') as TicketPriority,
    status: 'OPEN' as TicketStatus,
    createdByUserId: (creatorEmail || 'unknown@stsu.edu').toLowerCase(),
    creatorName: creatorName || 'University Member',
    creatorRole: creatorRole || 'STUDENT',
    department: department || 'General Academic',
    assignedFacultyId: facultyMember ? facultyMember.email : 'unassigned',
    assignedFacultyName: facultyMember ? facultyMember.fullName : 'Central Support Pool',
    createdAt: now,
    updatedAt: now,
    slaHours: slaTargetHours,
    slaDeadline,
    location,
    assetTag,
    history: [
      {
        action: 'TICKET_CREATED',
        timestamp: now,
        performedBy: creatorName || 'User',
        details: `Ticket created with priority ${priority || 'MEDIUM'} in category '${category}'`
      }
    ],
    messages: [
      {
        id: `msg_${Date.now()}`,
        senderId: (creatorEmail || 'user').toLowerCase(),
        senderName: creatorName || 'Submitter',
        senderRole: creatorRole || 'STUDENT',
        message: description.trim(),
        timestamp: now
      }
    ]
  };

  // 1. SAVE DIRECTLY TO MONGODB ATLAS
  if (isMongoDbConnected()) {
    try {
      await TicketModel.findOneAndUpdate(
        { ticketId: newTicket.ticketId },
        { $set: newTicket },
        { upsert: true, new: true }
      );
      console.log(`🍃 [MongoDB] Saved new ticket to MongoDB Atlas: ${newTicket.ticketId}`);
    } catch (err: any) {
      console.error('❌ Failed saving ticket to MongoDB Atlas:', err.message);
    }
  }

  // 2. Also keep local ledger in sync
  db.tickets.unshift(newTicket);

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'TICKET_CREATED',
    userId: creatorEmail || 'system',
    userEmail: creatorEmail || 'system',
    details: `Ticket ${ticketId} created: "${title.slice(0, 50)}..."`,
    timestamp: now
  });

  writeDb(db);
  broadcastSSE('NEW_TICKET', newTicket);

  res.status(201).json(newTicket);
});

// Tickets: Get Details
app.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const idClean = req.params.id.toUpperCase();
  let ticket: any = null;

  if (isMongoDbConnected()) {
    try {
      ticket = await TicketModel.findOne({ ticketId: idClean }).lean();
    } catch (e) {}
  }

  if (!ticket) {
    const db = readDb();
    ticket = db.tickets.find(t => t.ticketId.toUpperCase() === idClean);
  }

  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
  res.json(ticket);
});

// Tickets: Update Status & Assignment
app.patch('/api/tickets/:id/status', (req: Request, res: Response) => {
  const { status, performerRole, performerName, note, resolutionDetails } = req.body;
  const db = readDb();
  const ticket = db.tickets.find(t => t.ticketId.toUpperCase() === req.params.id.toUpperCase());

  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

  const validation = canTransitionTicketStatus({
    currentStatus: ticket.status,
    targetStatus: status,
    userRole: performerRole || 'FACULTY',
    hasAssignedFaculty: ticket.assignedFacultyId !== 'unassigned',
    hasResolutionDetails: !!resolutionDetails || !!ticket.resolutionDetails
  });

  if (!validation.allowed) {
    return res.status(400).json({ error: validation.reason || 'Status transition not permitted.' });
  }

  const now = new Date().toISOString();
  ticket.status = status;
  ticket.updatedAt = now;

  if (resolutionDetails) {
    ticket.resolutionDetails = resolutionDetails;
    ticket.resolvedAt = now;
  }

  ticket.history.push({
    action: `STATUS_CHANGED_TO_${status.replace(/\s+/g, '_')}`,
    timestamp: now,
    performedBy: performerName || 'System',
    details: note || `Status transitioned to ${status}`
  });

  writeDb(db);
  broadcastSSE('TICKET_UPDATED', ticket);

  res.json(ticket);
});

// Tickets: Assign Faculty
app.patch('/api/tickets/:id/assign', (req: Request, res: Response) => {
  const { facultyEmail, performerName } = req.body;
  const db = readDb();
  const ticket = db.tickets.find(t => t.ticketId.toUpperCase() === req.params.id.toUpperCase());
  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

  const faculty = db.users.find(u => u.email.toLowerCase() === facultyEmail.toLowerCase() && u.role === 'FACULTY');
  if (!faculty) return res.status(404).json({ error: 'Faculty member not found.' });

  const now = new Date().toISOString();
  ticket.assignedFacultyId = faculty.email;
  ticket.assignedFacultyName = faculty.fullName;
  if (ticket.status === 'OPEN') {
    ticket.status = 'ASSIGNED';
  }
  ticket.updatedAt = now;

  ticket.history.push({
    action: 'FACULTY_ASSIGNED',
    timestamp: now,
    performedBy: performerName || 'Administrator',
    details: `Assigned to ${faculty.fullName} (${faculty.department})`
  });

  writeDb(db);
  broadcastSSE('TICKET_UPDATED', ticket);

  res.json(ticket);
});

// Tickets: Add Message
app.post('/api/tickets/:id/messages', (req: Request, res: Response) => {
  const { message, senderId, senderName, senderRole } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const db = readDb();
  const ticket = db.tickets.find(t => t.ticketId.toUpperCase() === req.params.id.toUpperCase());
  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

  const now = new Date().toISOString();
  const newMsg = {
    id: `msg_${Date.now()}`,
    senderId: (senderId || 'user').toLowerCase(),
    senderName: senderName || 'User',
    senderRole: senderRole || 'STUDENT',
    message: message.trim(),
    timestamp: now
  };

  ticket.messages.push(newMsg);
  ticket.updatedAt = now;

  // Auto transition to IN PROGRESS if faculty replies to an assigned ticket
  if (senderRole === 'FACULTY' && (ticket.status === 'ASSIGNED' || ticket.status === 'OPEN')) {
    ticket.status = 'IN PROGRESS';
    ticket.history.push({
      action: 'STATUS_CHANGED_TO_IN_PROGRESS',
      timestamp: now,
      performedBy: senderName,
      details: 'Faculty initiated direct diagnostic response'
    });
  }

  writeDb(db);
  broadcastSSE('NEW_TICKET_MESSAGE', { ticketId: ticket.ticketId, message: newMsg });

  res.status(201).json(newMsg);
});

// Tickets: Submit Feedback
app.post('/api/tickets/:id/feedback', (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const db = readDb();
  const ticket = db.tickets.find(t => t.ticketId.toUpperCase() === req.params.id.toUpperCase());
  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

  ticket.feedback = {
    rating: Number(rating),
    comment: comment || '',
    submittedAt: new Date().toISOString()
  };

  writeDb(db);
  res.json({ success: true, feedback: ticket.feedback });
});

// Admin Overview Analytics
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const db = readDb();
  const totalStudents = db.users.filter(u => u.role === 'STUDENT' && u.isVerified).length;
  const totalFaculty = db.users.filter(u => u.role === 'FACULTY' && u.isVerified).length;
  const totalTickets = db.tickets.length;
  const openTickets = db.tickets.filter(t => t.status === 'OPEN').length;
  const inProgressTickets = db.tickets.filter(t => t.status === 'IN PROGRESS' || t.status === 'ASSIGNED').length;
  const resolvedTickets = db.tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const criticalTickets = db.tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;

  // Department distribution
  const departmentStats = db.departments.map(d => ({
    name: d.name,
    code: d.code,
    totalTickets: db.tickets.filter(t => t.department === d.name).length,
    openTickets: db.tickets.filter(t => t.department === d.name && (t.status === 'OPEN' || t.status === 'IN PROGRESS')).length,
    staffCount: d.supportStaffCount
  }));

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  db.tickets.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  res.json({
    metrics: {
      totalStudents,
      totalFaculty,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      criticalTickets,
      averageResolutionHours: 6.4,
      slaComplianceRate: 97.2
    },
    departmentStats,
    categoryCounts,
    recentAuditLogs: db.auditLogs.slice(0, 10),
    recentTickets: db.tickets.slice(0, 5)
  });
});

// Admin Users Roster
app.get('/api/admin/users', async (req: Request, res: Response) => {
  const role = req.query.role as string;
  let list: any[] = [];

  // Query MongoDB Atlas
  if (isMongoDbConnected()) {
    try {
      const query: any = {};
      if (role && role !== 'ALL') query.role = role;
      const mongoUsers = await UserModel.find(query).sort({ createdAt: -1 }).lean();
      if (mongoUsers && mongoUsers.length > 0) {
        list = mongoUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          department: u.department,
          studentId: u.studentId,
          facultyId: u.facultyId,
          designation: u.designation,
          phoneNumber: u.phoneNumber,
          isVerified: u.isVerified,
          isActive: u.isActive,
          createdAt: u.createdAt
        }));
      }
    } catch (err: any) {
      console.warn('⚠️  MongoDB query notice for admin users:', err.message);
    }
  }

  // Fallback to local ledger if empty or offline
  if (list.length === 0) {
    const db = readDb();
    list = db.users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      department: u.department,
      studentId: u.studentId,
      facultyId: u.facultyId,
      designation: u.designation,
      phoneNumber: u.phoneNumber,
      isVerified: u.isVerified,
      isActive: u.isActive,
      createdAt: u.createdAt
    }));

    if (role && role !== 'ALL') {
      list = list.filter(u => u.role === role);
    }
  }

  res.json(list);
});

// Admin Toggle User Status
app.patch('/api/admin/users/:id/toggle-status', (req: Request, res: Response) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  if (user.role === 'ADMIN') {
    return res.status(403).json({ error: 'Cannot deactivate primary system administrator account.' });
  }

  user.isActive = !user.isActive;
  writeDb(db);

  res.json({ success: true, isActive: user.isActive });
});

// Faculty Overview
app.get('/api/faculty/overview', (req: Request, res: Response) => {
  const email = (req.query.email as string || '').toLowerCase();
  const db = readDb();

  const assignedTickets = db.tickets.filter(t => t.assignedFacultyId.toLowerCase() === email);
  const pending = assignedTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
  const resolved = assignedTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');
  const highPriority = pending.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL');

  res.json({
    metrics: {
      totalAssigned: assignedTickets.length,
      pendingCount: pending.length,
      resolvedCount: resolved.length,
      highPriorityCount: highPriority.length,
      avgResponseHours: 1.8
    },
    assignedTickets: assignedTickets.slice(0, 8),
    recentDepartmentAnnouncements: db.announcements.slice(0, 3)
  });
});

// Student Overview
app.get('/api/student/overview', (req: Request, res: Response) => {
  const email = (req.query.email as string || '').toLowerCase();
  const db = readDb();

  const myTickets = db.tickets.filter(t => t.createdByUserId.toLowerCase() === email);
  const openCount = myTickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = myTickets.filter(t => t.status === 'IN PROGRESS' || t.status === 'ASSIGNED').length;
  const resolvedCount = myTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  res.json({
    metrics: {
      totalSubmitted: myTickets.length,
      openCount,
      inProgressCount,
      resolvedCount
    },
    myTickets: myTickets.slice(0, 6),
    latestAnnouncements: db.announcements.slice(0, 3)
  });
});

// AI Technical Assistant
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  const { message, conversationHistory } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Query message cannot be empty.' });
  }

  // Pre-calculate recommended category & priority from symptom analyzer
  const recommendation = recommendCategoryAndPriority(message);

  if (!aiClient) {
    // Graceful and helpful fallback diagnostics when API key is not in environment
    return res.json({
      reply: `Central IT Diagnostics Engine Response:\n\nBased on your query: "${message.trim()}", our preliminary university diagnostics suggest:\n\n1. Recommended Category: ${recommendation.category}\n2. Recommended Priority: ${recommendation.priority}\n\nTroubleshooting Steps:\n• Ensure you are connected to the authenticated campus network ('STSU-Secure').\n• Verify your credentials on the central Single Sign-On (SSO) page.\n• If this requires on-site hardware support in a laboratory, submit a ticket with your room number and equipment tag.\n\n(AI Assistant operational in diagnostic mode).`,
      recommendation
    });
  }

  try {
    const systemPrompt = `You are the Smart Technical Support University (STSU) AI Technical Assistant.
You assist university students, professors, and staff with technical challenges, campus Wi-Fi (STSU-Secure), university LMS (Moodle/Canvas), student email, lab workstations, projector calibrations in smart classrooms, and software licenses (MATLAB, AutoCAD, Python).
Always be concise, professional, clear, and reassuring.
Give practical step-by-step troubleshooting instructions.
If the issue clearly requires physical IT intervention, advise them to create an official support ticket and provide the recommended category (${recommendation.category}) and priority (${recommendation.priority}).
Never pretend a physical hardware fault has been repaired.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }]
        }
      ]
    });

    const reply = response.text || 'Technical support service response received.';

    res.json({
      reply,
      recommendation
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.json({
      reply: `Central IT Knowledge Engine:\n\nFor: "${message.trim()}"\n\nDiagnostic recommendations:\n• Category: ${recommendation.category}\n• Priority: ${recommendation.priority}\n\nPlease proceed to create an official support ticket if self-service troubleshooting does not resolve the issue.`,
      recommendation
    });
  }
});

// IT Modules: Assets
app.get('/api/modules/assets', (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.assets);
});

// IT Modules: Laboratories
app.get('/api/modules/labs', (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.laboratories);
});

// IT Modules: Smart Classrooms
app.get('/api/modules/classrooms', (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.classrooms);
});

// IT Modules: Announcements
app.get('/api/modules/announcements', (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.announcements);
});

app.post('/api/modules/announcements', (req: Request, res: Response) => {
  const { title, content, category, targetAudience, creatorName } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required.' });

  const db = readDb();
  const newAnn = {
    id: `ann_${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    category: category || 'ACADEMIC',
    targetAudience: targetAudience || 'ALL',
    createdBy: creatorName || 'Central IT Administration',
    createdAt: new Date().toISOString()
  };

  db.announcements.unshift(newAnn);
  writeDb(db);
  broadcastSSE('NEW_ANNOUNCEMENT', newAnn);

  res.status(201).json(newAnn);
});

// Departments List
app.get('/api/admin/departments', (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.departments);
});

// System Settings
app.get('/api/admin/settings', (req: Request, res: Response) => {
  const db = readDb();
  res.json(db.systemSettings);
});

app.post('/api/admin/settings', (req: Request, res: Response) => {
  const db = readDb();
  db.systemSettings = { ...db.systemSettings, ...req.body };
  writeDb(db);
  res.json(db.systemSettings);
});

// Database & System Health
app.get('/api/health/db', async (req: Request, res: Response) => {
  const health = await getMongoDbHealth();
  res.json(health);
});

// Vite Middleware Integration
async function startServer() {
  // Connect to MongoDB Atlas (Database connection only, no auto-seeding)
  await connectMongo();

  const distPath = path.resolve(process.cwd(), 'dist');
  const distExists = fs.existsSync(path.join(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' && distExists;

  if (!isProd) {
    if (process.env.NODE_ENV === 'production' && !distExists) {
      console.warn('⚠️  NODE_ENV is set to production but dist/index.html was not found. Falling back to Vite development server.');
    }
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Smart Technical Support University server running on http://localhost:${PORT}`);
  });
}

startServer();
