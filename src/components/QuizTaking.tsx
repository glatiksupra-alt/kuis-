import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Clock, 
  Flag, 
  Send,
  Sparkles,
  HelpCircle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ParticipantAnswer, Question, QuizResult, QuizSettings } from '../types';
import { formatDuration } from '../utils/storage';
import { sounds } from '../utils/sound';

interface QuizTakingProps {
  participantName: string;
  participantIdentifier: string;
  questions: Question[];
  settings: QuizSettings;
  onSubmitQuiz: (result: QuizResult) => void;
  onCancelQuiz: () => void;
}

const OPTION_THEMES = [
  { label: 'A', bg: 'bg-amber-100 text-amber-900 border-amber-300', active: 'bg-amber-500 text-white border-amber-600', ring: 'ring-amber-300' },
  { label: 'B', bg: 'bg-sky-100 text-sky-900 border-sky-300', active: 'bg-sky-500 text-white border-sky-600', ring: 'ring-sky-300' },
  { label: 'C', bg: 'bg-violet-100 text-violet-900 border-violet-300', active: 'bg-violet-500 text-white border-violet-600', ring: 'ring-violet-300' },
  { label: 'D', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', active: 'bg-emerald-500 text-white border-emerald-600', ring: 'ring-emerald-300' },
  { label: 'E', bg: 'bg-rose-100 text-rose-900 border-rose-300', active: 'bg-rose-500 text-white border-rose-600', ring: 'ring-rose-300' },
  { label: 'F', bg: 'bg-teal-100 text-teal-900 border-teal-300', active: 'bg-teal-500 text-white border-teal-600', ring: 'ring-teal-300' },
];

export const QuizTaking: React.FC<QuizTakingProps> = ({
  participantName,
  participantIdentifier,
  questions,
  settings,
  onSubmitQuiz,
  onCancelQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Timer logic
  const totalSecondsAllowed = settings.timeLimitMinutes > 0 ? settings.timeLimitMinutes * 60 : 0;
  const remainingSeconds = totalSecondsAllowed > 0 ? Math.max(0, totalSecondsAllowed - elapsedSeconds) : 0;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (totalSecondsAllowed > 0 && next >= totalSecondsAllowed) {
          // Auto submit when time runs out
          clearInterval(timerRef.current!);
          handleFinalSubmit(next);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSecondsAllowed]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    sounds.playTap();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleToggleFlag = () => {
    sounds.playPop();
    setFlagged((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleFinalSubmit = (finalDuration = elapsedSeconds) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let earnedScore = 0;
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    let correctCount = 0;

    const answersDetail: ParticipantAnswer[] = questions.map((q, idx) => {
      const chosen = selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : null;
      const isCorrect = chosen !== null && chosen === q.correctAnswerIndex;
      const pointsEarned = isCorrect ? q.points : 0;

      if (isCorrect) {
        correctCount += 1;
        earnedScore += pointsEarned;
      }

      return {
        questionId: q.id,
        questionText: q.text,
        selectedOptionIndex: chosen,
        selectedOptionText: chosen !== null ? q.options[chosen] : null,
        correctOptionIndex: q.correctAnswerIndex,
        correctOptionText: q.options[q.correctAnswerIndex],
        isCorrect,
        pointsEarned,
      };
    });

    const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
    const isPassed = percentage >= settings.passingScore;

    const newResult: QuizResult = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      participantName,
      participantIdentifier: participantIdentifier || undefined,
      submittedAt: new Date().toISOString(),
      durationSeconds: finalDuration,
      score: earnedScore,
      maxScore,
      percentage,
      isPassed,
      correctCount,
      totalQuestions: questions.length,
      answers: answersDetail,
    };

    sounds.playFanfare();
    onSubmitQuiz(newResult);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200/80 shadow-md mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Participant Info */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white font-black text-lg flex items-center justify-center shadow-sm">
              {participantName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-base">{participantName}</span>
                {participantIdentifier && (
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    {participantIdentifier}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Mengerjakan: <span className="text-amber-600 font-bold">{settings.title}</span>
              </p>
            </div>
          </div>

          {/* Cheerful Timer & Status */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl border-2 font-black text-sm transition-all ${
              totalSecondsAllowed > 0 && remainingSeconds < 60
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <Clock className="w-4 h-4 text-amber-600" />
              <span>
                {totalSecondsAllowed > 0 
                  ? `Sisa: ${formatDuration(remainingSeconds)}` 
                  : `Waktu: ${formatDuration(elapsedSeconds)}`}
              </span>
            </div>

            <motion.button
              type="button"
              onClick={() => {
                sounds.playPop();
                setShowExitConfirm(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-2 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
            >
              Keluar Kuis
            </motion.button>
          </div>
        </div>

        {/* Animated Progress Bar with cute mascot */}
        <div className="mt-4 pt-3 border-t-2 border-slate-100">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 mb-1.5">
            <span className="flex items-center space-x-1">
              <span>Soal {currentIndex + 1} dari {questions.length}</span>
              <span className="text-amber-500 font-black">• {currentQuestion.points} Poin</span>
            </span>
            <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-full">
              Terjawab: {answeredCount}/{questions.length}
            </span>
          </div>

          {/* Progress track with cute rocket runner */}
          <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-visible border border-slate-200">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 text-sm select-none transition-all duration-300 pointer-events-none"
              style={{ left: `calc(${Math.min(96, Math.max(2, progressPercent))}% - 8px)` }}
            >
              🚀
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Question Display Area */}
        <div className="lg:col-span-8 space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md relative"
            >
              {/* Question Header & Category Pill */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-2xl text-xs font-black bg-amber-400 text-amber-950 border-b-2 border-amber-600 shadow-2xs">
                    Nomor {currentIndex + 1}
                  </span>
                  {currentQuestion.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-2xl text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
                      {currentQuestion.category}
                    </span>
                  )}
                </div>

                {/* Flag Question Button */}
                <motion.button
                  type="button"
                  onClick={handleToggleFlag}
                  whileTap={{ scale: 0.9 }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                    flagged[currentIndex]
                      ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged[currentIndex] ? 'fill-amber-500 text-amber-600' : ''}`} />
                  <span>{flagged[currentIndex] ? 'Ditandai Ragu ⭐' : 'Tandai Ragu'}</span>
                </motion.button>
              </div>

              {/* Question Statement */}
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-relaxed mb-6">
                {currentQuestion.text}
              </h2>

              {/* Cheerful Candy Option Buttons */}
              <div className="space-y-3">
                {currentQuestion.options.map((optionText, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;
                  const theme = OPTION_THEMES[optIdx % OPTION_THEMES.length];

                  return (
                    <motion.button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start space-x-3.5 cursor-pointer ${
                        isSelected
                          ? `bg-amber-50/90 border-amber-500 shadow-md shadow-amber-200/50 ring-2 ${theme.ring}`
                          : 'bg-white hover:bg-amber-50/30 border-slate-200/90 hover:border-amber-300'
                      }`}
                    >
                      {/* Letter badge */}
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border-2 transition-colors ${
                        isSelected ? theme.active : theme.bg
                      }`}>
                        {theme.label}
                      </span>

                      {/* Option text */}
                      <div className="flex-1 pt-0.5">
                        <span className={`text-sm sm:text-base font-bold ${
                          isSelected ? 'text-amber-950 font-extrabold' : 'text-slate-800'
                        }`}>
                          {optionText}
                        </span>
                      </div>

                      {/* Check icon if selected */}
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="mt-8 pt-5 border-t-2 border-slate-100 flex items-center justify-between gap-3">
                <motion.button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => {
                    sounds.playPop();
                    setCurrentIndex((prev) => Math.max(0, prev - 1));
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-extrabold text-sm border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </motion.button>

                {currentIndex < questions.length - 1 ? (
                  <motion.button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 border-b-3 border-orange-600 shadow-md shadow-orange-500/20"
                  >
                    <span>Berikutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={() => {
                      sounds.playCorrect();
                      setShowConfirmModal(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 border-b-3 border-emerald-600 shadow-md shadow-emerald-500/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>Selesai & Kumpulkan! 🎯</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Cheerful Question Grid Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-200/80 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                <span className="text-base">🗺️</span>
                <span>Peta Nomor Soal</span>
              </h3>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {questions.length} Butir
              </span>
            </div>

            {/* Quick Number Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isCurrent = currentIndex === idx;
                const isFlagged = flagged[idx];

                let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50';

                if (isCurrent) {
                  btnStyle = 'ring-3 ring-amber-400 bg-amber-500 text-white font-black border-amber-600 shadow-xs';
                } else if (isFlagged) {
                  btnStyle = 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                }

                return (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setCurrentIndex(idx);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative h-10 rounded-xl text-xs border-2 flex items-center justify-center transition-all ${btnStyle}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1.5 -right-1 text-[10px]">
                        ⭐
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t-2 border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-200 border border-emerald-400" />
                <span>Terjawab</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-200 border border-amber-400" />
                <span>Ragu-Ragu</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500 border border-amber-600" />
                <span>Soal Aktif</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300" />
                <span>Belum Dijawab</span>
              </div>
            </div>

            {/* Direct Submit Button in Sidebar */}
            <div className="mt-5">
              <motion.button
                type="button"
                onClick={() => {
                  sounds.playCorrect();
                  setShowConfirmModal(true);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 border-b-3 border-emerald-600 shadow-md shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Kumpulkan Kuis</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-3 border-amber-300 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border-2 border-amber-300 text-3xl">
                🎯
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">
                Sudah Yakin Ingin Mengumpulkan?
              </h3>

              <p className="text-sm font-medium text-slate-600 mb-4">
                Kamu telah menjawab <span className="font-extrabold text-amber-700">{answeredCount}</span> dari{' '}
                <span className="font-extrabold text-slate-800">{questions.length}</span> soal kuis.
              </p>

              {answeredCount < questions.length && (
                <div className="mb-4 p-3 rounded-2xl bg-amber-50 border-2 border-amber-200 text-xs font-bold text-amber-900 flex items-center space-x-2 text-left">
                  <span className="text-base">⚠️</span>
                  <span>
                    Masih ada {questions.length - answeredCount} pertanyaan yang belum kamu jawab!
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 px-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold text-sm hover:bg-slate-50"
                >
                  Periksa Lagi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleFinalSubmit();
                  }}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm border-b-3 border-emerald-600 shadow-md shadow-emerald-500/30"
                >
                  Ya, Kumpulkan! ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-3 border-rose-300 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4 border-2 border-rose-300 text-3xl">
                🚪
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">
                Batalkan Pengerjaan Kuis?
              </h3>

              <p className="text-sm font-medium text-slate-600 mb-6">
                Jawaban kamu pada sesi ini tidak akan disimpan ke lembar spreadsheet jika kamu keluar sekarang.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="py-3 px-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold text-sm hover:bg-slate-50"
                >
                  Lanjut Mengerjakan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onCancelQuiz();
                  }}
                  className="py-3 px-4 rounded-2xl bg-rose-600 text-white font-black text-sm hover:bg-rose-700 border-b-3 border-rose-800 shadow-xs"
                >
                  Keluar Kuis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
