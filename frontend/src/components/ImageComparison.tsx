import React, { useState } from 'react';
import { Layers, Eye, Maximize2, X, Sliders } from 'lucide-react';
import { ImageOutputs } from '../types';

interface ImageComparisonProps {
  images: ImageOutputs;
  opacity: number;
  setOpacity: (val: number) => void;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  images,
  opacity,
  setOpacity
}) => {
  const [activeTab, setActiveTab] = useState<'overlay' | 'original' | 'heatmap' | 'split'>('split');
  const [sliderPos, setSliderPos] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
      
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            <span>Grad-CAM Visual Attention Map</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Model attention overlay indicating neural network feature activation focus
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'split'
                ? 'bg-white dark:bg-[#131f22] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Split Slider
          </button>
          <button
            onClick={() => setActiveTab('overlay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overlay'
                ? 'bg-white dark:bg-[#131f22] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overlay
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'heatmap'
                ? 'bg-white dark:bg-[#131f22] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Heatmap
          </button>
          <button
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'original'
                ? 'bg-white dark:bg-[#131f22] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {/* Main Visual Display Box */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center border border-slate-800 shadow-inner group">
        
        {/* Fullscreen Trigger */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-3 right-3 z-30 p-2 rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-lg"
          title="Toggle Fullscreen View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* View Mode: Split Slider */}
        {activeTab === 'split' && (
          <div className="relative w-full h-full select-none overflow-hidden flex items-center justify-center">
            {/* Background Image: Grad-CAM Overlay */}
            <img
              src={images.overlay}
              alt="Grad-CAM Overlay"
              className="absolute inset-0 w-full h-full object-contain"
            />

            {/* Foreground Image: Original Leaf clipped by slider position */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={images.original}
                alt="Original Leaf"
                className="absolute inset-0 w-full h-full object-contain max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Vertical Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] cursor-ew-resize z-20 flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold font-mono">
                ↔
              </div>
            </div>

            {/* Range Input Driver for Touch/Mouse */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-25"
            />

            {/* Side Badges */}
            <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-emerald-300 border border-slate-700 pointer-events-none">
              Original Leaf ({sliderPos}%)
            </div>
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-rose-300 border border-slate-700 pointer-events-none">
              Grad-CAM Overlay ({100 - sliderPos}%)
            </div>
          </div>
        )}

        {/* View Mode: Single Image (Overlay / Heatmap / Original) */}
        {activeTab !== 'split' && (
          <img
            src={images[activeTab]}
            alt={`Paddy Leaf ${activeTab}`}
            className="w-full h-full object-contain transition-opacity duration-300"
          />
        )}

      </div>

      {/* Opacity Slider Control & Color Scale Legend */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-center">
        
        {/* Opacity Control */}
        <div className="md:col-span-5 space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-500" />
              <span>Overlay Opacity</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {Math.round(opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Heatmap Color Scale Legend */}
        <div className="md:col-span-7 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>AI Attention / Affected Region Estimate</span>
            <span className="font-mono text-[10px] text-slate-400">ResNet18 Layer4</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm"></span>
              <span>Red/Orange (High)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm"></span>
              <span>Yellow (Medium)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-sm"></span>
              <span>Green/Blue (Low)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Fullscreen Zoom Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center p-2">
            <img
              src={images[activeTab === 'split' ? 'overlay' : activeTab]}
              alt="Expanded Grad-CAM View"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="text-center text-xs text-slate-400 font-mono mt-2">
            AgroVision Fullscreen Grad-CAM View ({activeTab.toUpperCase()})
          </div>
        </div>
      )}

    </div>
  );
};
