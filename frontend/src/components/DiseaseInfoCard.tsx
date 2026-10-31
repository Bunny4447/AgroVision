import React from 'react';
import { BookOpen, AlertTriangle, ShieldCheck, Thermometer, Sprout, Syringe } from 'lucide-react';
import { DiseaseInfo } from '../types';

interface DiseaseInfoCardProps {
  diseaseInfo: DiseaseInfo;
}

export const DiseaseInfoCard: React.FC<DiseaseInfoCardProps> = ({ diseaseInfo }) => {
  if (!diseaseInfo || !diseaseInfo.name) return null;

  const urgencyColors = {
    High: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    Low: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    None: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {diseaseInfo.name}
            </h3>
            {diseaseInfo.pathogen !== 'None (Healthy Crop)' && (
              <p className="text-xs italic text-slate-500 dark:text-slate-400">
                Causal Pathogen: {diseaseInfo.pathogen}
              </p>
            )}
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${urgencyColors[diseaseInfo.urgency] || urgencyColors.Medium}`}>
          Urgency Level: {diseaseInfo.urgency}
        </span>
      </div>

      {/* Description */}
      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <p>{diseaseInfo.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Symptoms List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Common Visual Symptoms</span>
          </h4>
          <ul className="space-y-2">
            {diseaseInfo.symptoms.map((symptom, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Favorable Environmental Conditions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-teal-500" />
            <span>Favorable Weather & Field Conditions</span>
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
            {diseaseInfo.favorable_conditions}
          </p>
        </div>

      </div>

      {/* Agronomic & Chemical Control Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* Cultural Management */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
            <Sprout className="w-4 h-4" />
            <span>Cultural & Field Practices</span>
          </h4>
          <ul className="space-y-2">
            {diseaseInfo.cultural_control.map((action, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chemical Management */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center space-x-2">
            <Syringe className="w-4 h-4" />
            <span>Chemical & Fungicide Spray Guidelines</span>
          </h4>
          <ul className="space-y-2">
            {diseaseInfo.chemical_control.map((chem, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
                <span>{chem}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};
