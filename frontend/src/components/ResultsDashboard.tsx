import React from 'react';
import { ArrowLeft, Download, Bookmark, Sparkles, BarChart3, Check } from 'lucide-react';
import { PredictionResult } from '../types';
import { FarmerSummaryBanner } from './FarmerSummaryBanner';
import { ImageComparison } from './ImageComparison';
import { RegionAnalysisCard } from './RegionAnalysisCard';
import { DiseaseInfoCard } from './DiseaseInfoCard';

interface ResultsDashboardProps {
  result: PredictionResult;
  opacity: number;
  setOpacity: (val: number) => void;
  onReset: () => void;
  onSaveHistory: (res: PredictionResult) => void;
  isSavedInHistory: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  opacity,
  setOpacity,
  onReset,
  onSaveHistory,
  isSavedInHistory
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scan Another Paddy Leaf</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSaveHistory(result)}
            disabled={isSavedInHistory}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              isSavedInHistory
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {isSavedInHistory ? <Check className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSavedInHistory ? 'Saved to History' : 'Save Analysis'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 1. Farmer Summary Banner */}
      <FarmerSummaryBanner result={result} />

      {/* 2. Visual Grad-CAM Image Comparison Component */}
      <ImageComparison
        images={result.images}
        opacity={opacity}
        setOpacity={setOpacity}
      />

      {/* 3. Region-Level Analysis Cards */}
      <RegionAnalysisCard regions={result.regions} />

      {/* 4. Disease Information & Management Guidelines */}
      <DiseaseInfoCard diseaseInfo={result.disease_info} />

      {/* 5. All Class Confidence Probabilities Bar Chart */}
      <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <BarChart3 className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Full Classifier Class Probability Distribution
          </h3>
        </div>

        <div className="space-y-3">
          {Object.entries(result.all_confidences).map(([clsKey, probVal]) => {
            const isTop = clsKey === result.prediction;
            return (
              <div key={clsKey} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isTop ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                    {clsKey.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className={`font-mono ${isTop ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {probVal}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTop ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{ width: `${Math.max(1, probVal)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
