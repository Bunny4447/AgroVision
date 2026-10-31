import React from 'react';
import { Target, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { RegionsAnalysis, RegionInfo } from '../types';

interface RegionAnalysisCardProps {
  regions: RegionsAnalysis;
}

export const RegionAnalysisCard: React.FC<RegionAnalysisCardProps> = ({ regions }) => {
  const renderRegionRow = (key: string, data: RegionInfo) => {
    let badgeBg = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    let barColor = 'bg-emerald-500';

    if (data.level === 'high') {
      badgeBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      barColor = 'bg-rose-500';
    } else if (data.level === 'medium') {
      badgeBg = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      barColor = 'bg-amber-500';
    }

    return (
      <div 
        key={key}
        className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/80 dark:border-slate-800 space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {key} Zone
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {data.name}
            </h4>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeBg}`}>
            {data.status}
          </span>
        </div>

        {/* Progress Bar & Scores */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400">
              AI Activation Intensity:
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {data.percentage}% (Peak: {Math.round(data.peak * 100)}%)
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700/80 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
              style={{ width: `${Math.min(100, Math.max(5, data.percentage))}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span>Leaf Region-Level Attention Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Zone activation metrics calculated after background leaf masking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderRegionRow('Top', regions.top)}
        {renderRegionRow('Middle', regions.middle)}
        {renderRegionRow('Bottom', regions.bottom)}
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">Regional Thresholding Logic:</strong> Scores represent normalized Grad-CAM activation density across leaf tissue. Regions above 55% activation are classified as <em>Highly affected</em>, 28-54% as <em>Moderately affected</em>, and under 28% as <em>Less affected / Healthy</em>.
        </p>
      </div>
    </div>
  );
};
