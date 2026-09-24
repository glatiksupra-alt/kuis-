import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Clock, HelpCircle, Play, ShieldCheck, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Question, QuizResult, QuizSettings, AppMode, AuthUser } from '../types';
import { sounds } from '../utils/sound';

interface QuizStartProps {
  settings: QuizSettings;
  questions: Question[];
  topResults: QuizResult[];
  onStart: (participantName: string, participantIdentifier: string) => void;
  onViewSpreadsheet: () => void;
  onOpenAdmin: () => void;
  appMode?: AppMode;
  onViewPodium?: () => void;
  currentUser?: AuthUser | null;
}

export const QuizStart: React.FC<QuizStartProps> = ({
  settings,
  questions,
  topResults,
  onStart,
  onViewSpreadsheet,
  onOpenAdmin,
  appMode = 'md',
  onViewPodium,
  currentUser,
}) => {
  const [name, setName] = useState(() => currentUser?.name || '');
  const [identifier, setIdentifier] = useState(() => 
    currentUser ? `${currentUser.identifier}${currentUser.area ? ` • ${currentUser.area}` : ''}` : ''
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name);
      if (!identifier) {
        setIdentifier(`${currentUser.identifier}${currentUser.area ? ` • ${currentUser.area}` : ''}`);
      }
    }
  }, [currentUser]);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const topScorer = topResults.length > 0 ? topResults[0] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Mohon masukkan nama Anda terlebih dahulu');
      sounds.playTap();
      return;
    }
    if (trimmedName.length < 2) {
      setError('Nama minimal terdiri dari 2 karakter');
      sounds.playTap();
      return;
    }
    if (questions.length === 0) {
      setError('Belum ada soal kuis yang tersedia. Silakan tambahkan soal melalui menu Admin.');
      sounds.playTap();
      return;
    }
    setError('');
    sounds.playCorrect();
    onStart(trimmedName, identifier.trim());
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Decorative Floating Cartoon Elements */}
      <div className="absolute top-2 left-6 text-3xl select-none pointer-events-none animate-float-slow opacity-80">
        🎈
      </div>
      <div className="absolute top-10 right-8 text-3xl select-none pointer-events-none animate-float-reverse opacity-80">
        🚀
      </div>
      <div className="absolute bottom-4 left-10 text-2xl select-none pointer-events-none animate-wiggle opacity-70">
        ⭐
      </div>
      <div className="absolute bottom-8 right-12 text-3xl select-none pointer-events-none animate-float-slow opacity-75">
        ✨
      </div>

      {/* Top Banner / Announcement - Animated Cheerful Podium 1, 2, 3 Preview */}
      {topResults.length > 0 && (
        <motion.div 
          id="top-scorer-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => {
            sounds.playPop();
            onViewSpreadsheet();
          }}
          className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 border-2 border-amber-300 shadow-md shadow-amber-200/40 cursor-pointer transition-all relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-amber-400 flex items-center justify-center text-white shadow-sm shrink-0">
                <Trophy className="w-6 h-6 animate-wiggle" />
                <span className="absolute -top-2.5 -right-2 text-base select-none animate-crown-bob inline-block">👑</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-full">
                    Klasemen Juara 1, 2, 3 Teratas
                  </span>
                </div>
                <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                  Podium Kejuaraan Spreadsheet Realtime
                </p>
              </div>
            </div>

            {/* Micro Top 3 Rank Pills with animation */}
            <div className="flex flex-wrap items-center gap-2">
              {topResults.slice(0, 3).map((res, idx) => {
                const rankNum = idx + 1;
                return (
                  <motion.div
                    key={res.id}
                    whileHover={{ scale: 1.06 }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-black shadow-xs border-2 ${
                      rankNum === 1
                        ? 'bg-amber-300/90 text-amber-950 border-amber-400 animate-gold-shine'
                        : rankNum === 2
                        ? 'bg-slate-200 text-slate-800 border-slate-300'
                        : 'bg-orange-200/90 text-amber-950 border-orange-300'
                    }`}
                  >
                    <span>{rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : '🥉'}</span>
                    <span className="truncate max-w-[100px]">{res.participantName}</span>
                    <span className="opacity-80">({res.score}p)</span>
                  </motion.div>
                );
              })}

              <div className="ml-1 text-xs font-bold text-amber-900 flex items-center space-x-1 bg-white/80 px-3 py-1.5 rounded-2xl border border-amber-300 shadow-2xs hover:bg-white transition-colors">
                <span>Panggung Juara</span>
                <span>&rarr;</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Cheerful Participant Form Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.25 }}
          className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-lg shadow-amber-100/60 relative overflow-hidden"
        >
          {/* Fun corner badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 via-teal-600 to-amber-500 text-white font-extrabold text-[11px] px-3.5 py-1 rounded-bl-2xl shadow-xs flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Merchandising KAO Indonesia</span>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl animate-bounce">🏪</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                Standar Planogram & SOP MD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2">
              {settings.title}
            </h1>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              {settings.description}
            </p>
          </div>

          {/* Active Logged In User Info Banner */}
          {currentUser && (
            <div className="mb-5 p-3 rounded-2xl bg-emerald-50/90 border-2 border-emerald-200/90 flex items-center justify-between text-xs text-emerald-950 shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  ✓
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-black text-emerald-950 text-xs">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] font-black bg-emerald-200/80 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-300">
                      {currentUser.role === 'admin' ? 'ADMIN' : 'MD'}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 block">
                    ID: {currentUser.identifier} {currentUser.area ? `• ${currentUser.area}` : ''}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                Data Terverifikasi
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="participant-name-input"
                className="block text-sm font-extrabold text-slate-800 mb-1.5 flex items-center space-x-1.5"
              >
                <span>Nama Karyawan Merchandiser</span>
                <span className="text-rose-500 font-bold">*</span>
                <span className="text-xs font-normal text-slate-400">(Tampil di Lembar Penilaian)</span>
              </label>
              <div className="relative">
                <input
                  id="participant-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ketik nama karyawan MD (cth: Budi Santoso)"
                  autoComplete="name"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 text-sm transition-all bg-amber-50/20"
                />
                <span className="absolute right-3.5 top-3.5 text-base select-none">
                  🧑‍💼
                </span>
              </div>
            </div>

            <div>
              <label 
                htmlFor="participant-id-input"
                className="block text-sm font-extrabold text-slate-800 mb-1.5 flex items-center space-x-1.5"
              >
                <span>Area Penempatan / Store / NIK Karyawan</span>
                <span className="text-xs text-slate-400 font-normal">(Contoh: MD Jakarta / Hypermart / NIK)</span>
              </label>
              <div className="relative">
                <input
                  id="participant-id-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: MD Jakarta Barat • Hypermart Puri • NIK: KAO-8841"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 text-sm transition-all bg-amber-50/20"
                />
                <span className="absolute right-3.5 top-3.5 text-base select-none">
                  📍
                </span>
              </div>
            </div>

            {error && (
              <motion.div 
                id="start-error-msg" 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2"
              >
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <div className="pt-3">
              <motion.button
                id="btn-start-quiz"
                type="submit"
                disabled={questions.length === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center space-x-2.5 py-4 px-6 rounded-2xl text-white font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:from-emerald-700 hover:to-amber-600 border-b-4 border-emerald-800 active:border-b-0 shadow-lg shadow-emerald-600/30 text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Play className="w-5 h-5 fill-current animate-bounce" />
                <span>Mulai Evaluasi Merchandising KAO! 🚀</span>
              </motion.button>
            </div>
          </form>

          {/* Quick spreadsheet / podium indicator */}
          <div className="mt-6 pt-5 border-t-2 border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Nilai otomatis terupdate di peringkat live</span>
            </span>
            {appMode === 'admin' ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onViewSpreadsheet();
                }}
                className="font-bold text-amber-800 hover:text-orange-900 underline underline-offset-4 cursor-pointer"
              >
                Buka Lembar Peringkat MD 📊
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  if (onViewPodium) {
                    onViewPodium();
                  } else {
                    onViewSpreadsheet();
                  }
                }}
                className="font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4 cursor-pointer flex items-center gap-1"
              >
                <span>Lihat Podium Juara 🏆</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Right column: Playful Quiz Rules & Specs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.25, delay: 0.05 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/80 shadow-md text-slate-800">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center space-x-2">
              <span className="text-xl">📋</span>
              <span>Informasi & Ketentuan Evaluasi MD</span>
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                <span className="text-slate-600 flex items-center space-x-2 font-medium">
                  <span className="text-base">📝</span>
                  <span>Jumlah Soal</span>
                </span>
                <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-amber-200 text-xs">
                  {questions.length} Pertanyaan SOP
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-orange-50/50 border border-orange-200/60">
                <span className="text-slate-600 flex items-center space-x-2 font-medium">
                  <span className="text-base">⏱️</span>
                  <span>Batas Waktu</span>
                </span>
                <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-orange-200 text-xs">
                  {settings.timeLimitMinutes > 0 ? `${settings.timeLimitMinutes} Menit` : 'Fleksibel'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-yellow-50/50 border border-yellow-200/60">
                <span className="text-slate-600 flex items-center space-x-2 font-medium">
                  <span className="text-base">⭐</span>
                  <span>Skor Maksimal</span>
                </span>
                <span className="font-extrabold text-amber-700 bg-white px-2.5 py-1 rounded-xl border border-yellow-200 text-xs">
                  {totalPoints} Poin
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                <span className="text-slate-600 flex items-center space-x-2 font-medium">
                  <span className="text-base">🎖️</span>
                  <span>Standar Nilai Kompeten</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Minimal {settings.passingScore}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60">
                <span className="text-slate-600 flex items-center space-x-2 font-medium">
                  <span className="text-base">👥</span>
                  <span>Merchandiser Sudah Tes</span>
                </span>
                <span className="font-extrabold text-indigo-700 bg-white px-2.5 py-1 rounded-xl border border-indigo-200 text-xs">
                  {topResults.length} Karyawan MD
                </span>
              </div>
            </div>
          </div>

          {/* Admin shortcut banner (Only visible in Mode Admin) */}
          {appMode === 'admin' ? (
            <div className="p-4.5 rounded-3xl bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-emerald-200/80 flex items-center justify-between shadow-xs">
              <div className="text-xs text-slate-700 font-medium">
                <span className="font-extrabold text-emerald-900 block text-sm mb-0.5">
                  🛠️ Kelola Bank Soal MD?
                </span>
                Supervisor / Admin dapat menambah & memperbarui soal SOP KAO.
              </div>
              <motion.button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onOpenAdmin();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-3 shrink-0 px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-emerald-700 text-white hover:bg-emerald-800 border-b-2 border-emerald-900 shadow-xs transition-colors cursor-pointer"
              >
                Buka Admin SOP 🔒
              </motion.button>
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-emerald-50/80 border-2 border-emerald-200/80 flex items-center space-x-3 text-xs text-emerald-900 shadow-2xs">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-black text-base shadow-xs">
                🥇
              </div>
              <div>
                <span className="font-black text-emerald-950 block text-xs">Mode Merchandiser Aktif</span>
                Kerjakan pertanyaan evaluasi SOP secara jujur dan raih peringkat podium teratas!
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
