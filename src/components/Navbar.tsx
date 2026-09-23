import React, { useState, useEffect } from 'react';
import { Award, BookOpen, FileSpreadsheet, Settings, Sparkles, Volume2, VolumeX, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { AppView } from '../types';
import { sounds } from '../utils/sound';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  participantCount: number;
  questionCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  participantCount,
  questionCount,
}) => {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(sounds.isSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundOn(newState);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Animated Mascot */}
          <motion.div 
            id="brand-logo"
            onClick={() => {
              sounds.playPop();
              onNavigate('quiz-start');
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:rotate-6 transition-transform">
                <Sparkles className="w-6 h-6 animate-pulse-glow" />
              </div>
              <span className="absolute -top-1 -right-1 text-sm animate-bounce">
                ⭐
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-600 bg-clip-text text-transparent">
                  KAO Merchandising
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  <Flame className="w-3 h-3 mr-1 text-orange-500 fill-orange-500" />
                  SOP & Planogram
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 hidden sm:block">
                Evaluasi & Peringkat Otomatis Karyawan MD
              </p>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Sound Toggle Button */}
            <motion.button
              id="sound-toggle-btn"
              type="button"
              onClick={handleToggleSound}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={soundOn ? 'Suara Aktif (Klik untuk Mematikan)' : 'Suara Mati (Klik untuk Mengaktifkan)'}
              className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                soundOn
                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-amber-600" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </motion.button>

            {/* Quiz Nav Button */}
            <motion.button
              id="nav-btn-quiz"
              onClick={() => {
                sounds.playPop();
                onNavigate('quiz-start');
              }}
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                currentView === 'quiz-start' || currentView === 'quiz-taking' || currentView === 'quiz-result'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 border-b-2 border-orange-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/70 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Mulai Kuis</span>
              <span className="sm:hidden">Kuis</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                currentView === 'quiz-start' || currentView === 'quiz-taking' || currentView === 'quiz-result'
                  ? 'bg-white/25 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {questionCount}
              </span>
            </motion.button>

            {/* Spreadsheet Nav Button */}
            <motion.button
              id="nav-btn-spreadsheet"
              onClick={() => {
                sounds.playPop();
                onNavigate('spreadsheet');
              }}
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                currentView === 'spreadsheet'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/70 border border-transparent'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Spreadsheet</span>
              {participantCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                  currentView === 'spreadsheet'
                    ? 'bg-white/25 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {participantCount}
                </span>
              )}
            </motion.button>

            {/* Admin Nav Button */}
            <motion.button
              id="nav-btn-admin"
              onClick={() => {
                sounds.playPop();
                onNavigate('admin');
              }}
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                currentView === 'admin'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/25 border-b-2 border-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-violet-50/70 border border-transparent'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Soal</span>
              <span className="sm:hidden">Admin</span>
            </motion.button>
          </nav>
        </div>
      </div>
    </header>
  );
};
