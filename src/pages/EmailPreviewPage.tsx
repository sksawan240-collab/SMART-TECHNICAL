import React, { useState } from 'react';
import { Mail, Ticket, Sparkles } from 'lucide-react';

export const EmailPreviewPage: React.FC = () => {
  const [template, setTemplate] = useState<'WELCOME' | 'OTP'>('WELCOME');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
          <Mail className="w-4 h-4" />
          <span>Automated SMTP Email System Inspection</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">HTML Email Template Previews</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
          Inspecting responsive, cross-client HTML email templates dispatched upon student/faculty registration, OTP verification, and automatic welcome ticket creation.
        </p>

        {/* Template Selector */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setTemplate('WELCOME')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              template === 'WELCOME'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Welcome Onboarding Ticket Email</span>
          </button>

          <button
            onClick={() => setTemplate('OTP')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              template === 'OTP'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>6-Digit Verification OTP Email</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 px-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>Target Client: Responsive HTML5 Table Matrix (Outlook, Gmail, Apple Mail Compatible)</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">Dispatched via SMTP</span>
        </div>

        <div className="mt-4 flex justify-center">
          <iframe
            src={template === 'WELCOME' ? '/api/email/preview-welcome?ticketId=STSU-2026-000001' : '/api/email/preview-otp?otp=849201'}
            className="w-full max-w-2xl h-[650px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19]"
            title="HTML Email Preview"
          />
        </div>
      </div>
    </div>
  );
};
