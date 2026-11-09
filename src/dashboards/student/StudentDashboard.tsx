import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import { 
  GraduationCap, 
  PlusCircle, 
  Ticket as TicketIcon, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Search, 
  Bot, 
  BookOpen, 
  Star, 
  Send, 
  FileText, 
  Download, 
  User, 
  RotateCw, 
  ExternalLink,
  ChevronRight,
  Wifi,
  Cpu,
  Monitor
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenTicket: (ticketId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenTicket }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'MY_TICKETS' | 'CREATE' | 'LIVE_TRACK' | 'AI_ASSISTANT' | 'KB' | 'PROFILE'>('MY_TICKETS');
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Create Ticket Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Wi-Fi and Internet');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');
  const [newLocation, setNewLocation] = useState('');
  const [creating, setCreating] = useState(false);

  // AI Assistant Chat State
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; recommendation?: any }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your STSU AI Technical Assistant. Ask me anything about campus Wi-Fi (STSU-Secure), Academic LMS, laboratory software installations, or projector troubleshooting. I can also diagnose your issue and recommend the right ticket category!'
    }
  ]);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Chat message state on selected ticket
  const [studentReply, setStudentReply] = useState('');

  const fetchStudentData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?role=STUDENT&email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
      setLoading(false);
    } catch (e) {
      addToast('ERROR', 'Error', 'Could not refresh student tickets.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  // Handle AI Symptom Diagnostic Query
  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const query = aiInput.trim();
    setAiChatHistory(prev => [...prev, { sender: 'user', text: query }]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await res.json();
      setAiChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply,
          recommendation: data.recommendation
        }
      ]);
      setAiLoading(false);
    } catch (e) {
      setAiChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Central IT Diagnostics: Please verify your connection to STSU-Secure or submit a ticket directly for human faculty assistance.'
        }
      ]);
      setAiLoading(false);
    }
  };

  const handleApplyAiRecommendation = (rec: any) => {
    if (rec) {
      setNewCategory(rec.category);
      setNewPriority(rec.priority);
      setActiveTab('CREATE');
      addToast('INFO', 'Applied AI Parameters', `Category set to '${rec.category}' with priority '${rec.priority}'`);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) {
      addToast('WARNING', 'Missing Fields', 'Please supply both a title and description.');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          priority: newPriority,
          location: newLocation,
          creatorEmail: user?.email,
          creatorName: user?.fullName,
          creatorRole: 'STUDENT',
          department: user?.department
        })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast('ERROR', 'Creation Failed', data.error || 'Failed to submit ticket.');
        setCreating(false);
        return;
      }

      addToast('SUCCESS', 'Ticket Successfully Created!', `Generated Sequence ID: ${data.ticketId}`);
      setNewTitle('');
      setNewDesc('');
      setCreating(false);
      fetchStudentData();
      setSelectedTicket(data);
      setActiveTab('LIVE_TRACK');
    } catch (e) {
      addToast('ERROR', 'Network Error', 'Could not create ticket.');
      setCreating(false);
    }
  };

  const handleSendStudentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !studentReply.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: studentReply.trim(),
          senderId: user?.email,
          senderName: user?.fullName,
          senderRole: 'STUDENT'
        })
      });
      if (res.ok) {
        setStudentReply('');
        fetchStudentData();
        const updated = await fetch(`/api/tickets/${selectedTicket.ticketId}`).then(r => r.json());
        setSelectedTicket(updated);
      }
    } catch (e) {
      addToast('ERROR', 'Error', 'Failed to send message.');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.ticketId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment
        })
      });
      if (res.ok) {
        addToast('SUCCESS', 'Feedback Recorded', 'Thank you for rating our university technical service!');
        setFeedbackComment('');
        fetchStudentData();
      }
    } catch (e) {
      addToast('ERROR', 'Error', 'Could not submit feedback.');
    }
  };

  const categories = [
    'Wi-Fi and Internet',
    'Computer Hardware',
    'Software Installation',
    'University Portal',
    'LMS Issues',
    'Email Account Problems',
    'Printer Problems',
    'Projector Problems',
    'Laboratory Equipment',
    'Smart Classroom',
    'Server Issues',
    'Cybersecurity',
    'Account Access',
    'Other Technical Issues'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Dual Theme Enterprise Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Student Academic Technology Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome, {user?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Roll ID: <strong className="text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">{user?.studentId || 'STU-2026-X'}</strong> · {user?.course || 'Academic Computing'} · {user?.department}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('CREATE')}
              className="px-4 py-2.5 rounded-xl bg-brand hover:opacity-95 text-xs font-bold text-white shadow-brand-glow flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Ticket</span>
            </button>

            <button
              onClick={() => setActiveTab('AI_ASSISTANT')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-brand-accent" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-6 mt-6 border-t border-slate-200 dark:border-slate-800/80 scrollbar-none">
          {[
            { id: 'MY_TICKETS', label: `My Tickets (${tickets.length})`, icon: TicketIcon },
            { id: 'CREATE', label: 'Create Support Ticket', icon: PlusCircle },
            { id: 'LIVE_TRACK', label: 'Live Ticket Tracking', icon: Clock },
            { id: 'AI_ASSISTANT', label: 'AI Technical Assistant', icon: Bot },
            { id: 'KB', label: 'Campus Knowledge Base', icon: BookOpen },
            { id: 'PROFILE', label: 'My Credentials', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand text-white shadow-brand-glow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: MY TICKETS */}
      {activeTab === 'MY_TICKETS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Submitted</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">{tickets.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">Open Tickets</span>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 font-mono tabular-nums mt-1">
                {tickets.filter(t => t.status === 'OPEN').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">In Progress</span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums mt-1">
                {tickets.filter(t => t.status === 'IN PROGRESS' || t.status === 'ASSIGNED').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                {tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
              </div>
            </div>
          </div>

          {/* Tickets Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-slate-500 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
                You have not submitted any technical tickets yet.
              </div>
            ) : (
              tickets.map(t => (
                <div
                  key={t.ticketId}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 tabular-nums">{t.ticketId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'RESOLVED' || t.status === 'CLOSED'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                          : t.status === 'OPEN'
                          ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                          : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{t.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{t.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Assigned: <strong className="text-slate-700 dark:text-slate-200">{t.assignedFacultyName}</strong></span>
                    <button
                      onClick={() => {
                        setSelectedTicket(t);
                        setActiveTab('LIVE_TRACK');
                      }}
                      className="text-indigo-600 dark:text-emerald-400 hover:text-indigo-500 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Live Track</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE NEW TICKET */}
      {activeTab === 'CREATE' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Generate Support Ticket</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Your ticket will be assigned a unique sequence number, logged into the university audit registry, and routed to your department support team.
            </p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Subject / Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cannot obtain DHCP IP address on STSU-Secure in Turing Lab"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c, i) => (
                    <option key={i} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level *</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="LOW">LOW (48h SLA)</option>
                  <option value="MEDIUM">MEDIUM (24h SLA)</option>
                  <option value="HIGH">HIGH (12h SLA)</option>
                  <option value="CRITICAL">CRITICAL (4h SLA)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Campus Location / Lab Station</label>
              <input
                type="text"
                placeholder="e.g. Turing AI Lab - Workstation 14"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Technical Description *</label>
              <textarea
                rows={5}
                required
                placeholder="Describe what occurred, any error codes shown on screen, and troubleshooting steps you already tried..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{creating ? 'Recording Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LIVE TICKET TRACKING */}
      {activeTab === 'LIVE_TRACK' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Select Ticket */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Select Ticket to Track
            </span>
            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No tickets available to track.</p>
            ) : (
              tickets.map(t => (
                <div
                  key={t.ticketId}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTicket?.ticketId === t.ticketId
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-blue-600 dark:text-cyan-400 tabular-nums">{t.ticketId}</span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{t.status}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">{t.title}</h5>
                </div>
              ))
            )}
          </div>

          {/* Timeline and Details */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {selectedTicket ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
                  <div>
                    <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-cyan-400 tabular-nums">{selectedTicket.ticketId}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedTicket.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Category: {selectedTicket.category} · Priority: <strong className="text-slate-700 dark:text-slate-200">{selectedTicket.priority}</strong>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 self-start sm:self-auto">
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Audit & Stage Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Progress Timeline & Audit Trail
                  </h4>
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {selectedTicket.history?.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-3 relative pl-6">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute left-2 top-1.5 ring-4 ring-white dark:ring-slate-900" />
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">{h.action}</span>
                            <span className="text-[10px] text-slate-500 font-mono tabular-nums">{new Date(h.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{h.details}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Logged by: {h.performedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Faculty Contact Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Assigned Faculty Incharge</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{selectedTicket.assignedFacultyName}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{selectedTicket.assignedFacultyId}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    SLA: {selectedTicket.slaHours}h target
                  </span>
                </div>

                {/* Resolution Details (if resolved) */}
                {selectedTicket.resolutionDetails && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/40 text-xs space-y-1">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Official Resolution Note:</span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{selectedTicket.resolutionDetails}</p>
                  </div>
                )}

                {/* 5-Star Feedback Form if Resolved */}
                {selectedTicket.status === 'RESOLVED' && !selectedTicket.feedback && (
                  <form onSubmit={handleSubmitFeedback} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rate Technical Resolution Satisfaction</h4>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className={`p-1 ${star <= feedbackRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Optional feedback comment on resolution speed and quality..."
                      value={feedbackComment}
                      onChange={e => setFeedbackComment(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Submit Feedback
                    </button>
                  </form>
                )}

                {/* Live Message Thread */}
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Direct Faculty Communication
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {selectedTicket.messages?.map(m => (
                      <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex justify-between items-center font-bold text-[11px] text-slate-700 dark:text-slate-300">
                          <span>{m.senderName} ({m.senderRole})</span>
                          <span className="text-[10px] text-slate-500 font-mono tabular-nums">{new Date(m.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{m.message}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendStudentReply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reply to faculty with updates or screenshots..."
                      value={studentReply}
                      onChange={e => setStudentReply(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Select a ticket to inspect live tracking and faculty messages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AI TECHNICAL ASSISTANT */}
      {activeTab === 'AI_ASSISTANT' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto shadow-sm flex flex-col h-[600px]">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">STSU AI Technical Support Assistant</h3>
                <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-mono">Powered by Google Gemini</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Active Diagnostics
            </span>
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
            {[
              'Cannot connect to STSU-Secure Wi-Fi on Windows 11',
              'MATLAB license error: Licensing Error -9,57',
              'Laboratory 3 Workstation 12 screen flickering',
              'Reset University Portal password procedure'
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => setAiInput(prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/80 dark:hover:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Window */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
            {aiChatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200'
                }`}>
                  <div className={`font-bold text-[10px] mb-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                    {msg.sender === 'user' ? 'You' : 'STSU AI Assistant'}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Recommendation Action */}
                  {msg.recommendation && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-indigo-600 dark:text-cyan-300 font-mono">
                        Category: {msg.recommendation.category} | Priority: {msg.recommendation.priority}
                      </span>
                      <button
                        onClick={() => handleApplyAiRecommendation(msg.recommendation)}
                        className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Create Ticket with these values
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* AI Input Form */}
          <form onSubmit={handleAiQuery} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask technical question or describe error code..."
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'Analyzing...' : 'Ask'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: CAMPUS KNOWLEDGE BASE */}
      {activeTab === 'KB' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Campus Self-Service Technical Knowledge Base</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Official IT walk-throughs and network configurations maintained by Central IT Infrastructure.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Campus Wi-Fi 6E</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Connect to SSID 'STSU-Secure'. Use your full university email and LDAP password. Set EAP to PEAP (MSCHAPv2).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <Cpu className="w-5 h-5 text-indigo-600 dark:text-cyan-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Lab Workstation Access</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Login to Turing AI & IT Labs using your student roll number and central password. GPU allocations reset nightly at 00:00 UTC.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <Monitor className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Academic Software Keys</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Download MATLAB, Autodesk AutoCAD, and JetBrains IDEs using your student email via software.stsu.edu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STUDENT PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xl mx-auto space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Account & Credentials</h3>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Student Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{user?.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Student Roll ID:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-cyan-300 tabular-nums">{user?.studentId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Official Email:</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">{user?.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Department:</span>
              <span className="text-slate-900 dark:text-white">{user?.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Account State:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                ACTIVE & VERIFIED
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
