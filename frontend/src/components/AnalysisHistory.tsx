import React from 'react';
import { History, Trash2, ArrowRight, Calendar, ShieldCheck } from 'lucide-react';
import { PredictionResult } from '../types';

interface AnalysisHistoryProps {
  history: PredictionResult[];
  onSelectHistory: (item: PredictionResult) => void;
  onClearHistory: () => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  history,
  onSelectHistory,
  onClearHistory
}) => {
  if (history.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
          <History className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          No Saved Analyses Yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Perform a paddy leaf scan and click "Save Analysis" on the results page to store records here for future review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-500" />
            <span>Analysis History ({history.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Locally saved paddy leaf health diagnostic records
          </p>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear History</span>
        </button>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectHistory(item)}
            className="group rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-emerald-500/60 dark:hover:border-emerald-500/60 cursor-pointer transition-all flex space-x-4 items-center"
          >
            {/* Thumbnail */}
            <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 relative">
              <img
                src={item.images.overlay}
                alt={item.display_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>{item.timestamp || 'Recently scanned'}</span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                {item.display_name}
              </h4>

              <div className="flex items-center space-x-3 text-xs">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{item.confidence}%</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 truncate">
                  {item.regions.top.status}
                </span>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        ))}
      </div>

    </div>
  );
};
