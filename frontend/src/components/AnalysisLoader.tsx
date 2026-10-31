import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const AnalysisLoader: React.FC = () => {
  const [step, setStep] = useState(0);

  const steps = [
    'Processing image & normalizing color channels...',
    'Extracting leaf features via ResNet18 CNN...',
    'Computing Grad-CAM gradients on conv layer4...',
    'Evaluating Top, Middle, and Bottom leaf regions...',
    'Generating farmer explanation & recommendations...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="max-w-xl mx-auto py-12 px-6 rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
      
      {/* Animated AI Pulse Icon */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
          <Cpu className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center space-x-2">
          <span>Analyzing Paddy Leaf</span>
          <Sparkles className="w-4 h-4 text-emerald-500" />
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          AgroVision Deep Learning & Grad-CAM Explainability Engine
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5 text-left pt-2">
        {steps.map((label, idx) => {
          const isDone = idx < step;
          const isCurrent = idx === step;
          return (
            <div 
              key={idx}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isDone 
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : isCurrent 
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 font-semibold'
                    : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex-shrink-0" />
              )}
              <span>{label}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
