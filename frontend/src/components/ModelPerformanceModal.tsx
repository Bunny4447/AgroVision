import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle2, Cpu, Grid, Layers, RefreshCw } from 'lucide-react';
import { ModelMetrics } from '../types';
import { apiUrl } from '../config';

export const ModelPerformanceModal: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl('/api/metrics'))
      .then((res) => res.json())
      .then((data) => {
        if (data.accuracy !== undefined) {
          setMetrics(data);
        } else {
          setError(data.message || 'Metrics unavailable.');
        }
      })
      .catch((err) => setError('Failed fetching model metrics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 flex flex-col items-center space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        <p className="text-xs">Loading Model Evaluation Metrics...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-3 bg-white dark:bg-[#131f22] p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Cpu className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Model Metrics Pending</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <BarChart2 className="w-6 h-6 text-emerald-500" />
          <span>ResNet18 CNN Model Performance & Validation</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Empirical evaluation results calculated on held-out paddy leaf test set
        </p>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#131f22] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Overall Accuracy</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.accuracy}%
          </p>
        </div>

        <div className="bg-white dark:bg-[#131f22] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Macro F1 Score</p>
          <p className="text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">
            {metrics.macro_f1}%
          </p>
        </div>

        <div className="bg-white dark:bg-[#131f22] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Macro Precision</p>
          <p className="text-3xl font-black text-green-600 dark:text-green-400 font-mono">
            {metrics.macro_precision}%
          </p>
        </div>

        <div className="bg-white dark:bg-[#131f22] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Macro Recall</p>
          <p className="text-3xl font-black text-emerald-500 font-mono">
            {metrics.macro_recall}%
          </p>
        </div>

      </div>

      {/* Per-Class Metrics Table */}
      <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-emerald-500" />
          <span>Per-Class Performance Metrics</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono font-semibold">
              <tr>
                <th className="p-3 rounded-l-lg">Disease Class</th>
                <th className="p-3">Precision</th>
                <th className="p-3">Recall</th>
                <th className="p-3">F1-Score</th>
                <th className="p-3 rounded-r-lg">Test Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.entries(metrics.per_class).map(([clsKey, data]) => (
                <tr key={clsKey} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {data.display_name}
                  </td>
                  <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {data.precision}%
                  </td>
                  <td className="p-3 font-mono font-semibold text-teal-600 dark:text-teal-400">
                    {data.recall}%
                  </td>
                  <td className="p-3 font-mono font-semibold text-green-600 dark:text-green-400">
                    {data.f1_score}%
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    {data.support} images
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Visualization */}
      <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Grid className="w-5 h-5 text-emerald-500" />
          <span>Confusion Matrix Grid</span>
        </h3>

        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            <div className="grid grid-cols-6 gap-1 text-center font-mono text-xs">
              <div className="p-2 font-semibold text-slate-400 text-[10px]">True \ Pred</div>
              {metrics.classes.map((cls, i) => (
                <div key={i} className="p-2 font-bold text-slate-800 dark:text-slate-200 text-[10px] truncate" title={cls}>
                  {cls.split(' ')[0]}
                </div>
              ))}

              {metrics.confusion_matrix.map((row, i) => (
                <React.Fragment key={i}>
                  <div className="p-2 font-bold text-slate-800 dark:text-slate-200 text-[10px] flex items-center justify-end">
                    {metrics.classes[i].split(' ')[0]}
                  </div>
                  {row.map((val, j) => {
                    const isDiagonal = i === j;
                    return (
                      <div
                        key={j}
                        className={`p-3 rounded-lg font-bold ${
                          isDiagonal
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : val > 0
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {val}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
