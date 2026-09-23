import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles } from 'lucide-react';

interface AndroidStatusBarProps {
  darkTheme?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ darkTheme = false }) => {
  const [timeStr, setTimeStr] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`w-full px-5 pt-3 pb-1 select-none flex items-center justify-between text-[11px] font-bold z-30 transition-colors ${
        darkTheme ? 'bg-slate-900 text-slate-200' : 'bg-white/95 text-slate-800'
      }`}
    >
      {/* Left: Real-time clock & Notification icons */}
      <div className="flex items-center space-x-2">
        <span className="font-extrabold tracking-tight text-xs font-mono">{timeStr}</span>
        
        {/* Micro Android App notification icons */}
        <div className="flex items-center space-x-1 pl-1">
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[8px] font-black" title="KAO Merchandiser">
            K
          </span>
          <span className="text-[10px]" title="SOP Aktif">
            🏪
          </span>
          <span className="text-[9px] text-emerald-500 font-black">
            ●
          </span>
        </div>
      </div>

      {/* Center: Punch-hole camera & Earpiece representation */}
      <div className="flex items-center space-x-1.5 pointer-events-none">
        <div className="w-3.5 h-3.5 rounded-full bg-black ring-2 ring-slate-800/80 flex items-center justify-center shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-emerald-500/40" />
        </div>
      </div>

      {/* Right: VoLTE, 5G, Wi-Fi, Battery */}
      <div className="flex items-center space-x-2">
        {/* VoLTE Pill */}
        <span className="text-[9px] font-black px-1 py-0.2 rounded bg-slate-200/80 text-slate-700 tracking-tighter">
          VoLTE
        </span>

        {/* 5G Signal bars */}
        <div className="flex items-end space-x-0.5 h-3" title="5G Full Sinyal">
          <div className="w-0.5 h-1.5 bg-current rounded-xs" />
          <div className="w-0.5 h-2 bg-current rounded-xs" />
          <div className="w-0.5 h-2.5 bg-current rounded-xs" />
          <div className="w-0.5 h-3 bg-current rounded-xs" />
          <span className="text-[8px] font-black leading-none ml-0.5">5G</span>
        </div>

        {/* Wi-Fi Icon */}
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />

        {/* Battery with percentage */}
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-black">94%</span>
          <div className="relative flex items-center">
            <div className="w-4.5 h-2.5 rounded-xs border-1.5 border-current p-0.5 flex items-center">
              <div className="h-full w-[90%] bg-emerald-500 rounded-2xs" />
            </div>
            <div className="w-0.5 h-1 bg-current rounded-r-2xs" />
          </div>
        </div>
      </div>
    </div>
  );
};
