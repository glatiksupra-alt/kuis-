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
  ShieldCheck, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Copy,
  Send,
  User,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView, AppMode, AuthUser } from '../../types';
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
  currentUser?: AuthUser | null;
  onLogout?: () => void;
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
  currentUser,
  onLogout,
}) => {
  const [soundActive, setSoundActive] = useState(() => sounds.isSoundEnabled());
  const [copiedToast, setCopiedToast] = useState(false);
  // isSlideOpen: controls whether Bagikan & Suara toolbar is slid open or slid to the right (collapsed)
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  // isDrawerOpen: controls full right slide-over panel
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundActive(next);
  };

  const copyToClipboard = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2200);
      }
    } catch {
      // fallback
    }
  };

  const handleShareApp = () => {
    sounds.playPop();
    const shareData = {
      title: 'Kuis Evaluasi Merchandising KAO',
      text: 'Halo Tim Merchandiser KAO! Mari uji pemahaman SOP display gondola, planogram, dan standar KAO di sini:',
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const handleShareWhatsApp = () => {
    sounds.playPop();
    const text = encodeURIComponent(
      `Halo Rekan Tim MD KAO! 🌟\nYuk ikuti Kuis Evaluasi Merchandising & SOP Planogram KAO:\n${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const isTakingQuiz = currentView === 'quiz-taking';
  const showBackButton = currentView !== 'quiz-start';

  const getViewTitle = () => {
    switch (currentView) {
      case 'quiz-start':
        return 'Kuis Merchandising KAO';
      case 'quiz-taking':
        return 'Evaluasi SOP KAO';
      case 'quiz-result':
        return 'Hasil Evaluasi';
      case 'spreadsheet':
        return 'Rekap Nilai MD';
      case 'admin':
        return 'Kelola Bank Soal';
      default:
        return 'KAO Merchandising';
    }
  };

  const getViewSubtitle = () => {
    switch (currentView) {
      case 'quiz-start':
        return appMode === 'md' ? 'SOP & Planogram Display' : 'Mode Admin SOP';
      case 'quiz-taking':
        return 'Sesi Ujian Lapangan';
      case 'quiz-result':
        return 'Ringkasan Nilai Karyawan';
      case 'spreadsheet':
        return `${participantCount} Karyawan Terdaftar`;
      case 'admin':
        return 'Pengaturan Bank Soal & Display';
      default:
        return 'KAO Indonesia';
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100/90 px-3 sm:px-4 py-2 flex items-center justify-between select-none z-20 shadow-xs relative">
        {/* Left: Logo & View Title (Clean & Breathable) */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {showBackButton && !isTakingQuiz ? (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onNavigate('quiz-start');
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-90 transition-all border border-slate-200 shrink-0"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 text-white flex items-center justify-center font-black shadow-sm shadow-emerald-500/30 shrink-0">
              <Store className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight truncate">
              {getViewTitle()}
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">{getViewSubtitle()}</span>
            </p>
          </div>
        </div>

        {/* Right Section: Rapi Mode MD + Slide Kekanan Bagikan & Suara */}
        <div className="flex items-center space-x-1.5 shrink-0 pl-1">
          {/* Tulisan Mode MD (Dirapikan & Bersih) */}
          {appMode === 'admin' ? (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onSwitchToMdMode?.();
              }}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-amber-500 hover:bg-amber-600 text-white shadow-xs border border-amber-600 active:scale-95 transition-all cursor-pointer"
              title="Mode Admin Aktif • Klik untuk Kunci & Beralih ke Mode MD"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-100" />
              <span>Mode Admin</span>
              <span className="text-[8px] bg-amber-900/30 text-amber-100 px-1 py-0.2 rounded font-bold">Kunci ✕</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onRequestAdminMode?.();
              }}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-300/80 active:scale-95 transition-all shadow-2xs cursor-pointer group"
              title="Mode MD Aktif • Klik jika ingin masuk ke Mode Admin (Perlu PIN)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="tracking-tight">Mode MD</span>
              <Lock className="w-2.5 h-2.5 text-emerald-600/70" />
            </button>
          )}

          {/* Bagikan & Suara: Di-bikin Slide Kekanan Supaya Lebih Clear */}
          <div className="flex items-center">
            <AnimatePresence initial={false} mode="wait">
              {isSlideOpen ? (
                <motion.div
                  key="expanded-tools"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="flex items-center space-x-1 bg-white/95 p-0.5 rounded-full border border-emerald-200/90 shadow-xs"
                >
                  {/* Tombol Bagikan (Share / Salin) */}
                  <button
                    type="button"
                    onClick={handleShareApp}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 active:scale-90 transition-all border border-slate-200 cursor-pointer"
                    title="Bagikan / Salin Tautan Kuis"
                  >
                    {copiedToast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Tombol Suara (Volume Toggle) */}
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border cursor-pointer active:scale-90 ${
                      soundActive
                        ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                    title={soundActive ? 'Suara Aktif (Klik untuk Senyap)' : 'Suara Senyap (Klik untuk Aktif)'}
                  >
                    {soundActive ? (
                      <Volume2 className="w-3.5 h-3.5" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Tombol Buka Panel Slide Lengkap */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setIsDrawerOpen(true);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all border border-slate-200 cursor-pointer"
                    title="Buka Menu Pengaturan Cepat"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                  </button>

                  {/* Tombol Slide ke Kanan (Tutup agar Tampilan Clear) */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setIsSlideOpen(false);
                    }}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
                    title="Slide ke kanan untuk tampilan lebih bersih (clear)"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
                  </button>
                </motion.div>
              ) : (
                /* Posisi Slid-to-Right (Terselip Rapi ke Kanan): Sangat Clear & Lapang */
                <motion.button
                  key="collapsed-slide-btn"
                  initial={{ opacity: 0, x: 10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setIsSlideOpen(true);
                  }}
                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold bg-slate-100/90 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 active:scale-95 transition-all shadow-2xs cursor-pointer group"
                  title="Klik untuk membuka tombol Suara & Bagikan (Slide ke Kiri)"
                >
                  <ChevronLeft className="w-3 h-3 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="flex items-center space-x-1 text-slate-600 group-hover:text-emerald-800">
                    {soundActive ? (
                      <Volume2 className="w-3 h-3 text-amber-600" />
                    ) : (
                      <VolumeX className="w-3 h-3 text-slate-400" />
                    )}
                    <Share2 className="w-2.5 h-2.5 text-slate-500" />
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Mini Logout Button */}
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Keluar dari akun ${currentUser.name}? Anda akan kembali ke halaman login.`)) {
                  sounds.playPop();
                  onLogout?.();
                }
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-90 transition-all cursor-pointer shrink-0"
              title={`Keluar dari Akun (${currentUser.name})`}
            >
              <LogOut className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Feedback Toast Salin Tautan */}
        <AnimatePresence>
          {copiedToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center space-x-1.5 z-50 pointer-events-none"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tautan Kuis Berhasil Disalin! ✨</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Slide-over Drawer dari Sisi Kanan (Right Slide Drawer) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs cursor-pointer"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      Aksi & Pengaturan
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500">
                      Suara, Bagikan & Mode KAO
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/80 active:scale-90 transition-all border border-slate-200 cursor-pointer"
                  title="Slide Tutup ke Kanan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-4 sm:p-5 space-y-5 flex-1">
                {/* 1. Pengaturan Suara dengan Slide Switch ke Kanan */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Pengaturan Audio Kuis
                  </span>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        soundActive ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {soundActive ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          {soundActive ? 'Efek Suara Aktif' : 'Efek Suara Senyap'}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500">
                          {soundActive ? 'Slide ke kanan (ON)' : 'Slide ke kiri (OFF)'}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Slide Switch Slider */}
                    <button
                      type="button"
                      onClick={handleToggleSound}
                      className={`w-13 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer relative flex items-center ${
                        soundActive ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                      title={soundActive ? 'Geser ke kiri untuk matikan' : 'Geser/Slide ke kanan untuk aktifkan suara'}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                      >
                        {soundActive ? (
                          <span className="text-[8px] font-black text-emerald-700">ON</span>
                        ) : (
                          <span className="text-[8px] font-black text-slate-400">OFF</span>
                        )}
                      </motion.div>
                    </button>
                  </div>

                  {soundActive && (
                    <button
                      type="button"
                      onClick={() => sounds.playCorrect()}
                      className="w-full py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Music className="w-3.5 h-3.5 text-amber-600" />
                      <span>Uji Bunyi Efek Suara 🎵</span>
                    </button>
                  )}
                </div>

                {/* 2. Bagikan Aplikasi (Share) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Bagikan Kuis ke Tim MD
                  </span>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="w-full py-2.5 px-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-black flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center space-x-2">
                        <Copy className="w-4 h-4 text-emerald-600" />
                        <span>Salin Tautan Kuis</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                        {copiedToast ? 'Tersalin! ✓' : 'Salin URL'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="w-full py-2.5 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-600/25"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Bagikan ke WhatsApp Tim MD</span>
                    </button>
                  </div>
                </div>

                {/* 3. Status Mode KAO */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Status Mode Kerja
                  </span>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black text-emerald-950">
                          {appMode === 'admin' ? 'Mode Administrator' : 'Mode Merchandiser (MD)'}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        {appMode === 'admin' ? 'Akses Penuh' : 'Khusus Ujian'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {appMode === 'admin'
                        ? 'Anda dapat mengedit soal, mengatur foto display, dan melihat spreadsheet nilai karyawan.'
                        : 'Mode khusus karyawan MD untuk pengerjaan soal merchandising SOP KAO.'}
                    </p>

                    {appMode === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setIsDrawerOpen(false);
                          onSwitchToMdMode?.();
                        }}
                        className="w-full py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer"
                      >
                        Kunci & Kembali ke Mode MD
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setIsDrawerOpen(false);
                          onRequestAdminMode?.();
                        }}
                        className="w-full py-2 rounded-xl text-xs font-black bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Lock className="w-3 h-3 text-emerald-700" />
                        <span>Beralih ke Mode Admin (PIN)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Profil Karyawan Terdaftar */}
                {currentUser && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Akun Karyawan
                    </span>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-900">{currentUser.name}</p>
                        <p className="text-[10px] font-semibold text-slate-500">
                          {currentUser.identifier} {currentUser.area ? `• ${currentUser.area}` : ''}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Keluar dari akun ${currentUser.name}?`)) {
                            sounds.playPop();
                            setIsDrawerOpen(false);
                            onLogout?.();
                          }
                        }}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>Tutup & Slide ke Kanan</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
