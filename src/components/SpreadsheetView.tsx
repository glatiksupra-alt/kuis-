import React, { useState, useMemo } from 'react';
import { 
  ArrowDownNarrowWide, 
  Check, 
  Copy, 
  Download, 
  Eye, 
  FileSpreadsheet, 
  Filter, 
  Plus, 
  RefreshCw, 
  Search, 
  Sparkles, 
  Trash2, 
  Trophy, 
  X,
  Printer,
  Award,
  Flame,
  LayoutList,
  Table as TableIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizResult } from '../types';
import { exportResultsToCSV, exportResultsToTSV, formatDate, formatDuration, sortResultsDescending } from '../utils/storage';
import { sounds } from '../utils/sound';
import { PodiumTop3 } from './PodiumTop3';
import { AdminPinModal } from './android/AdminPinModal';

interface SpreadsheetViewProps {
  results: QuizResult[];
  highlightResultId?: string;
  onDeleteResult: (id: string) => void;
  onClearAll: () => void;
  onAddManualResult: (result: QuizResult) => void;
  onNavigateToQuiz: () => void;
  isAdminAuthenticated?: boolean;
  onAdminAuthenticated?: () => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  results,
  highlightResultId,
  onDeleteResult,
  onClearAll,
  onAddManualResult,
  onNavigateToQuiz,
  isAdminAuthenticated = false,
  onAdminAuthenticated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<QuizResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  const requireAdmin = (action: () => void) => {
    if (isAdminAuthenticated) {
      action();
    } else {
      setPendingAdminAction(() => action);
      setIsPinModalOpen(true);
    }
  };

  // Form for manual row entry
  const [manualName, setManualName] = useState('');
  const [manualIdentifier, setManualIdentifier] = useState('');
  const [manualScore, setManualScore] = useState(80);
  const [manualMaxScore, setManualMaxScore] = useState(100);

  // Make sure list is strictly sorted descending by score
  const sortedAllResults = useMemo(() => {
    return sortResultsDescending(results);
  }, [results]);

