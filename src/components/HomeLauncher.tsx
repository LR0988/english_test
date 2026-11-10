import React from 'react';
import { ChevronRight, Star, CheckCircle2, Trophy } from 'lucide-react';
import { UNITS_DATA } from '../data/curriculum';
import { WordProgressRow, QuizAttemptRow } from '../lib/supabase';

export type ShelfTab = 'core' | 'starter' | 'culture' | 'games';

interface HomeLauncherProps {
  shelfTab: ShelfTab;
  onChangeShelfTab: (tab: ShelfTab) => void;
  wordProgressMap: Record<string, WordProgressRow>;
  completedItems: Record<string, boolean>;
  recentAttempts: QuizAttemptRow[];
  onOpenUnit: (unitId: string) => void;
  onOpenExtraTopic: (topic: 'sos' | 'taiwan' | 'clocks') => void;
  onOpenGame: (sub: 'magic_e' | 'board_game' | 'word_hunt' | 'checklist' | 'dictionary') => void;
}

export const HomeLauncher: React.FC<HomeLauncherProps> = ({
  shelfTab,
  onChangeShelfTab,
  wordProgressMap,
  completedItems,
  recentAttempts,
  onOpenUnit,
  onOpenExtraTopic,
  onOpenGame,
}) => {
  const shelfTabs: { id: ShelfTab; emoji: string; label: string; sub: string }[] = [
    { id: 'core', emoji: '🌟', label: '核心單元', sub: 'Units 1–4 & Reviews' },
    { id: 'starter', emoji: '🐾', label: '課前準備', sub: 'Starter & Get Ready' },
    { id: 'culture', emoji: '🎃', label: '節慶與實境', sub: '萬聖節・氣溫・時鐘' },
    { id: 'games', emoji: '🪄', label: '魔法遊戲館', sub: '翻翻卡・桌遊・檢核' },
  ];

  const renderUnitCard = (u: (typeof UNITS_DATA)[0]) => {
    const masteredInUnit = u.vocab.filter(
      (v) => (wordProgressMap[v.key]?.familiarity ?? 0) >= 2
    ).length;
    const totalWords = u.vocab.length;
    const pct = totalWords > 0 ? Math.round((masteredInUnit / totalWords) * 100) : 0;
    const doneChecks =
      u.checklistItems?.filter((c) => completedItems[c.key]).length ?? 0;

    return (
      <button
        key={u.id}
        onClick={() => onOpenUnit(u.id)}
        className="group bg-white rounded-[2rem] border-3 border-amber-200 hover:border-amber-400 p-5 sm:p-6 text-left shadow-sm hover:shadow-xl active:scale-[0.98] transition flex flex-col justify-between gap-4 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={`w-18 h-18 rounded-3xl bg-gradient-to-br ${u.themeColor} text-white flex items-center justify-center text-4xl shadow-md shrink-0`}
          >
            {u.heroEmoji}
          </div>
          <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-950 text-xs sm:text-sm font-black whitespace-nowrap">
            {u.pages.split('（')[0]}
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-black text-sky-700 uppercase tracking-wide whitespace-nowrap">
            {u.badge}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {u.titleEn}
          </h3>
          <p className="text-base font-bold text-slate-600 line-clamp-1">
            {u.titleZh}
          </p>
        </div>

        <div className="space-y-2 pt-1">
          {totalWords > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-extrabold text-slate-500 mb-1">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  熟記 {masteredInUnit} / {totalWords} 字
                </span>
                {u.checklistItems && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    檢核 {doneChecks}/{u.checklistItems.length}
                  </span>
                )}
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${u.themeColor} transition-all`}
                  style={{ width: `${Math.max(6, pct)}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-1 flex items-center justify-between text-amber-700 font-extrabold text-base">
            <span>點選進入翻頁學習</span>
            <span className="w-9 h-9 rounded-full bg-amber-100 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center transition">
              <ChevronRight className="w-5 h-5" />
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between gap-4 overflow-y-auto no-scrollbar py-2">
      <div className="space-y-5">
        {/* Segmented App Category Bar */}
        <div className="bg-white/90 p-2 rounded-[1.75rem] border-2 border-amber-200 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-2">
          {shelfTabs.map((t) => {
            const active = shelfTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChangeShelfTab(t.id)}
                className={`py-3 px-4 rounded-2xl flex items-center gap-3 text-left transition active:scale-95 cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'hover:bg-amber-50 text-slate-700'
                }`}
              >
                <span className="text-3xl shrink-0">{t.emoji}</span>
                <div className="min-w-0">
                  <div className="font-extrabold text-base sm:text-lg leading-tight whitespace-nowrap">
                    {t.label}
                  </div>
                  <div
                    className={`text-xs font-bold truncate ${
                      active ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    {t.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* App Icon Cards Grid */}
        {shelfTab === 'core' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-page-next">
            {UNITS_DATA.filter((u) => u.section === 'core').map(renderUnitCard)}
          </div>
        )}

        {shelfTab === 'starter' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-page-next">
            {UNITS_DATA.filter((u) => u.section === 'starter').map(renderUnitCard)}
          </div>
        )}

        {shelfTab === 'culture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-page-next">
            {UNITS_DATA.filter((u) => u.section === 'culture').map(renderUnitCard)}

            {[
              {
                id: 'sos' as const,
                emoji: '🚨',
                badge: "Task: Let's Write｜第 84–85 頁",
                title: '緊急求救通報產生器',
                desc: '認識火災、停電、地震、水災，組合英文 SOS 求救句子並朗讀！',
                gradient: 'from-rose-500 to-orange-500',
              },
              {
                id: 'taiwan' as const,
                emoji: '🗺️',
                badge: 'Picture Dictionary｜第 86–87 頁',
                title: '臺灣城市與氣溫主播台',
                desc: '臺北・新竹・臺中・高雄實境天氣與攝氏溫度 (°C) 英語播報！',
                gradient: 'from-sky-500 to-blue-600',
              },
              {
                id: 'clocks' as const,
                emoji: '🕰️',
                badge: 'Around the World｜第 90–91 頁',
                title: '世界四大著名時鐘巡禮',
                desc: '一頁一站環遊英國大笨鐘、德國咕咕鐘、美國中央車站與日本摩天輪時鐘！',
                gradient: 'from-violet-500 to-indigo-600',
              },
            ].map((card) => (
              <button
                key={card.id}
                onClick={() => onOpenExtraTopic(card.id)}
                className="group bg-white rounded-[2rem] border-3 border-amber-200 hover:border-amber-400 p-6 text-left shadow-sm hover:shadow-xl active:scale-[0.98] transition flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-18 h-18 rounded-3xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center text-4xl shadow-md`}
                  >
                    {card.emoji}
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-950 text-xs sm:text-sm font-black">
                    跨域實境
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black text-rose-600">{card.badge}</div>
                  <h3 className="text-2xl font-extrabold text-slate-900">{card.title}</h3>
                  <p className="text-base font-bold text-slate-600">{card.desc}</p>
                </div>
                <div className="flex items-center justify-between text-amber-700 font-extrabold text-base">
                  <span>點選進入互動書頁</span>
                  <span className="w-9 h-9 rounded-full bg-amber-100 group-hover:bg-amber-400 flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {shelfTab === 'games' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-page-next">
            {[
              {
                sub: 'magic_e' as const,
                emoji: '🪄',
                badge: '書末拉頁配件',
                title: 'Magic e 魔法折疊翻翻卡',
                desc: '一張一頁超大字卡！把字尾 e 摺進來聽短母音變長母音！',
                gradient: 'from-amber-400 to-orange-500',
              },
              {
                sub: 'board_game' as const,
                emoji: '🏖️',
                badge: '書末拉頁桌遊',
                title: '沙灘猜拳闖關桌遊',
                desc: '和 Boka 猜拳前進沙灘島嶼，複習全書四大核心問答句型！',
                gradient: 'from-sky-500 to-cyan-500',
              },
              {
                sub: 'word_hunt' as const,
                emoji: '🧙🏻‍♀️',
                badge: '第 112 頁挑戰',
                title: '女巫帽尋字雲 Word Hunt',
                desc: '在魔法女巫帽單字雲中找出 14 個指定通關單字！',
                gradient: 'from-purple-600 to-indigo-700',
              },
              {
                sub: 'checklist' as const,
                emoji: '📋',
                badge: '第 103–108 頁',
                title: '全書自我檢核本',
                desc: '一單元一頁勾選檢核進度，紀錄 Liam 的學習里程碑！',
                gradient: 'from-emerald-500 to-teal-600',
              },
              {
                sub: 'dictionary' as const,
                emoji: '📖',
                badge: '第 109–111 頁',
                title: 'A–Z 生字點讀字典',
                desc: '按字母分類翻頁查閱全書單字、課次頁碼與發音！',
                gradient: 'from-blue-500 to-indigo-600',
              },
            ].map((g) => (
              <button
                key={g.sub}
                onClick={() => onOpenGame(g.sub)}
                className="group bg-white rounded-[2rem] border-3 border-amber-200 hover:border-amber-400 p-6 text-left shadow-sm hover:shadow-xl active:scale-[0.98] transition flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-18 h-18 rounded-3xl bg-gradient-to-br ${g.gradient} text-white flex items-center justify-center text-4xl shadow-md`}
                  >
                    {g.emoji}
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs sm:text-sm font-black">
                    {g.badge}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-slate-900">{g.title}</h3>
                  <p className="text-base font-bold text-slate-600">{g.desc}</p>
                </div>
                <div className="flex items-center justify-between text-emerald-700 font-extrabold text-base">
                  <span>點選開啟遊戲</span>
                  <span className="w-9 h-9 rounded-full bg-emerald-100 group-hover:bg-emerald-400 group-hover:text-white flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Compact Recent Honor Strip on Home Screen */}
      {recentAttempts.length > 0 && (
        <div className="bg-white/85 rounded-3xl px-5 py-3.5 border-2 border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-700">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>最新闖關榮譽：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentAttempts.slice(0, 3).map((att, idx) => (
              <span
                key={att.id ?? idx}
                className="text-sm bg-amber-50 border border-amber-200 rounded-xl px-3 py-1 font-extrabold text-slate-800"
              >
                {att.unit_id} ({att.mode})：{att.score}/{att.total_questions}{' '}
                {'⭐'.repeat(att.stars_earned)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
