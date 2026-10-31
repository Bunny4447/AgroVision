import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Mail, Settings, RefreshCw, CheckCircle, AlertTriangle, Send, Key, Database, Crown } from 'lucide-react';
import { User, SmtpSettings } from '../types';
import { apiUrl } from '../config';

interface AdminPanelProps {
  currentUser: User | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [smtpConfig, setSmtpConfig] = useState<SmtpSettings | null>(null);
  const [loadingSmtp, setLoadingSmtp] = useState(true);

  // SMTP Form state
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPassword, setSenderPassword] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [senderName, setSenderName] = useState('AgroVision AI Support');
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpStatusMsg, setSmtpStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test Email state
  const [testEmail, setTestEmail] = useState(currentUser?.email || 'adityareddy14623@gmail.com');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(apiUrl('/api/admin/users'));
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSmtpConfig = async () => {
    setLoadingSmtp(true);
    try {
      const res = await fetch(apiUrl('/api/admin/smtp-config'));
      const data: SmtpSettings = await res.json();
      setSmtpConfig(data);
      if (data.sender_email && data.sender_email !== 'Not configured yet') {
        setSenderEmail(data.sender_email);
      }
      if (data.smtp_host) setSmtpHost(data.smtp_host);
      if (data.smtp_port) setSmtpPort(data.smtp_port);
      if (data.sender_name) setSenderName(data.sender_name);
    } catch (err) {
      console.error('Failed fetching SMTP settings:', err);
    } finally {
      setLoadingSmtp(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSmtpConfig();
  }, []);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpStatusMsg(null);

    try {
      const res = await fetch(apiUrl('/api/admin/smtp-config'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_email: senderEmail.trim(),
          sender_password: senderPassword.trim(),
          smtp_host: smtpHost.trim(),
          smtp_port: Number(smtpPort),
          sender_name: senderName.trim(),
          use_tls: true
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed saving SMTP configuration');

      setSmtpStatusMsg({ type: 'success', text: data.message });
      fetchSmtpConfig();
    } catch (err: any) {
      setSmtpStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestingSmtp(true);
    setTestResult(null);

    try {
      const res = await fetch(apiUrl('/api/admin/test-smtp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_email: testEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Test email failed');

      setTestResult({ type: 'success', text: data.message });
    } catch (err: any) {
      setTestResult({ type: 'error', text: err.message });
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Administrator Portal</span>
            </div>
            <h2 className="text-3xl font-black text-white">
              System Control & User Management
            </h2>
            <p className="text-xs text-slate-300">
              Logged in as <strong className="text-emerald-400 font-mono">adityareddy14623@gmail.com</strong> (Primary Admin)
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800">
            <Database className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Database Status</p>
              <p className="text-sm font-bold text-white font-mono">MySQL (agrovision_db)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Registered Users Table */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <Users className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Registered Users Database
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total {users.length} registered accounts stored in MySQL
                  </p>
                </div>
              </div>

              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="p-2 rounded-xl text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh user list"
              >
                <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingUsers ? (
              <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Loading users from MySQL...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No users found in database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono font-semibold">
                    <tr>
                      <th className="p-3 rounded-l-lg">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-r-lg">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => {
                      const isAdmin = u.role === 'admin' || u.email === 'adityareddy14623@gmail.com';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 space-y-0.5">
                            <p className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-500 inline" />}
                            </p>
                            <p className="font-mono text-[11px] text-slate-500 truncate max-w-[200px]">
                              {u.email}
                            </p>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                              isAdmin
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              {isAdmin ? '👑 Admin' : '🌾 Farmer'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.is_verified
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            }`}>
                              {u.is_verified ? 'Verified' : 'Pending OTP'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {u.created_at?.split(' ')[0] || 'Recent'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Outbound Email & SMTP Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Outbound Email & SMTP Configuration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Powers verification OTPs & professional guide emails
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                smtpConfig?.is_configured
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                {smtpConfig?.is_configured ? 'Live Active' : 'Setup Needed'}
              </span>
            </div>

            {/* Instruction Callout for Gmail App Password */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                <span>How to connect your Gmail Account:</span>
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                1. Go to your Google Account &rarr; Security &rarr; <strong>2-Step Verification</strong>.<br />
                2. Scroll to bottom &rarr; <strong>App Passwords</strong> &rarr; generate a 16-character password.<br />
                3. Paste your Gmail address and that 16-character App Password below.
              </p>
            </div>

            {smtpStatusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                smtpStatusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
              }`}>
                {smtpStatusMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
                <span>{smtpStatusMsg.text}</span>
              </div>
            )}

            {/* SMTP Form */}
            <form onSubmit={handleSaveSmtp} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Sender Email Address
                </label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. adityareddy14623@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Google App Password / SMTP Password
                </label>
                <input
                  type="password"
                  required
                  value={senderPassword}
                  onChange={(e) => setSenderPassword(e.target.value)}
                  placeholder="16-character App Password (e.g. abcd efgh ijkl mnop)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">SMTP Server Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">SMTP Port (TLS)</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSmtp}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60"
              >
                {savingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
                <span>{savingSmtp ? 'Saving Settings...' : 'Save & Enable SMTP Outbound Email'}</span>
              </button>
            </form>

            {/* Test Email Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Verify Live Email Delivery</span>
                <span className="text-[10px] text-slate-400">1-click test</span>
              </div>

              <div className="flex space-x-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={testingSmtp}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {testingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Test</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                  testResult.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                }`}>
                  {testResult.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
                  <span>{testResult.text}</span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
