import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ticket, User, ITAsset, Laboratory, SmartClassroom, Announcement, AuditLog, TicketStatus, TicketPriority } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Ticket as TicketIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  Download, 
  Settings, 
  FileText, 
  Cpu, 
  Monitor, 
  Bell, 
  Shield, 
  RotateCw, 
  ChevronRight, 
  MoreVertical,
  Check,
  X,
  Send
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenTicket: (ticketId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenTicket }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TICKETS' | 'USERS' | 'ASSETS' | 'ANNOUNCEMENTS' | 'SETTINGS' | 'AUDIT_LOGS'>('OVERVIEW');
  const [loading, setLoading] = useState(true);

  // Data states
  const [overviewMetrics, setOverviewMetrics] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [assets, setAssets] = useState<ITAsset[]>([]);
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [classrooms, setClassrooms] = useState<SmartClassroom[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Filter & Search states
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // New Announcement Modal / Form
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState<'MAINTENANCE' | 'NETWORK' | 'ACADEMIC' | 'URGENT'>('MAINTENANCE');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ovRes, tRes, uRes, astRes, labRes, clsRes, annRes, deptRes] = await Promise.all([
        fetch('/api/admin/overview').then(r => r.json()),
        fetch('/api/tickets?role=ADMIN').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/modules/assets').then(r => r.json()),
        fetch('/api/modules/labs').then(r => r.json()),
        fetch('/api/modules/classrooms').then(r => r.json()),
        fetch('/api/modules/announcements').then(r => r.json()),
        fetch('/api/admin/departments').then(r => r.json())
      ]);

      setOverviewMetrics(ovRes);
      setTickets(tRes);
      setUsersList(uRes);
      setAssets(astRes);
      setLabs(labRes);
      setClassrooms(clsRes);
      setAnnouncements(annRes);
      setDepartments(deptRes);
      setAuditLogs(ovRes.recentAuditLogs || []);
      setLoading(false);
    } catch (e) {
      addToast('ERROR', 'Data Load Error', 'Could not refresh administrative records.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleToggleUserStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) {
        addToast('ERROR', 'Action Blocked', data.error || 'Failed to toggle status.');
        return;
      }
      addToast('SUCCESS', 'Account Status Updated', `Account is now ${data.isActive ? 'Active' : 'Suspended'}`);
      fetchAllData();
    } catch (e) {
      addToast('ERROR', 'Network Error', 'Could not update user state.');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    try {
      const res = await fetch('/api/modules/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAnnTitle,
          content: newAnnContent,
          category: newAnnCategory,
          targetAudience: 'ALL',
          creatorName: user?.fullName || 'Chief Information Officer'
        })
      });
      if (res.ok) {
        addToast('SUCCESS', 'Announcement Published', 'Campus-wide technical alert broadcasted.');
        setNewAnnTitle('');
        setNewAnnContent('');
        fetchAllData();
      }
    } catch (e) {
      addToast('ERROR', 'Broadcast Error', 'Could not post announcement.');
    }
  };

  const handleExportPdfReport = () => {
    window.print();
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.ticketId.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          t.title.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          t.creatorName.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredUsers = usersList.filter(u => {
    if (userRoleFilter === 'ALL') return true;
    return u.role === userRoleFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Console Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Central IT Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              University Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Logged in as <strong className="text-slate-900 dark:text-slate-100">{user?.fullName}</strong> · Central IT Infrastructure Division
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={handleExportPdfReport}
              className="px-4 py-2 rounded-xl bg-brand hover:opacity-95 text-xs font-bold text-white shadow-brand-glow flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Summary</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          {[
            { id: 'OVERVIEW', label: 'Telemetry & Analytics', icon: BarChart3 },
            { id: 'TICKETS', label: `Tickets Registry (${tickets.length})`, icon: TicketIcon },
            { id: 'USERS', label: `Users & Faculty (${usersList.length})`, icon: Users },
            { id: 'ASSETS', label: 'IT Assets & Labs', icon: Cpu },
            { id: 'ANNOUNCEMENTS', label: 'Announcements', icon: Bell },
            { id: 'AUDIT_LOGS', label: 'Audit Logs', icon: FileText },
            { id: 'SETTINGS', label: 'System Configuration', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
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

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'OVERVIEW' && overviewMetrics && (
        <div className="space-y-6">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Total Enrolled Students
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {overviewMetrics.metrics.totalStudents}
              </div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">Verified student accounts</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Active Faculty Members
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {overviewMetrics.metrics.totalFaculty}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">Department support leads</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Open & Pending Tickets
              </span>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                {overviewMetrics.metrics.openTickets + overviewMetrics.metrics.inProgressTickets}
              </div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">Under active review</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Resolved Tickets
              </span>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {overviewMetrics.metrics.resolvedTickets}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">SLA Compliance: {overviewMetrics.metrics.slaComplianceRate}%</p>
            </div>
          </div>

          {/* Department Workloads & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            
            {/* Department Breakdown */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Departmental Support Load</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-normal">Active Distribution</span>
              </h3>

              <div className="space-y-3">
                {overviewMetrics.departmentStats.map((d: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">{d.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Support Staff: {d.staffCount} technicians</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {d.totalTickets} tickets
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Issue Categories Reported</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-normal">Real-Time Counts</span>
              </h3>

              <div className="space-y-2">
                {Object.entries(overviewMetrics.categoryCounts).map(([cat, count]: [string, any], idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{cat}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">{count} occurrences</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent System Activity */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Recent Audit & Security Logs</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold mr-2">[{log.action}]</span>
                    <span className="text-slate-800 dark:text-slate-200">{log.details}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] tabular-nums">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TICKETS MANAGEMENT */}
      {activeTab === 'TICKETS' && (
        <div className="space-y-6 text-left">
          
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search ticket ID, title, submitter..."
                value={ticketSearch}
                onChange={e => setTicketSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN PROGRESS">IN PROGRESS</option>
                <option value="WAITING FOR USER">WAITING FOR USER</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Ticket ID</th>
                    <th className="py-3.5 px-4 font-bold">Subject & Category</th>
                    <th className="py-3.5 px-4 font-bold">Priority</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Submitter</th>
                    <th className="py-3.5 px-4 font-bold">Assigned Faculty</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No tickets match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map(t => {
                      let priorityClass = 'text-slate-500 font-medium';
                      if (t.priority === 'CRITICAL') priorityClass = 'text-rose-600 dark:text-rose-400 font-bold';
                      else if (t.priority === 'HIGH') priorityClass = 'text-amber-600 dark:text-amber-400 font-bold';
                      else if (t.priority === 'MEDIUM') priorityClass = 'text-blue-600 dark:text-blue-400 font-medium';

                      let statusClass = 'text-slate-600 dark:text-slate-300 font-medium';
                      if (t.status === 'RESOLVED' || t.status === 'CLOSED') statusClass = 'text-emerald-600 dark:text-emerald-400 font-semibold';
                      else if (t.status === 'OPEN') statusClass = 'text-blue-600 dark:text-cyan-400 font-semibold';
                      else if (t.status === 'IN PROGRESS') statusClass = 'text-purple-600 dark:text-purple-400 font-semibold';

                      return (
                        <tr key={t.ticketId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-cyan-400 tabular-nums">
                            {t.ticketId}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{t.title}</div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.category}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={priorityClass}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={statusClass}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-900 dark:text-white font-medium">{t.creatorName}</div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.department}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {t.assignedFacultyName}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onOpenTicket(t.ticketId)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-900/30 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & FACULTY MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Filter Role:</span>
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students Only</option>
                <option value="FACULTY">Faculty Only</option>
                <option value="ADMIN">Administrators</option>
              </select>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing {filteredUsers.length} verified accounts
            </span>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Name & Email</th>
                  <th className="py-3.5 px-4 font-bold">Role</th>
                  <th className="py-3.5 px-4 font-bold">ID / Designation</th>
                  <th className="py-3.5 px-4 font-bold">Department</th>
                  <th className="py-3.5 px-4 font-bold">Account State</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{u.fullName}</div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {u.studentId || u.facultyId || u.designation || 'System Admin'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{u.department}</td>
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold text-[11px] ${
                        u.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            u.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: IT ASSETS & LABS */}
      {activeTab === 'ASSETS' && (
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* IT Hardware Assets */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Central IT Asset Inventory</span>
                <span className="text-xs text-blue-600 dark:text-cyan-400 font-mono font-medium">{assets.length} Registered</span>
              </h3>

              <div className="space-y-3">
                {assets.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No hardware assets registered yet.</p>
                ) : (
                  assets.map(ast => (
                    <div key={ast.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{ast.assetTag}</span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                          {ast.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ast.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Location: {ast.location} · Last Service: {ast.lastMaintenance}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Academic Computing Laboratories */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Specialized Academic Laboratories</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">{labs.length} Facilities</span>
              </h3>

              <div className="space-y-3">
                {labs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No academic computing labs registered yet.</p>
                ) : (
                  labs.map(lab => (
                    <div key={lab.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">{lab.labCode}</span>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono">
                          {lab.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{lab.name}</h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                        <span>Faculty Lead: {lab.inChargeFaculty}</span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {lab.operationalStations}/{lab.workstationCount} Stations
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Create Announcement Form */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Publish Campus Alert</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Switch Firmware Upgrade"
                  value={newAnnTitle}
                  onChange={e => setNewAnnTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newAnnCategory}
                  onChange={e => setNewAnnCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MAINTENANCE">Scheduled Maintenance</option>
                  <option value="NETWORK">Campus Network Bulletin</option>
                  <option value="URGENT">Critical Incident Alert</option>
                  <option value="ACADEMIC">Academic IT Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Details & Impact</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe affected buildings, expected downtime, and workarounds..."
                  value={newAnnContent}
                  onChange={e => setNewAnnContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Notice</span>
              </button>
            </form>
          </div>

          {/* Active Announcements List */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Active Campus Bulletins</h3>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No active announcements currently posted.</p>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {ann.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{ann.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{ann.content}</p>
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      Dispatched by: {ann.createdBy}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Platform Audit Trail</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">SOC2 / FERPA Compliance Log</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">[{log.action}]</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">User: {log.userEmail}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 mt-1">{log.details}</p>
                </div>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap tabular-nums">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl space-y-6 shadow-sm text-left">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Central Support University IT Policy</h3>
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">SLA Target Parameters (Hours):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-rose-600 dark:text-rose-400 block font-bold">CRITICAL</span>
                  <span className="text-slate-900 dark:text-white text-base font-bold">4 hrs</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-amber-600 dark:text-amber-400 block font-bold">HIGH</span>
                  <span className="text-slate-900 dark:text-white text-base font-bold">12 hrs</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-blue-600 dark:text-blue-400 block font-bold">MEDIUM</span>
                  <span className="text-slate-900 dark:text-white text-base font-bold">24 hrs</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-emerald-600 dark:text-emerald-400 block font-bold">LOW</span>
                  <span className="text-slate-900 dark:text-white text-base font-bold">48 hrs</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Email & OTP Server Configuration</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                SMTP Relay: <strong className="text-slate-800 dark:text-slate-200">smtp.gmail.com (TLS Port 587)</strong><br />
                OTP Validity: <strong className="text-slate-800 dark:text-slate-200">5 Minutes</strong><br />
                Brute-force Threshold: <strong className="text-slate-800 dark:text-slate-200">5 failed attempts per window</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
