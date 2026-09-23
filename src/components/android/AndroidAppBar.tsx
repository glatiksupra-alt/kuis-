import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Store,
  Share2,
  CheckCircle2,
  Lock,
  Shield,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { AppView, AppMode } from '../../types';
import { sounds } from '../../utils/sound';

interface AndroidAppBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  participantCount: number;
  isAdminAuthenticated?: boolean;
  onLockAdmin?: () => void;
  appMode?: AppMode;
  onRequestAdminMode?: () => void;
  onSwitchToMdMode?: () => void;
}

export const AndroidAppBar: React.FC<AndroidAppBarProps> = ({
  currentView,
  onNavigate,
  participantCount,
  isAdminAuthenticated = false,
  onLockAdmin,
  appMode = 'md',
  onRequestAdminMode,
  onSwitchToMdMode,
}) => {
  const [soundActive, setSoundActive] = useState(() => sounds.isSoundEnabled());
  const [copiedToast, setCopiedToast] = useState(false);

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundActive(next);
  };

  const handleShareApp = () => {
    sounds.playPop();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const isTakingQuiz = currentView === 'quiz-taking';
  const showBackButton = currentView !== 'quiz-start';

  const getViewTitle = () => {
    switch (currentView) {
      case 'quiz-start':
        return appMode === 'md' ? 'Evaluasi MD KAO' : 'KAO Merchandising';
      case 'quiz-taking':
        return 'Evaluasi SOP KAO';
      case 'quiz-result':
        return 'Hasil & Pembahasan';
      case 'spreadsheet':
        return 'Rekap Nilai MD';
      case 'podium':
        return 'Panggung Juara MD';
      case 'admin':
        return 'Kelola Bank Soal';
      default:
        return 'KAO Merchandising';
    }
  };

  const getViewSubtitle = () => {
    if (appMode === 'md') {
      if (currentView === 'quiz-start') return 'Mode MD • Soal & Planogram';
      if (currentView === 'podium') return 'Mode MD • Top 3 Klasemen';
    }
    switch (currentView) {
      case 'quiz-start':
        return 'SOP & Planogram Modern Market';
      case 'quiz-taking':
        return 'Sesi Ujian Lapangan';
      case 'quiz-result':
        return 'Peringkat Terurut Otomatis';
      case 'spreadsheet':
        return `${participantCount} Karyawan Terdaftar`;
      case 'podium':
        return 'Juara 1, 2, dan 3 🏆';
      case 'admin':
        return 'Pengaturan SOP & Standar';
      default:
        return 'KAO Indonesia';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100/80 px-4 py-2.5 flex items-center justify-between select-none z-20 shadow-xs">
      <div className="flex items-center space-x-2.5">
        {showBackButton && !isTakingQuiz ? (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onNavigate('quiz-start');
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-90 transition-all border border-slate-200"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 text-white flex items-center justify-center font-black shadow-sm shadow-emerald-500/30">
            <Store className="w-4.5 h-4.5" />
          </div>
        )}

        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
              {getViewTitle()}
            </h1>
            <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-black border ${
              appMode === 'admin'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {appMode === 'admin' ? 'ADMIN' : 'MD'}
            </span>
          </div>
          <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{getViewSubtitle()}</span>
          </p>
        </div>
      </div>

      {/* Right Action Icons & Mode Switcher */}
      <div className="flex items-center space-x-1.5">
        {/* Mode Switcher Pill Button */}
        {appMode === 'admin' ? (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onSwitchToMdMode?.();
            }}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white border border-emerald-800 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Mode Admin Aktif - Klik untuk Kunci & Beralih ke Mode MD"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-200" />
            <span>Mode Admin</span>
            <span className="text-[9px] bg-emerald-950/70 text-emerald-200 px-1 py-0.2 rounded font-bold">Kunci ✕</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onRequestAdminMode?.();
            }}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 active:scale-95 transition-all shadow-2xs cursor-pointer"
            title="Klik untuk Masuk ke Mode Admin (Perlu PIN)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Mode MD</span>
            <Lock className="w-2.5 h-2.5 text-slate-500" />
          </button>
        )}

        {/* Share / Copy link */}
        <button
          type="button"
          onClick={handleShareApp}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all relative border border-slate-200"
          title="Salin Tautan Aplikasi"
        >
          {copiedToast ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
            soundActive
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
          title={soundActive ? 'Suara Aktif' : 'Suara Senyap'}
        >
          {soundActive ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
