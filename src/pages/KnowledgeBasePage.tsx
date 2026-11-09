import React, { useState } from 'react';
import { Search, BookOpen, Wifi, ShieldAlert, Cpu, Monitor, FileCode, CheckCircle2 } from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const articles = [
    {
      id: 'kb_01',
      category: 'Wi-Fi & Network',
      icon: <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: 'Connecting to STSU-Secure Campus Wi-Fi 6E',
      summary: 'Complete guide for configuring 802.1X PEAP enterprise authentication on Windows 11, macOS, Android 14, and iOS devices.',
      content: `1. Select 'STSU-Secure' from your device Wi-Fi options.\n2. Security Method: WPA2/WPA3 Enterprise (PEAP).\n3. Phase 2 Authentication: MSCHAPv2.\n4. Identity: Your full official university email address.\n5. Password: Your central university LDAP portal password.\n6. Certificate: Trust 'STSU-Root-CA-2026' when prompted.`
    },
    {
      id: 'kb_02',
      category: 'Software & Licensing',
      icon: <FileCode className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      title: 'Activating Academic MATLAB & Simulink Campus License',
      summary: 'Step-by-step instructions to link your university email to MathWorks Academic Campus-Wide License.',
      content: `1. Visit software.stsu.edu and log in using student Single Sign-On.\n2. Select MathWorks MATLAB Campus Portal.\n3. Create or associate your MathWorks account using your @student.stsu.edu or @stsu.edu address.\n4. Enter University License Activation Key: 9028-1142-9901.\n5. Launch MATLAB installer and sign in to activate.`
    },
    {
      id: 'kb_03',
      category: 'Laboratory Workstations',
      icon: <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'Turing AI & HPC Lab Compute Guidelines',
      summary: 'Accessing shared NVIDIA GPU workstations, mounting network storage shares, and running batch jobs.',
      content: `1. Physical Access: Scan your student RFID badge at Turing AI Lab Pod B.\n2. Workstation Login: Use your student ID as username.\n3. Storage: All student research work must be saved in your networked /mnt/student_shares/$STUDENT_ID volume.\n4. Local drive C:/ is re-imaged automatically every Sunday at 00:00 UTC.`
    },
    {
      id: 'kb_04',
      category: 'Smart Classrooms',
      icon: <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'Smart Board Calibration & HDMI Passthrough in Lecture Halls',
      summary: 'Resolving touch drift, input source detection issues, and wireless screencasting in smart classrooms.',
      content: `1. Press the 'CALIBRATE' button on the left bezel of the Panasonic Interactive Display for 3 seconds.\n2. Tap the four target crosshairs accurately using the stylus.\n3. For wireless Miracast/AirPlay projection, connect to SSID 'Classroom-AV-$ROOM' and input the 4-digit PIN displayed on the top right screen banner.`
    },
    {
      id: 'kb_05',
      category: 'Security & Access',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      title: 'University Password Guidelines & Phishing Reporting',
      summary: 'Learn how to detect fraudulent academic emails and report suspicious portal login attempts.',
      content: `1. University IT will NEVER ask for your password via email, SMS, or third-party forms.\n2. Official portal URLs always end strictly with .stsu.edu.\n3. To report a suspicious email, forward the message as an attachment to security@stsu.edu or create a Critical Priority ticket under 'Cybersecurity'.`
    }
  ];

  const filtered = articles.filter(a => {
    const matchCat = selectedCat === 'ALL' || a.category === selectedCat;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                        a.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Central Knowledge Repository</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">University IT Knowledge Base</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
          Comprehensive technical procedures, software license setups, and troubleshooting tutorials verified by university engineers.
        </p>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-lg mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search guides by keywords (e.g. Wi-Fi, MATLAB, Projector, Password)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        {['ALL', 'Wi-Fi & Network', 'Software & Licensing', 'Laboratory Workstations', 'Smart Classrooms', 'Security & Access'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedCat === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(art => (
          <div
            key={art.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {art.icon}
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {art.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{art.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{art.summary}</p>
              
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                {art.content}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified by Central IT Operations (2026.1)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
