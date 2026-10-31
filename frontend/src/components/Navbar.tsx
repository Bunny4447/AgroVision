import React from 'react';
import { Leaf, BarChart2, History, Info, Moon, Sun, ShieldCheck, LogIn, LogOut, Crown, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: 'analyzer' | 'history' | 'metrics' | 'how-it-works' | 'admin' | 'auth';
  setCurrentTab: (tab: 'analyzer' | 'history' | 'metrics' | 'how-it-works' | 'admin' | 'auth') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  historyCount: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  historyCount,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'adityareddy14623@gmail.com';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[#131f22]/80 border-b border-slate-200 dark:border-emerald-950/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('analyzer')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Agro<span className="text-emerald-500">Vision</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                v2.0 AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Paddy Health Intelligence & Grad-CAM Explainability
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setCurrentTab('analyzer')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'analyzer'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Leaf Analyzer</span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'history'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('metrics')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'metrics'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Model Stats</span>
          </button>

          <button
            onClick={() => setCurrentTab('how-it-works')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'how-it-works'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="hidden md:inline">How It Works</span>
          </button>

          {/* Admin Panel Tab (Exclusive to Aditya Reddy) */}
          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 font-bold border border-amber-500/40'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(prev => !prev)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            title="Toggle Dark/Light Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Auth Button or User Menu */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isAdmin ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5 font-mono">
                    {isAdmin ? 'Admin' : 'Farmer'}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`flex items-center space-x-1.5 ml-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                currentTab === 'auth'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </nav>

      </div>
    </header>
  );
};
