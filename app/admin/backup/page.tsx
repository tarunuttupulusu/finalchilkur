"use client";
import React, { useState } from 'react';
import { 
  Database, Download, Upload, RefreshCw, Loader2, Sparkles, Check, 
  AlertTriangle, ShieldAlert, FileText
} from 'lucide-react';

export default function BackupCMS() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // File restore state
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  const handleExportBackup = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cms/backup');
      const data = await res.json();
      if (data.success) {
        const jsonStr = JSON.stringify(data.payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `BSD_Database_Backup_${new Date().toISOString().slice(0,10)}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSuccessMsg('Database snapshot exported successfully!');
      } else {
        setErrorMsg(data.error || 'Export failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error exporting backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) return;

    if (!confirm('WARNING: Restoring a database backup will overwrite existing dishes, categories, offers, and gallery photos! Proceed?')) {
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonText = event.target?.result as string;
          const payload = JSON.parse(jsonText);

          const res = await fetch('/api/cms/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'restore', payload })
          });
          const data = await res.json();
          if (data.success) {
            setSuccessMsg('Database restored successfully from backup file!');
            setRestoreFile(null);
          } else {
            setErrorMsg(data.error || 'Restore operation failed');
          }
        } catch (err: any) {
          setErrorMsg('Invalid JSON format: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(restoreFile);
    } catch (err: any) {
      setErrorMsg('Error reading file: ' + err.message);
      setLoading(false);
    }
  };

  const handleTriggerSeeding = async () => {
    if (!confirm('Re-seed the database? This will restore the database to the initial 162 standard dishes and 35 gallery assets, resetting all modifications. Proceed?')) {
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/cms/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_reset' })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Database successfully seeded to factory default settings!');
      } else {
        setErrorMsg(data.error || 'Seed resetting failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error triggering database seeding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-brand-dark/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <Database size={14} className="text-brand-gold animate-pulse" />
            System Maintenance
          </span>
          <h1 className="font-display text-3xl font-black text-brand-dark mt-2">
            Backups & Database Reset
          </h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Export entire database schemas, restore configuration from files, or re-run default seeders.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl flex items-center gap-3 animate-slideDown">
          <Check size={18} className="text-green-600" />
          <span className="text-xs font-bold uppercase tracking-wider">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-3 animate-slideDown">
          <AlertTriangle size={18} className="text-red-600" />
          <span className="text-xs font-bold uppercase tracking-wider">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Export / Seed Card */}
        <div className="bg-white p-8 rounded-3xl border border-brand-dark/5 shadow-sm space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-brand-dark flex items-center gap-2">
              <Download size={18} className="text-brand-accent" />
              <span>Export & Default Seeding</span>
            </h3>
            <p className="text-xs text-brand-dark/50 mt-1">Export full snapshot or restore template to factory defaults.</p>
          </div>

          <div className="space-y-4">
            <div className="border border-brand-dark/5 bg-brand-bg rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-brand-dark block">Download DB Snapshot</span>
              <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                Downloads a single, standalone JSON file containing all Categories, Dishes, Testimonials, Offers, Gallery Photos, Site Settings, and Audit Logs. Use this for server migrations.
              </p>
              
              <button
                onClick={handleExportBackup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-dark hover:bg-brand-dark/95 text-[#F6EFE3] font-bold uppercase tracking-wider text-xs rounded-xl shadow-md disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                <span>Download Database JSON Backup</span>
              </button>
            </div>

            <div className="border border-red-100 bg-red-50/50 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>Re-seed Factory Defaults</span>
              </span>
              <p className="text-[11px] text-red-900/75 leading-relaxed">
                Overwrites the database with default starter values. Useful for resetting local sandbox modifications or cleaning trash assets. Re-runs `seed-cms.ts`.
              </p>
              
              <button
                onClick={handleTriggerSeeding}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                <span>Trigger Database Re-seeding</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upload / Restore Card */}
        <div className="bg-white p-8 rounded-3xl border border-brand-dark/5 shadow-sm space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-brand-dark flex items-center gap-2">
              <Upload size={18} className="text-brand-accent" />
              <span>Restore Database Snapshot</span>
            </h3>
            <p className="text-xs text-brand-dark/50 mt-1">Upload a JSON backup file to overwrite current configuration.</p>
          </div>

          <form onSubmit={handleRestoreBackup} className="space-y-4">
            <div className="border-2 border-dashed border-brand-dark/10 hover:border-brand-accent rounded-2xl p-8 text-center bg-brand-bg relative cursor-pointer">
              {restoreFile ? (
                <div className="space-y-2 flex flex-col items-center">
                  <Database className="text-brand-accent" size={32} />
                  <span className="text-xs font-bold text-brand-dark truncate max-w-[200px]">
                    {restoreFile.name}
                  </span>
                  <span className="text-[9px] text-brand-dark/45 font-mono">
                    Size: {(restoreFile.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => setRestoreFile(null)}
                    className="text-[10px] text-red-500 underline font-semibold"
                  >
                    Select different file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-brand-dark/35" size={32} />
                  <span className="block text-xs font-bold text-brand-dark/65">
                    Select JSON Backup File
                  </span>
                  <span className="block text-[9px] text-brand-dark/45">
                    Only .json files generated from this CMS portal are supported.
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    required
                    onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !restoreFile}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-brand-accent/20 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
              <span>Restore Backup Snapshot</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
