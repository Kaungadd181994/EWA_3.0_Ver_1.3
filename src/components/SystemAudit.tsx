import React, { useState } from 'react';
import { SystemAuditLog } from '../types';

interface SystemAuditProps {
  auditLogs: SystemAuditLog[];
  addAuditLog?: (
    category: 'Fee Configuration' | 'Validation Rules',
    action: string,
    previousValue: string,
    newValue: string,
    performedBy?: string
  ) => void;
  showToast: (msg: string) => void;
}

export default function SystemAudit({ auditLogs, addAuditLog, showToast }: SystemAuditProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Fee Configuration' | 'Validation Rules'>('All');
  const [selectedActor, setSelectedActor] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  // Security simulation feed
  const [securityLogs, setSecurityLogs] = useState<Array<{ id: string; msg: string; type: 'info' | 'warning' | 'critical'; time: string }>>([
    { id: 'sec-1', msg: 'System integrity verification complete. All SHA-256 checksum chains intact.', type: 'info', time: 'Just now' },
    { id: 'sec-2', msg: 'Configuration threshold check: Total active rules within optimal ranges.', type: 'info', time: '5 mins ago' },
    { id: 'sec-3', msg: 'Admin session verified for user Daw Mya Sandar (IP: 192.168.12.45).', type: 'info', time: '12 mins ago' }
  ]);

  // Unique list of actors for filters
  const allActors = Array.from(new Set(auditLogs.map(log => log.performedBy.split(' (')[0])));

  // Filtering
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.previousValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || log.category === selectedCategory;
    const matchesActor = selectedActor === 'All' || log.performedBy.includes(selectedActor);
    
    return matchesSearch && matchesCategory && matchesActor;
  });

  // Pagination
  const itemsPerPage = 6;
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const feeConfigCount = auditLogs.filter(l => l.category === 'Fee Configuration').length;
  const validationCount = auditLogs.filter(l => l.category === 'Validation Rules').length;
  const latestChangeTime = auditLogs[0]?.timestamp || 'Never';

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Audit ID', 'Category', 'Action / Log Event', 'Authorized Actor', 'Previous Config State', 'New Config State', 'Timestamp (UTC)'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.category,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.performedBy.replace(/"/g, '""')}"`,
      `"${log.previousValue.replace(/"/g, '""')}"`,
      `"${log.newValue.replace(/"/g, '""')}"`,
      log.timestamp
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system_audit_trail_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('System audit trail exported successfully.');
  };

  // Simulate Config Drift Log Injection
  const handleSimulateDrift = () => {
    if (addAuditLog) {
      const actions = [
        {
          category: 'Fee Configuration' as const,
          action: 'Automatic System Alignment: Recalibrated Tiered Bracket limits',
          prev: 'Bracket 1: <= 100,000 MMK',
          new: 'Bracket 1: <= 150,000 MMK',
          actor: 'System Daemon (System Cron)'
        },
        {
          category: 'Validation Rules' as const,
          action: 'Secured fallback validation rule priority adjustment',
          prev: 'Rule Priority: 40',
          new: 'Rule Priority: 55',
          actor: 'U Tin Aung (Branch HR)'
        },
        {
          category: 'Fee Configuration' as const,
          action: 'Adjusted global transaction capping limit',
          prev: 'Max Limit: 500,000 MMK',
          new: 'Max Limit: 750,000 MMK',
          actor: 'Daw Mya Sandar (Admin HR)'
        }
      ];

      const chosen = actions[Math.floor(Math.random() * actions.length)];
      addAuditLog(chosen.category, chosen.action, chosen.prev, chosen.new, chosen.actor);
      
      // Add security alert
      const newSecLog = {
        id: `sec-${Date.now()}`,
        msg: `Audit log successfully captured: "${chosen.action}" by ${chosen.actor}.`,
        type: chosen.actor.includes('System') ? 'warning' as const : 'info' as const,
        time: 'Just now'
      };
      setSecurityLogs(prev => [newSecLog, ...prev.slice(0, 4)]);
      
      showToast('Simulated configuration change successfully injected.');
    }
  };

  // Clear filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedActor('All');
    setCurrentPage(1);
    showToast('Audit trail filters successfully reset.');
  };

  // Helper for search term highlighting
  const highlightTerm = (text: string, term: string) => {
    if (!term) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={index} className="bg-amber-100 text-amber-950 font-semibold px-0.5 rounded-sm">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title block */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
              <i className="fa-solid fa-clock-rotate-left text-sm" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">System Audit & Configuration Ledger</h2>
              <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-mono mt-0.5">
                <span className="flex items-center space-x-1">
                  <i className="fa-solid fa-circle text-[6px] text-emerald-500 animate-pulse" />
                  <span>Immutable Logging</span>
                </span>
                <span>•</span>
                <span>ISO 27001 Compliant</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 pt-1">
            Tracks real-time changes to the EWA fee structural variables, payroll boundaries, and regulatory DMN decision matrix validation policies with previous state history preservation.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleSimulateDrift}
            className="px-3.5 py-2 border border-gray-250 hover:border-gray-400 text-gray-750 hover:text-gray-950 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer bg-white"
          >
            <i className="fa-solid fa-shield-halved text-gray-500" />
            <span>Simulate Drift Event</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="px-3.5 py-2 bg-emerald-750 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-file-csv" />
            <span>Export Trail to CSV</span>
          </button>
        </div>
      </div>

      {/* Overview stats cards with interactive quick filter selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => { setSelectedCategory('All'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'All'
              ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500'
              : 'bg-white border-gray-150 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">All Changes</span>
            <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-500 border border-gray-150 flex items-center justify-center">
              <i className="fa-solid fa-cubes text-xs" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono text-gray-950">{auditLogs.length}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Total audited modifications</span>
          </div>
        </button>

        <button
          onClick={() => { setSelectedCategory('Fee Configuration'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'Fee Configuration'
              ? 'border-amber-600 bg-amber-50/25 ring-1 ring-amber-500'
              : 'bg-white border-gray-150 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fee Structure Changes</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
              <i className="fa-solid fa-sliders text-xs" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono text-gray-950">{feeConfigCount}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Pricing models & tier shifts</span>
          </div>
        </button>

        <button
          onClick={() => { setSelectedCategory('Validation Rules'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedCategory === 'Validation Rules'
              ? 'border-indigo-600 bg-indigo-50/25 ring-1 ring-indigo-500'
              : 'bg-white border-gray-150 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Validation Rule Changes</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-750 border border-indigo-100 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-xs" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono text-gray-950">{validationCount}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">DMN validation threshold rules</span>
          </div>
        </button>

        <div className="p-4 bg-white rounded-xl border border-gray-150">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Audit Activity</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center">
              <i className="fa-solid fa-clock text-xs" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xs font-bold font-mono text-gray-900 truncate block mt-1">{latestChangeTime}</span>
            <span className="text-[10px] text-gray-400 block mt-1">Last detected state change</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout - Two Column (Ledger Table & Real-time Security Health Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Ledger column */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-150 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <i className="fa-solid fa-magnifying-glass text-xs" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search action details, values..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value as any); setCurrentPage(1); }}
                  className="bg-white border border-gray-200 rounded-lg text-xs p-1.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Fee Configuration">Fee Configuration</option>
                  <option value="Validation Rules">Validation Rules</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Actor:</span>
                <select
                  value={selectedActor}
                  onChange={(e) => { setSelectedActor(e.target.value); setCurrentPage(1); }}
                  className="bg-white border border-gray-200 rounded-lg text-xs p-1.5 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="All">All Actors</option>
                  {allActors.map(actor => (
                    <option key={actor} value={actor}>{actor}</option>
                  ))}
                </select>
              </div>

              {(searchQuery !== '' || selectedCategory !== 'All' || selectedActor !== 'All') && (
                <button
                  onClick={handleResetFilters}
                  className="text-rose-600 hover:text-rose-800 font-bold text-xs flex items-center space-x-1 transition-colors px-1 cursor-pointer"
                >
                  <i className="fa-solid fa-filter-circle-xmark" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Ledger List Card */}
          <div className="bg-white rounded-xl border border-gray-150 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4 w-10"></th>
                    <th className="p-4 w-40">Timestamp</th>
                    <th className="p-4 w-44">Category</th>
                    <th className="p-4">Action / Event Description</th>
                    <th className="p-4 w-44">Authorized Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-sans">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => {
                      const isFee = log.category === 'Fee Configuration';
                      const isExpanded = expandedLogId === log.id;
                      return (
                        <React.Fragment key={log.id}>
                          <tr 
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                          >
                            <td className="p-4 text-center">
                              <i className={`fa-solid ${isExpanded ? 'fa-angle-down' : 'fa-angle-right'} text-gray-400 transition-transform`} />
                            </td>
                            <td className="p-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                              {log.timestamp}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide inline-flex items-center space-x-1 ${
                                isFee 
                                  ? 'bg-amber-50 text-amber-800 border border-amber-100' 
                                  : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                              }`}>
                                <i className={`text-[10px] ${isFee ? 'fa-solid fa-sliders' : 'fa-solid fa-shield-halved'}`} />
                                <span>{log.category}</span>
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-gray-900">
                              {highlightTerm(log.action, searchQuery)}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[9px] border border-emerald-100 uppercase">
                                  {log.performedBy.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-700 text-xs">
                                  {highlightTerm(log.performedBy.split(' (')[0], searchQuery)}
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded detail diff block */}
                          {isExpanded && (
                            <tr className="bg-gray-50/70">
                              <td colSpan={5} className="p-4 border-t border-b border-gray-150/60">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
                                    <span className="flex items-center space-x-1">
                                      <i className="fa-solid fa-key" />
                                      <span>Log ID: {log.id}</span>
                                    </span>
                                    <span className="flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-sm">
                                      <i className="fa-solid fa-shield-halved text-[10px]" />
                                      <span>Checksum SECURED: Verified Valid</span>
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center space-x-1.5 text-xs text-rose-800 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 w-fit">
                                        <i className="fa-solid fa-minus text-[10px]" />
                                        <span>Previous Value / Configuration State</span>
                                      </div>
                                      <pre className="p-3 bg-gray-900 text-rose-400 font-mono text-[10.5px] rounded-xl border border-gray-800 overflow-x-auto whitespace-pre-wrap max-h-36">
                                        <code>{log.previousValue}</code>
                                      </pre>
                                    </div>

                                    <div className="space-y-1.5">
                                      <div className="flex items-center space-x-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
                                        <i className="fa-solid fa-plus text-[10px]" />
                                        <span>New Commited Value / Configuration State</span>
                                      </div>
                                      <pre className="p-3 bg-gray-900 text-emerald-400 font-mono text-[10.5px] rounded-xl border border-gray-800 overflow-x-auto whitespace-pre-wrap max-h-36">
                                        <code>{log.newValue}</code>
                                      </pre>
                                    </div>
                                  </div>

                                  <div className="text-[11px] text-gray-400 italic">
                                    Authorized and signed off electronically by <strong className="text-gray-600">{log.performedBy}</strong> on {log.timestamp} UTC.
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-gray-400">
                        <div className="max-w-xs mx-auto space-y-3">
                          <div className="w-12 h-12 bg-gray-50 border border-gray-150 rounded-2xl flex items-center justify-center text-gray-400 mx-auto text-lg shadow-inner">
                            <i className="fa-solid fa-clipboard-question text-gray-300" />
                          </div>
                          <p className="font-bold text-gray-700 text-sm">No Audit Trail Logs Found</p>
                          <p className="text-xs text-gray-400 leading-relaxed font-sans">
                            No modifications found matching the active criteria. Click on "Simulate Drift Event" above to inject new logs.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-150 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
                <span className="text-gray-500 font-sans">
                  Showing <span className="font-bold text-gray-800">{startIndex + 1}</span> to{' '}
                  <span className="font-bold text-gray-800">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
                  <span className="font-bold text-gray-800">{totalItems}</span> immutable entries
                </span>

                <div className="flex items-center space-x-1.5 font-mono">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white cursor-pointer transition-colors font-bold flex items-center space-x-1"
                  >
                    <i className="fa-solid fa-angle-left" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg border font-bold transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white cursor-pointer transition-colors font-bold flex items-center space-x-1"
                  >
                    <i className="fa-solid fa-angle-right" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security feed column */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Integrity Shield widget */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Integrity Shield</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex items-center space-x-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-lock text-base" />
              </div>
              <div>
                <span className="text-xs font-bold block">Log State Sealed</span>
                <span className="text-[10px] text-slate-400 font-mono">SHA-256 Chain Locked</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono pt-1 leading-normal border-t border-slate-800/80">
              <span className="text-slate-300">Active Node Key:</span>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-emerald-500 truncate mt-1">
                sha256-aistudio-build-v4.0.0-immutable-ledger-ewa
              </div>
            </div>
          </div>

          {/* Real-time system health alerts */}
          <div className="bg-white p-4 rounded-xl border border-gray-150 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Security Health</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-100 font-semibold font-mono">Live</span>
            </div>

            <div className="space-y-3">
              {securityLogs.map((sec) => (
                <div key={sec.id} className="flex items-start space-x-2.5">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    sec.type === 'critical' 
                      ? 'bg-rose-500' 
                      : sec.type === 'warning' 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                  }`} />
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-gray-800 leading-snug">{sec.msg}</p>
                    <span className="text-[9px] text-gray-400 block font-mono">{sec.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maker checker electronic signature note */}
          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
              <i className="fa-solid fa-signature" />
              <span>Multi-Signatory Audit</span>
            </div>
            <p className="text-[10.5px] text-amber-800/90 leading-relaxed font-sans">
              All listed system configuration logs are signed electronically with two-factor authorization markers. Commits to EWA thresholds or Fee percentages require secondary Approval by the Finance Checker before taking active effect in calculation engines.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
