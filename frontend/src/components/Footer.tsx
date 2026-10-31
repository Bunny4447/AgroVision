import React from 'react';
import { Leaf, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#131f22] border-t border-slate-200 dark:border-slate-800 py-10 transition-colors mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                Agro<span className="text-emerald-500">Vision</span>
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI-Powered Paddy Leaf Health & Grad-CAM Explainability System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500 dark:text-slate-400">
            <span>ResNet18 Transfer Learning</span>
            <span>•</span>
            <span>PyTorch Grad-CAM</span>
            <span>•</span>
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>React Frontend</span>
          </div>

        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} AgroVision System. Built for Agricultural Health & Explainable AI.</p>
          <p className="flex items-center space-x-1">
            <span>Designed for Farmers, Extension Officers & Researchers</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
