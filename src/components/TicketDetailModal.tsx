import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Ticket, TicketStatus } from '../types';
import { 
  X, 
  Send, 
  Printer, 
  RotateCw
} from 'lucide-react';

interface TicketDetailModalProps {
  ticketId: string;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticketId, onClose }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [facultyRoster, setFacultyRoster] = useState<any[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/users?role=FACULTY')
        .then(r => r.json())
        .then(data => setFacultyRoster(data))
        .catch(() => {});
    }
  }, [ticketId]);

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          performerRole: user?.role || 'ADMIN',
          performerName: user?.fullName || 'Administrator'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('ERROR', 'Error', data.error || 'Could not change status.');
        return;
      }
      addToast('SUCCESS', 'Status Updated', `Ticket marked as ${status}`);
      fetchTicket();
    } catch (e) {
      addToast('ERROR', 'Error', 'Failed to update status.');
    }
  };

  const handleAssign = async () => {
    if (!selectedFaculty) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyEmail: selectedFaculty,
          performerName: user?.fullName
        })
      });
      if (res.ok) {
        addToast('SUCCESS', 'Faculty Assigned', 'Ticket assigned to selected faculty.');
        fetchTicket();
      }
    } catch (e) {
      addToast('ERROR', 'Error', 'Could not assign faculty.');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage.trim(),
          senderId: user?.email || 'admin@stsu.edu',
          senderName: user?.fullName || 'Staff Specialist',
          senderRole: user?.role || 'ADMIN'
        })
      });
      if (res.ok) {
        setReplyMessage('');
        fetchTicket();
      }
    } catch (e) {
      addToast('ERROR', 'Error', 'Could not send reply.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white flex items-center gap-3 shadow-xl">
          <RotateCw className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Loading ticket details...</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center shadow-xl">
          <p className="text-sm text-slate-600 dark:text-slate-300">Ticket not found or has been removed.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-left space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs">
              <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                {ticket.ticketId}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className={`font-semibold ${
                ticket.priority === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' :
                ticket.priority === 'HIGH' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
              }`}>
                {ticket.priority} Priority
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                {ticket.status}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{ticket.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Submitter:</span>
            <strong className="text-slate-900 dark:text-white">{ticket.creatorName}</strong>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Department:</span>
            <strong className="text-slate-900 dark:text-white">{ticket.department}</strong>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Assigned Faculty:</span>
            <strong className="text-blue-600 dark:text-cyan-400">{ticket.assignedFacultyName}</strong>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">SLA Target:</span>
            <strong className="text-amber-600 dark:text-amber-400 font-mono">{ticket.slaHours} Hours</strong>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Problem Description</h4>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>

        {/* Resolution details (if available) */}
        {ticket.resolutionDetails && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Documented Resolution:</span>
            <p className="text-slate-800 dark:text-slate-200">{ticket.resolutionDetails}</p>
          </div>
        )}

        {/* Admin / Faculty Controls */}
        {(user?.role === 'ADMIN' || user?.role === 'FACULTY') && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Triage & Status Transitions</h4>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange('IN PROGRESS')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 text-xs font-semibold transition-colors cursor-pointer"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleStatusChange('WAITING FOR USER')}
                className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60 text-xs font-semibold transition-colors cursor-pointer"
              >
                Wait for Submitter
              </button>
              <button
                onClick={() => handleStatusChange('ESCALATED')}
                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/60 text-xs font-semibold transition-colors cursor-pointer"
              >
                Escalate Ticket
              </button>
              <button
                onClick={() => handleStatusChange('RESOLVED')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 text-xs font-semibold transition-colors cursor-pointer"
              >
                Mark Resolved
              </button>
            </div>

            {/* Admin Assign Faculty Control */}
            {user?.role === 'ADMIN' && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">Assign Faculty:</span>
                <select
                  value={selectedFaculty}
                  onChange={e => setSelectedFaculty(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white flex-1"
                >
                  <option value="">Select Faculty Specialist...</option>
                  {facultyRoster.map(f => (
                    <option key={f.id} value={f.email}>{f.fullName} ({f.department})</option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Assign
                </button>
              </div>
            )}
          </div>
        )}

        {/* Message Thread */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Conversation & Updates</h4>
          
          <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1">
            {ticket.messages?.map(m => (
              <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  <span>{m.senderName} ({m.senderRole})</span>
                  <span className="font-mono text-slate-400 tabular-nums">{new Date(m.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendReply} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Post update or instructions..."
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
