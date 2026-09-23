import React from 'react';
import { Trophy, Sparkles, ArrowRight, TableProperties, Flame, Clock, Award } from 'lucide-react';
import { QuizResult, AppMode } from '../types';
import { PodiumTop3 } from './PodiumTop3';
import { formatDuration, formatDate } from '../utils/storage';
import { sounds } from '../utils/sound';

interface PodiumViewProps {
  results: QuizResult[];
  onStartQuiz: () => void;
  onViewSpreadsheet: () => void;
  appMode?: AppMode;
}

export const PodiumView: React.FC<PodiumViewProps> = ({
  results,
  onStartQuiz,
  onViewSpreadsheet,
  appMode = 'md',
}) => {
  const top10 = results.slice(0, 10);
  const remainingRanks = results.slice(3, 10);

  return (
    <div className="p-3 sm:p-5 space-y-4 max-w-2xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wide uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Leaderboard Merchandiser KAO</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Panggung Kehormatan Juara 🏆
          </h2>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            Penghargaan otomatis bagi karyawan MD dengan pemahaman SOP & Planogram tertinggi di lapangan.
          </p>
        </div>
      </div>

      {/* 3D Olympic Podium Component */}
      <div className="bg-white rounded-3xl p-3 sm:p-5 border-2 border-emerald-100 shadow-md">
        <PodiumTop3
          results={results}
          title="Podium Juara 1, 2, dan 3 🥇"
          subtitle="Ketuk podium atau tombol selebrasi untuk menyalakan kembang api!"
          showCelebrateButton={true}
        />
      </div>

      {/* Ranks 4-10 Leaderboard List */}
      {remainingRanks.length > 0 && (
        <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Peringkat 4 Hingga 10 Teratas</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">
              Total {results.length} Karyawan MD
            </span>
          </div>

          <div className="space-y-2">
            {remainingRanks.map((r, idx) => {
              const rank = idx + 4;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-200 font-black text-xs text-slate-700 flex items-center justify-center">
                      #{rank}
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">
                        {r.participantName}
                      </p>
                      {r.participantIdentifier && (
                        <p className="text-[10px] font-medium text-slate-500 truncate max-w-[160px]">
                          {r.participantIdentifier}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-700 block">
                      {r.score} Poin
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {r.percentage}% • {formatDuration(r.durationSeconds)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Navigation Action Cards */}
      <div className={`grid ${appMode === 'admin' ? 'grid-cols-2' : 'grid-cols-1'} gap-2.5`}>
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onStartQuiz();
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex flex-row items-center justify-center space-x-2 shadow-md active:scale-95 transition-all text-center cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Mulai Kuis SOP Baru</span>
        </button>

        {appMode === 'admin' && (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onViewSpreadsheet();
            }}
            className="p-3.5 rounded-2xl bg-white border-2 border-emerald-300 text-emerald-800 font-black text-xs flex flex-row items-center justify-center space-x-2 shadow-xs active:scale-95 transition-all text-center cursor-pointer"
          >
            <TableProperties className="w-4 h-4 text-emerald-600" />
            <span>Buka Rekap Lengkap</span>
          </button>
        )}
      </div>
    </div>
  );
};
