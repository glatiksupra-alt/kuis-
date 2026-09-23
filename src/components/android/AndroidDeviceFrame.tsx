import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Maximize2, 
  Monitor, 
  Sparkles, 
  Palette, 
  Info,
  RotateCcw
} from 'lucide-react';
import { AndroidStatusBar } from './AndroidStatusBar';
import { AndroidAppBar } from './AndroidAppBar';
import { AndroidBottomNav } from './AndroidBottomNav';
import { AppView, AppMode } from '../../types';
import { sounds } from '../../utils/sound';

export type DeviceDisplayMode = 'android-frame' | 'mobile-fit' | 'desktop-wide';
export type DeviceFrameColor = 'obsidian' | 'emerald' | 'titanium';

interface AndroidDeviceFrameProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  participantCount: number;
  questionCount: number;
  children: React.ReactNode;
  isAdminAuthenticated?: boolean;
  onLockAdmin?: () => void;
  appMode?: AppMode;
  onRequestAdminMode?: () => void;
  onSwitchToMdMode?: () => void;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  currentView,
  onNavigate,
  participantCount,
  questionCount,
  children,
  isAdminAuthenticated = false,
  onLockAdmin,
  appMode = 'md',
  onRequestAdminMode,
  onSwitchToMdMode,
}) => {
  const [displayMode, setDisplayMode] = useState<DeviceDisplayMode>('android-frame');
  const [frameColor, setFrameColor] = useState<DeviceFrameColor>('obsidian');
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Detect if user is already on a mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Frame colors config
  const getFrameColors = () => {
    switch (frameColor) {
      case 'emerald':
        return {
          rim: 'bg-emerald-950 border-emerald-800 shadow-emerald-950/40',
          accent: 'border-emerald-600',
          button: 'bg-emerald-800',
        };
      case 'titanium':
        return {
          rim: 'bg-slate-700 border-slate-500 shadow-slate-900/40',
          accent: 'border-slate-400',
          button: 'bg-slate-600',
        };
      case 'obsidian':
      default:
        return {
          rim: 'bg-neutral-900 border-neutral-700 shadow-neutral-950/60',
          accent: 'border-neutral-600',
          button: 'bg-neutral-800',
        };
    }
  };

  const colors = getFrameColors();

  // If on actual mobile device or user selected 'mobile-fit', show clean mobile container
  const effectiveMode = isMobileScreen ? 'mobile-fit' : displayMode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col items-center justify-start p-0 sm:py-6 sm:px-4 font-sans selection:bg-emerald-200 selection:text-emerald-900 relative">
      
      {/* Top Floating Control Bar (visible on desktop to switch modes & colors) */}
      {!isMobileScreen && (
        <header className="w-full max-w-4xl mx-auto mb-4 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-2.5">
            <span className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-sm">
              🤖
            </span>
            <div>
              <span className="text-xs font-black tracking-tight text-white block">
                Tampilan Aplikasi Android HP
              </span>
              <span className="text-[10px] text-emerald-300 font-medium">
                KAO Merchandising Smart App (SOP & Planogram)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Display Mode Switcher */}
            <div className="flex items-center bg-black/30 rounded-xl p-1 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setDisplayMode('android-frame');
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  displayMode === 'android-frame'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Tampilan HP Android dengan Frame Device Realistis"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>HP Android</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setDisplayMode('mobile-fit');
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  displayMode === 'mobile-fit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Tampilan Layar Mobile Penuh"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Layar Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setDisplayMode('desktop-wide');
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  displayMode === 'desktop-wide'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Tampilan Desktop Lebar"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop Luas</span>
              </button>
            </div>

            {/* Device Color Picker (when in android-frame mode) */}
            {displayMode === 'android-frame' && (
              <div className="hidden md:flex items-center space-x-1 pl-2 border-l border-white/20">
                <span className="text-[10px] text-slate-300 font-bold mr-1">Warna HP:</span>
                <button
                  type="button"
                  onClick={() => setFrameColor('obsidian')}
                  className={`w-5 h-5 rounded-full bg-neutral-900 border-2 transition-all ${
                    frameColor === 'obsidian' ? 'border-emerald-400 scale-110 ring-2 ring-emerald-400/40' : 'border-neutral-600'
                  }`}
                  title="Obsidian Black"
                />
                <button
                  type="button"
                  onClick={() => setFrameColor('emerald')}
                  className={`w-5 h-5 rounded-full bg-emerald-800 border-2 transition-all ${
                    frameColor === 'emerald' ? 'border-emerald-400 scale-110 ring-2 ring-emerald-400/40' : 'border-emerald-600'
                  }`}
                  title="KAO Emerald Green"
                />
                <button
                  type="button"
                  onClick={() => setFrameColor('titanium')}
                  className={`w-5 h-5 rounded-full bg-slate-500 border-2 transition-all ${
                    frameColor === 'titanium' ? 'border-emerald-400 scale-110 ring-2 ring-emerald-400/40' : 'border-slate-400'
                  }`}
                  title="Titanium Silver"
                />
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content Presentation Container */}
      {effectiveMode === 'desktop-wide' ? (
        // Desktop Wide Mode (expanded standard view with mobile app bar & bottom nav optional)
        <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[85vh] border-2 border-slate-200">
          <AndroidStatusBar />
          <AndroidAppBar 
            currentView={currentView}
            onNavigate={onNavigate}
            participantCount={participantCount}
            isAdminAuthenticated={isAdminAuthenticated}
            onLockAdmin={onLockAdmin}
            appMode={appMode}
            onRequestAdminMode={onRequestAdminMode}
            onSwitchToMdMode={onSwitchToMdMode}
          />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
            {children}
          </main>
          <AndroidBottomNav 
            currentView={currentView}
            onNavigate={onNavigate}
            participantCount={participantCount}
            questionCount={questionCount}
            isAdminAuthenticated={isAdminAuthenticated}
            appMode={appMode}
          />
        </div>
      ) : effectiveMode === 'mobile-fit' ? (
        // Mobile Fit Mode (borderless mobile app viewport, ideal on real phones or clean mobile simulator)
        <div className="w-full max-w-md mx-auto bg-white min-h-screen sm:min-h-[880px] sm:max-h-[920px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border sm:border-2 border-slate-300 relative">
          <AndroidStatusBar />
          <AndroidAppBar 
            currentView={currentView}
            onNavigate={onNavigate}
            participantCount={participantCount}
            isAdminAuthenticated={isAdminAuthenticated}
            onLockAdmin={onLockAdmin}
            appMode={appMode}
            onRequestAdminMode={onRequestAdminMode}
            onSwitchToMdMode={onSwitchToMdMode}
          />
          <main className="flex-1 overflow-y-auto bg-slate-50 relative">
            {children}
          </main>
          <AndroidBottomNav 
            currentView={currentView}
            onNavigate={onNavigate}
            participantCount={participantCount}
            questionCount={questionCount}
            isAdminAuthenticated={isAdminAuthenticated}
            appMode={appMode}
          />
        </div>
      ) : (
        // Android Frame Mode (Realistic Smartphone with chassis, physical buttons, curved bezel)
        <div className="relative my-auto py-2">
          {/* Hardware Physical Buttons on the Right Side (Volume & Power) */}
          <div className="absolute -right-3 top-28 w-2 h-14 rounded-r-md bg-neutral-700 border-y border-r border-neutral-600 shadow-md pointer-events-none" />
          <div className="absolute -right-3 top-46 w-2 h-14 rounded-r-md bg-neutral-700 border-y border-r border-neutral-600 shadow-md pointer-events-none" />
          <div className="absolute -right-3 top-66 w-2 h-10 rounded-r-md bg-neutral-700 border-y border-r border-neutral-600 shadow-md pointer-events-none" />

          {/* Hardware SIM Tray / Mute Switch on the Left */}
          <div className="absolute -left-2 top-36 w-1.5 h-8 rounded-l-md bg-neutral-700 border-y border-l border-neutral-600 shadow-md pointer-events-none" />

          {/* Android Smartphone Outer Chassis Frame */}
          <div
            className={`w-[412px] h-[860px] rounded-[52px] p-3 shadow-2xl relative flex flex-col border-4 transition-all duration-300 ${colors.rim} ${colors.accent}`}
            style={{
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), inset 0 0 10px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Top Earpiece Speaker Slit */}
            <div className="w-16 h-1 bg-neutral-800 rounded-full mx-auto mb-1.5 shadow-inner" />

            {/* Inner Phone Screen Display */}
            <div className="w-full flex-1 bg-white rounded-[40px] overflow-hidden flex flex-col relative shadow-inner border border-black/40">
              
              {/* Android Top Status Bar */}
              <AndroidStatusBar />

              {/* Android App Header */}
              <AndroidAppBar 
                currentView={currentView}
                onNavigate={onNavigate}
                participantCount={participantCount}
                isAdminAuthenticated={isAdminAuthenticated}
                onLockAdmin={onLockAdmin}
                appMode={appMode}
                onRequestAdminMode={onRequestAdminMode}
                onSwitchToMdMode={onSwitchToMdMode}
              />

              {/* Scrollable App Screen Viewport */}
              <main className="flex-1 overflow-y-auto bg-slate-50 relative overscroll-contain">
                {children}
              </main>

              {/* Android Material 3 Bottom Navigation Bar */}
              <AndroidBottomNav 
                currentView={currentView}
                onNavigate={onNavigate}
                participantCount={participantCount}
                questionCount={questionCount}
                isAdminAuthenticated={isAdminAuthenticated}
                appMode={appMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
