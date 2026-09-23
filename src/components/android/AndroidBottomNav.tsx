import React from 'react';
import { 
  ClipboardCheck, 
  TableProperties, 
  Trophy, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import { AppView, AppMode } from '../../types';
import { sounds } from '../../utils/sound';

interface AndroidBottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  participantCount: number;
  questionCount: number;
  isAdminAuthenticated?: boolean;
  appMode?: AppMode;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentView,
  onNavigate,
  participantCount,
  questionCount,
  isAdminAuthenticated = false,
  appMode = 'md',
}) => {
  // If user is actively taking a quiz, hide the full bottom nav or show a minimalist bar to prevent accidental exits
  if (currentView === 'quiz-taking') {
    return (
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex flex-col items-center select-none z-30">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          <span>Sesi Evaluasi Sedang Berlangsung</span>
        </div>
        {/* Android bottom gesture pill */}
        <div className="w-32 h-1 bg-slate-300 rounded-full mt-2 mb-0.5" />
      </div>
    );
  }

  const isMdMode = appMode === 'md';

  // Mode MD ONLY displays Pertanyaan (Evaluasi) and Podium
  const mdNavItems: { view: AppView; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      view: 'quiz-start',
      label: 'Pertanyaan SOP',
      icon: <ClipboardCheck className="w-5 h-5" />,
      badge: questionCount > 0 ? `${questionCount} Soal` : undefined,
    },
    {
      view: 'podium',
      label: 'Podium Juara',
      icon: <Trophy className="w-5 h-5" />,
      badge: participantCount >= 3 ? 'Top 3' : undefined,
    },
  ];

  // Mode Admin displays all 4 tabs
  const adminNavItems: { view: AppView; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      view: 'quiz-start',
      label: 'Evaluasi',
      icon: <ClipboardCheck className="w-5 h-5" />,
      badge: questionCount > 0 ? `${questionCount} Q` : undefined,
    },
    {
      view: 'spreadsheet',
      label: 'Rekap Nilai',
      icon: <TableProperties className="w-5 h-5" />,
      badge: participantCount > 0 ? participantCount : undefined,
    },
    {
      view: 'podium',
      label: 'Podium',
      icon: <Trophy className="w-5 h-5" />,
      badge: participantCount >= 3 ? 'Top 3' : undefined,
    },
    {
      view: 'admin',
      label: 'Admin SOP',
      icon: <Settings className="w-5 h-5" />,
      badge: isAdminAuthenticated ? 'Aktif' : 'PIN 🔒',
    },
  ];

  const activeNavItems = isMdMode ? mdNavItems : adminNavItems;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-t border-emerald-100/90 pt-1.5 pb-2 px-2 flex flex-col items-center select-none z-30 shadow-lg">
      <div className={`w-full grid ${isMdMode ? 'grid-cols-2 max-w-xs' : 'grid-cols-4 max-w-md'} gap-1 transition-all duration-300`}>
        {activeNavItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => {
                if (!isActive) {
                  sounds.playPop();
                  onNavigate(item.view);
                }
              }}
              className="flex flex-col items-center justify-center py-1 relative group cursor-pointer"
            >
              {/* Material 3 active capsule pill */}
              <div
                className={`relative px-5 py-1 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 font-semibold'
                }`}
              >
                {item.icon}

                {/* Optional micro badge */}
                {item.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black shadow-xs ${
                      isActive
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label below capsule */}
              <span
                className={`text-[10px] mt-1 tracking-tight transition-colors ${
                  isActive
                    ? 'font-black text-emerald-900'
                    : 'font-medium text-slate-500 group-hover:text-slate-700'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android Gesture Navigation Home Pill */}
      <div className="w-32 h-1 bg-slate-300 rounded-full mt-1.5 mb-0.5" />
    </nav>
  );
};
