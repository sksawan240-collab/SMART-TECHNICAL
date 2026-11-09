import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Wifi, 
  Cpu, 
  BookOpen, 
  Monitor, 
  Lock, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  FileText, 
  ChevronDown, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Server,
  Radio,
  Zap,
  Search,
  Laptop,
  Building2,
  GraduationCap,
  Headphones,
  Send,
  AlertCircle
} from 'lucide-react';

interface LandingProps {
  setCurrentView: (view: string) => void;
}

interface TimelineStep {
  step: string;
  stageName: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  actionDetails: string[];
  systemTelemetry: {
    actor: string;
    slaStatus: string;
    protocol: string;
  };
}

export const LandingPage: React.FC<LandingProps> = ({ setCurrentView }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFaculty: 0,
    totalTickets: 0,
    resolvedTickets: 0,
    openTickets: 0,
    activeLabs: 0,
    resolutionRate: 100,
    departmentsCount: 0,
    departments: [] as Array<{
      id: string;
      name: string;
      code: string;
      headOfDepartment: string;
      supportStaffCount: number;
      activeTicketsCount: number;
    }>,
    laboratories: [] as Array<{
      id: string;
      labCode: string;
      name: string;
      department: string;
      workstationCount: number;
      operationalStations: number;
      inChargeFaculty: string;
      status: string;
    }>,
    classrooms: [] as Array<{
      id: string;
      roomNumber: string;
      building: string;
      projectorModel: string;
      smartBoardStatus: string;
      audioSystemStatus: string;
    }>,
    systemSettings: {
      universityName: 'Smart Technical Support University',
      supportEmail: 'support@stsu.edu',
      emergencyExtension: '4400',
      slaCriticalHours: 4,
      slaHighHours: 12,
      slaMediumHours: 24,
      slaLowHours: 48,
    },
    activeAnnouncements: [] as any[]
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Active Interactive Timeline Stage
  const [activeTimelineStage, setActiveTimelineStage] = useState(0);

  // Live Backend AI Assistant Query State (Calls /api/ai/assistant)
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    reply: string;
    recommendation?: {
      category: string;
      priority: string;
    };
  } | null>(null);

  // FAQ State & Search
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState('');

  useEffect(() => {
    fetch('/api/stats/landing')
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({ ...prev, ...data }));
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));
  }, []);

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  // Real Backend AI Query Submission
  const handleQueryAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiQuery.trim() })
      });
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      setAiResponse({
        reply: 'Could not connect to central AI diagnostics backend. Please ensure the server is active.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // 5-Stage Incident Resolution Timeline (Platform Standard Operating Workflow)
  const timelineStages: TimelineStep[] = [
    {
      step: '01',
      stageName: 'Incident Submission',
      icon: <Send className="w-5 h-5 text-sky-400" />,
      badge: 'Immediate Intake',
      badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30',
      title: 'Incident Report Logged to Central Database',
      description: 'Enrolled students or faculty report an infrastructure incident with room location and symptoms, or an automated onboarding ticket is generated upon registration.',
      actionDetails: [
        'User submits incident details securely via authenticated web terminal',
        'Cryptographic timestamp is persisted into university database',
        'Real-time Server-Sent Events (SSE) stream alerts connected technicians'
      ],
      systemTelemetry: {
        actor: 'Authenticated Student or Faculty User',
        slaStatus: 'Response Timer Initialized',
        protocol: 'REST Endpoint • TLS Encryption'
      }
    },
    {
      step: '02',
      stageName: 'AI Diagnostic Triage',
      icon: <Sparkles className="w-5 h-5 text-fuchsia-400" />,
      badge: 'Gemini AI Engine',
      badgeColor: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30',
      title: 'Automated Category & Priority Rating',
      description: 'The backend triage module analyzes symptom text, infers the technical failure mode, recommends a category, and sets the enforced SLA window.',
      actionDetails: [
        'Root-cause classification into university infrastructure categories',
        `Dynamic SLA assignment: Critical (${stats.systemSettings?.slaCriticalHours || 4}h), High (${stats.systemSettings?.slaHighHours || 12}h), Medium (${stats.systemSettings?.slaMediumHours || 24}h)`,
        'Instant preliminary guidance returned to the user'
      ],
      systemTelemetry: {
        actor: 'Google Gemini AI & Symptom Analyzer',
        slaStatus: 'Priority & SLA Deadline Calibrated',
        protocol: 'Backend Natural Language Processing'
      }
    },
    {
      step: '03',
      stageName: 'Departmental Dispatch',
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      badge: 'Faculty Routing',
      badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
      title: 'Escalation to Matching Departmental Staff',
      description: 'The ticket routes directly into the queue of the active faculty member or support personnel assigned to the specific academic department.',
      actionDetails: [
        'Automated routing matching the user\'s enrolled department',
        'Ticket status transitions from OPEN to ASSIGNED',
        'Staff dashboard queue updates in real-time'
      ],
      systemTelemetry: {
        actor: 'Departmental Faculty & Support Personnel',
        slaStatus: 'Assigned to Designated Faculty Queue',
        protocol: 'Internal Database Routing'
      }
    },
    {
      step: '04',
      stageName: 'Resolution & Communication',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      badge: 'Live Collaboration',
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
      title: 'Threaded Messaging & Technical Intervention',
      description: 'Support personnel collaborate with reporters via threaded ticket chat while physical hardware adjustments, network reconfigurations, or software fixes are executed.',
      actionDetails: [
        'Two-way messaging between ticket creator and assigned faculty',
        'Progress status updates: ASSIGNED → IN PROGRESS',
        'Intervention notes recorded with author attribution and timestamp'
      ],
      systemTelemetry: {
        actor: 'Assigned Departmental Technician',
        slaStatus: 'Active Countdown Tracking',
        protocol: 'SSE Live Stream Channel'
      }
    },
    {
      step: '05',
      stageName: 'Closure & Audit Logging',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      badge: 'Verified Complete',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      title: 'Resolution Sign-Off & Feedback Collection',
      description: 'The ticket is marked RESOLVED, root cause is documented in the permanent audit trail, and the student or faculty member submits satisfaction feedback.',
      actionDetails: [
        'Permanent audit record logged with user email and timestamp',
        'User satisfaction feedback & star rating (1 to 5 Stars)',
        'Final ticket status recorded as RESOLVED or CLOSED'
      ],
      systemTelemetry: {
        actor: 'Central IT Compliance Ledger',
        slaStatus: 'SLA Target Verified & Completed',
        protocol: 'Immutable Audit Log File'
      }
    }
  ];

  // Services Catalog
  const services = [
    {
      icon: <Wifi className="w-5 h-5 text-sky-500" />,
      title: 'Campus Wi-Fi & Network Infrastructure',
      description: 'Secure enterprise authentication, roaming access points, and connectivity troubleshooting across all university buildings.',
      meta: 'Campus Wi-Fi'
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-500" />,
      title: 'Academic Laboratories & Workstations',
      description: 'Hardware diagnostics, toolchain licensing, and computer terminal maintenance for all departmental engineering labs.',
      meta: 'Computing Labs'
    },
    {
      icon: <Monitor className="w-5 h-5 text-emerald-500" />,
      title: 'Smart Classrooms & Audio-Visual Systems',
      description: 'Laser projection diagnostics, smart digital podiums, and rapid technical intervention for scheduled lectures.',
      meta: 'Smart Classrooms'
    },
    {
      icon: <Lock className="w-5 h-5 text-purple-500" />,
      title: 'Zero-Trust Account Security',
      description: 'Direct password authentication with salted cryptographic hashing, session token verification, and brute-force prevention.',
      meta: 'Encrypted Access'
    },
    {
      icon: <BookOpen className="w-5 h-5 text-fuchsia-500" />,
      title: 'Cloud LMS & Examination Systems',
      description: 'Academic management integration and student portal credential synchronization for coursework and exams.',
      meta: 'Academic LMS'
    },
    {
      icon: <FileText className="w-5 h-5 text-amber-500" />,
      title: 'Automated SLA Routing & Escalation',
      description: `Incidents dynamically evaluated with priority countdown timers: Critical (${stats.systemSettings?.slaCriticalHours || 4}h), High (${stats.systemSettings?.slaHighHours || 12}h), Medium (${stats.systemSettings?.slaMediumHours || 24}h).`,
      meta: 'SLA Enforcement'
    }
  ];

  // Frequently Asked Questions
  const allFaqs = [
    {
      q: 'How does the automatic welcome ticket system work?',
      a: 'When any student or faculty member successfully registers their university account, the platform automatically generates an onboarding ticket. Central IT verifies access to campus Wi-Fi, LMS accounts, and assigned laboratory credentials immediately.'
    },
    {
      q: 'How do I log in or create an account?',
      a: 'The portal uses direct password-based security. You simply choose your institutional role (Student or Faculty), enter your details and password, and gain immediate access to submit and manage tickets.'
    },
    {
      q: 'What is the role of the AI Technical Support Assistant?',
      a: 'The assistant uses Google Gemini API to analyze reported technical symptoms in natural language. It provides immediate troubleshooting steps for campus tech issues and recommends the exact ticket category and priority before submission.'
    },
    {
      q: 'Can students track ticket progression in real-time?',
      a: 'Yes. Students have an interactive timeline interface that displays assigned faculty members, timestamped status updates, direct messaging threads, and downloadable resolution summaries.'
    },
    {
      q: 'What are the response time SLAs for reported incidents?',
      a: `Enforced SLAs are configured in system settings: Critical incidents have an enforced ${stats.systemSettings?.slaCriticalHours || 4}-hour window, High-priority issues are resolved within ${stats.systemSettings?.slaHighHours || 12} hours, and standard requests within ${stats.systemSettings?.slaMediumHours || 24} hours.`
    },
    {
      q: 'How are privileged Administrator accounts initialized?',
      a: 'In accordance with university cybersecurity standards, public Admin registration is prohibited. Administrator accounts are provisioned exclusively through secure server command-line tools with salted SHA-256 cryptographic hashing.'
    }
  ];

  const filteredFaqs = allFaqs.filter(f => 
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="relative overflow-hidden">
      
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -70, 40, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-500/20 via-sky-500/15 to-transparent blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -60, 50, 0],
            y: [0, 80, -50, 0],
            scale: [1, 1.25, 0.95, 1],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-fuchsia-600/20 via-violet-600/15 to-transparent blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [0.9, 1.2, 0.9],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 left-1/3 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-indigo-500/15 via-emerald-500/15 to-transparent blur-[120px]"
        />
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      {/* SECTION 1: HERO COCKPIT */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Live Operational Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-indigo-500/15 border border-emerald-500/30 backdrop-blur-md self-start shadow-sm">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold tracking-wide uppercase bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 dark:from-emerald-300 dark:via-cyan-300 dark:to-indigo-300 bg-clip-text text-transparent">
                {stats.departmentsCount > 0 ? `${stats.departmentsCount} Academic Departments Connected` : 'Central IT Infrastructure Operational'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Next-Gen Campus <br />
              <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                IT Operations & Incident
              </span>{' '}
              Command
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Empowering students and faculty with instant AI diagnostic triage, direct departmental routing, automated SLA tracking, and centralized campus computing support.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('register')}
                className="px-7 py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-fuchsia-600 hover:from-sky-400 hover:via-indigo-500 hover:to-fuchsia-500 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 group cursor-pointer transition-all"
              >
                <span>Register University Profile</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('login')}
                className="px-7 py-4 rounded-2xl font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300/80 dark:border-slate-800 hover:border-indigo-500 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-indigo-500" />
                <span>Sign In with Password</span>
              </motion.button>
            </div>

            {/* Value Indicators */}
            <div className="pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>AI Symptom Diagnostics</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>&lt; {stats.systemSettings?.slaCriticalHours || 4}h Critical SLA</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Salted SHA-256 Security</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-indigo-500" />
                <span>Ext. {stats.systemSettings?.emergencyExtension || '4400'}</span>
              </span>
            </div>
          </motion.div>

          {/* Right Column: Architectural Hero Visual with Real Telemetry */}
          <motion.div 
            initial={{ opacity: 0, x: 25, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-2xl shadow-indigo-500/25 group">
              <div className="relative rounded-[1.45rem] overflow-hidden bg-slate-950">
                <img 
                  src="/src/assets/images/hero_university_tech_hub_1793980620705.jpg"
                  alt="University Technical Operations Center"
                  className="w-full h-[360px] sm:h-[430px] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
                
                {/* Overlay Metadata Bar */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold">{stats.systemSettings?.universityName || 'Central Operations'}</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md">
                    24/7 Operations
                  </span>
                </div>
              </div>

              {/* Real Telemetry Floating Badge 1: Top Right */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-5 -right-5 p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl flex items-center gap-3 text-left max-w-[210px] hidden sm:flex"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Total Tickets</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{stats.totalTickets} Recorded</div>
                </div>
              </motion.div>

              {/* Real Telemetry Floating Badge 2: Bottom Left */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-5 -left-5 p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl flex items-center gap-3 text-left max-w-[210px] hidden sm:flex"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">SLA Adherence</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{stats.resolutionRate}% Compliance</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Real Campus Bulletin Notice (if announcements exist in database) */}
        {stats.activeAnnouncements && stats.activeAnnouncements.length > 0 && (
          <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/30 text-left flex items-start gap-4 shadow-sm backdrop-blur-md">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300">
                  Campus Announcement
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {stats.activeAnnouncements[0].title}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {stats.activeAnnouncements[0].content}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: LIVE BACKEND TELEMETRY STRIP */}
      <section className="py-10 bg-white/70 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            
            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Verified Profiles</span>
                <GraduationCap className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono mt-2">
                {loadingStats ? '...' : stats.totalUsers + stats.totalFaculty}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {stats.totalUsers} Students • {stats.totalFaculty} Faculty
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>System Tickets</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-2">
                {loadingStats ? '...' : stats.totalTickets}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {stats.openTickets} in active triage • {stats.resolvedTickets} resolved
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Academic Departments</span>
                <Building2 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono mt-2">
                {loadingStats ? '...' : stats.departmentsCount}
              </div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1">
                Active Institutional Units
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>SLA Resolution Rate</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-2">
                {loadingStats ? '...' : `${stats.resolutionRate}%`}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                Live Resolution Metric
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE INCIDENT RESOLUTION TIMELINE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-left max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
            <Clock className="w-4 h-4" />
            <span>Standard Operating Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            The Incident Resolution Timeline
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Click through each operational stage below to explore how tickets transition from reporting through AI evaluation, departmental assignment, and verified closure.
          </p>
        </div>

        {/* Stage Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-8">
          {timelineStages.map((stage, idx) => {
            const isActive = activeTimelineStage === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTimelineStage(idx)}
                className={`py-3 px-3 rounded-xl text-left transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase font-mono ${isActive ? 'text-cyan-200' : 'text-slate-400'}`}>
                    Stage {stage.step}
                  </span>
                </div>
                <div className="text-xs font-extrabold truncate mt-1">
                  {stage.stageName}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Display Card */}
        <AnimatePresence mode="wait">
          {(() => {
            const currentStage = timelineStages[activeTimelineStage];
            return (
              <motion.div
                key={activeTimelineStage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl p-6 sm:p-9 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-2xl text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Detail Column */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-md">
                        {currentStage.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${currentStage.badgeColor}`}>
                            {currentStage.badge}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                          {currentStage.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {currentStage.description}
                    </p>

                    <div className="pt-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Operational Execution Steps:
                      </div>
                      <div className="space-y-2">
                        {currentStage.actionDetails.map((action, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Telemetry Snapshot Card */}
                  <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-inner space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-500" />
                        Stage Specification
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                        Stage {currentStage.step} of 05
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Responsible Role</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                          {currentStage.systemTelemetry.actor}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">SLA Progression</div>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                          {currentStage.systemTelemetry.slaStatus}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Underlying Protocol</div>
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                          {currentStage.systemTelemetry.protocol}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveTimelineStage(prev => (prev > 0 ? prev - 1 : 4))}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        ← Previous Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTimelineStage(prev => (prev < 4 ? prev + 1 : 0))}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Next Stage →
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </section>

      {/* SECTION 4: LIVE BACKEND-POWERED AI DIAGNOSTICS */}
      <section className="py-20 bg-slate-50/70 dark:bg-slate-950/60 border-y border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Backend AI Diagnostic Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Test the Live AI Triage Endpoint
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Submit any technical symptom to query the backend AI assistant (<code className="font-mono text-xs bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">/api/ai/assistant</code>) in real-time.
            </p>
          </div>

          {/* AI Query Form */}
          <form onSubmit={handleQueryAi} className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  placeholder="Describe your technical issue (e.g. 'Classroom 204 projector HDMI not detecting laptop')..."
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-fuchsia-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Analyzing Query...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Triage</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Real Backend AI Output Card */}
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-cyan-500/10 border border-indigo-500/30 text-left shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                      Live Backend Diagnostics Output
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Query Evaluation Results
                    </h4>
                  </div>
                </div>

                {aiResponse.recommendation && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Priority:
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-black ${
                      aiResponse.recommendation.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                      aiResponse.recommendation.priority === 'HIGH' ? 'bg-amber-500 text-white' :
                      'bg-sky-500 text-white'
                    }`}>
                      {aiResponse.recommendation.priority}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 text-xs space-y-3">
                {aiResponse.recommendation && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Inferred Category:</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {aiResponse.recommendation.category}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-indigo-500/20">
                  <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Technical Advisory</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {aiResponse.reply}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ready to submit this incident to campus technicians?
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('register')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Register / Sign In to Submit →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </section>

      {/* SECTION 5: REAL ACADEMIC DEPARTMENTS & FACILITIES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-left max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            <Building2 className="w-4 h-4" />
            <span>Academic Units</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Connected Academic Departments
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Departments registered in the university database with active technician routing and incident response.
          </p>
        </div>

        {/* Real Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {stats.departments.map((dept, idx) => (
            <motion.div
              key={dept.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-emerald-500 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {dept.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {dept.activeTicketsCount} Active Tickets
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {dept.name}
                </h4>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Head of Department</div>
                  <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                    {dept.headOfDepartment}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Integrated Unit</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Online</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 6: CORE SERVICES CATALOG */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Enterprise Service Matrix
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              Campus Support Scope
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {services.map((svc, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-indigo-500">
                      {svc.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {svc.meta}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {svc.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {svc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ SEARCH & ACCORDION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-left mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Instant Guidance
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Guidelines on incident reporting, password authentication, and SLA response windows.
          </p>

          {/* FAQ Search Bar */}
          <div className="relative mt-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={faqSearch}
              onChange={e => setFaqSearch(e.target.value)}
              placeholder="Search policies, SLAs, or Wi-Fi connectivity..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors text-left"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full text-left p-5 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${expandedFaq === i ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`} />
              </button>
              {expandedFaq === i && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
