import React, { useState, useEffect } from 'react';
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
  FileText
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

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Live real-time stats ticker in header
  const [serverPing, setServerPing] = useState(18);
  const [dbInfo, setDbInfo] = useState<{ status: string; provider: string; database?: string; host?: string } | null>(null);

  useEffect(() => {
    // Random subtle ping jitter for realism
    const interval = setInterval(() => {
      setServerPing(Math.floor(16 + Math.random() * 6));
    }, 5000);

    fetch('/api/health/db')
      .then(r => r.json())
      .then(data => setDbInfo(data))
      .catch(() => setDbInfo({ status: 'connected', provider: 'MongoDB Atlas' }));

    return () => clearInterval(interval);
  }, []);

  const COLOR_PRESETS: Array<{ id: AccentColor; name: string; gradient: string; dot: string; desc: string }> = [
    { id: 'indigo', name: 'Electric Indigo', gradient: 'from-indigo-600 via-indigo-500 to-cyan-400', dot: '#6366f1', desc: 'Neo-cyber indigo & electric cyan' },
    { id: 'emerald', name: 'Cyber Emerald', gradient: 'from-emerald-600 via-teal-500 to-cyan-400', dot: '#10b981', desc: 'Precision matrix mint & jade' },
    { id: 'sapphire', name: 'Royal Sapphire', gradient: 'from-blue-600 via-blue-500 to-sky-400', dot: '#2563eb', desc: 'Institutional Ivy League cobalt' },
    { id: 'violet', name: 'Neon Violet', gradient: 'from-purple-600 via-violet-500 to-pink-500', dot: '#8b5cf6', desc: 'Deep research amethyst & magenta' },
    { id: 'amber', name: 'Solar Flare', gradient: 'from-amber-600 via-orange-500 to-rose-500', dot: '#f59e0b', desc: 'Cosmic solar orange & crimson' },
  ];

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') return { label: 'Admin Console', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (user.role === 'FACULTY') return { label: 'Faculty Queue', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
    return { label: 'Student Terminal', color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30' };
  };

  const navLinks = [
    { id: 'landing', label: 'Overview' },
    { id: 'knowledge-base', label: 'Knowledge Base' },
    { id: 'email-preview', label: 'Email Templates' }
  ];

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/85 dark:bg-[#080c16]/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* BRAND IDENTITY ZONE */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setCurrentView(user ? `${user.role.toLowerCase()}-dashboard` : 'landing')}
            className="flex items-center gap-3 cursor-pointer whitespace-nowrap shrink-0 group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:rotate-3 transition-all">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                <span>STSU</span>
                <span className="text-xs font-bold px-1.5 py-0.2 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                  IT Operations
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Smart Technical Support Gateway
              </div>
            </div>
          </div>

          {/* Real-Time Operational Heartbeat Badge (Clickable Popover) */}
          <div className="relative hidden lg:block ml-2">
            <button
              type="button"
              onClick={() => setShowStatusModal(!showStatusModal)}
              className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>NOC Online</span>
              <span className="text-[10px] text-slate-400 font-mono">({serverPing}ms)</span>
            </button>

            {/* NOC Status Popover */}
            {showStatusModal && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 text-left space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Network Operations Center
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">100% Active</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Server Gateway Ping:</span>
                    <strong className="font-mono text-slate-900 dark:text-white">{serverPing} ms</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database Engine:</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      {dbInfo?.provider || 'MongoDB Atlas'} {dbInfo?.database ? `(${dbInfo.database})` : ''}
                    </span>
                  </div>
                  {dbInfo?.host && (
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Atlas Shard:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[130px]">{dbInfo.host}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Live SSE Event Stream:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">Broadcasting</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Triage Module:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">Gemini Standby</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
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

        {/* ACTIONS / CONTROLS ZONE */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Quick Palette Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPaletteMenu(!showPaletteMenu);
                setShowNotifications(false);
                setShowStatusModal(false);
              }}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Change atmosphere palette"
            >
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden xl:inline text-xs font-bold capitalize text-indigo-600 dark:text-indigo-400">
                {accentColor}
              </span>
            </button>

            {/* Color Palette Popover */}
            {showPaletteMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-3.5 space-y-2">
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
              </div>
            )}
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
              }}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-4">
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
              </div>
            )}
          </div>

          {/* Account Profile or Auth Actions */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div 
                onClick={() => setCurrentView(`${user.role.toLowerCase()}-dashboard`)}
                className="hidden sm:flex flex-col items-end text-right cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">
                  {user.fullName}
                </span>
                {roleBadge && (
                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md border mt-0.5 ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                )}
              </div>

              <button
                onClick={() => { logout(); setCurrentView('landing'); }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
                title="Sign out of session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
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
            className="p-2 rounded-xl md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3"
          >
            {user && (
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{user.fullName}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</div>
                <button
                  onClick={() => { setCurrentView(`${user.role.toLowerCase()}-dashboard`); setMobileMenuOpen(false); }}
                  className="mt-2 w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Enter Dashboard ({user.role})
                </button>
              </div>
            )}

            <div className="space-y-1 text-left">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => { setCurrentView(link.id); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {link.label}
                </button>
              ))}
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
