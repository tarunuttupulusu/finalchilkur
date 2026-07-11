"use client";
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Search, RefreshCw, Loader2, AlertCircle, FileText, Calendar
} from 'lucide-react';

export default function AuditLogsCMS() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/audit');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  // Extract unique actions for filter options
  const uniqueActions = React.useMemo(() => {
    const actions = new Set<string>();
    logs.forEach(log => {
      if (log.action) actions.add(log.action);
    });
    return ['All', ...Array.from(actions)];
  }, [logs]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-brand-dark/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <ShieldAlert size={14} className="text-brand-accent animate-pulse" />
            Security & Compliance
          </span>
          <h1 className="font-display text-3xl font-black text-brand-dark mt-2">
            Audit Trail Logs
          </h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Review security-audited operations: who added dishes, exported databases, or modified site templates.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-brand-dark/10 hover:border-brand-accent text-brand-dark font-bold uppercase tracking-wider text-xs shadow-sm transition-all"
        >
          <RefreshCw size={14} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-dark/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={16} />
          <input
            type="text"
            placeholder="Search by admin email or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#ECE3D4]/20 border border-brand-dark/10 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-brand-dark/65">Action Filter:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-white border border-brand-dark/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-accent"
          >
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
          <p className="font-display text-lg font-bold text-brand-dark">Loading compliance trail...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl overflow-hidden border border-brand-dark/5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-brand-dark text-[#F6EFE3] font-display font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Admin User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Detailed Description</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4 pr-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5 text-brand-dark/85">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-brand-dark/50">
                      No security audit records match your query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-brand-dark/5 transition-colors">
                      <td className="p-4 pl-6 font-bold truncate max-w-[180px]">{log.userEmail}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-accent/15 text-brand-accent">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 leading-relaxed">{log.details}</td>
                      <td className="p-4 font-mono text-[10px] text-brand-dark/60">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-4 pr-6 font-mono text-[10px] whitespace-nowrap text-brand-dark/60">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
