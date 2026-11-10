import React, { useState } from 'react';
import {
  Volume2,
  Turtle,
  Sparkles,
  CheckSquare,
  Square,
  Gamepad2,
  Music,
  Star,
  HelpCircle,
} from 'lucide-react';
import {
  UnitData,
  VocabItem,
  CHARACTERS_DATA,
  PLAY_AND_SAY_WORDS,
} from '../data/curriculum';
import {
  speakEnglish,
  playSuccessChime,
  playGentleRetry,
  playClapSound,
} from '../lib/speech';
import { WordProgressRow } from '../lib/supabase';

interface UnitExplorerProps {
  unit: UnitData;
  wordProgressMap: Record<string, WordProgressRow>;
  completedChecklist: Record<string, boolean>;
  onToggleChecklist: (itemKey: string) => void;
  onStartPractice: (initialTab: 'flashcards' | 'quiz' | 'spelling' | 'scramble') => void;
}

const WEATHER_Y_ITEMS = [
  { noun: 'cloud', nounZh: '雲', adj: 'cloudy', adjZh: '陰天的', emoji: '☁️', special: false },
  { noun: 'rain', nounZh: '雨', adj: 'rainy', adjZh: '下雨的', emoji: '🌧️', special: false },
  { noun: 'sun', nounZh: '太陽', adj: 'sunny', adjZh: '晴朗的（重複 n + y！）', emoji: '☀️', special: true },
  { noun: 'wind', nounZh: '風', adj: 'windy', adjZh: '颳風的', emoji: '💨', special: false },
];

const TEEN_TY_PAIRS = [
  { teenNum: 13, teenEn: 'thirteen', tyNum: 30, tyEn: 'thirty' },
  { teenNum: 14, teenEn: 'fourteen', tyNum: 40, tyEn: 'forty（沒 u）' },
  { teenNum: 15, teenEn: 'fifteen', tyNum: 50, tyEn: 'fifty' },
  { teenNum: 16, teenEn: 'sixteen', tyNum: 60, tyEn: 'sixty' },
  { teenNum: 17, teenEn: 'seventeen', tyNum: 70, tyEn: 'seventy' },
  { teenNum: 18, teenEn: 'eighteen', tyNum: 80, tyEn: 'eighty' },
  { teenNum: 19, teenEn: 'nineteen', tyNum: 90, tyEn: 'ninety' },
];

const SYLLABLE_WORDS = [
  { word: 'box', zh: '盒子', count: 1, parts: 'box', emoji: '📦' },
  { word: 'pen', zh: '原子筆', count: 1, parts: 'pen', emoji: '🖊️' },
  { word: 'desk', zh: '書桌', count: 1, parts: 'desk', emoji: '🗄️' },
  { word: 'under', zh: '在……底下', count: 2, parts: 'un · der', emoji: '⬇️' },
  { word: 'marker', zh: '彩色筆', count: 2, parts: 'mar · ker', emoji: '🖍️' },
  { word: 'ruler', zh: '尺', count: 2, parts: 'ru · ler', emoji: '📏' },
  { word: 'octopus', zh: '章魚', count: 3, parts: 'oc · to · pus', emoji: '🐙' },
  { word: 'umbrella', zh: '雨傘', count: 3, parts: 'um · brel · la', emoji: '☂️' },
  { word: 'eraser', zh: '橡皮擦', count: 3, parts: 'e · ra · ser', emoji: '🧼' },
];

const ROOM_DETECTIVE_PUZZLES = [
  {
    id: 'room-a',
    clueEn: 'The red toy car is under the desk. The blue box is on the desk. Where am I?',
    clueZh: '紅色玩具車在書桌底下，藍色盒子在書桌上面。我在哪一間？',
    correctRoom: 'Room A',
    options: [
      { name: 'Room A', desc: '🚗 在書桌下 (under) ＋ 🟦📦 在書桌上 (on)' },
      { name: 'Room B', desc: '🚗 在書桌上 (on) ＋ 🟦📦 在椅子下 (under)' },
      { name: 'Room C', desc: '🚗 在盒子裡 (in) ＋ 🟦📦 在地板上 (on the floor)' },
    ],
  },
  {
    id: 'room-b',
    clueEn: 'The ruler is in the box. The pencil is on the chair. Where am I?',
    clueZh: '尺在盒子裡面，鉛筆在椅子上面。我在哪一間？',
    correctRoom: 'Room B',
    options: [
      { name: 'Room A', desc: '📏 在書桌上 (on) ＋ ✏️ 在書桌下 (under)' },
      { name: 'Room B', desc: '📏 在盒子裡 (in) ＋ ✏️ 在椅子上 (on)' },
      { name: 'Room C', desc: '📏 在椅子下 (under) ＋ ✏️ 在盒子裡 (in)' },
    ],
  },
];

