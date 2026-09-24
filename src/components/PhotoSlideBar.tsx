import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Play, 
  Pause, 
  Image as ImageIcon,
  Sparkles,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BannerSettings, CarouselSlide } from '../types';
import { sounds } from '../utils/sound';
import { PhotoSlideModal } from './PhotoSlideModal';

interface PhotoSlideBarProps {
  bannerSettings: BannerSettings;
  onSaveSettings: (settings: BannerSettings) => void;
  isAdmin?: boolean;
}

export const PhotoSlideBar: React.FC<PhotoSlideBarProps> = ({
  bannerSettings,
  onSaveSettings,
  isAdmin = false,
}) => {
  // Filter only active slides
  const activeSlides = bannerSettings.slides.filter((s) => s.isActive);
  const slides = activeSlides.length > 0 ? activeSlides : bannerSettings.slides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const autoSlideInterval = (bannerSettings.autoSlideIntervalSeconds || 4) * 1000;
  const isAutoSlideEnabled = bannerSettings.isAutoSlideEnabled !== false;

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-slide effect
  useEffect(() => {
    if (!isAutoSlideEnabled || isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [isAutoSlideEnabled, isPaused, slides.length, autoSlideInterval]);

  // Make sure currentIndex is in bounds if slides change
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const handleNext = () => {
    sounds.playPop();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    sounds.playPop();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleDotClick = (idx: number) => {
    sounds.playPop();
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    // 50px threshold for swipe
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide: CarouselSlide | undefined = slides[currentIndex];

  if (!currentSlide) return null;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div className="w-full space-y-2 select-none">
      {/* Photo Slide Container */}
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-lg shadow-slate-200/60 border border-slate-200 bg-slate-900 group aspect-16/9 max-h-56 sm:max-h-64"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentSlide.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
              onError={(e) => {
                // Fallback image if broken
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1000&auto=format&fit=crop';
              }}
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Slide Content */}
            <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between text-white">
              {/* Top Row: Tag, Index, and Controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {currentSlide.tag && (
                    <span className="text-[10px] sm:text-xs font-black bg-emerald-600/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-emerald-400/40 shadow-xs uppercase tracking-wider">
                      {currentSlide.tag}
                    </span>
                  )}
                  <span className="text-[10px] font-bold bg-black/50 backdrop-blur-xs text-slate-200 px-2 py-0.5 rounded-full border border-white/20">
                    {currentIndex + 1} / {slides.length}
                  </span>
                </div>

                {/* Admin Quick Setting Button */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playPop();
                      setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-1 text-[11px] font-black bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded-xl shadow-md border border-amber-300 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Atur Slide</span>
                  </button>
                )}
              </div>

              {/* Bottom Row: Title and Caption */}
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-black text-white leading-snug drop-shadow-md line-clamp-1">
                  {currentSlide.title}
                </h4>
                {currentSlide.subtitle && (
                  <p className="text-[11px] sm:text-xs text-slate-200/95 font-medium leading-relaxed drop-shadow-sm line-clamp-2 max-w-lg">
                    {currentSlide.subtitle}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slide sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-75 sm:opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Slide berikutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-75 sm:opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20 shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Slide Indicators & Auto-slide status */}
      <div className="flex items-center justify-between px-1">
        {/* Dots */}
        <div className="flex items-center space-x-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleDotClick(idx)}
              aria-label={`Buka slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 bg-emerald-600'
                  : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Admin Manage Shortcut Link */}
        {isAdmin ? (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setIsModalOpen(true);
            }}
            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
          >
            <Sliders className="w-3 h-3 text-emerald-600" />
            <span>Kelola Bar Foto Slide (Mode Admin)</span>
          </button>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Panduan Visual Display KAO</span>
          </span>
        )}
      </div>

      {/* Admin Photo Slide Configuration Modal */}
      {isAdmin && (
        <PhotoSlideModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          bannerSettings={bannerSettings}
          onSaveSettings={onSaveSettings}
        />
      )}
    </div>
  );
};
