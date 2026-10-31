import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { SampleImage } from '../types';
import { apiUrl } from '../config';

interface ImageUploaderProps {
  onAnalyzeFile: (file: File) => void;
  onAnalyzeSample: (sampleKey: string) => void;
  isAnalyzing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onAnalyzeFile,
  onAnalyzeSample,
  isAnalyzing
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [selectedSampleKey, setSelectedSampleKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch pre-loaded sample images from backend
  useEffect(() => {
    fetch(apiUrl('/api/sample-images'))
      .then(res => res.json())
      .then(data => {
        if (data.samples) {
          setSamples(data.samples);
        }
      })
      .catch(err => console.log('Could not fetch sample images:', err));
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setSelectedSampleKey(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Invalid file format. Please upload a valid JPG or PNG image of a paddy leaf.');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage('File size exceeds 12MB. Please upload a smaller image file.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSampleClick = (sample: SampleImage) => {
    setSelectedFile(null);
    setPreviewUrl(sample.image_data);
    setSelectedSampleKey(sample.key);
    setErrorMessage(null);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedSampleKey(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerAnalyze = () => {
    if (selectedFile) {
      onAnalyzeFile(selectedFile);
    } else if (selectedSampleKey) {
      onAnalyzeSample(selectedSampleKey);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Upload Paddy Leaf Image
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Upload a clear photograph of a rice/paddy leaf or select one of the pre-loaded sample leaves below to test Grad-CAM explainability.
        </p>
      </div>

      {/* Main Upload Dropzone or Preview */}
      <div className="max-w-3xl mx-auto">
        {!previewUrl ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131f22] hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-sm hover:shadow-md'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  Drag & Drop your paddy leaf image here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  or <span className="text-emerald-600 dark:text-emerald-400 font-medium underline">browse from your device</span>
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Supports JPG, JPEG, PNG</span>
                <span>•</span>
                <span>Max size: 12MB</span>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Card */
          <div className="rounded-2xl bg-white dark:bg-[#131f22] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedFile ? selectedFile.name : `Sample Paddy Leaf (${selectedSampleKey?.replace('_', ' ').toUpperCase()})`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ready for CNN Deep Learning Analysis
                  </p>
                </div>
              </div>

              <button
                onClick={clearSelection}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Change Image
              </button>
            </div>

            {/* Image Preview Container */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center border border-slate-800">
              <img
                src={previewUrl}
                alt="Selected Paddy Leaf"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={clearSelection}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={triggerAnalyze}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transform active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{isAnalyzing ? 'Analyzing Leaf...' : 'Run AgroVision AI Analysis'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Validation Error Message */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Pre-loaded Sample Images Grid */}
      {samples.length > 0 && (
        <div className="max-w-4xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Or Select a Sample Paddy Leaf to Test Instantly:</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Click any sample below</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {samples.map((sample) => {
              const isSelected = selectedSampleKey === sample.key;
              return (
                <div
                  key={sample.key}
                  onClick={() => handleSampleClick(sample)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg scale-105'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white dark:bg-[#131f22]'
                  }`}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img
                      src={sample.image_data}
                      alt={sample.display_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 bg-white/95 dark:bg-[#131f22]/95 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {sample.display_name}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
