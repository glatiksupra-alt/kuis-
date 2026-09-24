import React, { useState } from 'react';
import { 
  ArrowDown, 
  ArrowUp, 
  Check, 
  Edit3, 
  FileSpreadsheet, 
  HelpCircle, 
  Layers, 
  Plus, 
  RefreshCw, 
  Save, 
  Settings2, 
  Sparkles, 
  Trash2,
  Wand2,
  Sliders,
  CheckCircle,
  Lightbulb,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, QuizSettings, BannerSettings } from '../types';
import { QuestionModal } from './QuestionModal';
import { sounds } from '../utils/sound';
import { getAdminPin, saveAdminPin, verifyAdminPin, resetAdminPin, DEFAULT_ADMIN_PIN } from '../utils/storage';
import { PhotoSlideBar } from './PhotoSlideBar';
import { PhotoSlideModal } from './PhotoSlideModal';

interface AdminPanelProps {
  questions: Question[];
  settings: QuizSettings;
  onSaveQuestions: (questions: Question[]) => void;
  onSaveSettings: (settings: QuizSettings) => void;
  onResetFactory: () => void;
  onViewSpreadsheet: () => void;
  onLogoutAdmin?: () => void;
  bannerSettings?: BannerSettings;
  onSaveBannerSettings?: (settings: BannerSettings) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questions,
  settings,
  onSaveQuestions,
  onSaveSettings,
  onResetFactory,
  onViewSpreadsheet,
  onLogoutAdmin,
  bannerSettings,
  onSaveBannerSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'settings' | 'banners' | 'spreadsheet'>('questions');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isPhotoSlideModalOpen, setIsPhotoSlideModalOpen] = useState(false);

  // Settings form state
  const [title, setTitle] = useState(settings.title);
  const [description, setDescription] = useState(settings.description);
  const [passingScore, setPassingScore] = useState(settings.passingScore);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(settings.timeLimitMinutes);
  const [shuffleQuestions, setShuffleQuestions] = useState(settings.shuffleQuestions);
  const [shuffleOptions, setShuffleOptions] = useState(settings.shuffleOptions);
  const [showExplanation, setShowExplanation] = useState(settings.showExplanationAfterQuiz);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Factory reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // PIN management state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccessToast, setPinSuccessToast] = useState(false);
  const [showPinResetConfirm, setShowPinResetConfirm] = useState(false);

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (!verifyAdminPin(oldPin)) {
      sounds.playWrong();
      setPinError('PIN Lama tidak sesuai! Periksa kembali.');
      return;
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      sounds.playWrong();
      setPinError('PIN Baru harus terdiri dari 4 hingga 6 digit angka!');
      return;
    }

    if (newPin !== confirmPin) {
      sounds.playWrong();
      setPinError('Konfirmasi PIN Baru tidak cocok!');
      return;
    }

    sounds.playCorrect();
    saveAdminPin(newPin);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPinSuccessToast(true);
    setTimeout(() => setPinSuccessToast(false), 3500);
  };

  const handleResetPinDefault = () => {
    sounds.playCorrect();
    resetAdminPin();
    setShowPinResetConfirm(false);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPinSuccessToast(true);
    setTimeout(() => setPinSuccessToast(false), 3500);
  };

  // Add / Edit Question
  const handleOpenAdd = () => {
    sounds.playPop();
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    sounds.playPop();
    setEditingQuestion(q);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (q: Question) => {
    if (editingQuestion) {
      const updated = questions.map((item) => (item.id === q.id ? q : item));
      onSaveQuestions(updated);
    } else {
      onSaveQuestions([...questions, q]);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    sounds.playPop();
    const updated = questions.filter((q) => q.id !== deleteTargetId);
    onSaveQuestions(updated);
    setDeleteTargetId(null);
  };

  // Move questions up / down
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    sounds.playPop();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    onSaveQuestions(newQuestions);
  };

  // Template questions loader
  const handleLoadTemplate = (topic: 'tech' | 'indonesia' | 'math') => {
    sounds.playCorrect();
    let templateQuestions: Question[] = [];

    if (topic === 'tech') {
      templateQuestions = [
        {
          id: `tpl-t1-${Date.now()}`,
          text: 'Apa kepanjangan dari singkatan HTML dalam pengembangan web?',
          options: [
            'HyperText Markup Language',
            'High Tech Machine Learning',
            'Hyperlink and Text Modular Logic',
            'Home Tool Management Layout',
          ],
          correctAnswerIndex: 0,
          points: 25,
          explanation: 'HTML adalah singkatan dari HyperText Markup Language, bahasa standar untuk membuat halaman web.',
          category: 'Teknologi',
        },
        {
          id: `tpl-t2-${Date.now()}`,
          text: 'Manakah struktur data yang mengadopsi prinsip LIFO (Last In, First Out)?',
          options: ['Queue (Antrean)', 'Stack (Tumpukan)', 'Array', 'Linked List'],
          correctAnswerIndex: 1,
          points: 25,
          explanation: 'Stack bekerja dengan prinsip LIFO, elemen terakhir yang masuk adalah yang pertama kali dikeluarkan.',
          category: 'Teknologi',
        },
        {
          id: `tpl-t3-${Date.now()}`,
          text: 'Protokol jaringan manakah yang menggunakan enkripsi SSL/TLS untuk komunikasi web aman?',
          options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
          correctAnswerIndex: 2,
          points: 25,
          explanation: 'HTTPS (Hypertext Transfer Protocol Secure) mengenkripsi lalu lintas data menggunakan TLS/SSL.',
          category: 'Teknologi',
        },
        {
          id: `tpl-t4-${Date.now()}`,
          text: 'Di dalam database relasional, kunci yang menghubungkan suatu tabel dengan kunci utama tabel lain disebut...',
          options: ['Primary Key', 'Foreign Key', 'Composite Key', 'Candidate Key'],
          correctAnswerIndex: 1,
          points: 25,
          explanation: 'Foreign Key (Kunci Tamu) merujuk ke Primary Key dari tabel relasi lain untuk menjaga integritas referensial.',
          category: 'Teknologi',
        },
      ];
    } else if (topic === 'indonesia') {
      templateQuestions = [
        {
          id: `tpl-i1-${Date.now()}`,
          text: 'Danau vulkanik terbesar di Indonesia sekaligus danau terluas di Asia Tenggara adalah...',
          options: ['Danau Singkarak', 'Danau Toba', 'Danau Matano', 'Danau Poso'],
          correctAnswerIndex: 1,
          points: 25,
          explanation: 'Danau Toba di Sumatera Utara memiliki panjang sekitar 100 km dan lebar 30 km, terbentuk akibat letusan gunung berapi super purba.',
          category: 'Geografi',
        },
        {
          id: `tpl-i2-${Date.now()}`,
          text: 'Peristiwa Rengasdengklok yang terjadi sebelum Proklamasi Kemerdekaan RI bertujuan untuk...',
          options: [
            'Menyerahkan diri kepada Sekutu',
            'Menjauhkan Soekarno-Hatta dari pengaruh Jepang',
            'Membubarkan BPUPKI',
            'Menandatangani Perjanjian Roem-Royen',
          ],
          correctAnswerIndex: 1,
          points: 25,
          explanation: 'Para pemuda mendesak Soekarno dan Hatta agar segera memproklamasikan kemerdekaan tanpa campur tangan Jepang.',
          category: 'Sejarah',
        },
        {
          id: `tpl-i3-${Date.now()}`,
          text: 'Lagu kebangsaan Indonesia Raya pertama kali diperdengarkan secara resmi pada peristiwa...',
          options: ['Kongres Pemuda II (1928)', 'Proklamasi Kemerdekaan 1945', 'Sidang BPUPKI', 'Sumpah Palapa'],
          correctAnswerIndex: 0,
          points: 25,
          explanation: 'Wage Rudolf Soepratman memperdengarkan lagu Indonesia Raya dengan gesekan biola pada Kongres Pemuda II tanggal 28 Oktober 1928.',
          category: 'Sejarah',
        },
        {
          id: `tpl-i4-${Date.now()}`,
          text: 'Candi Borobudur yang merupakan candi Buddha terbesar di dunia dibangun pada masa wangsa...',
          options: ['Sanjaya', 'Syailendra', 'Isyana', 'Warmadewa'],
          correctAnswerIndex: 1,
          points: 25,
          explanation: 'Candi Borobudur didirikan oleh para penganut agama Buddha Mahayana sekitar tahun 800-an Masehi pada masa kejayaan wangsa Syailendra.',
          category: 'Budaya',
        },
      ];
    } else if (topic === 'math') {
      templateQuestions = [
        {
          id: `tpl-m1-${Date.now()}`,
          text: 'Jika 3x + 7 = 28, maka berapakah nilai dari x?',
          options: ['5', '6', '7', '8'],
          correctAnswerIndex: 2,
          points: 25,
          explanation: '3x = 28 - 7 => 3x = 21 => x = 7.',
          category: 'Aljabar',
        },
        {
          id: `tpl-m2-${Date.now()}`,
          text: 'Berapakah luas sebuah lingkaran dengan jari-jari r = 7 cm? (Gunakan π = 22/7)',
          options: ['154 cm²', '144 cm²', '176 cm²', '128 cm²'],
          correctAnswerIndex: 0,
          points: 25,
          explanation: 'Luas = π × r² = (22/7) × 7 × 7 = 154 cm².',
          category: 'Matematika',
        },
        {
          id: `tpl-m3-${Date.now()}`,
          text: 'Deret angka: 2, 4, 8, 16, 32, ... Berapakah angka berikutnya?',
          options: ['48', '56', '64', '72'],
          correctAnswerIndex: 2,
          points: 25,
          explanation: 'Setiap suku dikalikan 2 (kelipatan geometri), maka 32 × 2 = 64.',
          category: 'Logika',
        },
        {
          id: `tpl-m4-${Date.now()}`,
          text: 'Sebuah toko memberikan diskon 20% untuk jaket seharga Rp 200.000. Berapa harga jaket setelah didiskon?',
          options: ['Rp 150.000', 'Rp 160.000', 'Rp 170.000', 'Rp 180.000'],
          correctAnswerIndex: 1,
          points: 25,
          explanation: 'Potongan diskon = 20% × Rp 200.000 = Rp 40.000. Harga akhir = Rp 200.000 - Rp 40.000 = Rp 160.000.',
          category: 'Aritmetika',
        },
      ];
    }

    onSaveQuestions(templateQuestions);
  };

  // Save general quiz settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playCorrect();
    const updated: QuizSettings = {
      ...settings,
      title: title.trim() || 'Kuis Pertanyaan Interaktif',
      description: description.trim(),
      passingScore: Math.min(100, Math.max(1, Number(passingScore))),
      timeLimitMinutes: Math.max(0, Number(timeLimitMinutes)),
      shuffleQuestions,
      shuffleOptions,
      showExplanationAfterQuiz: showExplanation,
    };
    onSaveSettings(updated);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-400/30 border-2 border-amber-300">
            🛠️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>Pengaturan Soal & Kuis (Admin)</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Mode Editor ⭐
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">
              Atur pertanyaan kuis, bobot nilai, kunci jawaban, dan konfigurasi kelulusan.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onLogoutAdmin && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onLogoutAdmin();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-black text-rose-700 bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Kunci Panel Admin dan Keluar"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kunci Admin</span>
            </button>
          )}

          <motion.button
            type="button"
            onClick={() => {
              sounds.playPop();
              onViewSpreadsheet();
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-black text-emerald-800 bg-emerald-50 border-2 border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Rekap Nilai</span>
          </motion.button>
        </div>
      </div>

      {/* Cheerful Navigation Tabs */}
      <div className="flex bg-white/70 p-1.5 rounded-2xl border-2 border-amber-200/80 mb-6 gap-2">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('questions');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Daftar Soal ({questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('settings');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Pengaturan Kuis & KKM</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('banners');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'banners'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Bar Foto Slide ({bannerSettings?.slides?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            setActiveTab('spreadsheet');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'spreadsheet'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Panduan Spreadsheet</span>
        </button>
      </div>

      {/* Tab 1: Questions Management */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-amber-200/80 shadow-2xs">
            <div className="text-xs sm:text-sm font-bold text-slate-600">
              Total <strong className="text-slate-950 font-black">{questions.length}</strong> Soal • Total Skor Maksimal:{' '}
              <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-black">
                {totalPoints} Poin
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Preset template buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold hidden md:inline">Pakai Contoh:</span>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate('tech')}
                  className="px-3 py-1.5 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black transition-colors"
                >
                  💻 Teknologi
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate('indonesia')}
                  className="px-3 py-1.5 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black transition-colors"
                >
                  🇮🇩 Wawasan RI
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate('math')}
                  className="px-3 py-1.5 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black transition-colors"
                >
                  🔢 Matematika
                </button>
              </div>

              <motion.button
                type="button"
                id="btn-add-question"
                onClick={handleOpenAdd}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-b-2 border-orange-700 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soal Baru ✨</span>
              </motion.button>
            </div>
          </div>

          {/* Question List */}
          {questions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border-2 border-dashed border-amber-300">
              <div className="text-4xl mb-2">📝</div>
              <p className="font-black text-slate-800 mb-1 text-base">Belum ada soal kuis.</p>
              <p className="text-xs font-medium text-slate-500 mb-4">Tambahkan pertanyaan baru atau pilih template contoh di atas.</p>
              <motion.button
                type="button"
                onClick={handleOpenAdd}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-amber-500 hover:bg-amber-600 border-b-2 border-amber-700"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pertanyaan Sekarang 🚀</span>
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                return (
                  <motion.div
                    key={q.id}
                    layout
                    className="bg-white p-5 rounded-3xl border-2 border-amber-200/80 shadow-2xs hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </span>
                        {q.category && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            {q.category}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {q.points} Poin
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          title="Geser ke atas"
                          className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-xl hover:bg-slate-100"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === questions.length - 1}
                          onClick={() => handleMoveQuestion(idx, 'down')}
                          title="Geser ke bawah"
                          className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-xl hover:bg-slate-100"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(q)}
                          title="Edit pertanyaan"
                          className="p-2 text-slate-600 hover:text-amber-700 rounded-xl hover:bg-amber-100 ml-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            setDeleteTargetId(q.id);
                          }}
                          title="Hapus pertanyaan"
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question text */}
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 mb-3.5 leading-relaxed">
                      {q.text}
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctAnswerIndex === optIdx;
                        const label = ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] || `${optIdx + 1}`;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-2xl border-2 flex items-center space-x-2.5 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-slate-900 font-extrabold ring-1 ring-emerald-400/40'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700 font-bold'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-[10px] font-black ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {label}
                            </span>
                            <span className="flex-1 truncate">{opt}</span>
                            {isCorrect && (
                              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-xs font-bold text-slate-600 bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
                        <strong className="text-amber-900 font-black">💡 Pembahasan:</strong> {q.explanation}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: General Quiz Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-2xs max-w-3xl">
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center text-lg">
              ⚙️
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Konfigurasi & Parameter Kuis
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Atur judul, kriteria kelulusan (KKM), dan batas waktu pengerjaan kuis.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 mt-6">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Judul Kuis
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Deskripsi / Petunjuk Pengerjaan
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Kriteria Ketuntasan Minimal (KKM %)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm font-bold rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-sm font-black text-slate-500">%</span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-1">
                  Nilai di bawah ini akan berstatus PERLU PEMBINAAN pada spreadsheet.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Batas Waktu Pengerjaan (Menit)
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-bold rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] font-bold text-slate-500 mt-1">
                  Isi 0 untuk pengerjaan santai tanpa batasan waktu (unlimited).
                </p>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-slate-100 space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-2xl hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showExplanation}
                  onChange={(e) => setShowExplanation(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-amber-500 focus:ring-amber-400 accent-amber-500"
                />
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Tampilkan Pembahasan Soal
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    Peserta dapat melihat penjelasan jawaban setelah selesai kuis.
                  </span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-2xl hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-amber-500 focus:ring-amber-400 accent-amber-500"
                />
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Acak Urutan Soal (Shuffle)
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    Soal akan diacak posisinya setiap kali kuis dimulai.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between border-t-2 border-slate-100">
              {settingsSavedToast ? (
                <span className="text-xs font-black text-emerald-700 flex items-center space-x-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300">
                  <Check className="w-4 h-4" />
                  <span>Pengaturan berhasil disimpan! ✨</span>
                </span>
              ) : (
                <span />
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-b-2 border-orange-700 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Kuis ✨</span>
              </motion.button>
            </div>
          </form>

          {/* Keamanan & Ganti PIN Admin */}
          <div className="mt-10 pt-6 border-t-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>Keamanan & PIN Admin SOP</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Aktif 🔒
                    </span>
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500">
                    PIN melindungi akses perubahan soal, bobot nilai, dan parameter kuis.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                PIN Default: 1234
              </span>
            </div>

            <form onSubmit={handleChangePin} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    PIN Lama
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="Contoh: 1234"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    PIN Baru (4-6 Digit)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="PIN Baru"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Ulangi PIN Baru
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="Konfirmasi PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {pinError && (
                <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </p>
              )}

              {pinSuccessToast && (
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 p-2 rounded-xl border border-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PIN Admin berhasil diperbarui!</span>
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinResetConfirm(true)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Reset PIN ke Default (1234)
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
                >
                  Simpan PIN Baru 🔐
                </button>
              </div>
            </form>

            {/* Modal konfirmasi reset PIN */}
            {showPinResetConfirm && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-slate-200 shadow-xl text-center">
                  <KeyRound className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <h4 className="text-sm font-black text-slate-900 mb-1">
                    Reset PIN ke Default?
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mb-4">
                    PIN Admin akan dikembalikan menjadi <strong className="font-black text-emerald-700">1234</strong>.
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPinResetConfirm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPinDefault}
                      className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700"
                    >
                      Ya, Reset ke 1234
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset factory */}
          <div className="mt-10 pt-6 border-t-2 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-rose-700">Kembalikan Data Awal (Reset)</h4>
                <p className="text-[11px] font-bold text-slate-500">
                  Reset semua soal kuis dan data spreadsheet ke contoh awal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setShowResetConfirm(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 border-2 border-rose-300"
              >
                Reset Semuanya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Photo Slide Bar Management */}
      {activeTab === 'banners' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-2xs space-y-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-600/30">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Pengaturan Bar Foto Slide KAO
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  Kelola foto display produk, rotasi slide otomatis, dan panduan merchandising yang tampil di bawah tombol kuis.
                </p>
              </div>
            </div>

            {bannerSettings && onSaveBannerSettings && (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setIsPhotoSlideModalOpen(true);
                }}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/25 cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Atur & Upload Foto Slide</span>
              </button>
            )}
          </div>

          {/* Live Preview of Photo Slide Bar */}
          {bannerSettings && onSaveBannerSettings && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Pratinjau Langsung (Live Preview):
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {bannerSettings.isAutoSlideEnabled ? `Slide Otomatis: Aktif (${bannerSettings.autoSlideIntervalSeconds}s)` : 'Slide Otomatis: Nonaktif'}
                </span>
              </div>

              <div className="max-w-xl mx-auto p-4 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs">
                <PhotoSlideBar
                  bannerSettings={bannerSettings}
                  onSaveSettings={onSaveBannerSettings}
                  isAdmin={true}
                />
              </div>
            </div>
          )}

          {/* Slide List Summary */}
          {bannerSettings && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Daftar Foto Saat Ini ({bannerSettings.slides.length} Foto):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bannerSettings.slides.map((slide, idx) => (
                  <div 
                    key={slide.id}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center space-x-3"
                  >
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 relative">
                      <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] font-black px-1 rounded-tl-md">
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1">
                        <p className="text-xs font-black text-slate-900 truncate">{slide.title}</p>
                        {slide.tag && (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md shrink-0">
                            {slide.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{slide.subtitle || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Spreadsheet Integration Guide */}
      {activeTab === 'spreadsheet' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-2xs space-y-6 max-w-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-xs">
              📊
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Sistem Urutan Spreadsheet Otomatis
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Otomatis mengurutkan dari nilai yang paling besar ke paling kecil.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-1.5">
              <span className="font-black text-amber-950 flex items-center space-x-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Kriteria Urutan Peringkat (1 s/d N):</span>
              </span>
              <ol className="list-decimal list-inside text-amber-900 space-y-1 pl-1 font-bold">
                <li><strong>Skor Nilai Utama (Kolom D)</strong>: Nilai terbesar berada di urutan nomor 1 paling atas.</li>
                <li><strong>Durasi Pengerjaan (Kolom G)</strong>: Jika skor sama, peserta yang lebih cepat ditempatkan lebih atas.</li>
                <li><strong>Waktu Submit (Kolom H)</strong>: Jika skor dan durasi sama, submisi terbaru diprioritaskan.</li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2 font-bold text-slate-700">
              <span className="font-black text-slate-900 text-sm">Fitur Spreadsheet yang Tersedia:</span>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li><strong>Download CSV (.csv)</strong>: Kompatibel dengan Microsoft Excel, Apple Numbers, dan Google Sheets.</li>
                <li><strong>Salin Format Google Sheets (TSV)</strong>: Klik tombol &ldquo;Salin ke Sheets&rdquo;, lalu buka sheet baru dan tekan <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-xs">Ctrl+V</kbd> atau <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-xs">Cmd+V</kbd>.</li>
                <li><strong>Pencarian & Filter Cepat</strong>: Cari peserta berdasarkan nama atau kelas, dan filter status Lulus / Remedial.</li>
                <li><strong>Statistik Formula Spreadsheet</strong>: Perhitungan otomatis formula `=COUNT`, `=AVERAGE`, `=MAX`, `=MIN`, dan persentase kelulusan.</li>
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              type="button"
              onClick={() => {
                sounds.playPop();
                onViewSpreadsheet();
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-b-2 border-emerald-700 shadow-md cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buka Tampilan Spreadsheet Sekarang 🚀</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
      />

      {/* Modal Slide Foto Bar */}
      {bannerSettings && onSaveBannerSettings && (
        <PhotoSlideModal
          isOpen={isPhotoSlideModalOpen}
          onClose={() => setIsPhotoSlideModalOpen(false)}
          bannerSettings={bannerSettings}
          onSaveSettings={onSaveBannerSettings}
        />
      )}

      {/* Delete Question Confirm Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-3 border-rose-300 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 text-xl border-2 border-rose-300">
                🗑️
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">Hapus Soal Ini?</h3>
              <p className="text-xs font-bold text-slate-600 mb-4 leading-relaxed">
                Pertanyaan ini akan dihapus dari daftar soal kuis.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="px-3.5 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 rounded-xl border-2 border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Factory Reset Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-3 border-rose-300 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 text-xl border-2 border-rose-300">
                ⚠️
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">Kembalikan Data Awal?</h3>
              <p className="text-xs font-bold text-slate-600 mb-4 leading-relaxed">
                Semua soal yang diedit dan riwayat pengerjaan kuis di spreadsheet akan dikembalikan ke data sampel awal.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3.5 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 rounded-xl border-2 border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setShowResetConfirm(false);
                    onResetFactory();
                  }}
                  className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                >
                  Reset Semuanya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
