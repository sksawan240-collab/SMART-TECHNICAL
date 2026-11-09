import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Laptop, 
  ShieldCheck, 
  Headphones, 
  Mail, 
  PhoneCall, 
  Activity, 
  ArrowUp, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  Cpu,
  Wifi,
  Sparkles,
  Building2,
  Clock
} from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  const [stats, setStats] = useState({
    universityName: 'Smart Technical Support University',
    supportEmail: 'support@stsu.edu',
    emergencyExtension: '4400',
    slaCriticalHours: 4,
    departmentsCount: 4,
    totalTickets: 0,
    resolutionRate: 100
  });

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Fetch live system settings
    fetch('/api/stats/landing')
      .then(res => res.json())
      .then(data => {
        if (data.systemSettings) {
          setStats(prev => ({
            ...prev,
            universityName: data.systemSettings.universityName || prev.universityName,
            supportEmail: data.systemSettings.supportEmail || prev.supportEmail,
            emergencyExtension: data.systemSettings.emergencyExtension || prev.emergencyExtension,
            slaCriticalHours: data.systemSettings.slaCriticalHours || prev.slaCriticalHours,
            departmentsCount: data.departmentsCount || prev.departmentsCount,
            totalTickets: data.totalTickets || prev.totalTickets,
            resolutionRate: data.resolutionRate || prev.resolutionRate
          }));
        }
      })
      .catch(() => {});

    // Live clock update
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white/90 dark:bg-[#070b16]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 transition-colors text-left relative z-20">
      
      {/* Top Operations Ribbon */}
      <div className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/70 dark:bg-slate-900/40 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Incident Dispatch Active</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-indigo-500" />
              <span>Emergency IT Helpdesk: <strong>Ext. {stats.emergencyExtension}</strong></span>
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              <span>{stats.supportEmail}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Campus Local Time: <strong className="text-slate-800 dark:text-slate-200 font-bold">{currentTime || '--:--:--'}</strong></span>
            </span>
          </div>

        </div>
      </div>

      {/* Main Multi-Column Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Column 1: Identity & Security Governance (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div 
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
                <Laptop className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {stats.universityName}
                </div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                  Central IT Infrastructure Operations
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Integrated technical support ecosystem powering campus Wi-Fi networks, departmental computing laboratories, smart AV classrooms, and high-priority incident resolution.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Security & SLA Compliance</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 leading-normal">
                Protected by salted SHA-256 password hashing. Critical campus incidents enforced under a {stats.slaCriticalHours}-hour SLA threshold.
              </div>
            </div>
          </div>

          {/* Column 2: Portals & Navigation (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Portals</span>
            </div>
            <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setCurrentView('landing')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                  System Overview
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('login')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                  Sign In to Terminal
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('register')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                  Register Account
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('facilities')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                  Campus Facilities & Labs
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('knowledge-base')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                  Knowledge Base & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('system-status')} className="hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                  Live System Status & SLAs
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Technical Services (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Campus Services</span>
            </div>
            <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>Wi-Fi 6E Enterprise Roaming</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Computing Lab Workstations</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-500 shrink-0" />
                <span>Automated Gemini AI Triage</span>
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Real-Time SLA Escalation</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Centralized Session Security</span>
              </li>
            </ul>
          </div>

          {/* Column 4: NOC Telemetry & Location (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Network Operations Hub</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Physical Service Center</span>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  Tower Alpha • Level 2
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Central Computing Complex
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Live SLA Target:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.resolutionRate}% Compliance</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Recorded Incidents:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{stats.totalTickets} Tickets</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Operating Schedule: <strong>24/7/365 On-Call Dispatch</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar: Copyright & Scroll to Top */}
      <div className="border-t border-slate-200/80 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          
          <div>
            © 2026 {stats.universityName}. All rights reserved. Central Academic Infrastructure Platform.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px]">Direct Password Security Protocol</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer font-bold"
              title="Return to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </footer>
  );
};

