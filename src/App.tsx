import React, { useState, useEffect } from 'react';
import { AppView, AppMode, Question, QuizResult, QuizSettings } from './types';
import { 
  addQuizResult, 
  clearAllQuizResults, 
  deleteQuizResult, 
  loadQuestions, 
  loadQuizResults, 
  loadQuizSettings, 
  resetAllToDefault, 
  saveQuestions, 
  saveQuizSettings, 
  sortResultsDescending,
  getSavedAppMode,
  saveAppMode
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { QuizStart } from './components/QuizStart';
import { QuizTaking } from './components/QuizTaking';
import { QuizResultView } from './components/QuizResult';
import { SpreadsheetView } from './components/SpreadsheetView';
import { AdminPanel } from './components/AdminPanel';
import { PodiumView } from './components/PodiumView';
import { AndroidDeviceFrame } from './components/android/AndroidDeviceFrame';
import { AdminPinModal } from './components/android/AdminPinModal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('quiz-start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<QuizSettings>(loadQuizSettings);
  const [results, setResults] = useState<QuizResult[]>([]);
  
  // App Mode State: Mode 'md' is the default mode (Merchandiser: only questions & podium)
  // Mode 'admin' requires PIN verification to access questions bank, settings, and spreadsheet
  const [appMode, setAppMode] = useState<AppMode>('md');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pendingAdminView, setPendingAdminView] = useState<AppView | null>(null);
  
  // Active taking session state
  const [participantName, setParticipantName] = useState('');
  const [participantIdentifier, setParticipantIdentifier] = useState('');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [highlightResultId, setHighlightResultId] = useState<string | undefined>(undefined);

  // Initial load
  useEffect(() => {
    setQuestions(loadQuestions());
    setSettings(loadQuizSettings());
    setResults(loadQuizResults());
  }, []);

  // Shuffle helper
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Start quiz handler
  const handleStartQuiz = (name: string, identifier: string) => {
    setParticipantName(name);
    setParticipantIdentifier(identifier);

    let prepared = [...questions];
    if (settings.shuffleQuestions) {
      prepared = shuffleArray(prepared);
    }
    if (settings.shuffleOptions) {
      prepared = prepared.map((q) => {
        const correctOptText = q.options[q.correctAnswerIndex];
        const shuffledOpts = shuffleArray(q.options);
        const newCorrectIndex = shuffledOpts.indexOf(correctOptText);
        return {
          ...q,
          options: shuffledOpts,
          correctAnswerIndex: newCorrectIndex,
        };
      });
    }

    setActiveQuestions(prepared);
    setCurrentView('quiz-taking');
  };

  // Submit quiz handler
  const handleSubmitQuiz = (newResult: QuizResult) => {
    const updatedResults = addQuizResult(newResult);
    setResults(updatedResults);
    setLastResult(newResult);
    setHighlightResultId(newResult.id);
    setCurrentView('quiz-result');
  };

  // Cancel quiz taking
  const handleCancelTaking = () => {
    setCurrentView('quiz-start');
  };

  // Delete result
  const handleDeleteResult = (id: string) => {
    const updated = deleteQuizResult(id);
    setResults(updated);
    if (highlightResultId === id) {
      setHighlightResultId(undefined);
    }
  };

  // Clear all results
  const handleClearAllResults = () => {
    const empty = clearAllQuizResults();
    setResults(empty);
    setHighlightResultId(undefined);
  };

  // Add manual result
  const handleAddManualResult = (result: QuizResult) => {
    const updated = addQuizResult(result);
    setResults(updated);
    setHighlightResultId(result.id);
  };

  // Update questions from admin
  const handleSaveQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    saveQuestions(newQuestions);
  };

  // Update settings from admin
  const handleSaveSettings = (newSettings: QuizSettings) => {
    setSettings(newSettings);
    saveQuizSettings(newSettings);
  };

  // Factory reset
  const handleResetFactory = () => {
    const res = resetAllToDefault();
    setQuestions(res.questions);
    setSettings(res.settings);
    setResults(res.results);
    setHighlightResultId(undefined);
    setLastResult(null);
  };

  // Calculate current rank of last result
  const lastResultRank = lastResult
    ? results.findIndex((r) => r.id === lastResult.id) + 1
    : 1;

  // Request transition to Mode Admin with PIN verification
  const handleRequestAdminMode = (targetView?: AppView) => {
    setPendingAdminView(targetView || null);
    setShowAdminPinModal(true);
  };

  // When admin PIN is entered correctly
  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setAppMode('admin');
    saveAppMode('admin');
    setShowAdminPinModal(false);
    if (pendingAdminView) {
      setCurrentView(pendingAdminView);
      setPendingAdminView(null);
    }
  };

  // Switch back to Mode MD (locks admin features, displays only questions & podium)
  const handleSwitchToMdMode = () => {
    setIsAdminAuthenticated(false);
    setAppMode('md');
    saveAppMode('md');
    if (currentView === 'admin' || currentView === 'spreadsheet') {
      setCurrentView('quiz-start');
    }
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'quiz-start' && currentView === 'quiz-taking') {
      if (!window.confirm('Evaluasi kuis sedang berlangsung. Anda yakin ingin kembali ke menu utama?')) {
        return;
      }
    }
    // If currently in Mode MD, trying to access admin or spreadsheet triggers PIN modal
    if (appMode === 'md' && (view === 'admin' || view === 'spreadsheet')) {
      handleRequestAdminMode(view);
      return;
    }
    if (view === 'admin' && !isAdminAuthenticated) {
      handleRequestAdminMode('admin');
      return;
    }
    setCurrentView(view);
  };

  return (
    <>
      <AndroidDeviceFrame
        currentView={currentView}
        onNavigate={handleNavigate}
        participantCount={results.length}
        questionCount={questions.length}
        isAdminAuthenticated={isAdminAuthenticated}
        onLockAdmin={handleSwitchToMdMode}
        appMode={appMode}
        onRequestAdminMode={() => handleRequestAdminMode()}
        onSwitchToMdMode={handleSwitchToMdMode}
      >
        {currentView === 'quiz-start' && (
          <QuizStart
            settings={settings}
            questions={questions}
            topResults={results}
            onStart={handleStartQuiz}
            onViewSpreadsheet={() => setCurrentView('spreadsheet')}
            onOpenAdmin={() => handleNavigate('admin')}
            appMode={appMode}
            onViewPodium={() => setCurrentView('podium')}
          />
        )}

        {currentView === 'quiz-taking' && (
          <QuizTaking
            participantName={participantName}
            participantIdentifier={participantIdentifier}
            questions={activeQuestions}
            settings={settings}
            onSubmitQuiz={handleSubmitQuiz}
            onCancelQuiz={handleCancelTaking}
          />
        )}

        {currentView === 'quiz-result' && lastResult && (
          <QuizResultView
            result={lastResult}
            currentRank={lastResultRank}
            totalParticipants={results.length}
            onViewSpreadsheet={() => setCurrentView('spreadsheet')}
            onRetake={() => setCurrentView('quiz-start')}
            appMode={appMode}
            onViewPodium={() => setCurrentView('podium')}
          />
        )}

        {currentView === 'spreadsheet' && (
          <SpreadsheetView
            results={results}
            highlightResultId={highlightResultId}
            onDeleteResult={handleDeleteResult}
            onClearAll={handleClearAllResults}
            onAddManualResult={handleAddManualResult}
            onNavigateToQuiz={() => setCurrentView('quiz-start')}
            isAdminAuthenticated={isAdminAuthenticated}
            onAdminAuthenticated={() => setIsAdminAuthenticated(true)}
          />
        )}

        {currentView === 'podium' && (
          <PodiumView
            results={results}
            onStartQuiz={() => setCurrentView('quiz-start')}
            onViewSpreadsheet={() => setCurrentView('spreadsheet')}
            appMode={appMode}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            questions={questions}
            settings={settings}
            onSaveQuestions={handleSaveQuestions}
            onSaveSettings={handleSaveSettings}
            onResetFactory={handleResetFactory}
            onViewSpreadsheet={() => setCurrentView('spreadsheet')}
            onLogoutAdmin={handleSwitchToMdMode}
          />
        )}
      </AndroidDeviceFrame>

      {/* Admin Security PIN Authentication Modal */}
      <AdminPinModal
        isOpen={showAdminPinModal}
        title="Beralih ke Mode Admin SOP"
        description="Masukkan PIN Admin SOP (Default: 1234) untuk membuka seluruh menu bank soal, rekap spreadsheet, dan variabel aplikasi."
        onSuccess={handleAdminAuthSuccess}
        onCancel={() => {
          setShowAdminPinModal(false);
          setPendingAdminView(null);
        }}
      />
    </>
  );
}
