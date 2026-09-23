import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, 
  Award, 
  CheckCircle, 
  Clock, 
  FileSpreadsheet, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  XCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { QuizResult as QuizResultType, AppMode } from '../types';
import { formatDuration } from '../utils/storage';
import { sounds } from '../utils/sound';

interface QuizResultProps {
  result: QuizResultType;
  currentRank: number;
  totalParticipants: number;
  onViewSpreadsheet: () => void;
  onRetake: () => void;
  appMode?: AppMode;
  onViewPodium?: () => void;
}

export const QuizResultView: React.FC<QuizResultProps> = ({
  result,
  currentRank,
  totalParticipants,
  onViewSpreadsheet,
  onRetake,
  appMode = 'md',
  onViewPodium,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    // Play celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#3b82f6'],
      });

      if (result.isPassed) {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 350);
      }
    } catch (err) {
      console.log('Confetti effect unavailable', err);
    }
  }, [result.isPassed]);

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇 Juara 1';
    if (rank === 2) return '🥈 Juara 2';
    if (rank === 3) return '🥉 Juara 3';
    return `Peringkat #${rank}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Result Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="bg-white rounded-3xl p-6 sm:p-10 border-3 border-amber-200/90 shadow-xl text-center relative overflow-hidden"
      >
        {/* Decorative corner stars */}
        <div className="absolute -top-3 -left-3 text-4xl select-none animate-wiggle">
          🌟
        </div>
        <div className="absolute -top-3 -right-3 text-4xl select-none animate-wiggle">
          🎉
        </div>

        {/* Badge Icon with animation */}
        <div className="inline-flex items-center justify-center mb-5">
          {result.isPassed ? (
            <div className="relative">
              <div className="w-22 h-22 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-amber-400/40 border-3 border-amber-400 animate-bounce">
                <Trophy className="w-12 h-12 text-amber-950 fill-amber-300" />
              </div>
              <span className="absolute -bottom-2 -right-2 text-2xl">👑</span>
            </div>
          ) : (
            <div className="w-22 h-22 rounded-3xl bg-gradient-to-tr from-orange-400 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-400/30 border-3 border-orange-300">
              <Award className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Heading */}
        <div>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2 border-2 ${
            result.isPassed
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {result.isPassed ? 'Luar Biasa! Kompeten Standar SOP KAO 🎉' : 'Evaluasi Selesai • Perlu Pembinaan Tambahan 💪'}
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-1">
            {result.participantName}
          </h1>
          {result.participantIdentifier && (
            <p className="text-sm font-bold text-amber-700 mb-4">{result.participantIdentifier}</p>
          )}
        </div>

        {/* Big Cheerful Score Display */}
        <div className="my-6 py-6 px-6 rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50/40 border-2 border-amber-200 inline-block w-full max-w-md mx-auto shadow-xs">
          <span className="text-xs font-black text-amber-800 uppercase tracking-wider block mb-1">
            Skor Akhir Kamu
          </span>
          <div className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight">
            {result.score}
            <span className="text-2xl sm:text-4xl font-bold text-slate-400">/{result.maxScore}</span>
          </div>
          <div className="mt-2 text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-200">
            Akurasi {result.percentage}% ({result.correctCount} dari {result.totalQuestions} Benar ✨)
          </div>
        </div>

        {/* Podium Highlight for Rank 1, 2, and 3 */}
        {currentRank <= 3 && (
          <motion.div
            initial={{ scale: 0.9, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
            className={`mb-6 p-4.5 rounded-3xl border-3 shadow-lg relative overflow-hidden text-left ${
              currentRank === 1
                ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-100 border-amber-400 text-amber-950 animate-gold-shine'
                : currentRank === 2
                ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-50 border-slate-400 text-slate-900'
                : 'bg-gradient-to-r from-orange-200 via-amber-100 to-orange-50 border-orange-400 text-amber-950'
            }`}
          >
            {/* Twinkles */}
            <div className="absolute top-1 right-3 text-lg animate-sparkle-twinkle select-none pointer-events-none">✨</div>
            <div className="absolute bottom-1 right-8 text-sm animate-sparkle-twinkle select-none pointer-events-none" style={{ animationDelay: '1s' }}>🌟</div>

            <div className="flex items-center space-x-3.5 relative z-10">
              <div className="relative shrink-0">
                {currentRank === 1 && (
                  <motion.div 
                    animate={{ y: [-4, 4, -4], rotate: [-4, 4, -4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl select-none"
                  >
                    👑
                  </motion.div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-2 ${
                  currentRank === 1
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-amber-400/40'
                    : currentRank === 2
                    ? 'bg-slate-300 text-slate-800 border-slate-400'
                    : 'bg-orange-400 text-white border-orange-500'
                }`}>
                  {currentRank === 1 ? '🥇' : currentRank === 2 ? '🥈' : '🥉'}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    currentRank === 1
                      ? 'bg-amber-950 text-amber-200'
                      : currentRank === 2
                      ? 'bg-slate-800 text-slate-100'
                      : 'bg-amber-900 text-orange-200'
                  }`}>
                    {currentRank === 1 ? 'Juara 1 • Posisi Tertinggi' : currentRank === 2 ? 'Juara 2 • Podium Perak' : 'Juara 3 • Podium Perunggu'}
                  </span>
                  <span className="text-xs">🎉</span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                  {currentRank === 1 
                    ? 'Luar Biasa! Namamu Menduduki Posisi #1 di Spreadsheet!' 
                    : currentRank === 2
                    ? 'Hebat Sekali! Kamu Berhasil Masuk Podium Juara 2!'
                    : 'Keren Banget! Kamu Meraih Posisi Podium Juara 3!'}
                </h3>
                <p className="text-xs font-semibold opacity-85 mt-0.5">
                  Pencapaianmu langsung tampil di panggung juara spreadsheet nilai secara realtime.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Spreadsheet / Podium Rank Card with Medal styling */}
        <motion.div 
          onClick={() => {
            sounds.playPop();
            if (appMode === 'admin') {
              onViewSpreadsheet();
            } else {
              onViewPodium ? onViewPodium() : onViewSpreadsheet();
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`mb-8 p-4.5 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-left cursor-pointer border-b-4 ${
            currentRank === 1
              ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 border-amber-700 shadow-amber-500/30 ring-2 ring-amber-300'
              : currentRank === 2
              ? 'bg-gradient-to-r from-slate-600 via-slate-500 to-slate-700 border-slate-800 shadow-slate-500/25 ring-2 ring-slate-300'
              : currentRank === 3
              ? 'bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 border-amber-900 shadow-orange-500/25 ring-2 ring-orange-300'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 border-orange-700 shadow-orange-500/25'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 font-black text-lg">
              {currentRank <= 3 ? '🏆' : `#${currentRank}`}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-amber-100">
                {appMode === 'admin' ? 'Peringkat di Rekap Merchandiser KAO' : 'Posisi di Panggung Juara MD'}
              </span>
              <p className="text-base font-black">
                {getRankMedal(currentRank)}{' '}
                <span className="text-xs font-bold text-white/90">
                  (dari {totalParticipants} MD terurut)
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-black bg-white text-orange-600 px-3.5 py-2 rounded-xl shadow-xs">
            <span>{appMode === 'admin' ? 'Buka Lembar Nilai' : 'Buka Podium Juara'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left mb-8">
          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">Status Hasil</span>
            <span className={`text-sm font-black ${result.isPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {result.isPassed ? 'KOMPETEN (LULUS)' : 'PERLU PEMBINAAN'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">Waktu Selesai</span>
            <span className="text-sm font-black text-slate-800 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDuration(result.durationSeconds)}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">Jawaban Benar</span>
            <span className="text-sm font-black text-emerald-600">
              {result.correctCount} Butir
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">Jawaban Salah</span>
            <span className="text-sm font-black text-rose-600">
              {result.totalQuestions - result.correctCount} Butir
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {appMode === 'admin' ? (
            <motion.button
              type="button"
              onClick={() => {
                sounds.playPop();
                onViewSpreadsheet();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 border-b-3 border-emerald-700 shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buka Spreadsheet Nilai 📊</span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={() => {
                sounds.playPop();
                if (onViewPodium) {
                  onViewPodium();
                } else {
                  onViewSpreadsheet();
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 border-b-3 border-amber-700 shadow-md shadow-amber-500/25 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Lihat Panggung Juara 🏆</span>
            </motion.button>
          )}

          <motion.button
            type="button"
            onClick={() => {
              sounds.playPop();
              onRetake();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-extrabold text-sm border-2 border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mulai Ulang Kuis</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => {
              sounds.playPop();
              setShowExplanation(!showExplanation);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 py-3.5 px-5 rounded-2xl font-extrabold text-sm bg-amber-50 text-amber-900 border-2 border-amber-300 hover:bg-amber-100 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>{showExplanation ? 'Tutup Pembahasan' : 'Lihat Kunci Jawaban 💡'}</span>
          </motion.button>
        </div>

        {/* Review Answers & Explanations Accordion */}
        {showExplanation && (
          <div className="mt-8 pt-6 border-t-2 border-slate-200 text-left space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2 mb-4">
              <span>💡 Pembahasan & Kunci Jawaban Soal</span>
            </h3>

            {result.answers.map((ans, idx) => (
              <div 
                key={ans.questionId || idx}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  ans.isCorrect 
                    ? 'bg-emerald-50/50 border-emerald-300' 
                    : 'bg-rose-50/50 border-rose-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-black text-xs px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700">
                    Soal #{idx + 1}
                  </span>
                  <span className={`inline-flex items-center text-xs font-black px-2.5 py-1 rounded-full ${
                    ans.isCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ans.isCorrect ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Benar (+{ans.pointsEarned} Poin)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Salah (0 Poin)
                      </>
                    )}
                  </span>
                </div>

                <p className="text-sm font-black text-slate-900 mb-3">
                  {ans.questionText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">Jawaban Kamu:</span>
                    <span className={ans.isCorrect ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}>
                      {ans.selectedOptionText || '(Tidak dijawab)'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">Kunci Jawaban Benar:</span>
                    <span className="text-emerald-700 font-black">
                      {ans.correctOptionText}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
