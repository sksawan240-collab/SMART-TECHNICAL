import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  KeyRound,
  Sparkles,
  GraduationCap,
  Building2,
  X,
  Radio,
  Zap,
  CheckCircle2,
  Unlock
} from 'lucide-react';

interface LoginProps {
  setCurrentView: (view: string) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ setCurrentView }) => {
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [accessGrantedData, setAccessGrantedData] = useState<{
    name: string;
    role: string;
    email: string;
    targetView: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast('WARNING', 'Missing Fields', 'Please enter your university email and password.');
      return;
    }

    setLoading(true);
    const success = await login(email.trim(), password, rememberMe);
    setLoading(false);

    if (success) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }

      const saved = localStorage.getItem('stsu_user');
      const u = saved ? JSON.parse(saved) : null;
      const role = u?.role || 'STUDENT';
      const name = u?.fullName || email.trim();
      let targetView = 'student-dashboard';
      if (role === 'ADMIN') targetView = 'admin-dashboard';
      else if (role === 'FACULTY') targetView = 'faculty-dashboard';

      setAccessGrantedData({
        name,
        role,
        email: email.trim(),
        targetView
      });

      setTimeout(() => {
        setCurrentView(targetView);
      }, 2400);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Dynamic Animated Ambient Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Animated Gradient Orb 1: Cyan / Sky */}
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-24 -left-24 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-br from-cyan-500/30 via-sky-500/25 to-transparent blur-[90px]"
        />

        {/* Animated Gradient Orb 2: Purple / Fuchsia */}
        <motion.div
          animate={{
            x: [0, -45, 30, 0],
            y: [0, 60, -40, 0],
            scale: [1, 1.2, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-32 -right-32 w-96 h-96 sm:w-[550px] sm:h-[550px] rounded-full bg-gradient-to-tr from-fuchsia-600/30 via-indigo-600/25 to-transparent blur-[100px]"
        />

        {/* Animated Gradient Orb 3: Violet / Rose Center Highlight */}
        <motion.div
          animate={{
            scale: [0.9, 1.15, 0.9],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[600px] sm:h-[600px] rounded-full bg-gradient-to-r from-violet-600/20 via-pink-500/20 to-amber-500/15 blur-[110px]"
        />

        {/* Futuristic Subtle Cyber Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }} 
        />
      </div>

      {/* Main Double-Panel Glass Container */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* LEFT PANEL: Professional Brand Showcase */}
        <motion.div 
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col justify-center space-y-6 text-left"
        >
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-fuchsia-500/15 border border-cyan-500/30 backdrop-blur-md self-start shadow-sm">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 dark:from-cyan-300 dark:via-indigo-300 dark:to-fuchsia-300 bg-clip-text text-transparent">
              Smart Technical Support Gateway • Online
            </span>
          </div>

          {/* Heading */}
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]"
            >
              Sign In to Your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                Technical Support
              </span>{' '}
              Portal
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed"
            >
              Secure centralized access for Students, Faculty, and Staff to report infrastructure incidents, request laboratory equipment support, and track real-time resolution SLAs.
            </motion.p>
          </div>

          {/* Core Institutional Services Info Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="space-y-3 max-w-lg"
          >
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 backdrop-blur-xl shadow-lg flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  Student & Faculty Support Services
                </div>
                <div className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">
                  Fast-tracked troubleshooting for campus Wi-Fi, departmental computer labs, smart classroom projectors, and university email accounts.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 backdrop-blur-xl shadow-lg flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  Automated AI Triage & Direct Escalation
                </div>
                <div className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tickets are intelligently diagnosed, categorized, and assigned to designated departmental technicians with live status updates.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Badges Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="grid grid-cols-3 gap-3 max-w-lg pt-1"
          >
            <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Real-Time</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">AI Triage & Routing</div>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>AES-256</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Encrypted Access</div>
            </div>

            <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Radio className="w-3.5 h-3.5 text-sky-500" />
                <span>24 / 7</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Portal Availability</div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT PANEL: Radiant Animated Glass Sign-In Form */}
        <motion.div 
          initial={{ opacity: 0, x: 35, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="lg:col-span-6 w-full max-w-md mx-auto"
        >
          {/* Glowing Animated Outer Border Container */}
          <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-2xl shadow-indigo-500/20 group">
            
            {/* Shimmering Halo */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 opacity-30 group-hover:opacity-50 blur-xl transition-all duration-700 pointer-events-none" />

            {/* Inner Glass Card */}
            <div className="bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl rounded-[1.45rem] p-7 sm:p-9 text-left relative z-10 overflow-hidden shadow-2xl">
              
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Authentication Gateway</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Portal Sign In
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <KeyRound className="w-6 h-6" />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    University Email Address
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@stsu.edu"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Remember terminal session</span>
                  </label>
                </div>

                {/* Radiant Gradient Submit CTA Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full mt-3 py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-fuchsia-600 hover:from-sky-400 hover:via-indigo-500 hover:to-fuchsia-500 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative px-3 bg-white dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  New to Support Portal?
                </span>
              </div>

              {/* Create Account Action */}
              <motion.button
                type="button"
                onClick={() => setCurrentView('register')}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />
                <span>Create Student or Faculty Account</span>
              </motion.button>

              {/* Security Footnote */}
              <div className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by institutional multi-factor verification</span>
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl relative"
            >
              <button 
                onClick={() => setForgotModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-md">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Central IT Password Reset</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Institutional Identity Protection Protocol</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                <p>
                  To protect institutional accounts and student data privacy, password resets cannot be performed through unsecured public links.
                </p>
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 space-y-1.5">
                  <div className="font-bold text-indigo-900 dark:text-indigo-300">How to restore access:</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    <li>Contact Central IT Operations: <strong>Ext. 4400</strong></li>
                    <li>Email campus support from your registered email: <strong>support@stsu.edu</strong></li>
                    <li>Visit Campus Computing Lab (Tower Alpha, Level 2) with your University Photo ID Card.</li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access Granted Cyber Animation Overlay */}
      <AnimatePresence>
        {accessGrantedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.82, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
              className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/50 shadow-[0_0_100px_rgba(16,185,129,0.35)] text-center overflow-hidden"
            >
              {/* Futuristic Cyber Lighting Background */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/25 rounded-full blur-3xl pointer-events-none" />

              {/* Glowing Holographic Unlocked Badge */}
              <div className="relative mx-auto mb-6 w-24 h-24 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/60"
                />
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 blur-md"
                />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/50">
                  <motion.div
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.15 }}
                  >
                    <Unlock className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
              </div>

              {/* Security Pill */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-3"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Security Clearance Verified</span>
              </motion.div>

              {/* Animated ACCESS GRANTED Heading */}
              <motion.h3
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.22 }}
                className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 tracking-tight"
              >
                ACCESS GRANTED
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="text-sm text-slate-600 dark:text-slate-300 mt-2"
              >
                Welcome back, <strong className="text-slate-900 dark:text-white">{accessGrantedData.name}</strong>.
              </motion.p>

              {/* Holographic Security Credentials Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-left space-y-1.5 font-mono"
              >
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>User Identity:</span>
                  <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px]">{accessGrantedData.email}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Privilege Tier:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">{accessGrantedData.role}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Target Gateway:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{accessGrantedData.targetView.replace('-', ' ').toUpperCase()}</span>
                </div>
              </motion.div>

              {/* Animated Cyber Progress Bar */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                    Redirecting to Dashboard...
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Initializing</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.4, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView(accessGrantedData.targetView)}
                className="mt-4 text-xs font-semibold text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                Click here if not redirected automatically →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
