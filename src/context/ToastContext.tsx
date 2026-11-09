import React, { createContext, useContext, useState, useEffect } from 'react';
import { ToastNotification } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Ticket, X, Volume2, VolumeX, Bell } from 'lucide-react';

interface ToastContextType {
  toasts: ToastNotification[];
  history: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  clearHistory: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [history, setHistory] = useState<ToastNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play subtle audio tone using Web Audio API
  const playBeep = (type: ToastNotification['type']) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'SUCCESS') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      } else if (type === 'ERROR' || type === 'WARNING') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.08);
      } else {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      }

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.26);
    } catch (e) {
      // AudioContext not supported or restricted
    }
  };

  const addToast = (type: ToastNotification['type'], title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastNotification = {
      id,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    setHistory(prev => [newToast, ...prev.slice(0, 29)]);
    playBeep(type);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearHistory = () => setHistory([]);

  // Listen to Server-Sent Events for live real-time notifications
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'NEW_TICKET') {
            addToast('TICKET_UPDATE', `New Ticket Generated: ${parsed.data.ticketId}`, parsed.data.title);
          } else if (parsed.type === 'TICKET_UPDATED') {
            addToast('INFO', `Ticket Status Updated: ${parsed.data.ticketId}`, `Status moved to ${parsed.data.status}`);
          } else if (parsed.type === 'NEW_ANNOUNCEMENT') {
            addToast('WARNING', `University Announcement`, parsed.data.title);
          }
        } catch (e) {
          // ignore parsing ping
        }
      };
    } catch (e) {
      // SSE not available
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, history, addToast, removeToast, clearHistory, soundEnabled, setSoundEnabled }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-20 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map(toast => {
          let borderCol = 'border-blue-500/30';
          let bgGradient = 'from-slate-900/90 to-blue-950/90';
          let icon = <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;

          if (toast.type === 'SUCCESS') {
            borderCol = 'border-emerald-500/40';
            bgGradient = 'from-slate-900/90 to-emerald-950/90';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
          } else if (toast.type === 'ERROR') {
            borderCol = 'border-rose-500/40';
            bgGradient = 'from-slate-900/90 to-rose-950/90';
            icon = <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
          } else if (toast.type === 'WARNING') {
            borderCol = 'border-amber-500/40';
            bgGradient = 'from-slate-900/90 to-amber-950/90';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
          } else if (toast.type === 'TICKET_UPDATE') {
            borderCol = 'border-cyan-500/40';
            bgGradient = 'from-slate-900/90 to-cyan-950/90';
            icon = <Ticket className="w-5 h-5 text-cyan-400 flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto backdrop-blur-xl bg-gradient-to-r ${bgGradient} border ${borderCol} p-4 rounded-xl shadow-2xl text-slate-100 flex items-start gap-3 transition-all duration-300 transform translate-y-0`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold tracking-wide text-white truncate">{toast.title}</h4>
                  <span className="text-[10px] text-slate-400">{toast.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
