import React from 'react';
import { ArrowRight, Eye, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

interface HeroProps {
  onStartAnalysis: () => void;
  onExploreHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartAnalysis, onExploreHowItWorks }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-emerald-950/20 dark:via-[#0b1315] dark:to-[#0b1315] pt-10 pb-16 border-b border-slate-200/60 dark:border-slate-800/60">
      
      {/* Decorative Glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>CNN Deep Learning + Grad-CAM Visual Explainability</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              See What's Affecting Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400">Paddy Leaf</span>.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Don't just tell farmers what disease the leaf has. <strong className="text-slate-900 dark:text-emerald-300 font-semibold">Show them WHERE the AI sees the problem</strong> with region-by-region visual attention maps and actionable management steps.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onStartAnalysis}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transform active:scale-95 transition-all"
              >
                <span>Analyze Paddy Leaf</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreHowItWorks}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-medium text-base flex items-center justify-center space-x-2 transition-colors"
              >
                <Eye className="w-5 h-5 text-emerald-500" />
                <span>Explore How It Works</span>
              </button>
            </div>

            {/* Quick Feature Stats */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">5 Classes</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Blight, Spot, Smut, Blast, Healthy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Grad-CAM</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Layer4 Conv Heatmap</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">3 Leaf Zones</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Top, Middle, Bottom</p>
              </div>
            </div>

          </div>

          {/* Right Hero Graphic Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-slate-900/90 p-4 border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl overflow-hidden group">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-emerald-300 font-semibold">ResNet18 + Grad-CAM Overlay</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                  94.2% Confidence
                </span>
              </div>

              {/* Graphic visual container */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                
                {/* Simulated Paddy Leaf + Grad-CAM Heatmap mockup */}
                <div className="w-full h-full relative flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 300 400" fill="none">
                    {/* Background */}
                    <rect width="300" height="400" fill="#0f172a" />
                    {/* Leaf shape */}
                    <path 
                      d="M150,20 Q210,120 200,280 Q190,360 150,380 Q110,360 100,280 Q90,120 150,20 Z" 
                      fill="#15803d" 
                      stroke="#22c55e" 
                      strokeWidth="2" 
                    />
                    {/* Midrib */}
                    <line x1="150" y1="20" x2="150" y2="380" stroke="#4ade80" strokeWidth="2" />
                    
                    {/* Grad-CAM Heatmap Radial Blends */}
                    {/* High attention top-middle (Red/Orange) */}
                    <ellipse cx="150" cy="140" rx="35" ry="45" fill="url(#gradHigh)" opacity="0.85" />
                    {/* Med attention center (Yellow) */}
                    <ellipse cx="150" cy="220" rx="30" ry="35" fill="url(#gradMed)" opacity="0.7" />
                    {/* Low attention bottom (Green/Blue) */}
                    <ellipse cx="150" cy="300" rx="20" ry="25" fill="url(#gradLow)" opacity="0.5" />
                    
                    <defs>
                      <radialGradient id="gradHigh">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#f97316" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="gradMed">
                        <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="gradLow">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                  </svg>

                  {/* Zone Overlay Annotation Floating Badges */}
                  <div className="absolute top-[25%] left-4 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-rose-500/40 text-[11px] text-rose-300 font-semibold shadow-md">
                    Top Region: HIGH (72%)
                  </div>
                  <div className="absolute top-[48%] right-4 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-amber-500/40 text-[11px] text-amber-300 font-semibold shadow-md">
                    Middle Region: MED (48%)
                  </div>
                  <div className="absolute bottom-[20%] left-6 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/40 text-[11px] text-emerald-300 font-semibold shadow-md">
                    Bottom Region: LOW (12%)
                  </div>
                </div>

              </div>

              {/* Graphic Footer Legend */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span>High Attention</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                  <span>Medium Attention</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                  <span>Low / Healthy</span>
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
