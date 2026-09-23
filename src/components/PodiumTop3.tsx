import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Clock, Flame, PartyPopper, Sparkles, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizResult } from '../types';
import { formatDuration } from '../utils/storage';
import { sounds } from '../utils/sound';

interface PodiumTop3Props {
  results: QuizResult[];
  onSelectParticipant?: (id: string) => void;
  title?: string;
  subtitle?: string;
  showCelebrateButton?: boolean;
}

export const PodiumTop3: React.FC<PodiumTop3Props> = ({
  results,
  onSelectParticipant,
  title = "Panggung Juara 1, 2, dan 3 🏆",
  subtitle = "Penghargaan peringkat tertinggi otomatis berdasarkan perolehan skor kuis",
  showCelebrateButton = true,
}) => {
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [celebrateMessage, setCelebrateMessage] = useState<string | null>(null);

  const top1 = results[0] || null;
  const top2 = results[1] || null;
  const top3 = results[2] || null;

  const triggerConfettiFromSide = (side: 'left' | 'center' | 'right', rank: number) => {
    try {
      if (rank === 1) {
        sounds.playFanfare();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { x: 0.5, y: 0.4 },
          colors: ['#f59e0b', '#fbbf24', '#fef08a', '#d97706', '#ec4899'],
        });
      } else if (rank === 2) {
        sounds.playCorrect();
        confetti({
          particleCount: 50,
          angle: 70,
          spread: 60,
          origin: { x: 0.25, y: 0.5 },
          colors: ['#94a3b8', '#cbd5e1', '#38bdf8', '#818cf8'],
        });
      } else {
        sounds.playPop();
        confetti({
          particleCount: 50,
          angle: 110,
          spread: 60,
          origin: { x: 0.75, y: 0.5 },
          colors: ['#ea580c', '#f97316', '#fdba74', '#fbbf24'],
        });
      }
    } catch {
      // fallback
    }

    const name = rank === 1 ? top1?.participantName : rank === 2 ? top2?.participantName : top3?.participantName;
    if (name) {
      setCelebrateMessage(`🎉 Hore! Selamat kepada Juara ${rank}: ${name}! 🌟`);
      setTimeout(() => setCelebrateMessage(null), 3500);
    }
  };

  const celebrateAll = () => {
    sounds.playFanfare();
    try {
      // Fire multi-stage celebratory fireworks
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { x: 0.2, y: 0.5 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 90,
          origin: { x: 0.5, y: 0.4 },
          colors: ['#fbbf24', '#f59e0b', '#ffd700', '#ffffff'],
        });
      }, 200);
      setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { x: 0.8, y: 0.5 },
          colors: ['#ea580c', '#6366f1', '#14b8a6', '#f43f5e'],
        });
      }, 400);
    } catch {
      // fallback
    }
    setCelebrateMessage("🎊 Tepuk tangan meriah untuk Para Juara 1, 2, dan 3! 🚀");
    setTimeout(() => setCelebrateMessage(null), 4000);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-50/90 via-orange-50/50 to-white border-3 border-amber-200 shadow-xl relative overflow-hidden">
      {/* Playful background ambient decorations */}
      <div className="absolute top-2 left-4 text-2xl select-none opacity-40 animate-float-slow pointer-events-none">
        ✨
      </div>
      <div className="absolute top-4 right-6 text-2xl select-none opacity-40 animate-float-reverse pointer-events-none">
        🌟
      </div>
      <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full bg-orange-200/30 blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-200/80 text-amber-900 border border-amber-300">
              <Trophy className="w-3.5 h-3.5 mr-1 text-amber-700" />
              Podium Kejuaraan
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
              Top 3 Teratas
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>{title}</span>
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            {subtitle}
          </p>
        </div>

        {showCelebrateButton && (
          <motion.button
            type="button"
            onClick={celebrateAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 border-b-3 border-orange-700 shadow-md shadow-orange-500/25 cursor-pointer shrink-0"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Rayakan Juara 1, 2, 3! 🎊</span>
          </motion.button>
        )}
      </div>

      {/* Interactive celebratory toast */}
      <AnimatePresence>
        {celebrateMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-5 p-3 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs sm:text-sm text-center shadow-lg border-2 border-amber-500 relative z-20"
          >
            {celebrateMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Olympic Podium Structure (Juara 2 - Juara 1 - Juara 3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 sm:pt-12 pb-2 relative z-10 max-w-2xl mx-auto">
        
        {/* ================= JUARA 2 (SILVER - KIRI) ================= */}
        <div className="flex flex-col items-center">
          {top2 ? (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 0.15 }}
              onClick={() => {
                triggerConfettiFromSide('left', 2);
                if (onSelectParticipant) onSelectParticipant(top2.id);
              }}
              onMouseEnter={() => setActiveHighlight(2)}
              onMouseLeave={() => setActiveHighlight(null)}
              className="w-full flex flex-col items-center cursor-pointer group"
            >
              {/* Silver Star Floating Decoration */}
              <div className="relative mb-2">
                <motion.div 
                  animate={{ y: [-3, 3, -3], rotate: [-4, 4, -4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-slate-200 via-slate-100 to-white text-slate-700 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-3 border-slate-300 group-hover:scale-110 group-hover:border-slate-400 transition-all relative"
                >
                  🥈
                  <span className="absolute -top-2 -right-1 text-xs">⭐</span>
                </motion.div>
              </div>

              {/* Participant Name & Score Pill */}
              <div className="text-center w-full px-1 mb-2">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800 mb-1 border border-slate-300">
                  Juara 2
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate" title={top2.participantName}>
                  {top2.participantName}
                </p>
                <p className="text-[11px] sm:text-xs font-black text-slate-600">
                  {top2.score} Poin
                </p>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatDuration(top2.durationSeconds)}</span>
                </div>
              </div>

              {/* 3D Silver Pedestal Block */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 110 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
                className="w-full rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-x-2 border-t-2 border-slate-300 border-b-6 border-slate-500 shadow-lg flex flex-col items-center justify-start pt-3 relative overflow-hidden group-hover:brightness-105 transition-all"
              >
                {/* Metallic shine reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                <span className="text-2xl sm:text-4xl font-black text-slate-700/80 drop-shadow-sm">
                  2
                </span>
                <span className="text-[10px] sm:text-xs font-black uppercase text-slate-600 tracking-wider">
                  PERAK
                </span>
                <div className="mt-1 px-2 py-0.5 rounded-md bg-white/60 text-[10px] font-extrabold text-slate-700">
                  {top2.percentage}%
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="w-full flex flex-col items-center opacity-60">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-bold mb-2">
                🥈
              </div>
              <p className="text-[11px] font-bold text-slate-400 mb-2">Belum ada</p>
              <div className="w-full h-20 rounded-t-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300 font-black text-xl">
                2
              </div>
            </div>
          )}
        </div>

        {/* ================= JUARA 1 (GOLD - TENGAH, PALING TINGGI & BERSINAR) ================= */}
        <div className="flex flex-col items-center">
          {top1 ? (
            <motion.div
              initial={{ opacity: 0, y: 70, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 120, delay: 0.35 }}
              onClick={() => {
                triggerConfettiFromSide('center', 1);
                if (onSelectParticipant) onSelectParticipant(top1.id);
              }}
              onMouseEnter={() => setActiveHighlight(1)}
              onMouseLeave={() => setActiveHighlight(null)}
              className="w-full flex flex-col items-center cursor-pointer group"
            >
              {/* Champion Animated Crown */}
              <div className="relative mb-1">
                <motion.div
                  animate={{ y: [-4, 4, -4], rotate: [-3, 3, -3], scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-2xl sm:text-3xl filter drop-shadow-md select-none"
                >
                  👑
                </motion.div>

                {/* Champion Gold Medal / Avatar */}
                <motion.div 
                  whileHover={{ scale: 1.12 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-amber-950 flex items-center justify-center font-black text-3xl sm:text-4xl shadow-xl shadow-amber-400/40 border-4 border-amber-300 ring-4 ring-yellow-200/80 group-hover:ring-amber-300 animate-gold-shine transition-all relative mt-1"
                >
                  🥇
                  {/* Twinkling sparkles */}
                  <span className="absolute -top-2 -right-2 text-sm animate-sparkle-twinkle">✨</span>
                  <span className="absolute -bottom-1 -left-2 text-sm animate-sparkle-twinkle" style={{ animationDelay: '1s' }}>🌟</span>
                </motion.div>
              </div>

              {/* Champion Name & High Score */}
              <div className="text-center w-full px-1 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-400 shadow-xs mb-1 animate-pulse">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>Juara 1 • Teratas</span>
                </span>
                <p className="text-xs sm:text-base font-black text-slate-950 truncate max-w-full" title={top1.participantName}>
                  {top1.participantName}
                </p>
                <p className="text-xs sm:text-sm font-black text-amber-800">
                  {top1.score} Poin
                </p>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatDuration(top1.durationSeconds)}</span>
                </div>
              </div>

              {/* 3D Tall Gold Pedestal Block */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 160 }}
                transition={{ type: 'spring', damping: 14, stiffness: 100, delay: 0.4 }}
                className="w-full rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-x-3 border-t-3 border-yellow-200 border-b-8 border-amber-600 shadow-xl shadow-amber-400/30 flex flex-col items-center justify-start pt-3.5 relative overflow-hidden group-hover:brightness-105 transition-all"
              >
                {/* Glossy top reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none" />
                
                {/* Large embossed "1" */}
                <div className="relative">
                  <span className="text-4xl sm:text-6xl font-black text-amber-950/80 drop-shadow">
                    1
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-black uppercase text-amber-950 tracking-widest mt-0.5">
                  EMAS
                </span>
                <div className="mt-1.5 px-3 py-0.5 rounded-full bg-amber-950 text-white text-[10px] sm:text-[11px] font-black shadow-xs">
                  {top1.percentage}% Akurat
                </div>
                
                <span className="text-[9px] font-bold text-amber-900/80 mt-1 uppercase tracking-tight hidden sm:block">
                  Puncak Klasemen
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <div className="w-full flex flex-col items-center opacity-60">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 flex items-center justify-center text-amber-400 font-bold mb-2">
                🥇
              </div>
              <p className="text-[11px] font-bold text-amber-500 mb-2">Menunggu Juara</p>
              <div className="w-full h-32 rounded-t-2xl bg-amber-100/50 border-2 border-dashed border-amber-300 flex items-center justify-center text-amber-400 font-black text-3xl">
                1
              </div>
            </div>
          )}
        </div>

        {/* ================= JUARA 3 (BRONZE - KANAN) ================= */}
        <div className="flex flex-col items-center">
          {top3 ? (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 16, stiffness: 120, delay: 0.1 }}
              onClick={() => {
                triggerConfettiFromSide('right', 3);
                if (onSelectParticipant) onSelectParticipant(top3.id);
              }}
              onMouseEnter={() => setActiveHighlight(3)}
              onMouseLeave={() => setActiveHighlight(null)}
              className="w-full flex flex-col items-center cursor-pointer group"
            >
              {/* Bronze Sparkle Floating Decoration */}
              <div className="relative mb-2">
                <motion.div 
                  animate={{ y: [-2, 2, -2], rotate: [3, -3, 3] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-500 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-3 border-amber-600 group-hover:scale-110 group-hover:border-amber-700 transition-all relative"
                >
                  🥉
                  <span className="absolute -top-2 -left-1 text-xs">💫</span>
                </motion.div>
              </div>

              {/* Participant Name & Score */}
              <div className="text-center w-full px-1 mb-2">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-amber-900 mb-1 border border-orange-200">
                  Juara 3
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate" title={top3.participantName}>
                  {top3.participantName}
                </p>
                <p className="text-[11px] sm:text-xs font-black text-amber-800">
                  {top3.score} Poin
                </p>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatDuration(top3.durationSeconds)}</span>
                </div>
              </div>

              {/* 3D Bronze Pedestal Block */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 85 }}
                transition={{ type: 'spring', damping: 16, stiffness: 100, delay: 0.15 }}
                className="w-full rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-600 via-orange-500 to-amber-700 border-x-2 border-t-2 border-orange-400 border-b-6 border-amber-900 shadow-md flex flex-col items-center justify-start pt-2.5 relative overflow-hidden group-hover:brightness-105 transition-all"
              >
                {/* Bronze glossy reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                <span className="text-2xl sm:text-3xl font-black text-white/90 drop-shadow-sm">
                  3
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-100 tracking-wider">
                  PERUNGGU
                </span>
                <div className="mt-1 px-2 py-0.5 rounded-md bg-black/20 text-[10px] font-extrabold text-amber-100">
                  {top3.percentage}%
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="w-full flex flex-col items-center opacity-60">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border-2 border-dashed border-orange-200 flex items-center justify-center text-orange-400 font-bold mb-2">
                🥉
              </div>
              <p className="text-[11px] font-bold text-orange-400 mb-2">Belum ada</p>
              <div className="w-full h-16 rounded-t-2xl bg-orange-100/50 border-2 border-dashed border-orange-200 flex items-center justify-center text-orange-300 font-black text-xl">
                3
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Cheerful Bottom Hint / Click Callout */}
      <div className="mt-4 pt-3 border-t border-amber-200/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-900/80 font-bold">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Klik salah satu panggung juara untuk meletuskan kembang api selebrasi! 🎉</span>
        </div>
        <span className="text-[11px] text-slate-500 font-semibold">
          Urutan otomatis: Skor Tertinggi &rarr; Durasi Tercepat
        </span>
      </div>
    </div>
  );
};
