import React, { useState } from 'react';
import { 
  Store, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  MapPin, 
  BadgeCheck, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Layers,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthUser } from '../types';
import { verifyAdminPin, saveAuthUser, DEFAULT_ADMIN_PIN } from '../utils/storage';
import { sounds } from '../utils/sound';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

const STORE_AREAS = [
  'Alfamart - Jabodetabek',
  'Indomaret - Jabodetabek',
  'Alfamart - Jawa Barat',
  'Indomaret - Jawa Barat',
  'Superindo - Jabodetabek & Banten',
  'Hypermart / Foodmart - Nasional',
  'Lotte Mart - Nasional',
  'Modern Trade Local - Jateng & DIY',
  'Modern Trade - Jatim & Bali',
  'Area Modern Market Lainnya',
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'md' | 'admin'>('md');

  // MD form state
  const [mdName, setMdName] = useState('');
  const [mdIdentifier, setMdIdentifier] = useState('');
  const [mdArea, setMdArea] = useState(STORE_AREAS[0]);
  const [rememberMe, setRememberMe] = useState(true);

  // Admin form state
  const [adminName, setAdminName] = useState('Supervisor Area Modern Market');
  const [adminPin, setAdminPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Validation / Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTabChange = (tab: 'md' | 'admin') => {
    sounds.playTap();
    setActiveTab(tab);
    setErrorMsg(null);
  };

  // Quick autofill demo profiles
  const handleAutofillDemo = (name: string, id: string, area: string) => {
    sounds.playPop();
    setMdName(name);
    setMdIdentifier(id);
    setMdArea(area);
    setErrorMsg(null);
  };

  const handleMdLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = mdName.trim();
    const trimmedId = mdIdentifier.trim();

    if (!trimmedName) {
      sounds.playWrong();
      setErrorMsg('Harap masukkan Nama Lengkap Anda.');
      return;
    }

    if (!trimmedId) {
      sounds.playWrong();
      setErrorMsg('Harap masukkan NIK / ID Karyawan MD Anda.');
      return;
    }

    setIsSubmitting(true);
    sounds.playCorrect();

    const user: AuthUser = {
      id: `md-${Date.now()}`,
      name: trimmedName,
      identifier: trimmedId,
      role: 'md',
      area: mdArea,
      loginAt: new Date().toISOString(),
    };

    saveAuthUser(user, rememberMe);

    setTimeout(() => {
      onLoginSuccess(user);
    }, 300);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = adminName.trim() || 'Admin SOP KAO';
    const trimmedPin = adminPin.trim();

    if (!trimmedPin) {
      sounds.playWrong();
      setErrorMsg('Masukkan PIN Keamanan Admin SOP.');
      return;
    }

    if (!verifyAdminPin(trimmedPin)) {
      sounds.playWrong();
      setErrorMsg('PIN Admin tidak valid. Gunakan PIN default: 1234');
      return;
    }

    setIsSubmitting(true);
    sounds.playFanfare();

    const user: AuthUser = {
      id: `admin-${Date.now()}`,
      name: trimmedName,
      identifier: 'ADMIN-SOP',
      role: 'admin',
      area: 'Head Office / Area Modern Market',
      loginAt: new Date().toISOString(),
    };

    saveAuthUser(user, rememberMe);

    setTimeout(() => {
      onLoginSuccess(user);
    }, 350);
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white select-none">
      <div className="w-full max-w-md mx-auto">
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 pt-2"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 text-white shadow-lg shadow-emerald-600/20 mb-3">
            <Store className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center space-x-1.5 mb-1">
            <span className="text-xs uppercase tracking-widest font-black text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
              KAO INDONESIA
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Modern Trade System
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Portal Evaluasi Merchandiser
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1 max-w-xs mx-auto">
            Sistem evaluasi standar display, planogram, dan SOP KAO Modern Market.
          </p>

          {/* Supported Brand Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1 mt-3">
            {['Attack', 'Biore', 'Laurier', "Men's Biore", 'Merries', 'MegRhythm'].map((b) => (
              <span key={b} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                {b}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Role Selector Tabs (MD vs Admin) */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center mb-5 shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange('md')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeTab === 'md'
                ? 'bg-white text-emerald-800 shadow-sm shadow-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Merchandiser (MD)</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              Default
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-amber-900 shadow-sm shadow-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Admin / Supervisor</span>
            <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
              PIN
            </span>
          </button>
        </div>

        {/* Error Feedback Alert */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-start space-x-2.5 text-xs text-rose-800 font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-100/90 shadow-xl shadow-slate-200/50">
          {activeTab === 'md' ? (
            /* =================== MD LOGIN FORM =================== */
            <form onSubmit={handleMdLogin} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Masuk sebagai Merchandiser</span>
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500">
                    Akses pengerjaan pertanyaan evaluasi & podium juara
                  </p>
                </div>
              </div>

              {/* Nama Lengkap Input */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Nama Lengkap MD <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={mdName}
                    onChange={(e) => {
                      setMdName(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl text-xs font-semibold text-slate-900 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* NIK / ID Karyawan Input */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  NIK / ID Karyawan MD <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={mdIdentifier}
                    onChange={(e) => {
                      setMdIdentifier(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Contoh: MD-2024-089"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl text-xs font-semibold text-slate-900 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all uppercase"
                  />
                </div>
              </div>

              {/* Area / Mitra Penugasan */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Area / Mitra Modern Market
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={mdArea}
                    onChange={(e) => setMdArea(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 rounded-2xl text-xs font-semibold text-slate-900 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    {STORE_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Remember me toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Ingat sesi saya di HP ini</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all border-b-3 border-emerald-900 active:border-b-0"
              >
                <span>Masuk sebagai Merchandiser</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              {/* Quick demo autofill chips */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] uppercase font-extrabold text-slate-600 block mb-2">
                  ⚡ Isi Cepat Akun Uji Coba:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutofillDemo('Budi Santoso', 'MD-2024-001', 'Alfamart - Jabodetabek')}
                    className="p-2 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-800 transition-colors"
                  >
                    <span className="block truncate text-emerald-700 font-black">Budi Santoso</span>
                    <span className="text-[10px] text-slate-600 block">MD-001 • Alfamart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutofillDemo('Rina Anggraeni', 'MD-2024-002', 'Indomaret - Jawa Barat')}
                    className="p-2 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-800 transition-colors"
                  >
                    <span className="block truncate text-emerald-700 font-black">Rina Anggraeni</span>
                    <span className="text-[10px] text-slate-600 block">MD-002 • Indomaret</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* =================== ADMIN LOGIN FORM =================== */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Masuk sebagai Admin / Supervisor</span>
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500">
                    Akses penuh ke bank soal, bobot nilai, dan rekap spreadsheet
                  </p>
                </div>
              </div>

              {/* Nama Supervisor Input */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Nama Supervisor / Admin
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Nama Admin SOP"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl text-xs font-semibold text-slate-900 bg-slate-50 border-2 border-slate-200 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* PIN Keamanan Admin SOP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700">
                    PIN Keamanan Admin SOP <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    PIN Bawaan: {DEFAULT_ADMIN_PIN}
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-600 absolute left-3.5 top-3.5" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    maxLength={8}
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Masukkan PIN 4-6 digit"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl text-sm tracking-widest font-black text-slate-900 bg-slate-50 border-2 border-slate-200 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                    title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  PIN ini memverifikasi hak akses untuk merubah variabel SOP dan data peserta.
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md shadow-amber-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all border-b-3 border-amber-900 active:border-b-0"
              >
                <Lock className="w-4 h-4" />
                <span>Masuk sebagai Admin SOP</span>
              </motion.button>

              {/* Quick default PIN helper */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span className="text-[11px] font-semibold">
                  Gunakan PIN standar: <strong>{DEFAULT_ADMIN_PIN}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setAdminPin(DEFAULT_ADMIN_PIN);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black cursor-pointer shadow-xs transition-colors"
                >
                  Isi PIN 1234
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-[10px] font-semibold text-slate-400 flex items-center justify-center space-x-2">
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>Aplikasi Mobile Teroptimasi Android • KAO Modern Market v2.4</span>
        </div>
      </div>
    </div>
  );
};
