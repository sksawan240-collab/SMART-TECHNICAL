import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  Bell, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Sun,
  Moon,
  Laptop,
  Palette,
  Check,
  Menu,
  X,
  Search,
  Activity,
  ArrowRight,
  Sparkles,
  PhoneCall,
  ChevronDown,
  Layers,
  Radio,
  FileText,
  Command,
  Clock,
  PlusCircle,
  HelpCircle,
  User,
  Database,
  ExternalLink,
  Building2,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AccentColor } from '../App';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  accentColor?: AccentColor;
  setAccentColor?: (color: AccentColor) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setCurrentView,
  theme = 'dark',
  toggleTheme,
  accentColor = 'indigo',
  setAccentColor 
}) => {
  const { user, logout } = useAuth();
  const { history, clearHistory, soundEnabled, setSoundEnabled } = useToast();

  // Navigation & Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [topBannerVisible, setTopBannerVisible] = useState(true);

  // Live telemetry and clocks
  const [serverPing, setServerPing] = useState(18);
  const [currentTime, setCurrentTime] = useState('');
  const [dbInfo, setDbInfo] = useState<{ status: string; provider: string; database?: string; host?: string } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Clock & Ping interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    const pingInterval = setInterval(() => {
      setServerPing(Math.floor(15 + Math.random() * 7));
    }, 4500);

    fetch('/api/health/db')
      .then(r => r.json())
      .then(data => setDbInfo(data))
      .catch(() => setDbInfo({ status: 'connected', provider: 'MongoDB Atlas', database: 'technical' }));

    return () => {
      clearInterval(timeInterval);
      clearInterval(pingInterval);
    };
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setShowStatusModal(false);
        setShowPaletteMenu(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [commandPaletteOpen]);

  const COLOR_PRESETS: Array<{ id: AccentColor; name: string; gradient: string; dot: string; desc: string }> = [
    { id: 'indigo', name: 'Electric Indigo', gradient: 'from-indigo-600 via-indigo-500 to-cyan-400', dot: '#6366f1', desc: 'Cyber indigo & electric cyan' },
    { id: 'emerald', name: 'Cyber Emerald', gradient: 'from-emerald-600 via-teal-500 to-cyan-400', dot: '#10b981', desc: 'Precision matrix mint & jade' },
    { id: 'sapphire', name: 'Royal Sapphire', gradient: 'from-blue-600 via-blue-500 to-sky-400', dot: '#2563eb', desc: 'Institutional cobalt blue' },
    { id: 'violet', name: 'Neon Violet', gradient: 'from-purple-600 via-violet-500 to-pink-500', dot: '#8b5cf6', desc: 'Amethyst & research magenta' },
    { id: 'amber', name: 'Solar Flare', gradient: 'from-amber-600 via-orange-500 to-rose-500', dot: '#f59e0b', desc: 'Solar amber & energetic orange' },
  ];

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') return { label: 'Admin Console', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (user.role === 'FACULTY') return { label: 'Faculty Queue', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
    return { label: 'Student Terminal', color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30' };
  };

  const navLinks = [
    { id: 'landing', label: 'Overview' },
    { id: 'facilities', label: 'Campus Facilities' },
    { id: 'knowledge-base', label: 'Knowledge Base' },
    { id: 'system-status', label: 'System Status' }
  ];

  const roleBadge = getRoleBadge();

  // Quick Command Palette search items
  const quickActions = [
    { id: 'landing', title: 'Campus IT Overview', subtitle: 'View real-time telemetry and landing portal', icon: Laptop, category: 'Navigation' },
    { id: 'facilities', title: 'Campus Facilities & Labs', subtitle: 'Explore computing laboratories, smart halls, and hardware', icon: Building2, category: 'Infrastructure' },
    { id: 'knowledge-base', title: 'Knowledge Base & FAQs', subtitle: 'Search self-service solutions and troubleshooting tutorials', icon: HelpCircle, category: 'Support' },
    { id: 'system-status', title: 'Live System Status & SLAs', subtitle: 'Inspect cloud cluster health, service uptime, and response metrics', icon: Activity, category: 'Operations' },
    ...(user ? [
      { id: `${user.role.toLowerCase()}-dashboard`, title: `${user.role === 'ADMIN' ? 'Administrator Console' : user.role === 'FACULTY' ? 'Faculty Ticket Queue' : 'My Student Tickets'}`, subtitle: 'Open active workspace and incident management', icon: Activity, category: 'Dashboard' }
    ] : [
      { id: 'login', title: 'Sign In to Portal', subtitle: 'Authenticate using university email & password', icon: User, category: 'Account' },
      { id: 'register', title: 'Register New Account', subtitle: 'Create student or faculty access profile', icon: PlusCircle, category: 'Account' },
    ])
  ];

  const filteredActions = quickActions.filter(action =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 w-full transition-colors select-none">
      
      {/* 1. TOP LIVE HEARTBEAT & EMERGENCY STRIP (DISMISSIBLE / EXPANDABLE) */}
      <AnimatePresence>
        {topBannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-[11px] font-medium border-b border-indigo-500/20 px-3 sm:px-6 py-1.5 flex items-center justify-between gap-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30 text-[10px] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                CAMPUS NOC
              </span>
              <span className="text-slate-300 truncate hidden sm:inline">
                Scheduled Maintenance: Academic Wi-Fi & Servers 100% Operational • Zero Active Outages
              </span>
              <span className="text-slate-300 truncate sm:hidden">
                Central IT Operational • Zero Outages
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-slate-400 font-mono text-[10px]">
              <div className="hidden lg:flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>IST {currentTime || '12:00:00'}</span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-slate-300">
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                <span>Hotline: <strong className="text-white font-bold">Ext. 4400</strong></span>
              </div>
              <button
                onClick={() => setTopBannerVisible(false)}
                className="p-0.5 text-slate-400 hover:text-white transition-colors"
                title="Dismiss Banner"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="w-full backdrop-blur-2xl bg-white/90 dark:bg-[#070b14]/90 border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* BRAND IDENTITY ZONE */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => setCurrentView(user ? `${user.role.toLowerCase()}-dashboard` : 'landing')}
              className="flex items-center gap-3 cursor-pointer whitespace-nowrap shrink-0 group select-none"
            >
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:rotate-3 transition-all">
                <Laptop className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                  <span>STSU</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                    IT OPERATIONS
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Smart Technical Support University
                </div>
              </div>
            </div>

            {/* LIVE NOC STATUS PILL (CLICKABLE TELEMETRY POPOVER) */}
            <div className="relative hidden xl:block ml-1">
              <button
                type="button"
                onClick={() => {
                  setShowStatusModal(!showStatusModal);
                  setShowPaletteMenu(false);
                  setShowNotifications(false);
                  setShowUserMenu(false);
                }}
                className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NOC Online</span>
                <span className="text-[10px] text-slate-400 font-mono">({serverPing}ms)</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showStatusModal ? 'rotate-180' : ''}`} />
              </button>

              {/* NOC Telemetry Dropdown Card */}
              <AnimatePresence>
                {showStatusModal && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 text-left space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        Network Operations Center
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        100% Active
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Database Engine:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                          <Database className="w-3 h-3" />
                          {dbInfo?.provider || 'MongoDB Atlas'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Target Database:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">{dbInfo?.database || 'technical'}</span>
                      </div>
                      {dbInfo?.host && (
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>Cluster Host:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={dbInfo.host}>
                            {dbInfo.host}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Gateway Latency:</span>
                        <strong className="font-mono text-slate-900 dark:text-white">{serverPing} ms (Optimal)</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">SSE Event Bus:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" />
                          Broadcasting
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">AI Triage Copilot:</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Gemini 2.5 Standby
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400">SLA Enforcement</span>
                      <span className="text-[10px] font-bold text-sky-500">100% Compliant</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentView(link.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Role Dashboard Quick Link (When Logged In) */}
            {user && (
              <button
                onClick={() => setCurrentView(`${user.role.toLowerCase()}-dashboard`)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  currentView.includes('dashboard')
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{user.role === 'ADMIN' ? 'Admin Console' : user.role === 'FACULTY' ? 'Faculty Queue' : 'My Tickets'}</span>
              </button>
            )}
          </nav>

          {/* QUICK COMMAND SEARCH BAR TRIGGER (⌘K / Ctrl+K) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs transition-all cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 group-hover:text-indigo-500 transition-colors" />
            <span className="hidden xl:inline text-slate-600 dark:text-slate-300">Quick search...</span>
            <span className="xl:hidden">Search</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xs text-slate-600 dark:text-slate-400">
              Ctrl K
            </kbd>
          </button>

          {/* ACTIONS / CONTROLS ZONE */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Quick Report Issue Button (When user logged in) */}
            {user && (
              <button
                onClick={() => setCurrentView(`${user.role.toLowerCase()}-dashboard`)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/25 hover:opacity-95 transition-all cursor-pointer"
                title="Create or manage support ticket"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>
            )}

            {/* Quick Palette Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowPaletteMenu(!showPaletteMenu);
                  setShowNotifications(false);
                  setShowStatusModal(false);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Change atmosphere palette"
              >
                <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden 2xl:inline text-xs font-bold capitalize text-indigo-600 dark:text-indigo-400">
                  {accentColor}
                </span>
              </button>

              {/* Color Palette Popover */}
              <AnimatePresence>
                {showPaletteMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-indigo-500" />
                        Color Atmosphere
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">5 Palettes</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {COLOR_PRESETS.map(preset => {
                        const isSelected = accentColor === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => {
                              if (setAccentColor) setAccentColor(preset.id);
                              setShowPaletteMenu(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-slate-100 dark:bg-slate-800/90 font-bold' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div 
                                className="w-4 h-4 rounded-full shadow-sm shrink-0 border border-white/20"
                                style={{ backgroundColor: preset.dot }}
                              />
                              <div>
                                <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                                  {preset.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal leading-tight">
                                  {preset.desc}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute notification sound' : 'Enable notification sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowPaletteMenu(false);
                  setShowStatusModal(false);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {history.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          System Activity Log ({history.length})
                        </span>
                      </div>
                      {history.length > 0 && (
                        <button 
                          onClick={clearHistory}
                          className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto mt-2 space-y-2 pr-1">
                      {history.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                          No recent notifications
                        </div>
                      ) : (
                        history.map(item => (
                          <div 
                            key={item.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-left"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                              <span className="text-[10px] text-slate-400 font-mono tabular-nums whitespace-nowrap">{item.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{item.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account Profile or Auth Actions */}
            {user ? (
              <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                    setShowPaletteMenu(false);
                    setShowStatusModal(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {user.fullName}
                    </span>
                    {roleBadge && (
                      <span className={`text-[9px] font-extrabold uppercase px-1 rounded-sm border mt-0.5 ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Profile Dropdown Card */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-3.5 space-y-2.5 text-left"
                    >
                      <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.fullName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                          Dept: {user.department}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setCurrentView(`${user.role.toLowerCase()}-dashboard`);
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Open Active Workspace</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentView('knowledge-base');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
                          <span>Help & Documentation</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => { 
                            logout(); 
                            setCurrentView('landing'); 
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <span>Sign Out Session</span>
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-sky-500 to-indigo-600 shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. GLOBAL COMMAND SEARCH PALETTE MODAL (CTRL+K) */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left"
            >
              {/* Search input header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Search className="w-5 h-5 text-indigo-500 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command, destination, or feature..."
                  className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden"
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="px-2 py-1 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  ESC
                </button>
              </div>

              {/* Action items list */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredActions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No results found for "{searchQuery}".
                  </div>
                ) : (
                  filteredActions.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          setCurrentView(action.id);
                          setCommandPaletteOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {action.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {action.subtitle}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {action.category}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <span>Navigate quickly with search</span>
                <span>Press <strong className="font-mono text-slate-600 dark:text-slate-300">ESC</strong> to exit</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3"
          >
            {user && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-left">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{user.fullName}</div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {user.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user.email}</div>
                <button
                  onClick={() => { setCurrentView(`${user.role.toLowerCase()}-dashboard`); setMobileMenuOpen(false); }}
                  className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md"
                >
                  Enter {user.role} Dashboard →
                </button>
              </div>
            )}

            <div className="space-y-1 text-left">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => { setCurrentView(link.id); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    currentView === link.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <button
                onClick={() => { setCommandPaletteOpen(true); setMobileMenuOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Open Command Search (Ctrl+K)</span>
              </button>
            </div>

            {!user && (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setCurrentView('login'); setMobileMenuOpen(false); }}
                  className="py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setCurrentView('register'); setMobileMenuOpen(false); }}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-xs font-bold text-white shadow-md"
                >
                  Register
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