  // Filtered view
  const filteredResults = useMemo(() => {
    return sortedAllResults.filter((item) => {
      const matchSearch =
        item.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.participantIdentifier && item.participantIdentifier.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter === 'passed') return item.isPassed;
      if (statusFilter === 'failed') return !item.isPassed;
      return true;
    });
  }, [sortedAllResults, searchTerm, statusFilter]);

  // Spreadsheet Formulas / Metrics calculation
  const totalCount = sortedAllResults.length;
  const averageScore = totalCount > 0 
    ? (sortedAllResults.reduce((acc, r) => acc + r.score, 0) / totalCount).toFixed(1)
    : '0';
  const maxScore = totalCount > 0 
    ? Math.max(...sortedAllResults.map((r) => r.score))
    : 0;
  const minScore = totalCount > 0 
    ? Math.min(...sortedAllResults.map((r) => r.score))
    : 0;
  const passedCount = sortedAllResults.filter((r) => r.isPassed).length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  // Top 3 Podium
  const top1 = sortedAllResults[0] || null;
  const top2 = sortedAllResults[1] || null;
  const top3 = sortedAllResults[2] || null;

  // Export CSV
  const handleDownloadCSV = () => {
    sounds.playCorrect();
    const csvData = exportResultsToCSV(sortedAllResults);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_nilai_kuis_ceria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy to TSV for easy pasting into Google Sheets / Excel
  const handleCopyTSV = () => {
    sounds.playCorrect();
    const tsvData = exportResultsToTSV(sortedAllResults);
    navigator.clipboard.writeText(tsvData).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  // Print view
  const handlePrint = () => {
    sounds.playPop();
    window.print();
  };

  // Submit manual entry
  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    sounds.playCorrect();
    const percentage = manualMaxScore > 0 ? Math.round((manualScore / manualMaxScore) * 100) : 0;
    const isPassed = percentage >= 70;

    const newResult: QuizResult = {
      id: `manual-${Date.now()}`,
      participantName: manualName.trim(),
      participantIdentifier: manualIdentifier.trim() || undefined,
      score: Number(manualScore),
      maxScore: Number(manualMaxScore),
      percentage,
      correctCount: Math.round((manualScore / manualMaxScore) * 5),
      totalQuestions: 5,
      isPassed,
      durationSeconds: 120,
      submittedAt: new Date().toISOString(),
      answers: [],
    };

    onAddManualResult(newResult);
    setManualName('');
    setManualIdentifier('');
    setShowManualModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6 animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>Spreadsheet Rekap Nilai Merchandising KAO</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border-2 border-emerald-300">
                  <ArrowDownNarrowWide className="w-3.5 h-3.5 mr-1" />
                  Auto-Sorted (Tertinggi ➔ Terendah)
                </span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Nilai evaluasi Merchandiser KAO otomatis ter-update dan menyusun dari skor terbesar ke terkecil secara realtime.
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            onClick={handleCopyTSV}
            id="btn-copy-sheets"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black text-slate-800 bg-white border-2 border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            title="Salin data siap paste ke Google Sheets atau Excel"
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700">Tersalin ke Clipboard! ✨</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Salin ke Sheets</span>
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleDownloadCSV}
            id="btn-download-csv"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-b-3 border-emerald-700 shadow-md shadow-emerald-500/25 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh CSV 📥</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => {
              sounds.playPop();
              requireAdmin(() => setShowManualModal(true));
            }}
            id="btn-manual-row"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black text-amber-900 bg-amber-50 border-2 border-amber-300 hover:bg-amber-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Baris</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={handlePrint}
            title="Cetak tabel"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-2xl text-slate-600 bg-white border-2 border-slate-300 hover:bg-slate-50 transition-colors hidden sm:inline-flex"
          >
            <Printer className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Cheerful 3D Animated Podium for Juara 1, 2, dan 3 */}
      {sortedAllResults.length > 0 && (
        <PodiumTop3 
          results={sortedAllResults} 
          title="Panggung Juara 1, 2, dan 3 🏆"
          subtitle="Peringkat tertinggi otomatis terurut dari nilai terbesar dan waktu pengerjaan tercepat"
        />
      )}

      {/* Formula & Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-mono text-[11px] text-emerald-700 font-extrabold">=COUNT(A:A)</span>
            <span className="font-bold">Total Peserta</span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {totalCount} <span className="text-xs font-normal text-slate-500">Orang</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-mono text-[11px] text-emerald-700 font-extrabold">=AVERAGE(D:D)</span>
            <span className="font-bold">Rata-Rata</span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {averageScore} <span className="text-xs font-normal text-slate-500">Poin</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-200 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span className="font-mono text-[11px] text-amber-700 font-extrabold">=MAX(D:D)</span>
            <span className="font-bold">Nilai Tertinggi</span>
          </div>
          <div className="text-xl font-black text-amber-700 flex items-center space-x-1">
            <span>{maxScore}</span>
            <Trophy className="w-4 h-4 text-amber-500 inline" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-mono text-[11px] text-emerald-700 font-extrabold">=MIN(D:D)</span>
            <span className="font-bold">Nilai Terendah</span>
          </div>
          <div className="text-xl font-black text-slate-800">
            {minScore} <span className="text-xs font-normal text-slate-500">Poin</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-mono text-[11px] text-emerald-700 font-extrabold">=RATE(PASS)</span>
            <span className="font-bold">Kelulusan</span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {passRate}% <span className="text-xs font-normal text-slate-500">({passedCount}/{totalCount})</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Formula Bar Display */}
      <div className="bg-white rounded-2xl border-2 border-amber-200/80 p-2.5 mb-4 shadow-2xs flex items-center space-x-3 text-xs">
        <span className="font-mono font-black text-amber-900 px-2.5 py-1 bg-amber-100 rounded-xl border border-amber-300">
          fx
        </span>
        <div className="flex-1 font-mono font-bold text-slate-800 overflow-x-auto truncate">
          =SORT(DATA_KUIS; 4; FALSE) <span className="text-slate-400 font-sans ml-2">(Auto-Sort: Kolom D Skor Descending)</span>
        </div>
        <span className="text-emerald-700 font-black hidden md:inline-flex items-center text-[11px] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Sparkles className="w-3 h-3 mr-1" />
          Realtime Auto-Sync Aktif
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-t-3xl border-2 border-b-0 border-amber-200/80 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-spreadsheet-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama karyawan MD atau area/store..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs border-2 border-slate-200 rounded-2xl p-1 bg-slate-50 font-bold">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setStatusFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all'
                  ? 'bg-amber-500 font-black text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({sortedAllResults.length})
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setStatusFilter('passed');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'passed'
                  ? 'bg-emerald-600 font-black text-white shadow-2xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Kompeten ({passedCount})
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setStatusFilter('failed');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'failed'
                  ? 'bg-rose-600 font-black text-white shadow-2xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Perlu Pembinaan ({totalCount - passedCount})
            </button>
          </div>

          {/* Mode Switcher: Mobile Card vs Spreadsheet Table */}
          <div className="flex items-center space-x-1 border-2 border-slate-200 rounded-2xl p-1 bg-slate-50 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setViewMode('card');
              }}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl transition-all ${
                viewMode === 'card'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Kartu HP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setViewMode('table');
              }}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel Excel</span>
            </button>
          </div>

          {sortedAllResults.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                requireAdmin(() => setShowClearConfirm(true));
              }}
              className="text-xs text-rose-600 hover:text-rose-700 p-2.5 rounded-2xl hover:bg-rose-50 border-2 border-rose-200 transition-colors"
              title="Kosongkan Semua Data (Perlu PIN Admin)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* The Content Area: Mobile Card View vs Spreadsheet Table */}
      {viewMode === 'card' ? (
        <div className="space-y-2.5 bg-slate-50/70 p-3 sm:p-4 rounded-b-3xl border-2 border-t-0 border-amber-200/80">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border-2 border-dashed border-slate-200 p-4">
              <div className="text-4xl mb-2">📊</div>
              <p className="font-extrabold text-slate-800 mb-1 text-sm">
                {searchTerm ? 'Tidak ada peserta yang cocok' : 'Belum ada data evaluasi MD'}
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Kerjakan kuis untuk mengisi lembar peringkat secara otomatis.
              </p>
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onNavigateToQuiz();
                }}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                Mulai Evaluasi Pertama 🚀
              </button>
            </div>
          ) : (
            filteredResults.map((row) => {
              const trueRank = sortedAllResults.findIndex((r) => r.id === row.id) + 1;
              const isHighlighted = highlightResultId === row.id;

              return (
                <div
                  key={row.id}
                  className={`bg-white rounded-2xl p-3.5 border-2 transition-all shadow-xs relative ${
                    isHighlighted
                      ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-300/40'
                      : trueRank === 1
                      ? 'border-amber-300 bg-gradient-to-r from-amber-50/40 to-white'
                      : trueRank === 2
                      ? 'border-slate-300 bg-gradient-to-r from-slate-50/40 to-white'
                      : trueRank === 3
                      ? 'border-orange-200 bg-gradient-to-r from-orange-50/30 to-white'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      {trueRank === 1 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border border-amber-600 shadow-2xs flex items-center gap-1">
                          🥇 #1 JUARA
                        </span>
                      ) : trueRank === 2 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-slate-200 text-slate-800 border border-slate-400 flex items-center gap-1">
                          🥈 #2
                        </span>
                      ) : trueRank === 3 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-900 border border-orange-300 flex items-center gap-1">
                          🥉 #3
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                          #{trueRank}
                        </span>
                      )}

                      <h4 className="font-black text-sm text-slate-900">
                        {row.participantName}
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        row.isPassed
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {row.isPassed ? 'KOMPETEN 🎯' : 'PEMBINAAN'}
                    </span>
                  </div>

                  {row.participantIdentifier && (
                    <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">{row.participantIdentifier}</span>
                    </p>
                  )}

                  {/* Score & Metrics Bar */}
                  <div className="bg-slate-50/80 rounded-xl p-2 border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-semibold">SKOR</span>
                      <span className="font-black text-amber-800 text-sm">{row.score}</span>
                      <span className="text-[10px] text-slate-400">/{row.maxScore}</span>
                    </div>

                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-semibold">AKURASI</span>
                      <span className="font-extrabold text-emerald-700">{row.percentage}%</span>
                    </div>

                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-semibold">BENAR</span>
                      <span>{row.correctCount}/{row.totalQuestions}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block font-semibold">DURASI</span>
                      <span>{formatDuration(row.durationSeconds)}</span>
                    </div>
                  </div>

                  {/* Footer date & actions */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                    <span>{formatDate(row.submittedAt)}</span>
                    <div className="flex items-center space-x-2">
                      {row.answers && row.answers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            setSelectedDetail(row);
                          }}
                          className="flex items-center space-x-1 text-emerald-700 font-bold hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rincian</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          requireAdmin(() => onDeleteResult(row.id));
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Hapus baris ini (Perlu PIN Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* The Interactive Spreadsheet Table */
        <div className="bg-white border-2 border-amber-200/80 rounded-b-3xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              {/* Spreadsheet Column Coordinates (A, B, C, D...) */}
              <tr className="bg-amber-50/50 text-amber-900/60 text-[11px] font-mono border-b border-amber-200 select-none">
                <th className="w-12 px-3 py-1.5 text-center font-normal border-r border-amber-200">#</th>
                <th className="px-3 py-1.5 font-bold text-center border-r border-amber-200 w-16">A</th>
                <th className="px-4 py-1.5 font-bold border-r border-amber-200">B</th>
                <th className="px-4 py-1.5 font-bold border-r border-amber-200">C</th>
                <th className="px-4 py-1.5 font-bold text-center border-r border-amber-200 w-28 bg-amber-100/50 text-amber-900">D</th>
                <th className="px-4 py-1.5 font-bold text-center border-r border-amber-200 w-28">E</th>
                <th className="px-4 py-1.5 font-bold text-center border-r border-amber-200 w-24">F</th>
                <th className="px-4 py-1.5 font-bold text-center border-r border-amber-200 w-28">G</th>
                <th className="px-4 py-1.5 font-bold border-r border-amber-200 w-36">H</th>
                <th className="px-4 py-1.5 font-bold text-center border-r border-amber-200 w-24">I</th>
                <th className="px-3 py-1.5 font-bold text-center w-16">J</th>
              </tr>

              {/* Functional Column Labels */}
              <tr className="bg-white text-slate-800 font-extrabold border-b-2 border-slate-200 text-xs">
                <th className="px-3 py-3 text-center border-r border-slate-200 bg-slate-50 text-slate-400 font-mono">
                  Row
                </th>
                <th className="px-3 py-3 text-center border-r border-slate-200">
                  Peringkat
                </th>
                <th className="px-4 py-3 border-r border-slate-200">
                  Nama Karyawan MD
                </th>
                <th className="px-4 py-3 border-r border-slate-200">
                  Area / Store / NIK
                </th>
                <th className="px-4 py-3 text-center border-r border-slate-200 bg-amber-50 text-amber-950">
                  <div className="flex items-center justify-center space-x-1 font-black">
                    <span>Skor Nilai</span>
                    <ArrowDownNarrowWide className="w-3.5 h-3.5 text-amber-700" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center border-r border-slate-200">
                  Akurasi (%)
                </th>
                <th className="px-4 py-3 text-center border-r border-slate-200">
                  Benar/Total
                </th>
                <th className="px-4 py-3 text-center border-r border-slate-200">
                  Durasi
                </th>
                <th className="px-4 py-3 border-r border-slate-200">
                  Waktu Submit
                </th>
                <th className="px-4 py-3 text-center border-r border-slate-200">
                  Status
                </th>
                <th className="px-3 py-3 text-center">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="font-extrabold text-slate-800 mb-1 text-base">
                      {searchTerm ? 'Tidak ada peserta yang cocok' : 'Belum ada data kuis tersimpan'}
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      Kerjakan kuis untuk mengisi lembar spreadsheet secara otomatis.
                    </p>
                    <motion.button
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        onNavigateToQuiz();
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 border-b-3 border-orange-600 shadow-md cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Mulai Kuis Ceria Pertama! 🚀</span>
                    </motion.button>
                  </td>
                </tr>
              ) : (
                filteredResults.map((row, idx) => {
                  const trueRank = sortedAllResults.findIndex((r) => r.id === row.id) + 1;
                  const isHighlighted = highlightResultId === row.id;

                  let rankBadge = (
                    <span className="font-bold text-slate-700">#{trueRank}</span>
                  );

                  if (trueRank === 1) {
                    rankBadge = (
                      <motion.div 
                        whileHover={{ scale: 1.15 }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 font-black text-xs border-2 border-amber-400 shadow-sm animate-gold-shine cursor-pointer"
                        title="Juara 1 • Skor Tertinggi"
                      >
                        <span className="text-sm animate-crown-bob inline-block">👑</span>
                        <span>🥇 #1</span>
                      </motion.div>
                    );
                  } else if (trueRank === 2) {
                    rankBadge = (
                      <motion.div 
                        whileHover={{ scale: 1.12 }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 text-slate-800 font-black text-xs border-2 border-slate-300 shadow-xs cursor-pointer"
                        title="Juara 2"
                      >
                        <span className="text-xs">⭐</span>
                        <span>🥈 #2</span>
                      </motion.div>
                    );
                  } else if (trueRank === 3) {
                    rankBadge = (
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 text-amber-950 font-black text-xs border-2 border-orange-300 shadow-xs cursor-pointer"
                        title="Juara 3"
                      >
                        <span className="text-xs">💫</span>
                        <span>🥉 #3</span>
                      </motion.div>
                    );
                  }

                  let rowStyle = 'bg-white';
                  if (isHighlighted) {
                    rowStyle = 'bg-amber-100/80 ring-2 ring-amber-400';
                  } else if (trueRank === 1) {
                    rowStyle = 'bg-amber-50/70 hover:bg-amber-100/50 border-l-4 border-l-amber-400';
                  } else if (trueRank === 2) {
                    rowStyle = 'bg-slate-50/80 hover:bg-slate-100/60 border-l-4 border-l-slate-400';
                  } else if (trueRank === 3) {
                    rowStyle = 'bg-orange-50/50 hover:bg-orange-100/50 border-l-4 border-l-orange-400';
                  } else if (idx % 2 === 1) {
                    rowStyle = 'bg-slate-50/40';
                  }

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${rowStyle}`}
                    >
                      {/* Row coordinate */}
                      <td className="px-3 py-3 text-center font-mono text-[11px] text-slate-400 bg-slate-50/80 border-r border-slate-200 select-none">
                        {idx + 1}
                      </td>

                      {/* Rank (Col A) */}
                      <td className="px-3 py-3 text-center border-r border-slate-200">
                        {rankBadge}
                      </td>

                      {/* Name (Col B) */}
                      <td className="px-4 py-3 font-extrabold text-slate-900 border-r border-slate-200">
                        <div className="flex items-center space-x-2">
                          <span>{row.participantName}</span>
                          {isHighlighted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                              Baru ⭐
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Identifier / Class (Col C) */}
                      <td className="px-4 py-3 text-slate-600 border-r border-slate-200 text-xs font-bold">
                        {row.participantIdentifier || '-'}
                      </td>

                      {/* Score (Col D - Primary sorted metric) */}
                      <td className="px-4 py-3 text-center border-r border-slate-200 font-mono font-black bg-amber-50/40">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-black border-2 ${
                          row.score >= 80
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : row.score >= 70
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-orange-50 text-orange-900 border-orange-200'
                        }`}>
                          {row.score}
                          <span className="text-[10px] font-normal text-slate-500 ml-0.5">/{row.maxScore}</span>
                        </span>
                      </td>

                      {/* Accuracy % (Col E) */}
                      <td className="px-4 py-3 text-center border-r border-slate-200">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="font-mono text-xs font-extrabold text-slate-800">
                            {row.percentage}%
                          </span>
                          <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block border border-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                row.percentage >= 70 ? 'bg-emerald-500' : 'bg-orange-400'
                              }`}
                              style={{ width: `${row.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Correct / Total (Col F) */}
                      <td className="px-4 py-3 text-center border-r border-slate-200 text-xs font-extrabold text-slate-700">
                        {row.correctCount} / {row.totalQuestions}
                      </td>

                      {/* Duration (Col G) */}
                      <td className="px-4 py-3 text-center border-r border-slate-200 font-mono text-xs font-bold text-slate-600">
                        {formatDuration(row.durationSeconds)}
                      </td>

                      {/* Submit Date (Col H) */}
                      <td className="px-4 py-3 text-xs text-slate-500 border-r border-slate-200">
                        {formatDate(row.submittedAt)}
                      </td>

                      {/* Status (Col I) */}
                      <td className="px-4 py-3 text-center border-r border-slate-200">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                          row.isPassed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {row.isPassed ? 'KOMPETEN 🎯' : 'PEMBINAAN'}
                        </span>
                      </td>

                      {/* Action (Col J) */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {row.answers && row.answers.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playPop();
                                setSelectedDetail(row);
                              }}
                              title="Lihat Rincian Jawaban"
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100 rounded-xl transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playPop();
                              requireAdmin(() => onDeleteResult(row.id));
                            }}
                            title="Hapus baris ini (Perlu PIN Admin)"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Spreadsheet Footer status */}
        <div className="bg-amber-50/40 border-t-2 border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between text-xs text-slate-600 font-bold gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Sheet 1: Rekap_Nilai (Urut Nilai Descending)</span>
            <span>•</span>
            <span>Menampilkan {filteredResults.length} baris data</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            ⚡ Urutan realtime: Skor Tertinggi &rarr; Waktu Tercepat &rarr; Tanggal Terbaru
          </div>
        </div>
      </div>
      )}

      {/* Answer Detail Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-3 border-amber-300"
            >
              <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100 mb-4">
                <div>
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Rincian Jawaban Peserta
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {selectedDetail.participantName}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Skor: {selectedDetail.score}/{selectedDetail.maxScore} ({selectedDetail.percentage}%) • Durasi: {formatDuration(selectedDetail.durationSeconds)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDetail(null)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedDetail.answers.map((ans, idx) => (
                  <div
                    key={ans.questionId || idx}
                    className={`p-4 rounded-2xl border-2 text-xs sm:text-sm ${
                      ans.isCorrect ? 'bg-emerald-50/50 border-emerald-300' : 'bg-rose-50/50 border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-slate-900">
                        Soal #{idx + 1}
                      </span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        ans.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ans.isCorrect ? `+${ans.pointsEarned} Poin (Benar)` : '0 Poin (Salah)'}
                      </span>
                    </div>

                    <p className="font-extrabold text-slate-800 mb-2">
                      {ans.questionText}
                    </p>

                    <div className="space-y-1.5 text-xs font-bold">
                      <div>
                        <span className="text-slate-500">Jawaban Peserta: </span>
                        <span className={ans.isCorrect ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                          {ans.selectedOptionText || '(Kosong / Tidak Menjawab)'}
                        </span>
                      </div>

                      {!ans.isCorrect && (
                        <div>
                          <span className="text-slate-500">Kunci Jawaban Benar: </span>
                          <span className="text-emerald-800 font-black">
                            {ans.correctOptionText}
                          </span>
                        </div>
                      )}

                      {ans.explanation && (
                        <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-xs">
                          <strong className="text-slate-900 font-black">Pembahasan: </strong>{ans.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t-2 border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDetail(null)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Row Entry Modal */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-3 border-amber-300"
            >
              <h3 className="text-base font-black text-slate-900 mb-1 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Tambah Baris Nilai Manual Karyawan MD</span>
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-4">
                Baris baru akan otomatis tersusun ke posisi yang tepat berdasarkan besaran nilainya di spreadsheet.
              </p>

              <form onSubmit={handleCreateManual} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Nama Karyawan MD <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Contoh: Budi Santoso - MD"
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Area Penempatan / Store / NIK
                  </label>
                  <input
                    type="text"
                    value={manualIdentifier}
                    onChange={(e) => setManualIdentifier(e.target.value)}
                    placeholder="Contoh: MD Surabaya MT • Superindo • NIK: KAO-7729"
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Skor Diperoleh
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualScore}
                      onChange={(e) => setManualScore(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Skor Maksimal
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualMaxScore}
                      onChange={(e) => setManualMaxScore(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t-2 border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-b-2 border-emerald-700 rounded-xl shadow-xs"
                  >
                    Simpan & Urutkan ✨
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-3 border-rose-300 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 text-2xl border-2 border-rose-300">
                🗑️
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">
                Kosongkan Lembar Spreadsheet?
              </h3>
              <p className="text-xs font-medium text-slate-600 mb-4 leading-relaxed">
                Semua baris nilai peserta ({sortedAllResults.length} data) akan dihapus secara permanen dari spreadsheet.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-100 rounded-xl border-2 border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setShowClearConfirm(false);
                    onClearAll();
                  }}
                  className="px-4 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  Ya, Hapus Semua
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin PIN Verification Modal */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        title="Otorisasi PIN Admin"
        description="Perubahan data nilai dan penambahan baris kuis hanya dapat dilakukan oleh Admin SOP."
        onSuccess={() => {
          onAdminAuthenticated?.();
          if (pendingAdminAction) {
            pendingAdminAction();
            setPendingAdminAction(null);
          }
          setIsPinModalOpen(false);
        }}
        onCancel={() => {
          setIsPinModalOpen(false);
          setPendingAdminAction(null);
        }}
      />
    </div>
  );
};
