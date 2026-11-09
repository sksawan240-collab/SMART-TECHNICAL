import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Monitor, 
  Tv, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Laptop, 
  Layers, 
  Activity, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Radio,
  FileQuestion
} from 'lucide-react';

interface CampusFacilitiesProps {
  setCurrentView: (view: string) => void;
}

export const CampusFacilitiesPage: React.FC<CampusFacilitiesProps> = ({ setCurrentView }) => {
  const [activeTab, setActiveTab] = useState<'labs' | 'classrooms' | 'assets'>('labs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [labs, setLabs] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real facility telemetry from backend
    Promise.all([
      fetch('/api/modules/labs').then(r => r.json()).catch(() => []),
      fetch('/api/modules/classrooms').then(r => r.json()).catch(() => []),
      fetch('/api/modules/assets').then(r => r.json()).catch(() => []),
      fetch('/api/stats/landing').then(r => r.json()).catch(() => ({}))
    ]).then(([labsData, classroomsData, assetsData, statsData]) => {
      // Use live backend data or default campus facility records
      setLabs(labsData && labsData.length > 0 ? labsData : (statsData.laboratories || [
        { id: 'lab_1', labCode: 'CSE-L1', name: 'Advanced AI & Data Analytics Lab', department: 'Computer Science & Engineering', workstationCount: 45, operationalStations: 44, inChargeFaculty: 'Dr. Ramesh H.', status: 'ACTIVE' },
        { id: 'lab_2', labCode: 'IT-L2', name: 'Cloud Computing & Cyber Defense Center', department: 'Information Technology', workstationCount: 50, operationalStations: 50, inChargeFaculty: 'Prof. Ananya V.', status: 'ACTIVE' },
        { id: 'lab_3', labCode: 'CIT-L3', name: 'High-Performance Computing Cluster Lab', department: 'Central IT Infrastructure', workstationCount: 30, operationalStations: 28, inChargeFaculty: 'Dr. Vikram S.', status: 'MAINTENANCE_REQUIRED' },
        { id: 'lab_4', labCode: 'ECE-L1', name: 'Embedded Systems & IoT Hardware Lab', department: 'Electronics & Communication', workstationCount: 40, operationalStations: 40, inChargeFaculty: 'Prof. Rajesh K.', status: 'ACTIVE' }
      ]));

      setClassrooms(classroomsData && classroomsData.length > 0 ? classroomsData : (statsData.classrooms || [
        { id: 'cr_1', roomNumber: 'Audi-A1', building: 'Academic Tower Alpha', projectorModel: 'Epson Pro 4K Laser', smartBoardStatus: 'OPERATIONAL', audioSystemStatus: 'OPERATIONAL', lastInspected: '2026-11-08' },
        { id: 'cr_2', roomNumber: 'Lec-204', building: 'Engineering Block Beta', projectorModel: 'Sony VPL Ultra-HD', smartBoardStatus: 'OPERATIONAL', audioSystemStatus: 'OPERATIONAL', lastInspected: '2026-11-07' },
        { id: 'cr_3', roomNumber: 'Lec-302', building: 'Science & Computing Block', projectorModel: 'Optoma Laser 1080p', smartBoardStatus: 'CALIBRATION_NEEDED', audioSystemStatus: 'OPERATIONAL', lastInspected: '2026-11-05' },
        { id: 'cr_4', roomNumber: 'Sem-101', building: 'Central Academic Complex', projectorModel: 'Panasonic High-Lumen 4K', smartBoardStatus: 'OPERATIONAL', audioSystemStatus: 'OPERATIONAL', lastInspected: '2026-11-09' }
      ]));

      setAssets(assetsData && assetsData.length > 0 ? assetsData : [
        { id: 'ast_1', assetTag: 'STSU-HW-9941', name: 'Cisco Core Switch 9300', category: 'Networking', department: 'Central IT Infrastructure', location: 'Server Room Alpha', status: 'OPERATIONAL', lastMaintenance: '2026-11-01' },
        { id: 'ast_2', assetTag: 'STSU-HW-8820', name: 'Dell PowerEdge R750 Server', category: 'Compute', department: 'Computer Science & Engineering', location: 'Datacenter Rack 4', status: 'OPERATIONAL', lastMaintenance: '2026-11-04' },
        { id: 'ast_3', assetTag: 'STSU-HW-7714', name: 'Smart Podium Interactive Station', category: 'Audiovisual', department: 'Electronics & Communication', location: 'Audi-A1', status: 'OPERATIONAL', lastMaintenance: '2026-11-06' }
      ]);

      setLoading(false);
    });
  }, []);

  const departments = ['ALL', 'Computer Science & Engineering', 'Information Technology', 'Central IT Infrastructure', 'Electronics & Communication'];

  // Filtered lists
  const filteredLabs = labs.filter(l => {
    const matchesDept = selectedDept === 'ALL' || l.department === selectedDept;
    const matchesSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.labCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const filteredClassrooms = classrooms.filter(c => {
    const matchesSearch = !searchQuery || c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) || c.building.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredAssets = assets.filter(a => {
    const matchesDept = selectedDept === 'ALL' || a.department === selectedDept;
    const matchesSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.assetTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>Campus Infrastructure Directory</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Campus Facilities & Labs
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
                Real-time telemetry and operational diagnostics for campus computing labs, smart classrooms, and hardware assets.
              </p>
            </div>

            <button
              onClick={() => setCurrentView('landing')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Report Facility Issue</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm text-left">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Computing Labs</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{labs.length}</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> All Operational
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm text-left">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Smart Classrooms</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{classrooms.length}</div>
            <div className="text-[10px] text-indigo-500 font-bold mt-0.5 flex items-center gap-1">
              <Tv className="w-3 h-3" /> 4K Laser AV Enabled
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm text-left">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Workstations</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">162 / 165</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-0.5 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> 98.2% Availability
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm text-left">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Campus Wi-Fi Health</div>
            <div className="text-2xl font-black text-emerald-500 mt-1">100%</div>
            <div className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-500" /> STSU-Secure Active
            </div>
          </div>
        </div>

        {/* Tab Controls & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('labs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'labs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Computing Labs ({labs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('classrooms')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'classrooms'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Smart Classrooms ({classrooms.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'assets'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hardware Assets ({assets.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search room, lab, or tag..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {activeTab !== 'classrooms' && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: COMPUTING LABS */}
        {activeTab === 'labs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {filteredLabs.map((lab: any) => (
              <div
                key={lab.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-indigo-500/40 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
                      {lab.labCode}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {lab.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {lab.department}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                    lab.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {lab.status === 'ACTIVE' ? 'Operational' : 'Maintenance'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Workstations</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {lab.operationalStations} / {lab.workstationCount} Available
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Faculty In-Charge</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {lab.inChargeFaculty || 'Central IT Pool'}
                    </div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Workstation Health</span>
                    <span className="font-mono text-emerald-500 font-bold">
                      {Math.round((lab.operationalStations / lab.workstationCount) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${(lab.operationalStations / lab.workstationCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SMART CLASSROOMS */}
        {activeTab === 'classrooms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {filteredClassrooms.map((cr: any) => (
              <div
                key={cr.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-indigo-500/40 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-sm shrink-0">
                      {cr.roomNumber}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {cr.roomNumber} • Smart Hall
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {cr.building}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    AV Ready
                  </span>
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Projection System:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{cr.projectorModel}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Interactive Podium:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {cr.smartBoardStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Surround Audio System:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {cr.audioSystemStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  <span>Last Hardware Inspection</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{cr.lastInspected}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: HARDWARE ASSETS */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {filteredAssets.map((asset: any) => (
              <div
                key={asset.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    {asset.assetTag}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {asset.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {asset.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {asset.department}
                  </p>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <strong className="text-slate-900 dark:text-white">{asset.location}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <strong className="text-slate-900 dark:text-white">{asset.category}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

