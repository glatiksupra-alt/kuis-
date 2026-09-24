import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Check, 
  Upload, 
  Clock, 
  Sliders, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BannerSettings, CarouselSlide } from '../types';
import { sounds } from '../utils/sound';
import { resetBannerSettings } from '../utils/storage';

interface PhotoSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannerSettings: BannerSettings;
  onSaveSettings: (settings: BannerSettings) => void;
}

export const PhotoSlideModal: React.FC<PhotoSlideModalProps> = ({
  isOpen,
  onClose,
  bannerSettings,
  onSaveSettings,
}) => {
  const [slides, setSlides] = useState<CarouselSlide[]>(bannerSettings.slides);
  const [autoSlideIntervalSeconds, setAutoSlideIntervalSeconds] = useState(
    bannerSettings.autoSlideIntervalSeconds || 4
  );
  const [isAutoSlideEnabled, setIsAutoSlideEnabled] = useState(
    bannerSettings.isAutoSlideEnabled !== false
  );

  // Form for adding or editing a slide
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    sounds.playPop();
    setEditingSlideId(null);
    setFormTitle('');
    setFormTag('SOP Merchandising');
    setFormSubtitle('');
    setFormImageUrl('');
    setFormError('');
    setIsAddingNew(true);
  };

  const handleOpenEdit = (slide: CarouselSlide) => {
    sounds.playPop();
    setIsAddingNew(false);
    setEditingSlideId(slide.id);
    setFormTitle(slide.title);
    setFormTag(slide.tag || 'SOP Merchandising');
    setFormSubtitle(slide.subtitle || '');
    setFormImageUrl(slide.imageUrl);
    setFormError('');
  };

  const handleCancelForm = () => {
    sounds.playPop();
    setIsAddingNew(false);
    setEditingSlideId(null);
    setFormError('');
  };

  // Handle local file upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('File harus berupa gambar (JPG, PNG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormImageUrl(result);
        setFormError('');
        sounds.playCorrect();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSlideForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Judul foto slide wajib diisi');
      return;
    }
    if (!formImageUrl.trim()) {
      setFormError('URL gambar atau file foto wajib dipilih');
      return;
    }

    if (isAddingNew) {
      const newSlide: CarouselSlide = {
        id: `slide-${Date.now()}`,
        title: formTitle.trim(),
        tag: formTag.trim() || 'SOP Merchandising',
        subtitle: formSubtitle.trim(),
        imageUrl: formImageUrl.trim(),
        isActive: true,
      };
      const updated = [...slides, newSlide];
      setSlides(updated);
      onSaveSettings({
        autoSlideIntervalSeconds,
        isAutoSlideEnabled,
        slides: updated,
      });
      sounds.playCorrect();
      setIsAddingNew(false);
    } else if (editingSlideId) {
      const updated = slides.map((s) => {
        if (s.id === editingSlideId) {
          return {
            ...s,
            title: formTitle.trim(),
            tag: formTag.trim(),
            subtitle: formSubtitle.trim(),
            imageUrl: formImageUrl.trim(),
          };
        }
        return s;
      });
      setSlides(updated);
      onSaveSettings({
        autoSlideIntervalSeconds,
        isAutoSlideEnabled,
        slides: updated,
      });
      sounds.playCorrect();
      setEditingSlideId(null);
    }
  };

  const handleToggleActive = (id: string) => {
    sounds.playPop();
    const updated = slides.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setSlides(updated);
    onSaveSettings({
      autoSlideIntervalSeconds,
      isAutoSlideEnabled,
      slides: updated,
    });
  };

  const handleDelete = (id: string) => {
    if (slides.length <= 1) {
      alert('Minimal harus ada 1 slide foto.');
      return;
    }
    if (confirm('Hapus slide foto ini?')) {
      sounds.playPop();
      const updated = slides.filter((s) => s.id !== id);
      setSlides(updated);
      onSaveSettings({
        autoSlideIntervalSeconds,
        isAutoSlideEnabled,
        slides: updated,
      });
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    sounds.playPop();
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSlides(updated);
    onSaveSettings({
      autoSlideIntervalSeconds,
      isAutoSlideEnabled,
      slides: updated,
    });
  };

  const handleSaveInterval = (interval: number, enabled: boolean) => {
    setAutoSlideIntervalSeconds(interval);
    setIsAutoSlideEnabled(enabled);
    onSaveSettings({
      autoSlideIntervalSeconds: interval,
      isAutoSlideEnabled: enabled,
      slides,
    });
    sounds.playPop();
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan foto slide ke setelan default KAO Merchandising?')) {
      const reset = resetBannerSettings();
      setSlides(reset.slides);
      setAutoSlideIntervalSeconds(reset.autoSlideIntervalSeconds);
      setIsAutoSlideEnabled(reset.isAutoSlideEnabled);
      onSaveSettings(reset);
      sounds.playCorrect();
      setIsAddingNew(false);
      setEditingSlideId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                Pengaturan Slide Foto Bar
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Atur foto panduan merchandising, rotasi otomatis, dan teks SOP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* Controls Bar: Auto Slide Interval & Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  Slide Otomatis (Auto-Slide)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoSlideEnabled}
                  onChange={(e) => handleSaveInterval(autoSlideIntervalSeconds, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {isAutoSlideEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                <span className="text-xs text-slate-600 font-semibold">Kecepatan Rotasi Slide:</span>
                <div className="flex items-center space-x-1.5">
                  {[2, 3, 4, 5, 7].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => handleSaveInterval(sec, true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        autoSlideIntervalSeconds === sec
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add / Edit Slide Form */}
          {(isAddingNew || editingSlideId) ? (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSaveSlideForm}
              className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <h4 className="font-black text-emerald-950 text-sm flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <span>{isAddingNew ? 'Tambah Foto Slide Baru' : 'Edit Foto Slide'}</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {formError}
                </div>
              )}

              {/* Title & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Foto / SOP *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Standar Gondola Attack"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Label Kategori (Tag)
                  </label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="Contoh: SOP Facing Out"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* Subtitle / Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Singkat / Panduan SOP
                </label>
                <textarea
                  rows={2}
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Keterangan singkat yang muncul di atas foto saat slide ditampilkan..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white resize-none"
                />
              </div>

              {/* Image Input: File Upload OR URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Gambar Foto *
                </label>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Upload dari HP / Laptop</span>
                    </button>
                    <span className="text-xs text-slate-500 font-medium">atau gunakan link URL:</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex items-center space-x-2">
                    <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... atau tempel tautan gambar"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                    />
                  </div>
                </div>

                {/* Image Preview */}
                {formImageUrl && (
                  <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-300 aspect-16/9 max-h-36 bg-slate-100">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setFormError('Gagal memuat preview gambar. Periksa URL Anda.')}
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs font-semibold">
                      Preview Gambar
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Slide</span>
                </button>
              </div>
            </motion.form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Daftar Slide Foto ({slides.length} Foto)
              </span>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Foto</span>
              </button>
            </div>
          )}

          {/* Slides List */}
          <div className="space-y-2.5">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  slide.isActive 
                    ? 'bg-white border-slate-200 shadow-2xs' 
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                {/* Thumbnail & Info */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-14 h-11 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative border border-slate-200">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] font-black px-1 rounded-tl-md">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h5 className="font-black text-slate-900 text-xs truncate">
                        {slide.title}
                      </h5>
                      {slide.tag && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md shrink-0">
                          {slide.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                      {slide.subtitle || 'Tidak ada keterangan'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    title={slide.isActive ? 'Nonaktifkan Slide' : 'Aktifkan Slide'}
                    onClick={() => handleToggleActive(slide.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {slide.isActive ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>

                  <button
                    type="button"
                    title="Pindah ke atas"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    title="Pindah ke bawah"
                    disabled={index === slides.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    title="Edit Data Slide"
                    onClick={() => handleOpenEdit(slide)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-700 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    title="Hapus Slide"
                    onClick={() => handleDelete(slide.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Reset to Default */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Perlu mengembalikan foto standar?</span>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center space-x-1 font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Foto Default KAO</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-700/25 cursor-pointer"
          >
            Selesai & Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
