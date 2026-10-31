import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisLoader } from './components/AnalysisLoader';
import { ResultsDashboard } from './components/ResultsDashboard';
import { AnalysisHistory } from './components/AnalysisHistory';
import { ModelPerformanceModal } from './components/ModelPerformanceModal';
import { HowItWorks } from './components/HowItWorks';
import { AdminPanel } from './components/AdminPanel';
import { AuthPage } from './components/AuthPage';
import { Footer } from './components/Footer';
import { PredictionResult, User } from './types';
import { apiUrl } from './config';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'analyzer' | 'history' | 'metrics' | 'how-it-works' | 'admin' | 'auth'>('analyzer');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('agrovision_theme');
    return saved !== null ? saved === 'dark' : true; // Default dark for sleek modern look
  });
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('agrovision_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PredictionResult | null>(null);
  const [opacity, setOpacity] = useState<number>(0.55);
  const [history, setHistory] = useState<PredictionResult[]>(() => {
    try {
      const saved = localStorage.getItem('agrovision_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync dark mode class on <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('agrovision_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('agrovision_theme', 'light');
    }
  }, [darkMode]);

  // Sync analysis history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('agrovision_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('agrovision_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed saving user to storage', e);
    }
    // If admin logs in, switch directly to admin tab or stay on analyzer
    if (user.role === 'admin' || user.email.toLowerCase() === 'adityareddy14623@gmail.com') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('analyzer');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agrovision_user');
    if (currentTab === 'admin') {
      setCurrentTab('analyzer');
    }
  };

  const handleAnalyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('opacity', opacity.toString());
    if (currentUser?.email) {
      formData.append('user_email', currentUser.email);
    }

    try {
      const response = await fetch(apiUrl('/api/predict'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }

      const result: PredictionResult = await response.json();
      result.timestamp = new Date().toLocaleString();
      setAnalysisResult(result);
    } catch (err: any) {
      alert(`Error during leaf analysis: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeSample = async (sampleKey: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('sample_key', sampleKey);
    formData.append('opacity', opacity.toString());
    if (currentUser?.email) {
      formData.append('user_email', currentUser.email);
    }

    try {
      const response = await fetch(apiUrl('/api/predict-sample'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Sample prediction failed');
      }

      const result: PredictionResult = await response.json();
      result.timestamp = new Date().toLocaleString();
      setAnalysisResult(result);
    } catch (err: any) {
      alert(`Error analyzing sample image: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveHistory = (res: PredictionResult) => {
    const exists = history.some(item => item.timestamp === res.timestamp);
    if (!exists) {
      setHistory(prev => [res, ...prev]);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('agrovision_history');
  };

  const isSavedInHistory = Boolean(
    analysisResult && history.some(item => item.timestamp === analysisResult.timestamp)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b1315] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        historyCount={history.length}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthMode('login');
          setCurrentTab('auth');
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {currentTab === 'auth' && (
          <AuthPage
            onBackToApp={() => setCurrentTab('analyzer')}
            onLoginSuccess={handleLoginSuccess}
            initialMode={authMode}
          />
        )}
        
        {currentTab === 'analyzer' && (
          <>
            {/* Show Hero banner when no active result and not analyzing */}
            {!analysisResult && !isAnalyzing && (
              <Hero
                onStartAnalysis={() => {
                  const element = document.getElementById('uploader-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                onExploreHowItWorks={() => setCurrentTab('how-it-works')}
              />
            )}

            {/* Analysis Loader State */}
            {isAnalyzing && <AnalysisLoader />}

            {/* Upload Area State */}
            {!isAnalyzing && !analysisResult && (
              <div id="uploader-section" className="pt-4">
                <ImageUploader
                  onAnalyzeFile={handleAnalyzeFile}
                  onAnalyzeSample={handleAnalyzeSample}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            )}

            {/* Results Dashboard State */}
            {!isAnalyzing && analysisResult && (
              <ResultsDashboard
                result={analysisResult}
                opacity={opacity}
                setOpacity={setOpacity}
                onReset={() => setAnalysisResult(null)}
                onSaveHistory={handleSaveHistory}
                isSavedInHistory={isSavedInHistory}
              />
            )}
          </>
        )}

        {currentTab === 'history' && (
          <AnalysisHistory
            history={history}
            onSelectHistory={(item) => {
              setAnalysisResult(item);
              setCurrentTab('analyzer');
            }}
            onClearHistory={handleClearHistory}
          />
        )}

        {currentTab === 'metrics' && <ModelPerformanceModal />}

        {currentTab === 'how-it-works' && <HowItWorks />}

        {currentTab === 'admin' && (
          <AdminPanel currentUser={currentUser} />
        )}

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default App;
