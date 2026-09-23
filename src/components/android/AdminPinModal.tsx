import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Delete, 
  X, 
  KeyRound, 
  AlertCircle, 
  Check, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { verifyAdminPin, DEFAULT_ADMIN_PIN } from '../../utils/storage';
import { sounds } from '../../utils/sound';

interface AdminPinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  title = 'Autentikasi PIN Admin SOP',
  description = 'Hanya admin yang dapat merubah dan mengedit variabel serta bank soal.',
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsShaking(false);
    }
  }, [isOpen]);

  const handleDigit = useCallback((digit: string) => {
    sounds.playPop();
    setErrorMsg('');
    setPin((prev) => {
      if (prev.length >= 6) return prev;
      return prev + digit;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    sounds.playPop();
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    sounds.playPop();
    setPin('');
    setErrorMsg('');
  }, []);

  // Check PIN verification automatically when reaching 4 digits (or allow manual submit)
  useEffect(() => {
    if (pin.length === 4) {
      if (verifyAdminPin(pin)) {
        sounds.playCorrect();
        setErrorMsg('');
        setTimeout(() => {
          onSuccess();
        }, 150);
      } else {
        sounds.playWrong();
        setIsShaking(true);
        setErrorMsg('PIN salah! Silakan coba kembali.');
        setTimeout(() => {
          setIsShaking(false);
          setPin('');
        }, 600);
      }
    }
  }, [pin, onSuccess]);

  // Physical keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleBackspace, onCancel]);

  if (!isOpen) return null;

  const numpadKeys = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-emerald-500/30 flex flex-col items-center relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onCancel();
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          title="Batal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3 border-2 border-emerald-300">
          <Lock className="w-7 h-7" />
        </div>

        {/* Modal Titles */}
        <h3 className="text-base font-black text-slate-900 text-center tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-[11px] font-semibold text-slate-500 text-center mt-1 max-w-[260px] leading-relaxed">
          {description}
        </p>

        {/* 4-PIN Circles Display */}
        <motion.div
          animate={isShaking ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center space-x-4 my-5"
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <motion.div
                key={index}
                animate={{ scale: isFilled ? 1.15 : 1 }}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  isFilled
                    ? 'bg-emerald-600 border-emerald-600 shadow-sm shadow-emerald-600/40'
                    : 'bg-slate-100 border-slate-300'
                }`}
              />
            );
          })}
        </motion.div>

        {/* Error message */}
        <div className="h-5 flex items-center justify-center mb-2">
          {errorMsg ? (
            <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          ) : (
            <span className="text-[10px] font-medium text-slate-400">
              Ketik 4 digit angka PIN Admin
            </span>
          )}
        </div>

        {/* Android Material Dialer Numpad */}
        <div className="w-full grid grid-cols-3 gap-2.5 max-w-[260px] mb-3">
          {numpadKeys.map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => handleDigit(item.num)}
              className="h-13 rounded-2xl bg-slate-100 hover:bg-emerald-50 active:bg-emerald-200 text-slate-900 flex flex-col items-center justify-center transition-all border border-slate-200 active:scale-95 cursor-pointer group"
            >
              <span className="text-lg font-black leading-none group-hover:text-emerald-800">
                {item.num}
              </span>
              {item.sub && (
                <span className="text-[8px] font-bold text-slate-400 mt-0.5 tracking-wider">
                  {item.sub}
                </span>
              )}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Backspace */}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 text-xs font-black transition-all border border-slate-200 active:scale-95 cursor-pointer flex items-center justify-center"
          >
            Hapus
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-slate-100 hover:bg-emerald-50 active:bg-emerald-200 text-slate-900 flex flex-col items-center justify-center transition-all border border-slate-200 active:scale-95 cursor-pointer group"
          >
            <span className="text-lg font-black leading-none group-hover:text-emerald-800">
              0
            </span>
            <span className="text-[8px] font-bold text-slate-400 mt-0.5">+</span>
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-slate-100 hover:bg-rose-50 active:bg-rose-100 text-slate-600 hover:text-rose-600 transition-all border border-slate-200 active:scale-95 cursor-pointer flex items-center justify-center"
            title="Hapus Digit Terakhir"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Hint Pill & Forgotten PIN Info */}
        <div className="w-full flex flex-col items-center space-y-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setShowHint(!showHint);
            }}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Petunjuk PIN Default</span>
          </button>

          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 text-center font-bold"
            >
              PIN bawaan awal adalah <strong className="font-black text-amber-950 px-1 py-0.5 bg-amber-200 rounded">{DEFAULT_ADMIN_PIN}</strong>. Anda dapat menggantinya kapan saja setelah masuk ke menu Pengaturan.
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
