import React from 'react';
import { ShieldCheck, AlertOctagon, Sparkles, MapPin, CheckCircle } from 'lucide-react';
import { PredictionResult } from '../types';

interface FarmerSummaryBannerProps {
  result: PredictionResult;
}

export const FarmerSummaryBanner: React.FC<FarmerSummaryBannerProps> = ({ result }) => {
  // Determine top affected region
  const sortedRegions = Object.entries(result.regions).sort((a, b) => b[1].score - a[1].score);
  const topRegionKey = sortedRegions[0][0];
  const topRegionData = sortedRegions[0][1];

  const urgencyBg = {
    High: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
    Medium: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
    Low: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300',
    None: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
  }[result.disease_info.urgency] || 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';

  return (
    <div className="space-y-4">
      
      {/* Low Confidence Warning Alert */}
      {result.is_low_confidence && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-3 shadow-sm">
          <AlertOctagon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">Low Prediction Confidence ({result.confidence}%)</p>
            <p className="leading-relaxed">{result.low_confidence_message}</p>
          </div>
        </div>
      )}

      {/* Main Paddy Health Summary Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>🌾 Paddy Health Diagnostic Summary</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white pt-1">
                {result.display_name}
              </h2>
            </div>

            {/* Confidence Gauge Badge */}
            <div className="bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-emerald-500/30 flex items-center space-x-4 self-start sm:self-auto shadow-lg">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">AI Confidence</p>
                <p className="text-2xl font-black text-emerald-400 font-mono">{result.confidence}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40 text-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Most Affected Zone:</span>
              </p>
              <p className="text-base font-bold text-white">
                {topRegionData.name.split(' (')[0]}
              </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Affected Region Estimate:</p>
              <p className="text-base font-bold text-amber-300">
                {topRegionData.status} ({topRegionData.percentage}%)
              </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Action Urgency:</p>
              <p className="text-base font-bold text-emerald-300">
                {result.disease_info.urgency} Action Required
              </p>
            </div>

          </div>

          {/* Farmer Natural Language Explanation Banner */}
          <div className="bg-slate-950/70 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-emerald-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 font-semibold block mb-0.5">AI Explanation:</strong>
              <span>{result.explanation}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
