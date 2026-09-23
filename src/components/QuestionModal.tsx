import React, { useState, useEffect } from 'react';
import { CheckCircle2, HelpCircle, Plus, Trash2, X, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { sounds } from '../utils/sound';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  initialQuestion?: Question | null;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
}) => {
  const [text, setText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [points, setPoints] = useState(20);
  const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialQuestion) {
      setText(initialQuestion.text);
      setOptions(initialQuestion.options.length >= 2 ? [...initialQuestion.options] : ['', '', '', '']);
      setCorrectAnswerIndex(initialQuestion.correctAnswerIndex);
      setPoints(initialQuestion.points);
      setExplanation(initialQuestion.explanation || '');
      setCategory(initialQuestion.category || '');
    } else {
      setText('');
      setOptions(['', '', '', '']);
      setCorrectAnswerIndex(0);
      setPoints(20);
      setExplanation('');
      setCategory('Umum');
    }
    setError('');
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      sounds.playPop();
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    sounds.playPop();
    if (options.length <= 2) {
      setError('Minimal harus ada 2 pilihan jawaban');
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    if (correctAnswerIndex >= updated.length) {
      setCorrectAnswerIndex(updated.length - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Pertanyaan tidak boleh kosong');
      return;
    }

    const filledOptions = options.map((o) => o.trim());
    if (filledOptions.some((o) => !o)) {
      setError('Semua pilihan jawaban harus diisi');
      return;
    }

    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      setError('Pilih salah satu jawaban yang benar');
      return;
    }

    sounds.playCorrect();

    const newQuestion: Question = {
      id: initialQuestion ? initialQuestion.id : `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: text.trim(),
      options: filledOptions,
      correctAnswerIndex,
      points: Number(points) > 0 ? Number(points) : 10,
      explanation: explanation.trim() || undefined,
      category: category.trim() || 'Umum',
    };

    onSave(newQuestion);
    onClose();
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const candyColors = [
    { border: 'border-amber-400', bg: 'bg-amber-50/80', badge: 'bg-amber-500' },
    { border: 'border-sky-400', bg: 'bg-sky-50/80', badge: 'bg-sky-500' },
    { border: 'border-emerald-400', bg: 'bg-emerald-50/80', badge: 'bg-emerald-500' },
    { border: 'border-pink-400', bg: 'bg-pink-50/80', badge: 'bg-pink-500' },
    { border: 'border-purple-400', bg: 'bg-purple-50/80', badge: 'bg-purple-500' },
    { border: 'border-teal-400', bg: 'bg-teal-50/80', badge: 'bg-teal-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-3 border-amber-300"
      >
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-xl shadow-xs">
              ✏️
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {initialQuestion ? 'Edit Pertanyaan Kuis' : 'Tambah Pertanyaan Kuis Baru'}
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Tentukan opsi jawaban dan tandai opsi yang benar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-black flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              Teks Pertanyaan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
              placeholder="Tuliskan pertanyaan kuis di sini..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category & Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Kategori / Topik
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Misal: Sains, Umum, TI, Sejarah"
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Bobot Nilai (Poin)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Options with Radio Button for Correct Answer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>Pilihan Jawaban & Kunci Jawaban Benar</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Pilih radio hijau pada jawaban benar
              </span>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => {
                const isCorrect = correctAnswerIndex === idx;
                const label = optionLabels[idx] || `${idx + 1}`;
                const candy = candyColors[idx % candyColors.length];

                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-2xl border-2 transition-all ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400/30 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <label 
                      className="flex items-center space-x-2 cursor-pointer shrink-0 pl-1"
                      title="Klik untuk jadikan kunci jawaban benar"
                    >
                      <input
                        type="radio"
                        name="correct-option-group"
                        checked={isCorrect}
                        onChange={() => {
                          sounds.playPop();
                          setCorrectAnswerIndex(idx);
                        }}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                      />
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-white ${
                        isCorrect ? 'bg-emerald-600 shadow-xs' : candy.badge
                      }`}>
                        {label}
                      </span>
                    </label>

                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Teks pilihan jawaban ${label}...`}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 bg-white"
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                        title="Hapus opsi ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2.5 text-xs font-black text-amber-800 hover:text-amber-900 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-100/70 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pilihan Jawaban ({optionLabels[options.length]}) ✨</span>
              </button>
            )}
          </div>

          {/* Explanation / Discussion */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              Pembahasan / Penjelasan Jawaban <span className="text-slate-400 font-medium">(Opsional)</span>
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Tulis alasan mengapa jawaban tersebut benar untuk ditampilkan pada peserta setelah kuis..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-slate-100">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onClose();
              }}
              className="px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-2xl"
            >
              Batal
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-b-2 border-orange-700 rounded-2xl shadow-md cursor-pointer"
            >
              {initialQuestion ? 'Simpan Perubahan ✨' : 'Tambahkan Soal 🚀'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