export const UnitExplorer: React.FC<UnitExplorerProps> = ({
  unit,
  wordProgressMap,
  completedChecklist,
  onToggleChecklist,
  onStartPractice,
}) => {
  const [tierFilter, setTierFilter] = useState<'all' | 'core' | 'recognition' | 'phonics'>('all');
  const [revealedChars, setRevealedChars] = useState<Record<string, boolean>>({});
  const [transformedWeather, setTransformedWeather] = useState<Record<string, boolean>>({});
  const [clockHour, setClockHour] = useState(12);
  const [clockMin, setClockMin] = useState<0 | 15 | 20 | 25 | 30 | 40 | 50>(30);
  const [honestChoice, setHonestChoice] = useState<'none' | 'home' | 'lost'>('none');
  const [syllableQuizAnswers, setSyllableQuizAnswers] = useState<Record<string, number>>({});
  const [roomIdx, setRoomIdx] = useState(0);
  const [pickedRoom, setPickedRoom] = useState<string | null>(null);
  const [playSayFilter, setPlaySayFilter] = useState<'all' | 'short_o' | 'long_oe' | 'short_u' | 'long_ue'>('all');

  const filteredVocab = unit.vocab.filter((v) =>
    tierFilter === 'all' ? true : v.tier === tierFilter
  );

  const getClockSentence = (h: number, m: number) => {
    const hourNames: Record<number, string> = {
      1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
      7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve',
    };
    const minNames: Record<number, string> = {
      0: "o'clock",
      15: 'fifteen',
      20: 'twenty',
      25: 'twenty-five',
      30: 'thirty',
      40: 'forty',
      50: 'fifty',
    };
    return `It's ${hourNames[h]} ${minNames[m]}.`;
  };

  return (
    <div className="space-y-8">
      {/* Unit Hero Banner - Big iPad Touch Buttons */}
      <div className={`rounded-[2rem] bg-gradient-to-r ${unit.themeColor} text-white p-7 sm:p-9 shadow-xl`}>
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wide">
              <span>{unit.badge}</span>
              <span>•</span>
              <span>{unit.pages}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold flex items-center gap-3.5 leading-tight">
              <span className="text-5xl sm:text-6xl">{unit.heroEmoji}</span>
              <span>{unit.titleEn}</span>
            </h2>
            <p className="text-xl sm:text-2xl font-extrabold text-white/95">{unit.titleZh}</p>
            <p className="text-base sm:text-lg text-white/90 font-semibold max-w-3xl">
              {unit.summary}
            </p>
          </div>

          {/* 4 Big iPad Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => onStartPractice('flashcards')}
              className="py-4 px-5 rounded-2xl bg-white text-slate-900 hover:bg-amber-50 active:scale-95 font-extrabold text-lg sm:text-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span>🃏</span>
              <span>單字閃卡</span>
            </button>
            <button
              onClick={() => onStartPractice('quiz')}
              className="py-4 px-5 rounded-2xl bg-amber-300 text-slate-950 hover:bg-amber-200 active:scale-95 font-extrabold text-lg sm:text-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span>🎧</span>
              <span>聽力測驗</span>
            </button>
            <button
              onClick={() => onStartPractice('spelling')}
              className="py-4 px-5 rounded-2xl bg-white/25 hover:bg-white/35 text-white border-2 border-white/50 active:scale-95 font-extrabold text-lg sm:text-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span>🔤</span>
              <span>拼字闖關</span>
            </button>
            <button
              onClick={() => onStartPractice('scramble')}
              className="py-4 px-5 rounded-2xl bg-white/25 hover:bg-white/35 text-white border-2 border-white/50 active:scale-95 font-extrabold text-lg sm:text-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Gamepad2 className="w-6 h-6" />
              <span>句子火車</span>
            </button>
          </div>
        </div>
      </div>

      {/* Starter Characters Interactive Guessing Cards */}
      {unit.id === 'starter-phonics-classroom' && (
        <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-indigo-100 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
              <HelpCircle className="w-7 h-7 text-indigo-500" />
              Characters 人物介紹猜猜我是誰？（第 10–11 頁）
            </h3>
            <span className="text-sm font-bold text-slate-500">點擊喇叭聽線索，再揭曉答案！</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CHARACTERS_DATA.map((ch) => {
              const isOpen = !!revealedChars[ch.id];
              return (
                <div
                  key={ch.id}
                  className="rounded-3xl border-2 border-slate-200 p-6 bg-slate-50/70 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-6xl">{isOpen ? ch.emoji : '❓'}</span>
                      <button
                        onClick={() => speakEnglish(ch.cluesEn.join(' '))}
                        className="px-4 py-3 rounded-2xl bg-indigo-100 hover:bg-indigo-200 active:scale-95 text-indigo-800 font-extrabold text-base flex items-center gap-2 cursor-pointer"
                      >
                        <Volume2 className="w-5 h-5" />
                        聽英文線索
                      </button>
                    </div>
                    <div className="space-y-1.5 text-xl font-extrabold text-slate-900">
                      {ch.cluesEn.map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                    <p className="text-base font-bold text-slate-600">{ch.cluesZh}</p>
                  </div>

                  <button
                    onClick={() => {
                      setRevealedChars((prev) => ({ ...prev, [ch.id]: !prev[ch.id] }));
                      speakEnglish(ch.answerEn);
                      if (!isOpen) playSuccessChime();
                    }}
                    className={`w-full py-4 rounded-2xl font-extrabold text-xl text-white bg-gradient-to-r ${ch.color} active:scale-[0.98] cursor-pointer shadow-md`}
                  >
                    {isOpen ? `✨ ${ch.answerEn}` : '👆 點我揭曉是誰！'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================== LARGE IPAD VOCABULARY CARDS ==================== */}
      <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-amber-100 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              📚 單字大字點讀卡（依課本黑・藍・綠分級）
            </h3>
            <p className="text-base text-slate-600 font-bold mt-1">
              點擊卡片直接發音！黑色字＝必背聽說讀寫｜藍色字＝口語認識｜綠色字＝自然發音
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: `全部 (${unit.vocab.length})` },
              { id: 'core', label: '⬛ 應用字彙' },
              { id: 'recognition', label: '🟦 認識字彙' },
              { id: 'phonics', label: '🟩 發音字彙' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTierFilter(f.id as typeof tierFilter)}
                className={`px-4 py-2.5 rounded-2xl text-base font-extrabold cursor-pointer active:scale-95 transition ${
                  tierFilter === f.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2 Spacious Columns on iPad so English letters are huge and never truncated */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVocab.map((item: VocabItem) => {
            const prog = wordProgressMap[item.key];
            const tierBorder =
              item.tier === 'core'
                ? 'border-slate-300 bg-white'
                : item.tier === 'phonics'
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-sky-300 bg-sky-50/50';
            const tierText =
              item.tier === 'core'
                ? 'text-slate-900'
                : item.tier === 'phonics'
                  ? 'text-emerald-900'
                  : 'text-sky-900';

            return (
              <div
                key={item.key}
                onClick={() => speakEnglish(item.en)}
                className={`group rounded-3xl border-3 p-5 sm:p-6 transition hover:shadow-lg active:scale-[0.99] cursor-pointer flex items-center justify-between gap-4 ${tierBorder}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-5xl sm:text-6xl shrink-0">{item.emoji}</span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className={`text-2xl sm:text-3xl font-extrabold tracking-wide break-words ${tierText}`}
                      >
                        {item.en}
                      </span>
                      {item.moe1200 && (
                        <span
                          className="text-base font-black text-amber-600"
                          title="教育部基本 1,200 字詞"
                        >
                          *
                        </span>
                      )}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-slate-700">{item.zh}</div>
                    <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                      {item.category && (
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                      )}
                      {item.page && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-900">
                          {item.page}
                        </span>
                      )}
                      {(prog?.familiarity ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-sm font-extrabold text-amber-600">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {prog.familiarity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Big Finger-Friendly Audio Buttons (48px+ x 48px+) */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakEnglish(item.en, 0.92);
                    }}
                    className="w-13 h-13 rounded-2xl bg-amber-200 hover:bg-amber-400 active:scale-90 text-amber-950 flex items-center justify-center transition cursor-pointer shadow-xs"
                    title="正常發音"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakEnglish(item.en, 0.58);
                    }}
                    className="w-13 h-13 rounded-2xl bg-teal-100 hover:bg-teal-300 active:scale-90 text-teal-900 flex items-center justify-center transition cursor-pointer shadow-xs"
                    title="慢速跟讀"
                  >
                    <Turtle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== LARGE SENTENCES & DAILY ENGLISH ==================== */}
      <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-sky-100 space-y-5">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          💬 核心句型・日常用語・故事重點口語
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {unit.sentences.map((s) => {
            const badgeColor =
              s.tag === '核心句型'
                ? 'bg-sky-100 text-sky-900'
                : s.tag === '日常用語'
                  ? 'bg-amber-100 text-amber-900'
                  : s.tag === '品格延伸'
                    ? 'bg-rose-100 text-rose-900'
                    : s.tag === '課室指令'
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'bg-emerald-100 text-emerald-900';

            return (
              <div
                key={s.key}
                className="rounded-3xl border-2 border-slate-200 bg-slate-50/70 p-6 space-y-3.5 hover:border-sky-300 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-sm font-extrabold px-3.5 py-1 rounded-full ${badgeColor}`}>
                    {s.tag}
                  </span>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() =>
                        speakEnglish(s.replyEn ? `${s.en} ${s.replyEn}` : s.en, 0.9)
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-base font-extrabold cursor-pointer shadow-xs"
                    >
                      <Volume2 className="w-5 h-5" />
                      播放發音
                    </button>
                    <button
                      onClick={() =>
                        speakEnglish(s.replyEn ? `${s.en} ${s.replyEn}` : s.en, 0.58)
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-base font-extrabold cursor-pointer shadow-xs"
                    >
                      <Turtle className="w-5 h-5" />
                      慢速跟讀
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => speakEnglish(s.en)}
                  className="cursor-pointer active:opacity-75 space-y-1"
                >
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                    {s.en}
                  </div>
                  <div className="text-lg font-bold text-slate-600">{s.zh}</div>
                </div>

                {s.replyEn && (
                  <div
                    onClick={() => speakEnglish(s.replyEn!)}
                    className="pt-3 border-t-2 border-slate-200/80 cursor-pointer active:opacity-75 space-y-1"
                  >
                    <div className="text-xl sm:text-2xl font-extrabold text-indigo-700 leading-snug">
                      ↳ {s.replyEn}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-600">
                      {s.replyZh}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== PHONICS & LET'S CHANT ==================== */}
      {(unit.phonicsGroups || unit.chant) && (
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-emerald-200 space-y-6">
          {unit.phonicsGroups && (
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
                🔤 Phonics 自然發音對照大字卡
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {unit.phonicsGroups.map((grp) => (
                  <div
                    key={grp.pattern}
                    className="bg-white rounded-3xl p-5 border-2 border-emerald-200 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl font-extrabold text-emerald-900">
                        {grp.pattern}
                      </span>
                      <span className="text-sm font-extrabold px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {grp.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {grp.words.map((w) => (
                        <button
                          key={w.en}
                          onClick={() => speakEnglish(w.en)}
                          className="p-4 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 active:scale-95 text-center transition cursor-pointer border border-emerald-200/70"
                        >
                          <div className="text-4xl mb-1">{w.emoji}</div>
                          <div className="text-2xl font-extrabold text-slate-900">{w.en}</div>
                          <div className="text-base text-slate-600 font-bold mt-0.5">{w.zh}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unit.chant && (
            <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xl sm:text-2xl font-extrabold text-amber-950 flex items-center gap-2.5">
                  <Music className="w-6 h-6 text-amber-500" />
                  {unit.chant.title}（韻文節奏跟讀）
                </h4>
                <button
                  onClick={() =>
                    speakEnglish(unit.chant!.lines.map((l) => l.en).join(' '), 0.84)
                  }
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-base font-extrabold cursor-pointer shadow-sm"
                >
                  <Volume2 className="w-5 h-5" />
                  播放整首韻文
                </button>
              </div>
              <div className="space-y-3">
                {unit.chant.lines.map((line, idx) => (
                  <div
                    key={idx}
                    onClick={() => speakEnglish(line.en, 0.84)}
                    className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 hover:bg-amber-100 active:scale-[0.99] space-y-1 cursor-pointer transition border border-amber-200/60"
                  >
                    <div className="font-extrabold text-slate-900 text-xl sm:text-2xl">
                      🎵 {line.en}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-600">{line.zh}</div>
                  </div>
                ))}
              </div>
              {unit.chant.extraNote && (
                <p className="text-base font-extrabold text-amber-800">{unit.chant.extraNote}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ==================== LEARN WITH BOKA INTERACTIVE LABS ==================== */}
      {unit.bokaTip && (
        <section className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-[2rem] p-6 sm:p-8 shadow-sm border-3 border-amber-300 space-y-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl shrink-0">🤖</div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-sm font-extrabold text-amber-900 bg-amber-200 px-3 py-1 rounded-full mb-1.5">
                <Sparkles className="w-4 h-4" />
                {unit.bokaTip.page}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {unit.bokaTip.title}
              </h3>
              <p className="text-base sm:text-lg font-bold text-slate-700 mt-1.5">
                {unit.bokaTip.description}
              </p>
            </div>
          </div>

          {/* Lab 1: Unit 1 Weather +y Transformer */}
          {unit.bokaTip.type === 'weather_y' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WEATHER_Y_ITEMS.map((item) => {
                const isAdj = !!transformedWeather[item.noun];
                return (
                  <button
                    key={item.noun}
                    onClick={() => {
                      const next = !isAdj;
                      setTransformedWeather((p) => ({ ...p, [item.noun]: next }));
                      speakEnglish(next ? item.adj : item.noun);
                      playSuccessChime();
                    }}
                    className={`p-6 rounded-3xl border-3 text-center transition active:scale-95 cursor-pointer ${
                      isAdj
                        ? 'bg-sky-600 text-white border-sky-700 shadow-lg'
                        : 'bg-white text-slate-900 border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="text-5xl mb-2">{item.emoji}</div>
                    <div className="text-3xl font-extrabold">
                      {isAdj ? (
                        <span>
                          {item.special ? (
                            <>
                              sun<span className="text-amber-300 underline">ny</span>
                            </>
                          ) : (
                            <>
                              {item.noun}
                              <span className="text-amber-300 underline">y</span>
                            </>
                          )}
                        </span>
                      ) : (
                        item.noun
                      )}
                    </div>
                    <div
                      className={`text-base font-bold mt-2 ${
                        isAdj ? 'text-sky-100' : 'text-slate-600'
                      }`}
                    >
                      {isAdj ? item.adjZh : `${item.nounZh}（👆 點我加 +y 變身！）`}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Lab 2: Unit 2 -teen vs -ty + Interactive Clock */}
          {unit.bokaTip.type === 'teen_ty' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {TEEN_TY_PAIRS.map((pair) => (
                  <div
                    key={pair.teenNum}
                    className="bg-white rounded-3xl p-4 border-2 border-amber-200 flex items-center justify-between gap-3"
                  >
                    <button
                      onClick={() => speakEnglish(pair.teenEn)}
                      className="flex-1 p-3 rounded-2xl bg-violet-50 hover:bg-violet-100 active:scale-95 text-center cursor-pointer"
                    >
                      <div className="text-2xl font-black text-violet-900">{pair.teenNum}</div>
                      <div className="text-base font-extrabold text-violet-700">{pair.teenEn}</div>
                    </button>
                    <span className="text-slate-400 font-extrabold text-sm">vs</span>
                    <button
                      onClick={() => speakEnglish(pair.tyEn.replace(/（.*）/, ''))}
                      className="flex-1 p-3 rounded-2xl bg-fuchsia-50 hover:bg-fuchsia-100 active:scale-95 text-center cursor-pointer"
                    >
                      <div className="text-2xl font-black text-fuchsia-900">{pair.tyNum}</div>
                      <div className="text-base font-extrabold text-fuchsia-700">{pair.tyEn}</div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Interactive Clock Dial */}
              <div className="bg-white rounded-3xl p-6 border-3 border-violet-200 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-extrabold text-violet-700">
                      ⏰ 互動大時鐘報時練習器
                    </div>
                    <div className="text-5xl font-black text-slate-900 font-mono mt-1">
                      {String(clockHour).padStart(2, '0')}:{String(clockMin).padStart(2, '0')}
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-violet-700 mt-1">
                      {getClockSentence(clockHour, clockMin)}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      speakEnglish(`What time is it? ${getClockSentence(clockHour, clockMin)}`)
                    }
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-lg font-extrabold cursor-pointer shadow-md"
                  >
                    <Volume2 className="w-6 h-6" />
                    聽問答發音
                  </button>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-base font-extrabold text-slate-700 block mb-2">
                      點選幾點 (Hour)：
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                        <button
                          key={h}
                          onClick={() => {
                            setClockHour(h);
                            speakEnglish(getClockSentence(h, clockMin));
                          }}
                          className={`w-13 h-13 rounded-2xl font-extrabold text-xl cursor-pointer active:scale-90 transition ${
                            clockHour === h
                              ? 'bg-violet-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-slate-700 block mb-2">
                      點選幾分 (Minute)：
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {([0, 15, 20, 25, 30, 40, 50] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setClockMin(m);
                            speakEnglish(getClockSentence(clockHour, m));
                          }}
                          className={`px-5 py-3 rounded-2xl font-extrabold text-xl cursor-pointer active:scale-90 transition ${
                            clockMin === m
                              ? 'bg-fuchsia-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          :{String(m).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lab 3: Unit 3 my vs your & Do the Right Thing */}
          {unit.bokaTip.type === 'my_your' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 space-y-4">
                <h4 className="text-xl font-extrabold text-slate-900">
                  🙋🏻‍♂️ my（我的） vs 👉🏻 your（你的）
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => speakEnglish('This is my pen. This is my dog.')}
                    className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-left cursor-pointer"
                  >
                    <div className="text-4xl mb-1">🙋🏻‍♂️🖊️</div>
                    <div className="text-2xl font-extrabold text-rose-900">my pen</div>
                    <div className="text-base font-bold text-slate-600 mt-1">
                      我的筆（This is my dog.）
                    </div>
                  </button>
                  <button
                    onClick={() => speakEnglish('This is your pen. This is your dog.')}
                    className="p-4 rounded-2xl bg-sky-50 hover:bg-sky-100 active:scale-95 text-left cursor-pointer"
                  >
                    <div className="text-4xl mb-1">👉🏻🖊️</div>
                    <div className="text-2xl font-extrabold text-sky-900">your pen</div>
                    <div className="text-base font-bold text-slate-600 mt-1">
                      你的筆（This is your dog.）
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 space-y-4">
                <h4 className="text-xl font-extrabold text-slate-900">
                  🌟 品格情境（第 53 頁）：Wow! A storybook!
                </h4>
                <p className="text-base text-slate-700 font-bold">
                  在教室撿到一本不屬於自己的故事書，Liam 會怎麼做呢？
                </p>
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setHonestChoice('home');
                      playGentleRetry();
                      speakEnglish('Take it home.');
                    }}
                    className={`w-full p-4 rounded-2xl text-base sm:text-lg font-extrabold border-2 text-left cursor-pointer active:scale-[0.98] ${
                      honestChoice === 'home'
                        ? 'bg-rose-100 border-rose-400 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    ❌ Take it home.（帶它回家）
                  </button>
                  <button
                    onClick={() => {
                      setHonestChoice('lost');
                      playSuccessChime();
                      speakEnglish('Take it to the Lost and Found.');
                    }}
                    className={`w-full p-4 rounded-2xl text-base sm:text-lg font-extrabold border-2 text-left cursor-pointer active:scale-[0.98] ${
                      honestChoice === 'lost'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    ✅ Take it to the Lost and Found.（送到失物招領處）
                  </button>
                </div>
                {honestChoice === 'lost' && (
                  <p className="text-base font-extrabold text-emerald-700">
                    🎉 Nice! Liam 是最誠實的小勇士 (Be Honest)！
                  </p>
                )}
                {honestChoice === 'home' && (
                  <p className="text-base font-extrabold text-rose-600">
                    💡 不是自己的東西不能帶回家喔！試著送到 Lost and Found 吧！
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Lab 4: Unit 4 Syllable Clapper & Earthquake Safety */}
          {unit.bokaTip.type === 'syllables' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-200">
                <div className="text-lg font-extrabold text-emerald-900 mb-3">
                  🪖 Earthquake Safety 抗震保命三步驟（點擊演練口令！）
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { step: '1. Drop!', zh: '趴下！', emoji: '🧎🏻' },
                    { step: '2. Cover!', zh: '掩護！', emoji: '🛡️' },
                    { step: '3. Hold on!', zh: '穩住！', emoji: '✊' },
                  ].map((s) => (
                    <button
                      key={s.step}
                      onClick={() => {
                        playClapSound();
                        speakEnglish(s.step.replace(/^\d\.\s*/, ''));
                      }}
                      className="p-5 rounded-3xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-center cursor-pointer transition active:scale-95"
                    >
                      <div className="text-5xl mb-2">{s.emoji}</div>
                      <div className="font-extrabold text-emerald-950 text-2xl">{s.step}</div>
                      <div className="text-lg font-bold text-emerald-700 mt-0.5">{s.zh}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 space-y-4">
                <div className="text-lg font-extrabold text-slate-900">
                  👏 點擊單字聽發音，拍拍手選出它是「幾音節 (1 / 2 / 3 syllables)」？
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SYLLABLE_WORDS.map((item) => {
                    const picked = syllableQuizAnswers[item.word];
                    const isCorrect = picked === item.count;
                    return (
                      <div
                        key={item.word}
                        className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between gap-4"
                      >
                        <div
                          onClick={() => speakEnglish(item.word)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{item.emoji}</span>
                            <div>
                              <div className="text-2xl font-extrabold text-slate-900">
                                {isCorrect ? item.parts : item.word}
                              </div>
                              <div className="text-base font-bold text-slate-600">{item.zh}</div>
                            </div>
                          </div>
                          <Volume2 className="w-6 h-6 text-slate-500" />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map((n) => (
                            <button
                              key={n}
                              onClick={() => {
                                playClapSound();
                                setSyllableQuizAnswers((p) => ({ ...p, [item.word]: n }));
                                if (n === item.count) {
                                  playSuccessChime();
                                  speakEnglish(item.word);
                                }
                              }}
                              className={`py-3 rounded-2xl text-base font-extrabold cursor-pointer active:scale-95 transition ${
                                picked === n
                                  ? n === item.count
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'bg-rose-400 text-white'
                                  : 'bg-white border-2 border-slate-200 text-slate-800 hover:bg-amber-50'
                              }`}
                            >
                              {n} 音節
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== REVIEW 2 SPECIAL ACTIVITIES ==================== */}
      {unit.id === 'review-2' && (
        <section className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-teal-200 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl font-extrabold text-slate-900">
                🕵🏻‍♂️ 房間物品位置偵探 Where am I?（第 75–77 頁）
              </h3>
              <button
                onClick={() => {
                  setPickedRoom(null);
                  setRoomIdx((i) => (i + 1) % ROOM_DETECTIVE_PUZZLES.length);
                }}
                className="px-5 py-3 rounded-2xl bg-teal-100 hover:bg-teal-200 text-teal-950 text-base font-extrabold cursor-pointer active:scale-95"
              >
                換一題謎題 ↻
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-teal-50 border-2 border-teal-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-2xl font-extrabold text-teal-950 leading-snug">
                  “{ROOM_DETECTIVE_PUZZLES[roomIdx].clueEn}”
                </p>
                <button
                  onClick={() => speakEnglish(ROOM_DETECTIVE_PUZZLES[roomIdx].clueEn)}
                  className="px-5 py-3 rounded-2xl bg-teal-600 text-white text-base font-extrabold shrink-0 cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Volume2 className="w-5 h-5" />
                  聽線索
                </button>
              </div>
              <p className="text-lg font-bold text-teal-800">
                {ROOM_DETECTIVE_PUZZLES[roomIdx].clueZh}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROOM_DETECTIVE_PUZZLES[roomIdx].options.map((rm) => {
                const isRight = rm.name === ROOM_DETECTIVE_PUZZLES[roomIdx].correctRoom;
                const selected = pickedRoom === rm.name;
                return (
                  <button
                    key={rm.name}
                    onClick={() => {
                      setPickedRoom(rm.name);
                      if (isRight) {
                        playSuccessChime();
                        speakEnglish(`You're in ${rm.name}!`);
                      } else {
                        playGentleRetry();
                      }
                    }}
                    className={`p-5 rounded-3xl border-3 text-left transition active:scale-95 cursor-pointer ${
                      selected
                        ? isRight
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-md'
                          : 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-slate-50 hover:bg-teal-50/50 border-slate-200'
                    }`}
                  >
                    <div className="text-2xl font-extrabold">🚪 {rm.name}</div>
                    <div className="text-base font-bold text-slate-700 mt-1.5">{rm.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-indigo-200 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  🎲 Play and Say 長短母音 25 字連線盤（第 78 頁）
                </h3>
                <p className="text-base text-slate-600 font-bold mt-1">
                  點擊單字聽發音，也能點右上角篩選同母音家族連線！
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: '全部 25 字' },
                  { id: 'short_o', label: '短 o' },
                  { id: 'long_oe', label: '長 o_e' },
                  { id: 'short_u', label: '短 u' },
                  { id: 'long_ue', label: '長 u_e' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPlaySayFilter(f.id as typeof playSayFilter)}
                    className={`px-4 py-2.5 rounded-2xl text-base font-extrabold cursor-pointer active:scale-95 ${
                      playSayFilter === f.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {PLAY_AND_SAY_WORDS.map((w) => {
                const match = playSayFilter === 'all' || playSayFilter === w.pattern;
                return (
                  <button
                    key={w.en}
                    onClick={() => speakEnglish(w.en)}
                    className={`p-4 rounded-2xl border-2 text-center transition active:scale-95 cursor-pointer ${
                      match
                        ? 'bg-indigo-50/80 hover:bg-indigo-100 border-indigo-300 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-100 text-slate-300 opacity-45'
                    }`}
                  >
                    <div className="font-extrabold text-xl sm:text-2xl">{w.en}</div>
                    <div className="text-sm font-bold text-slate-600 mt-0.5">{w.zh}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ==================== UNIT SELF-CHECKLIST ==================== */}
      {unit.checklistItems && unit.checklistItems.length > 0 && (
        <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-emerald-200 space-y-4">
          <h3 className="text-2xl font-extrabold text-slate-900">
            ✅ 單元自我檢核表 Self-Checklist（第 103–108 頁）
          </h3>
          <div className="space-y-3">
            {unit.checklistItems.map((chk) => {
              const checked = !!completedChecklist[chk.key];
              return (
                <button
                  key={chk.key}
                  onClick={() => {
                    onToggleChecklist(chk.key);
                    if (!checked) playSuccessChime();
                  }}
                  className={`w-full p-5 rounded-3xl border-3 flex items-center gap-4 text-left transition active:scale-[0.99] cursor-pointer ${
                    checked
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : 'bg-slate-50 hover:bg-amber-50/50 border-slate-200 text-slate-800'
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="w-8 h-8 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-8 h-8 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-extrabold text-lg sm:text-xl">{chk.labelZh}</div>
                    <div className="text-base font-bold text-slate-500 mt-0.5">{chk.labelEn}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
