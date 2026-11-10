import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BookPageSpec {
  id: string;
  shortTag: string;
  title: string;
  render: () => React.ReactNode;
}

interface PagedBookFrameProps {
  pages: BookPageSpec[];
  currentIndex: number;
  onChangeIndex: (nextIdx: number) => void;
  finishAction?: {
    label: string;
    onClick: () => void;
  };
}

export const PagedBookFrame: React.FC<PagedBookFrameProps> = ({
  pages,
  currentIndex,
  onChangeIndex,
  finishAction,
}) => {
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const safeIdx = Math.min(Math.max(0, currentIndex), Math.max(0, pages.length - 1));
  const currentPage = pages[safeIdx];

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= pages.length || idx === safeIdx) return;
    setDirection(idx > safeIdx ? 'next' : 'prev');
    onChangeIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Horizontal swipe only (ignore vertical gestures)
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0 && safeIdx < pages.length - 1) {
        goTo(safeIdx + 1);
      } else if (dx > 0 && safeIdx > 0) {
        goTo(safeIdx - 1);
      }
    }
  };

  // Group unique tags so Liam can jump to sections quickly without crowding
  const tagFirstPageList: { tag: string; firstIdx: number; active: boolean }[] = [];
  for (let i = 0; i < pages.length; i++) {
    const tag = pages[i].shortTag;
    const existing = tagFirstPageList.find((t) => t.tag === tag);
    if (!existing) {
      tagFirstPageList.push({
        tag,
        firstIdx: i,
        active: currentPage?.shortTag === tag,
      });
    }
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-full flex flex-col justify-between gap-3 overflow-hidden"
    >
      {/* Top Compact Chapter Step Strip */}
      {tagFirstPageList.length > 1 && (
        <div className="flex items-center justify-between gap-2 bg-white/90 px-3 py-2 rounded-2xl border-2 border-amber-200 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {tagFirstPageList.map((item) => (
              <button
                key={item.tag}
                onClick={() => goTo(item.firstIdx)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-extrabold whitespace-nowrap transition active:scale-95 cursor-pointer ${
                  item.active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-amber-100/70'
                }`}
              >
                {item.tag}
              </button>
            ))}
          </div>

          <span className="text-sm font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-xl whitespace-nowrap">
            {currentPage?.title}
          </span>
        </div>
      )}

      {/* Center Single Book Page Stage */}
      <div
        key={currentPage?.id ?? safeIdx}
        className={`flex-1 min-h-0 bg-white rounded-[2rem] border-3 border-amber-200 shadow-lg p-5 sm:p-7 overflow-y-auto flex flex-col justify-center ${
          direction === 'next' ? 'animate-page-next' : 'animate-page-prev'
        }`}
      >
        {currentPage?.render()}
      </div>

      {/* Bottom Native iPad Page-Turn Controls */}
      <div className="bg-white/95 rounded-[1.75rem] border-2 border-amber-200 px-4 py-3 flex items-center justify-between gap-3 shadow-sm shrink-0">
        <button
          onClick={() => goTo(safeIdx - 1)}
          disabled={safeIdx === 0}
          className="min-w-32 sm:min-w-40 py-3 px-4 sm:px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-35 active:scale-95 text-slate-800 font-extrabold text-base sm:text-xl whitespace-nowrap flex items-center justify-center gap-1.5 transition cursor-pointer disabled:cursor-default"
        >
          <ChevronLeft className="w-6 h-6 shrink-0" />
          上一頁
        </button>

        {/* Page Dots & Counter */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-base sm:text-lg font-black text-slate-700 whitespace-nowrap">
            第 <span className="text-amber-600 text-xl">{safeIdx + 1}</span> / {pages.length} 頁
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            {pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => goTo(idx)}
                aria-label={`跳至第 ${idx + 1} 頁`}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === safeIdx
                    ? 'w-7 bg-amber-500'
                    : 'w-2.5 bg-slate-200 hover:bg-amber-300'
                }`}
              />
            ))}
          </div>
        </div>

        {safeIdx < pages.length - 1 ? (
          <button
            onClick={() => goTo(safeIdx + 1)}
            className="min-w-32 sm:min-w-40 py-3 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-extrabold text-base sm:text-xl whitespace-nowrap flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25 transition cursor-pointer"
          >
            下一頁
            <ChevronRight className="w-6 h-6 shrink-0" />
          </button>
        ) : finishAction ? (
          <button
            onClick={finishAction.onClick}
            className="min-w-32 sm:min-w-40 py-3 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-extrabold text-base sm:text-lg whitespace-nowrap flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
          >
            {finishAction.label}
          </button>
        ) : (
          <div className="min-w-32 sm:min-w-40 text-center text-sm font-extrabold text-emerald-600 whitespace-nowrap">
            🎉 已到最後一頁
          </div>
        )}
      </div>
    </div>
  );
};
