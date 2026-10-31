import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Leaf,
  Sparkles,
  Edit3,
  Check
} from 'lucide-react';
import { User } from '../types';
import { apiUrl } from '../config';

interface AuthPageProps {
  onBackToApp: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

type AuthView = 'login' | 'register' | 'verify' | 'forgot-password' | 'reset-password';

export const AuthPage: React.FC<AuthPageProps> = ({
  onBackToApp,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [view, setView] = useState<AuthView>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');

      setSuccessMsg(data.message || `A 6-digit code has been dispatched to ${email}. Check your email inbox.`);
      setView('verify');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanCode = code.trim();
    if (!cleanCode) {
      setErrorMsg('Please enter your 6-digit verification code.');
      return;
    }
    if (cleanCode.length !== 6) {
      setErrorMsg('The verification code must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: cleanCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Verification failed');

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    resetMessages();
    setIsResending(true);
    try {
      const res = await fetch(apiUrl('/api/auth/resend-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not resend code');

      setSuccessMsg(data.message || `A fresh 6-digit verification code has been dispatched to ${email}. Check your inbox.`);
      setResendCooldown(10);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = async () => {
    const cleanNew = newEmailInput.trim();
    if (!cleanNew || !cleanNew.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    resetMessages();
    setIsChangingEmail(true);
    try {
      const res = await fetch(apiUrl('/api/auth/change-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_email: email, new_email: cleanNew })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed updating email');

      setEmail(data.email);
      setIsEditingEmail(false);
      setSuccessMsg(data.message || `Email updated to ${data.email}. A new verification code has been sent.`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.detail && data.detail.includes('not verified')) {
          setView('verify');
        }
        throw new Error(data.detail || 'Login failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not initiate password reset');

      setSuccessMsg(data.message || `A 6-digit recovery code has been sent to ${email}. Check your email.`);
      setView('reset-password');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim(), new_password: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Password reset failed');

      setSuccessMsg(data.message || 'Password reset successful! Please sign in with your new password.');
      setView('login');
      setPassword('');
      setConfirmPassword('');
      setCode('');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Navigation Bar for Auth Interface */}
      <div className="max-w-5xl w-full mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={onBackToApp}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-[#131f22] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leaf Analyzer</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>TLS 256-Bit Encrypted Authentication</span>
        </div>
      </div>

      {/* Main Two-Column Container */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden">
        
        {/* Left Column: Brand & Security Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-[#0d2222] to-[#0b1619] p-8 sm:p-10 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-900/30">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AgroVision v2.0 AI Portal</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                Paddy Health Intelligence & Diagnostics
              </h2>
              <p className="text-sm text-emerald-100/70 leading-relaxed">
                Log in to store your farm diagnostics history, inspect Grad-CAM leaf attention heatmaps, and access expert agronomic treatment plans.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-emerald-800/40">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">ResNet-18 Deep Residual Vision</h4>
                  <p className="text-[11px] text-emerald-100/60">High-confidence classification of Bacterial Blight, Blast, Brown Spot, Tungro, and Healthy crops.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Email OTP Security</h4>
                  <p className="text-[11px] text-emerald-100/60">6-digit cryptographically secure verification codes dispatched directly to your personal email inbox.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Full Admin Governance</h4>
                  <p className="text-[11px] text-emerald-100/60">Administrator controls for registered farmer accounts, SMTP configs, and evaluation metrics.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 text-[11px] text-emerald-200/50 border-t border-emerald-900/40 mt-8 lg:mt-0">
            AgroVision Explainable AI Platform &copy; 2026. All rights reserved.
          </div>
        </div>

        {/* Right Column: Authentication Form Interface */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6 text-slate-900 dark:text-slate-100">
          
          {/* Header & Sub-title */}
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {view === 'login' && 'Sign In to Your Account'}
              {view === 'register' && 'Create Farmer / Researcher Account'}
              {view === 'verify' && 'Verify Email Address'}
              {view === 'forgot-password' && 'Password Recovery'}
              {view === 'reset-password' && 'Set New Password'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {view === 'login' && 'Enter your credentials below to access your diagnostic workspace'}
              {view === 'register' && 'Enter your details to receive your 6-digit email verification code'}
              {view === 'verify' && `Please check your email inbox for the 6-digit code sent to ${email}`}
              {view === 'forgot-password' && 'Enter your email address and we will dispatch a recovery code to your inbox'}
              {view === 'reset-password' && 'Enter the 6-digit recovery code from your email and your new password'}
            </p>
          </div>

          {/* Navigation Pill Switcher for Sign In / Register */}
          {(view === 'login' || view === 'register') && (
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/60 max-w-xs">
              <button
                type="button"
                onClick={() => { setView('login'); resetMessages(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  view === 'login'
                    ? 'bg-white dark:bg-[#1a292d] text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setView('register'); resetMessages(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  view === 'register'
                    ? 'bg-white dark:bg-[#1a292d] text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Error and Success Alerts */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. adityareddy14623@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot-password'); resetMessages(); }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setView('register'); resetMessages(); }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditya Reddy"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">We will send a 6-digit verification code to this email.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code to Email...</span>
                  </>
                ) : (
                  <>
                    <span>Register & Get Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setView('login'); resetMessages(); }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Sign In instead
                </button>
              </div>
            </form>
          )}

          {/* 3. VERIFY CODE FORM (No code reveal, user checks real email) */}
          {view === 'verify' && (
            <div className="space-y-5">
              
              {/* Recipient Email Banner with Edit Typo Feature */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Verification Code Sent To:</span>
                  {!isEditingEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewEmailInput(email);
                        setIsEditingEmail(true);
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit / Fix Typo</span>
                    </button>
                  )}
                </div>

                {isEditingEmail ? (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="email"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleChangeEmail}
                      disabled={isChangingEmail}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors flex items-center space-x-1"
                    >
                      {isChangingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {email}
                  </div>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Please open your email inbox (and check Spam/Junk if needed) to copy the 6-digit verification code.
                </p>
              </div>

              {/* 6-Digit Code Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-emerald-500/40 focus:border-emerald-500 bg-slate-50 dark:bg-slate-900/60 text-center font-mono font-black text-xl tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Activating Account...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Activate Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend Code Options */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isResending}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 disabled:opacity-50 disabled:no-underline"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <span>Resend in {resendCooldown}s</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => { setView('login'); resetMessages(); }}
                  className="hover:underline"
                >
                  &larr; Back to Sign In
                </button>
              </div>

            </div>
          )}

          {/* 4. FORGOT PASSWORD FORM */}
          {view === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. adityareddy14623@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">We will dispatch a 6-digit recovery code to this email.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Recovery Code to Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { setView('login'); resetMessages(); }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET PASSWORD FORM (No code reveal, user checks real email) */}
          {view === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Recovery Code Sent To:</span>
                <p className="font-mono font-bold text-amber-500 text-sm">{email}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter the 6-digit code received in your email inbox to reset your password.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">6-Digit Recovery Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-5 h-5 text-amber-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-amber-500/40 focus:border-amber-500 bg-slate-50 dark:bg-slate-900/60 text-center font-mono font-black text-xl tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-600/25 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Password Reset</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => { setView('login'); resetMessages(); }}
                  className="hover:underline"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
