import React from 'react';
import { 
  Play, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  UserCheck, 
  Store, 
  Award, 
  FileText,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { Question, QuizResult, QuizSettings, AppMode, AuthUser, BannerSettings } from '../types';
import { sounds } from '../utils/sound';
import { PhotoSlideBar } from './PhotoSlideBar';

interface QuizStartProps {
  settings: QuizSettings;
  questions: Question[];
  topResults: QuizResult[];
  onStart: (participantName: string, participantIdentifier: string) => void;
  onViewSpreadsheet: () => void;
  onOpenAdmin: () => void;
  appMode?: AppMode;
  currentUser?: AuthUser | null;
  bannerSettings: BannerSettings;
  onSaveBannerSettings: (settings: BannerSettings) => void;
}

export const QuizStart: React.FC<QuizStartProps> = ({
  settings,
  questions,
  topResults,
  onStart,
  onViewSpreadsheet,
  onOpenAdmin,
  appMode = 'md',
  currentUser,
  bannerSettings,
  onSaveBannerSettings,
}) => {
  const participantName = currentUser?.name || 'Karyawan MD';
  const participantIdentifier = currentUser 
    ? `${currentUser.identifier}${currentUser.area ? ` • ${currentUser.area}` : ''}`
    : '';

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const handleStart = () => {
    sounds.playCorrect();
    onStart(participantName, participantIdentifier);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-8 space-y-5">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-xl shadow-slate-200/50 space-y-5"
      >
        {/* Verified User Account Header */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/30 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  {participantName}
                </h2>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  {currentUser?.role === 'admin' ? 'ADMIN' : 'MD'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {currentUser?.identifier || 'MD-KAO'} {currentUser?.area ? `• ${currentUser.area}` : ''}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terverifikasi</span>
          </div>
        </div>

        {/* Clean Quiz Information Matrix */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 block">Jumlah Soal</span>
            <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
              {questions.length} Soal
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 block">Batas Waktu</span>
            <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
              {settings.timeLimitMinutes > 0 ? `${settings.timeLimitMinutes} Mnt` : 'Fleksibel'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 block">Standar KKM</span>
            <span className="text-base sm:text-lg font-black text-emerald-700 mt-0.5 block">
              {settings.passingScore}%
            </span>
          </div>
        </div>

        {/* Direct Start Quiz Button */}
        <div>
          <motion.button
            id="btn-start-quiz"
            type="button"
            onClick={handleStart}
            disabled={questions.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl text-white font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 border-b-4 border-emerald-900 active:border-b-0 shadow-lg shadow-emerald-600/25 text-base sm:text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Mulai Kuis Merchandising KAO</span>
          </motion.button>
        </div>

        {/* Bar Foto Slide Otomatis (diatur di Mode Admin) */}
        <div className="pt-2 border-t border-slate-100">
          <PhotoSlideBar
            bannerSettings={bannerSettings}
            onSaveSettings={onSaveBannerSettings}
            isAdmin={appMode === 'admin'}
          />
        </div>

        {/* Admin Shortcut (Only shown in Admin Mode) */}
        {appMode === 'admin' && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-slate-600 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Mode Admin Aktif</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onOpenAdmin();
              }}
              className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Kelola Bank Soal</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
