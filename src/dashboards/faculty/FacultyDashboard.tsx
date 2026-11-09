import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Search, 
  RotateCw, 
  BookOpen, 
  Send, 
  FileText, 
  Check, 
  User, 
  ChevronRight,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface FacultyDashboardProps {
  onOpenTicket: (ticketId: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onOpenTicket }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'ASSIGNED' | 'RESOLVE' | 'MESSAGING' | 'DEPT_POOL' | 'KB'>('ASSIGNED');
  const [loading, setLoading] = useState(true);
  const [facultyMetrics, setFacultyMetrics] = useState<any>(null);
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [deptTickets, setDeptTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Resolution form state
  const [resolutionNote, setResolutionNote] = useState('');
  const [rootCause, setRootCause] = useState('Configuration / Permission Adjustment');

  // Messaging state
  const [chatMessage, setChatMessage] = useState('');

  // Availability state
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchFacultyData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ovRes, tRes] = await Promise.all([
        fetch(`/api/faculty/overview?email=${encodeURIComponent(user.email)}`).then(r => r.json()),
        fetch(`/api/tickets?role=FACULTY&email=${encodeURIComponent(user.email)}`).then(r => r.json())
      ]);

      setFacultyMetrics(ovRes.metrics);
      setAssignedTickets(tRes.filter((t: Ticket) => t.assignedFacultyId.toLowerCase() === user.email.toLowerCase()));
      setDeptTickets(tRes.filter((t: Ticket) => t.assignedFacultyId === 'unassigned'));
      if (tRes.length > 0 && !selectedTicket) {
        setSelectedTicket(tRes[0]);
      }
      setLoading(false);
    } catch (e) {
      addToast('ERROR', 'Error', 'Could not refresh faculty queue.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, [user]);

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus, note?: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          performerRole: 'FACULTY',
          performerName: user?.fullName || 'Faculty Member',
          note: note || `Status progressed to ${newStatus}`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('ERROR', 'Transition Blocked', data.error || 'Failed to update ticket status.');
        return;
      }
      addToast('SUCCESS', 'Ticket Updated', `Status set to ${newStatus}`);
      fetchFacultyData();
    } catch (e) {
      addToast('ERROR', 'Network Error', 'Could not save status change.');
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!resolutionNote.trim()) {
      addToast('WARNING', 'Required Details', 'Please provide explicit resolution details before closing.');
      return;
    }

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RESOLVED',
          performerRole: 'FACULTY',
          performerName: user?.fullName || 'Faculty Member',
          note: `Resolved: ${resolutionNote}`,
          resolutionDetails: `[Root Cause: ${rootCause}] ${resolutionNote}`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('ERROR', 'Resolution Failed', data.error || 'Could not resolve ticket.');
        return;
      }
      addToast('SUCCESS', 'Ticket Successfully Resolved', `SLA SLA Met: ${selectedTicket.ticketId}`);
      setResolutionNote('');
      fetchFacultyData();
    } catch (e) {
      addToast('ERROR', 'Network Error', 'Could not record resolution.');
    }
  };

  const handleClaimTicket = async (ticketId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyEmail: user.email,
          performerName: user.fullName
        })
      });
      if (res.ok) {
        addToast('SUCCESS', 'Ticket Claimed', `Assigned ${ticketId} to your queue.`);
        fetchFacultyData();
      }
    } catch (e) {
      addToast('ERROR', 'Claim Error', 'Could not assign ticket.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !chatMessage.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatMessage.trim(),
          senderId: user?.email,
          senderName: user?.fullName,
          senderRole: 'FACULTY'
        })
      });
      if (res.ok) {
        setChatMessage('');
        fetchFacultyData();
        // Refresh selected ticket
        const updated = await fetch(`/api/tickets/${selectedTicket.ticketId}`).then(r => r.json());
        setSelectedTicket(updated);
      }
    } catch (e) {
      addToast('ERROR', 'Chat Error', 'Message could not be dispatched.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Faculty Academic IT Triage Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Faculty Technical Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {user?.fullName} · {user?.designation || 'Faculty Incharge'} · <strong className="text-blue-600 dark:text-cyan-400">{user?.department}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Availability Toggle */}
            <button
              onClick={() => {
                setIsAvailable(!isAvailable);
                addToast('INFO', 'Availability Updated', isAvailable ? 'Status set to: In Lecture / Off Duty' : 'Status set to: Available for Technical Triage');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{isAvailable ? 'Available for Triage' : 'In Lecture'}</span>
            </button>

            <button
              onClick={fetchFacultyData}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
              title="Refresh queue"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          {[
            { id: 'ASSIGNED', label: `My Assigned Queue (${assignedTickets.length})`, icon: Briefcase },
            { id: 'RESOLVE', label: 'Resolution Console', icon: CheckCircle2 },
            { id: 'MESSAGING', label: 'Student Communication', icon: MessageSquare },
            { id: 'DEPT_POOL', label: `Department Pool (${deptTickets.length})`, icon: Clock },
            { id: 'KB', label: 'Technical Guide Authoring', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-brand text-white shadow-brand-glow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      {facultyMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Assigned Tickets
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {facultyMetrics.totalAssigned}
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">Directly assigned</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Pending Resolution
            </span>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              {facultyMetrics.pendingCount}
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">Active investigations</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Resolved by You
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {facultyMetrics.resolvedCount}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Documented solutions</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Average Response
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {facultyMetrics.avgResponseHours}h
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Well within SLA</p>
          </div>
        </div>
      )}

      {/* TAB 1: ASSIGNED TICKETS */}
      {activeTab === 'ASSIGNED' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                My Direct Triage Queue
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {assignedTickets.length} cases assigned
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {assignedTickets.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Your assigned queue is completely clear.
                </div>
              ) : (
                assignedTickets.map(ticket => (
                  <div key={ticket.ticketId} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 tabular-nums">{ticket.ticketId}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ticket.priority === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60' :
                          ticket.priority === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60' :
                          'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                        }`}>
                          {ticket.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ticket.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{ticket.description}</p>
                      <div className="text-[11px] text-slate-500">
                        Submitter: <strong className="text-slate-700 dark:text-slate-300">{ticket.creatorName}</strong> · {ticket.department}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {ticket.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(ticket.ticketId, 'IN PROGRESS', 'Faculty initiated investigation')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-900/60"
                        >
                          Start Work
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setActiveTab('RESOLVE');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-900/60"
                      >
                        Resolve
                      </button>

                      <button
                        onClick={() => onOpenTicket(ticket.ticketId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESOLUTION CONSOLE */}
      {activeTab === 'RESOLVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Select Ticket to Resolve */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Select Ticket from Queue
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {assignedTickets.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No assigned tickets available.</p>
              ) : (
                assignedTickets.map(t => (
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
                      <span className="text-[10px] text-slate-500">{t.status}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">{t.title}</h5>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {selectedTicket ? (
              <form onSubmit={handleResolveTicket} className="space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                    Recording Official Resolution for:
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedTicket.ticketId} - {selectedTicket.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submitter: {selectedTicket.creatorName} ({selectedTicket.createdByUserId})</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Diagnosed Root Cause Category *
                  </label>
                  <select
                    value={rootCause}
                    onChange={e => setRootCause(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Network / Access Point Reassociation">Network / Access Point Reassociation</option>
                    <option value="Configuration / Permission Adjustment">Configuration / Permission Adjustment</option>
                    <option value="Hardware Peripheral Reset & Cable Replaced">Hardware Peripheral Reset & Cable Replaced</option>
                    <option value="Academic License Provisioned">Academic License Provisioned</option>
                    <option value="Account Password / MFA Sync">Account Password / MFA Sync</option>
                    <option value="User Training & Guidance Provided">User Training & Guidance Provided</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Formal Resolution Details & Guidance to Submitter *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Document the exact technical fix applied so the submitter and central IT maintain an audited record..."
                    value={resolutionNote}
                    onChange={e => setResolutionNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  Note: Resolving will mark the ticket status as <strong className="text-slate-900 dark:text-white">RESOLVED</strong>, notify the submitter, stop the SLA countdown, and invite their 5-star feedback rating.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Formal Resolution & Close SLA</span>
                </button>
              </form>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Select a ticket from the left panel to begin formal resolution.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT MESSAGING */}
      {activeTab === 'MESSAGING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Active Dialogue Threads
            </span>
            {assignedTickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active threads.</p>
            ) : (
              assignedTickets.map(t => (
                <div
                  key={t.ticketId}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTicket?.ticketId === t.ticketId
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500/50'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-blue-600 dark:text-cyan-400 tabular-nums">{t.ticketId}</span>
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums">{t.messages?.length || 0} msgs</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">{t.creatorName}</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{t.title}</p>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[500px]">
            {selectedTicket ? (
              <>
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedTicket.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Thread with: {selectedTicket.creatorName} ({selectedTicket.createdByUserId})</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Messages scroll */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                  {selectedTicket.messages?.map(m => {
                    const isMe = m.senderRole === 'FACULTY';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`p-3 rounded-2xl max-w-md text-xs ${
                          isMe
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200'
                        }`}>
                          <div className={`font-bold text-[10px] mb-1 ${isMe ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            {m.senderName} ({m.senderRole})
                          </div>
                          <p className="leading-relaxed">{m.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 font-mono">{new Date(m.timestamp).toLocaleTimeString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type diagnostic response or instructions to student..."
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Select a conversation thread to respond.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DEPARTMENT POOL */}
      {activeTab === 'DEPT_POOL' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unassigned Department Pool</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Newly reported issues awaiting faculty ownership.</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{deptTickets.length} Awaiting Claim</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {deptTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No unassigned tickets in the central pool right now.
              </div>
            ) : (
              deptTickets.map(ticket => (
                <div key={ticket.ticketId} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 tabular-nums">{ticket.ticketId}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{ticket.title}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Department: {ticket.department} · Submitter: {ticket.creatorName}</span>
                  </div>
                  <button
                    onClick={() => handleClaimTicket(ticket.ticketId)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Claim Ticket
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: KNOWLEDGE BASE CONTRIBUTOR */}
      {activeTab === 'KB' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Faculty Troubleshooting Guide Contributor</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish official departmental troubleshooting procedures for campus Wi-Fi, lab station setups, and academic software installations.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <span className="font-bold text-blue-600 dark:text-cyan-300">Published Departmental Standard Operating Procedures (SOPs):</span>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
              <li>Configuring Ubuntu 24.04 LTS for Turing Lab CUDA clusters</li>
              <li>Connecting macOS & Windows 11 to STSU-Secure 802.1X PEAP Authentication</li>
              <li>Activating Academic MATLAB Network Campus License via license.stsu.edu</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
