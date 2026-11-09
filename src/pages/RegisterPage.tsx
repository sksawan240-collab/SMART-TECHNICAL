import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  User,
  GraduationCap,
  Mail,
  Building2,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Headphones,
  Loader2,
  ChevronDown,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

interface RegisterProps {
  setCurrentView: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterProps> = ({ setCurrentView }) => {
  const { setUser } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [usn, setUsn] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Student' | 'Faculty'>('Student');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    fullName: string;
    email: string;
    role: string;
    id: string;
  } | null>(null);

  // Modals
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Power Systems',
    'Mechanical Engineering',
    'Central IT Infrastructure',
    'Department of Mathematics & Computing'
  ];

  // Dynamic Password Strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: 'None', color: 'bg-slate-300 dark:bg-slate-700' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, text: 'Good', color: 'bg-sky-500' };
    return { score: 4, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      addToast('WARNING', 'Terms Agreement Required', 'Please accept the Terms & Conditions and Privacy Policy to continue.');
      return;
    }

    if (!fullName.trim() || !usn.trim() || !email.trim() || !password) {
      addToast('WARNING', 'Missing Fields', 'Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      addToast('ERROR', 'Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (role === 'Student') {
        const payload = {
          fullName: fullName.trim(),
          universityEmail: email.trim(),
          studentId: usn.trim(),
          department,
          password
        };

        const res = await fetch('/api/auth/register-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
          addToast('ERROR', 'Registration Failed', data.error || 'Could not complete registration.');
          setLoading(false);
          return;
        }

        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch (e) { }

        addToast('SUCCESS', 'Account Created Successfully!', data.message || 'Please log in to continue.');
        setLoading(false);
        setRegistrationSuccess({
          fullName: fullName.trim(),
          email: email.trim(),
          role: 'Student',
          id: usn.trim()
        });

        setTimeout(() => {
          setCurrentView('login');
        }, 2800);
      } else {
        const payload = {
          fullName: fullName.trim(),
          officialUniversityEmail: email.trim(),
          facultyId: usn.trim(),
          department,
          password
        };

        const res = await fetch('/api/auth/register-faculty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
          addToast('ERROR', 'Registration Failed', data.error || 'Could not complete faculty registration.');
          setLoading(false);
          return;
        }

        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch (e) { }

        addToast('SUCCESS', 'Faculty Account Created!', data.message || 'Please log in to continue.');
        setLoading(false);
        setRegistrationSuccess({
          fullName: fullName.trim(),
          email: email.trim(),
          role: 'Faculty',
          id: usn.trim()
        });

        setTimeout(() => {
          setCurrentView('login');
        }, 2800);
      }
    } catch (err) {
      addToast('ERROR', 'Network Failure', 'Could not reach central authentication server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Dynamic Animated Ambient Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, -40, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-fuchsia-600/25 via-violet-600/20 to-transparent blur-[110px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 40, 0],
            y: [0, 50, -50, 0],
            scale: [1, 1.25, 0.95, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-cyan-500/25 via-sky-500/20 to-transparent blur-[110px]"
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* Main Double-Panel Glass Container */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

        {/* LEFT COLUMN: Role Information & Workflow Highlights */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="lg:col-span-5 flex flex-col space-y-6 text-left"
        >
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md self-start shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Quick Registration
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Create Your <br />
              <span className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                Institutional Profile
              </span>
            </h1>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Register in seconds with your university email and ID to submit IT incident tickets, track laboratory equipment repairs, and access campus Wi-Fi support.
            </p>
          </div>

          {/* Dynamic Role Information Card */}
          <motion.div
            key={role}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 backdrop-blur-xl shadow-lg relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r ${role === 'Student'
                ? 'from-sky-400 via-indigo-500 to-cyan-400'
                : 'from-purple-500 via-pink-500 to-amber-400'
              }`} />

            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${role === 'Student'
                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                  : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                }`}>
                {role === 'Student' ? <GraduationCap className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {role === 'Student' ? 'Student Account' : 'Faculty & Staff Account'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {role === 'Student' ? 'Enrolled Student Portal' : 'Faculty Instruction & AV Portal'}
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Instant campus IT incident tracking & ticketing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Direct password login with zero wait times</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Automated onboarding welcome ticket on sign up</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: Streamlined Glass Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="lg:col-span-7 w-full"
        >
          {/* Glowing Animated Outer Border Wrapper */}
          <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-2xl shadow-indigo-500/20 group">

            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 opacity-25 group-hover:opacity-45 blur-xl transition-all duration-700 pointer-events-none" />

            {/* Inner Glass Card */}
            <div className="bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl rounded-[1.45rem] p-6 sm:p-8 text-left relative z-10 overflow-hidden shadow-2xl">

              {/* Form Header with Role Toggle Switch */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-0.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Fast Sign Up</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Create Profile
                  </h2>
                </div>

                {/* Role Switcher Pill */}
                <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setRole('Student')}
                    className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === 'Student'
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Faculty')}
                    className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === 'Faculty'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Faculty</span>
                  </button>
                </div>
              </div>

              {/* Form with Reduced, Essential Fields Only */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* 1. Full Legal Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-500 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Aditi Rao"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* 2. University Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    University Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-500 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="yourname@stsu.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* 3. Row with USN / Faculty ID and Academic Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {role === 'Student' ? 'University Seat No. (USN)' : 'Faculty ID'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-500 transition-colors">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={usn}
                        onChange={e => setUsn(e.target.value)}
                        placeholder={role === 'Student' ? 'e.g. 3SB24CS101' : 'e.g. FAC-4421'}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono uppercase focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Department
                    </label>
                    <div className="relative">
                      <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all appearance-none cursor-pointer"
                      >
                        {departments.map((dept, i) => (
                          <option key={i} value={dept} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{dept}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* 4. Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Password (Min. 8 Chars) <span className="text-rose-500">*</span>
                    </label>
                    {password && (
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Strength: <strong className="text-slate-800 dark:text-slate-200">{strength.text}</strong>
                      </span>
                    )}
                  </div>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-500 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator Bar */}
                  {password && (
                    <div className="grid grid-cols-4 gap-1.5 h-1 mt-2">
                      <div className={`rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className={`rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className={`rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className={`rounded-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                    </div>
                  )}
                </div>

                {/* 5. Terms Agreement Checkbox */}
                <div className="flex items-start gap-2.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    id="termsAgree"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="termsAgree" className="cursor-pointer select-none leading-normal">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold underline cursor-pointer"
                    >
                      Terms & Conditions
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold underline cursor-pointer"
                    >
                      University IT Privacy Policy
                    </button>
                    .
                  </label>
                </div>

                {/* Submit CTA Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full mt-3 py-3 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-fuchsia-600 hover:from-sky-400 hover:via-indigo-500 hover:to-fuchsia-500 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account & Enter Portal →</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Already Registered Navigation */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Already registered?</span>
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Sign In Here</span>
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Support Contact Modal */}
      <AnimatePresence>
        {supportModalOpen && (
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl relative"
            >
              <button
                onClick={() => setSupportModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-md">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Central IT Helpdesk Support</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Technical Support Division</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Campus Helpdesk Hotline</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">Ext. 4400</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Direct Email Support</div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">support@stsu.edu</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="w-full mt-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer"
              >
                Close Directory
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms & Conditions Modal */}
      <AnimatePresence>
        {termsModalOpen && (
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setTermsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Acceptable Use Policy & Privacy</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">University IT Operations & Data Governance</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Academic Identity Verification:</strong> Users must register using genuine academic credentials (USN for students, Faculty ID for instructors).
                </p>
                <p>
                  <strong>2. Account Security:</strong> Passwords are protected using salted cryptographic hashing. Do not share terminal passwords or access tokens.
                </p>
                <p>
                  <strong>3. Support Integrity:</strong> Support tickets submitted through the portal are triaged with automated AI diagnostics and routed directly to certified technicians.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setAgreeTerms(true); setTermsModalOpen(false); }}
                className="w-full mt-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer"
              >
                I Understand and Agree
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Success Animated Overlay */}
      <AnimatePresence>
        {registrationSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 25 }}
              className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-[0_0_80px_rgba(16,185,129,0.3)] text-center overflow-hidden"
            >
              {/* Animated Background Ambience */}
              <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />

              {/* Holographic Glowing Checkmark Orb */}
              <div className="relative mx-auto mb-6 w-24 h-24 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/60"
                />
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 blur-md"
                />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.15 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
              </div>

              {/* Badge & Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Registration Successful</span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
              >
                Welcome to STSU!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-slate-600 dark:text-slate-300 mt-2"
              >
                Account created for <strong className="text-slate-900 dark:text-white">{registrationSuccess.fullName}</strong>.
              </motion.p>

              {/* User Identity Chip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-left space-y-1.5 font-mono"
              >
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Registered Email:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{registrationSuccess.email}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Assigned Role:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{registrationSuccess.role}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Academic ID:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{registrationSuccess.id}</span>
                </div>
              </motion.div>

              {/* Animated Progress Bar & Redirect Notice */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                    Redirecting to Login Page...
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Please wait</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.8, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('login')}
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
