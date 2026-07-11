"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, Search, RefreshCw, Loader2, AlertCircle, FileText, Calendar
} from 'lucide-react';

export default function AuditLogsCMS() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionFilter, setActionFilter] = useState('All');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs(isRefreshing = false) {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/cms/audit');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch audit trail logs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // 3. SEARCH INPUT DEBOUNCING
  // Prevents keyboard lag/latency in table filtering by debouncing keypress events by 250ms
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const filteredLogs = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    return logs.filter(log => {
      const matchesSearch = !query || 
        log.userEmail.toLowerCase().includes(query) ||
        (log.details && log.details.toLowerCase().includes(query)) ||
        (log.action && log.action.toLowerCase().includes(query));
      
      const matchesAction = actionFilter === 'All' || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, debouncedSearch, actionFilter]);

  // Extract unique actions for filter options list
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach(log => {
      if (log.action) actions.add(log.action);
    });
    return ['All', ...Array.from(actions)];
  }, [logs]);

  // Helper to determine action tag style
  const getActionTagStyle = (action: string) => {
    const a = (action || '').toUpperCase();
    if (a.includes('DELETE') || a.includes('REMOVE')) {
      return 'bg-rose-50 text-rose-800 border border-rose-100';
    }
    if (a.includes('ADD') || a.includes('CREATE') || a.includes('IMPORT')) {
      return 'bg-emerald-50 text-emerald-800 border border-emerald-100';
    }
    if (a.includes('UPDATE') || a.includes('EDIT') || a.includes('REORDER') || a.includes('TOGGLE')) {
      return 'bg-zinc-100 text-zinc-800 border border-zinc-200';
    }
    return 'bg-zinc-50 text-zinc-650 border border-zinc-200';
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* Header Panel (Desaturated Off-white and Zinc styling) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <ShieldAlert size={12} className="text-zinc-400" />
            Security & Compliance
          </span>
          <h1 className="font-display text-2xl font-black text-zinc-800 mt-2">
            Audit Trail Logs
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Review security-audited operations: who added dishes, exported databases, or modified site templates.
          </p>
        </div>

        <button
          onClick={() => loadLogs(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-zinc-650 hover:text-zinc-800 text-[10px] font-bold uppercase transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80 flex items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
          <Search className="text-zinc-400 mr-2" size={14} />
          <input
            type="text"
            placeholder="Search by admin email or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-750 focus:outline-none placeholder-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-zinc-500">Action Filter:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-zinc-800"
          >
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-zinc-200 shadow-sm">
          <Loader2 className="animate-spin text-zinc-500 mb-4" size={48} />
          <p className="font-display text-base font-bold text-zinc-700">Loading compliance trail...</p>
        </div>
      ) : (
        /* Compliance Logs Table */
        <div className="bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-zinc-800 text-white font-display font-bold uppercase tracking-wider border-b border-zinc-700">
                  <th className="p-4 pl-6 text-[10px]">Admin User</th>
                  <th className="p-4 text-[10px]">Action</th>
                  <th className="p-4 text-[10px]">Detailed Description</th>
                  <th className="p-4 text-[10px]">IP Address</th>
                  <th className="p-4 pr-6 text-[10px]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-400 font-medium">
                      No security audit records match your query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4 pl-6 font-bold truncate max-w-[180px]">{log.userEmail}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getActionTagStyle(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      {/* Description data fallback support */}
                      <td className="p-4 leading-relaxed">
                        {log.details && log.details.trim() ? log.details : <span className="text-zinc-400 italic">— System Modified</span>}
                      </td>
                      <td className="p-4 font-mono text-[10px] text-zinc-500">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-4 pr-6 font-mono text-[10px] whitespace-nowrap text-zinc-500">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
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
