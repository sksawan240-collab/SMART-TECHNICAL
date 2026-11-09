import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  RotateCw, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Sparkles
} from 'lucide-react';

interface OtpVerificationProps {
  setCurrentView: (view: string) => void;
}

export const OtpVerificationPage: React.FC<OtpVerificationProps> = ({ setCurrentView }) => {
  const { pendingEmailForOtp, devOtpCode, setDevOtpCode, setLatestWelcomeTicket, setUser } = useAuth();
  const { addToast } = useToast();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300s)
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifiedTicket, setVerifiedTicket] = useState<any | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputsRef.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      addToast('WARNING', 'Incomplete Code', 'Please enter the complete 6-digit verification code.');
      return;
    }

    if (!pendingEmailForOtp) {
      addToast('ERROR', 'Session Expired', 'Please enter your email on the registration page.');
      setCurrentView('register');
      return;
    }
    const email = pendingEmailForOtp;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast('ERROR', 'Verification Failed', data.error || 'Invalid or expired OTP.');
        setLoading(false);
        return;
      }

      // Celebratory Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      setVerifiedTicket(data.welcomeTicket);
      setLatestWelcomeTicket(data.welcomeTicket);
      setUser(data.user);
      localStorage.setItem('stsu_user', JSON.stringify(data.user));
      localStorage.setItem('stsu_token', data.token);

      addToast('SUCCESS', 'Account Activated', 'Your university account has been verified.');
      setLoading(false);

      setTimeout(() => {
        if (data.user.role === 'ADMIN') setCurrentView('admin-dashboard');
        else if (data.user.role === 'FACULTY') setCurrentView('faculty-dashboard');
        else setCurrentView('student-dashboard');
      }, 2500);
    } catch (e) {
      addToast('ERROR', 'Network Error', 'Could not verify code with central authentication server.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmailForOtp) return;
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmailForOtp })
      });
      const data = await res.json();
      if (res.ok) {
        setTimeLeft(300);
        if (data.devOtp) setDevOtpCode(data.devOtp);
        addToast('INFO', 'OTP Dispatched', 'A new verification code has been dispatched.');
      } else {
        addToast('ERROR', 'Resend Failed', data.error || 'Could not resend OTP.');
      }
    } catch (e) {
      addToast('ERROR', 'Error', 'Failed to communicate with auth service.');
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Animated Glow Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.18, 0.32, 0.18]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-brand blur-3xl pointer-events-none -z-10"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.28, 0.15]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-brand blur-3xl pointer-events-none -z-10"
      />

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-center"
        >
          
          {/* Success Onboarding State (if verified) */}
          <AnimatePresence mode="wait">
            {verifiedTicket ? (
              <motion.div 
                key="verified-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="py-4 space-y-4"
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-brand-glow"
                >
                  <CheckCircle2 className="w-7 h-7" />
                </motion.div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account Successfully Activated!</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your initial university onboarding ticket has been automatically generated:
                </p>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Automated Onboarding Ticket
                    </span>
                    <span className="font-mono font-bold text-brand-accent">
                      {verifiedTicket.ticketId}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{verifiedTicket.title}</h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Assigned: <strong className="text-slate-800 dark:text-slate-200">{verifiedTicket.assignedFacultyName}</strong></span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {verifiedTicket.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />
                  <span>Redirecting to your dashboard...</span>
                </div>
              </motion.div>
            ) : (
              // Standard OTP Entry Form
              <motion.div 
                key="otp-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  whileHover={{ rotate: 10, scale: 1.08 }}
                  className="w-12 h-12 rounded-xl bg-brand text-white flex items-center justify-center mx-auto mb-4 shadow-brand-glow cursor-pointer"
                >
                  <ShieldCheck className="w-6 h-6" />
                </motion.div>

                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                  <span>Email OTP Verification</span>
                  <Sparkles className="w-4 h-4 text-brand-accent" />
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                  Enter the 6-digit cryptographic verification code dispatched to:
                </p>
                <div className="mt-2 font-mono text-xs font-semibold text-brand-accent bg-brand-subtle py-1 px-3 rounded-lg inline-block border border-brand">
                  {pendingEmailForOtp || 'your university email'}
                </div>

                {/* 6 Digit Inputs */}
                <form onSubmit={handleVerify} className="mt-6">
                  <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { inputsRef.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleDigitChange(idx, e.target.value)}
                        onKeyDown={e => handleKeyDown(idx, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-extrabold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* Timer & Resend */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6 px-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Expires in: <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{formatTimer(timeLeft)}</strong></span>
                    </div>

                    <button
                      type="button"
                      disabled={resending || timeLeft > 270}
                      onClick={handleResend}
                      className="text-brand-accent hover:underline font-semibold transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                      <span>Resend Code</span>
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || otpDigits.join('').length !== 6}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-brand shadow-brand-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying & Generating Onboarding Ticket...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Code & Activate Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
            Smart Technical Support University • Cryptographic Auth Protocol
          </div>
        </motion.div>
      </div>
    </div>
  );
};
