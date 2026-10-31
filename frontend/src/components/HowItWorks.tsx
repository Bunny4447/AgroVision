import React from 'react';
import { Cpu, Eye, Target, Sparkles, Layers, ArrowRight, ShieldAlert } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="space-y-12 max-w-4xl mx-auto py-6">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Explainable AI in Agriculture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          How AgroVision Grad-CAM Works
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Understanding the deep learning pipeline behind paddy disease predictions and region-level visual attention heatmaps.
        </p>
      </div>

      {/* Step Pipeline Cards */}
      <div className="space-y-6">
        
        {/* Step 1 */}
        <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-emerald-500/20">
            1
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-500" />
              <span>Image Preprocessing & ResNet18 Feature Extraction</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              When a paddy leaf image is uploaded, it is resized to 224x224 RGB channels and normalized using standard ImageNet color statistics. The image passes through 18 convolutional layers in a trained ResNet architecture, extracting hierarchical visual features ranging from fine edge details to complex pathogen lesion boundaries.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-teal-500/20">
            2
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Eye className="w-5 h-5 text-teal-500" />
              <span>Grad-CAM Gradient Computation (Layer4 Conv)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Grad-CAM (Gradient-weighted Class Activation Mapping) attaches PyTorch backward hooks to the final convolutional layer (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px] text-teal-600">model.layer4[-1]</code>). It computes the gradient of the predicted class score with respect to feature activation maps. Channel weights are pooled to calculate a 2D intensity heatmap highlighting the spatial regions that influenced the model's prediction most heavily.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-green-500/20">
            3
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <span>Leaf Masking & Regional Zone Intensity Scoring</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To prevent background pixels from inflating regional scores, AgroVision segments the leaf tissue using Otsu/HSV leaf masking. The leaf blade is partitioned into 3 vertical zones (Top, Middle, Bottom), and average activation density is calculated per zone to categorize regions as <em>Highly affected</em>, <em>Moderately affected</em>, or <em>Less affected / Healthy</em>.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-emerald-600/20">
            4
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Farmer Explanation & Management Recommendations</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Finally, AgroVision synthesizes the numerical results into plain-language summaries for farmers and agricultural officers, coupling visual heatmap overlays with tailored agronomic management strategies, fungicide spray guidelines, and cultural practices.
            </p>
          </div>
        </div>

      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Agricultural Disclaimer:</strong> Grad-CAM heatmaps reflect neural network visual feature attention during model inference. They provide an interpretable estimate of influential leaf regions to assist decision-making, but should not replace professional laboratory or expert field diagnostics.
        </p>
      </div>

    </div>
  );
};
