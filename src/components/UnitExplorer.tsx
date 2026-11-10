import React, { useState, useMemo, useEffect } from 'react';
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
import { PagedBookFrame, BookPageSpec } from './PagedBookFrame';

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
  { teenNum: 13, teenEn: 'thirteen', tyNum: 30, tyEn: 'thirty', tyNote: '' },
  { teenNum: 14, teenEn: 'fourteen', tyNum: 40, tyEn: 'forty', tyNote: '⚠️ 沒 u' },
  { teenNum: 15, teenEn: 'fifteen', tyNum: 50, tyEn: 'fifty', tyNote: '' },
  { teenNum: 16, teenEn: 'sixteen', tyNum: 60, tyEn: 'sixty', tyNote: '' },
  { teenNum: 17, teenEn: 'seventeen', tyNum: 70, tyEn: 'seventy', tyNote: '' },
  { teenNum: 18, teenEn: 'eighteen', tyNum: 80, tyEn: 'eighty', tyNote: '' },
];

const SYLLABLE_WORDS = [
  { word: 'box', zh: '盒子', count: 1, parts: 'box', emoji: '📦' },
  { word: 'pen', zh: '原子筆', count: 1, parts: 'pen', emoji: '🖊️' },
  { word: 'desk', zh: '書桌', count: 1, parts: 'desk', emoji: '🗄️' },
  { word: 'under', zh: '在底下', count: 2, parts: 'un · der', emoji: '⬇️' },
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

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export const UnitExplorer: React.FC<UnitExplorerProps> = ({
  unit,
  wordProgressMap,
  completedChecklist,
  onToggleChecklist,
  onStartPractice,
}) => {
  const [pageIdx, setPageIdx] = useState(0);
  const [revealedChars, setRevealedChars] = useState<Record<string, boolean>>({});
  const [transformedWeather, setTransformedWeather] = useState<Record<string, boolean>>({});
  const [clockHour, setClockHour] = useState(12);
  const [clockMin, setClockMin] = useState<0 | 15 | 20 | 25 | 30 | 40 | 50>(30);
  const [honestChoice, setHonestChoice] = useState<'none' | 'home' | 'lost'>('none');
  const [syllableQuizAnswers, setSyllableQuizAnswers] = useState<Record<string, number>>({});
  const [roomIdx, setRoomIdx] = useState(0);
  const [pickedRoom, setPickedRoom] = useState<string | null>(null);
  const [playSayFilter, setPlaySayFilter] = useState<'all' | 'short_o' | 'long_oe' | 'short_u' | 'long_ue'>('all');

  useEffect(() => {
    setPageIdx(0);
  }, [unit.id]);

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

  const renderVocabCard = (item: VocabItem) => {
    const prog = wordProgressMap[item.key];
    const tierBorder =
      item.tier === 'core'
        ? 'border-slate-300 bg-amber-50/30'
        : item.tier === 'phonics'
          ? 'border-emerald-300 bg-emerald-50/60'
          : 'border-sky-300 bg-sky-50/60';
    const tierBadge =
      item.tier === 'core'
        ? { label: '⬛ 必背字', cls: 'bg-slate-900 text-white' }
        : item.tier === 'phonics'
          ? { label: '🟩 發音字', cls: 'bg-emerald-600 text-white' }
          : { label: '🟦 認識字', cls: 'bg-sky-600 text-white' };

    const enSizeClass =
      item.en.length >= 15
        ? 'text-2xl sm:text-3xl'
        : item.en.length >= 11
          ? 'text-2xl sm:text-3xl lg:text-4xl'
          : 'text-3xl sm:text-4xl';

    return (
      <div
        key={item.key}
        onClick={() => speakEnglish(item.en)}
        className={`rounded-3xl border-3 p-4 sm:p-5 flex flex-col justify-between gap-2.5 cursor-pointer active:scale-[0.98] transition shadow-xs hover:shadow-md ${tierBorder}`}
      >
        {/* Top Row: Emoji + Badges on Left, Audio Buttons Side-by-Side on Right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-4xl sm:text-5xl leading-none shrink-0">{item.emoji}</span>
            <span
              className={`text-xs font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${tierBadge.cls}`}
            >
              {tierBadge.label}
            </span>
            {item.page && (
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                {item.page}
              </span>
            )}
            {(prog?.familiarity ?? 0) > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-amber-600 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {prog.familiarity}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                speakEnglish(item.en, 0.92);
              }}
              className="w-11 h-11 rounded-2xl bg-amber-300 hover:bg-amber-400 active:scale-90 text-slate-950 flex items-center justify-center shadow-xs cursor-pointer"
              title="正常發音"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                speakEnglish(item.en, 0.56);
              }}
              className="w-11 h-11 rounded-2xl bg-teal-100 hover:bg-teal-200 active:scale-90 text-teal-900 flex items-center justify-center shadow-xs cursor-pointer"
              title="慢速跟讀"
            >
              <Turtle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full-Width Single-Line English Word + Clean Chinese Meaning */}
        <div className="pt-0.5">
          <div
            className={`${enSizeClass} font-black text-slate-900 tracking-wide whitespace-nowrap leading-tight`}
          >
            {item.en}
            {item.moe1200 && <span className="text-amber-600 ml-1 text-lg align-top">*</span>}
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-700 mt-1 truncate">
            {item.zh}
          </div>
        </div>
      </div>
    );
  };

  // Build crisp, single-screen pages dynamically
  const pages = useMemo<BookPageSpec[]>(() => {
    const list: BookPageSpec[] = [];

    // 1. Cover Page
    list.push({
      id: `${unit.id}-cover`,
      shortTag: '📖 封面',
      title: `${unit.badge} 單元導覽`,
      render: () => (
        <div
          className={`h-full rounded-3xl bg-gradient-to-br ${unit.themeColor} text-white p-7 sm:p-10 flex flex-col justify-between gap-6`}
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/25 px-4 py-1.5 rounded-full text-base font-extrabold">
              <span>{unit.badge}</span>
              <span>•</span>
              <span>{unit.pages}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-6xl sm:text-8xl shrink-0">{unit.heroEmoji}</span>
              <div className="min-w-0">
                <h2
                  className={`${
                    unit.titleEn.length > 22 ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl'
                  } font-black leading-tight`}
                >
                  {unit.titleEn}
                </h2>
                <p className="text-xl sm:text-2xl font-extrabold text-white/95 mt-1">
                  {unit.titleZh}
                </p>
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white/90 max-w-3xl leading-relaxed pt-1">
              {unit.summary}
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-base font-extrabold text-white/90">
              👆 點擊右下角「下一頁 ▶」一頁一頁翻書學習，或直接進入互動練習：
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => onStartPractice('flashcards')}
                className="py-3.5 px-4 rounded-2xl bg-white text-slate-900 font-extrabold text-lg whitespace-nowrap shadow-md active:scale-95 cursor-pointer"
              >
                🃏 3D 閃卡
              </button>
              <button
                onClick={() => onStartPractice('quiz')}
                className="py-3.5 px-4 rounded-2xl bg-amber-300 text-slate-950 font-extrabold text-lg whitespace-nowrap shadow-md active:scale-95 cursor-pointer"
              >
                🎧 聽音測驗
              </button>
              <button
                onClick={() => onStartPractice('spelling')}
                className="py-3.5 px-4 rounded-2xl bg-white/20 border-2 border-white/50 text-white font-extrabold text-lg whitespace-nowrap active:scale-95 cursor-pointer"
              >
                🔤 方塊拼字
              </button>
              <button
                onClick={() => onStartPractice('scramble')}
                className="py-3.5 px-4 rounded-2xl bg-white/20 border-2 border-white/50 text-white font-extrabold text-lg whitespace-nowrap active:scale-95 cursor-pointer"
              >
                🚂 句子火車
              </button>
            </div>
          </div>
        </div>
      ),
    });

    // 2. Starter Characters Page (if Starter 2-4)
    if (unit.id === 'starter-phonics-classroom') {
      list.push({
        id: 'starter-characters',
        shortTag: '🎭 角色猜謎',
        title: '人物介紹猜猜我是誰（p.10–11）',
        render: () => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-7 h-7 text-indigo-500" />
                Characters 人物介紹猜猜看！
              </h3>
              <span className="text-sm font-bold text-slate-500">點喇叭聽線索，再揭曉答案</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHARACTERS_DATA.map((ch) => {
                const isOpen = !!revealedChars[ch.id];
                return (
                  <div
                    key={ch.id}
                    className="rounded-3xl border-2 border-slate-200 p-5 bg-slate-50 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-xl font-extrabold text-slate-900">
                          {ch.cluesEn.join(' ')}
                        </div>
                        <div className="text-base font-bold text-slate-600">{ch.cluesZh}</div>
                      </div>
                      <button
                        onClick={() => speakEnglish(ch.cluesEn.join(' '))}
                        className="w-13 h-13 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 active:scale-90 cursor-pointer"
                      >
                        <Volume2 className="w-6 h-6" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setRevealedChars((p) => ({ ...p, [ch.id]: !p[ch.id] }));
                        speakEnglish(ch.answerEn);
                        if (!isOpen) playSuccessChime();
                      }}
                      className={`w-full py-3.5 rounded-2xl font-extrabold text-xl text-white bg-gradient-to-r ${ch.color} active:scale-95 cursor-pointer shadow-sm`}
                    >
                      {isOpen ? `${ch.emoji} ${ch.answerEn}` : '❓ 點我揭曉答案'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ),
      });
    }

    // 3. Vocabulary Pages (4 giant cards per page = 2x2 iPad perfection!)
    const vocabChunks = chunkArray(unit.vocab, 4);
    vocabChunks.forEach((chunk, idx) => {
      list.push({
        id: `${unit.id}-vocab-${idx}`,
        shortTag: '📚 單字卡',
        title: `單字點讀卡（${idx + 1} / ${vocabChunks.length}）`,
        render: () => (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-2xl font-extrabold text-slate-900">
                📚 點擊單字卡聽發音（第 {idx + 1} / {vocabChunks.length} 組）
              </h3>
              <span className="text-sm font-bold text-slate-500">
                ⬛ 必背應用字 ｜ 🟦 口語認識字 ｜ 🟩 自然發音字
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chunk.map(renderVocabCard)}
            </div>
          </div>
        ),
      });
    });

    // 4. Sentence Pages (2 giant dialogue cards per page!)
    const sentenceChunks = chunkArray(unit.sentences, 2);
    sentenceChunks.forEach((chunk, idx) => {
      list.push({
        id: `${unit.id}-sent-${idx}`,
        shortTag: '💬 句型對話',
        title: `句型與口語（${idx + 1} / ${sentenceChunks.length}）`,
        render: () => (
          <div className="space-y-5">
            <h3 className="text-2xl font-extrabold text-slate-900">
              💬 點擊句子跟讀練習（{idx + 1} / {sentenceChunks.length}）
            </h3>
            <div className="space-y-4">
              {chunk.map((s) => (
                <div
                  key={s.key}
                  className="rounded-3xl border-3 border-sky-200 bg-sky-50/40 p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-4 py-1 rounded-full bg-sky-600 text-white text-sm font-extrabold whitespace-nowrap">
                      {s.tag}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          speakEnglish(s.replyEn ? `${s.en} ${s.replyEn}` : s.en, 0.9)
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-base sm:text-lg font-extrabold whitespace-nowrap cursor-pointer shadow-xs"
                      >
                        <Volume2 className="w-5 h-5 shrink-0" />
                        正常發音
                      </button>
                      <button
                        onClick={() =>
                          speakEnglish(s.replyEn ? `${s.en} ${s.replyEn}` : s.en, 0.56)
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-base sm:text-lg font-extrabold whitespace-nowrap cursor-pointer shadow-xs"
                      >
                        <Turtle className="w-5 h-5 shrink-0" />
                        慢速跟讀
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => speakEnglish(s.en)}
                    className="cursor-pointer active:opacity-75 space-y-1"
                  >
                    <div
                      className={`${
                        s.en.length > 34 ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-4xl'
                      } font-black text-slate-900 leading-snug`}
                    >
                      {s.en}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-slate-600">{s.zh}</div>
                  </div>

                  {s.replyEn && (
                    <div
                      onClick={() => speakEnglish(s.replyEn!)}
                      className="pt-3 border-t-2 border-sky-200/80 cursor-pointer active:opacity-75 space-y-1"
                    >
                      <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 leading-snug">
                        ↳ {s.replyEn}
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-slate-600">
                        {s.replyZh}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ),
      });
    });

    // 5. Phonics Groups Page
    if (unit.phonicsGroups && unit.phonicsGroups.length > 0) {
      const phChunks = chunkArray(unit.phonicsGroups, 2);
      phChunks.forEach((grpPair, idx) => {
        list.push({
          id: `${unit.id}-phonics-${idx}`,
          shortTag: '🔤 自然發音',
          title:
            phChunks.length > 1
              ? `Phonics 自然發音（${idx + 1} / ${phChunks.length}）`
              : 'Phonics 自然發音對照',
          render: () => (
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
                🔤 自然發音字群點讀
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {grpPair.map((grp) => (
                  <div
                    key={grp.pattern}
                    className="rounded-3xl border-3 border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xl sm:text-2xl font-black text-emerald-900 whitespace-nowrap">
                        {grp.pattern}
                      </span>
                      <span className="px-3.5 py-1 rounded-full bg-emerald-600 text-white text-sm font-extrabold whitespace-nowrap">
                        {grp.label}
                      </span>
                    </div>
                    <div
                      className={`grid gap-3 ${
                        grp.words.length >= 4
                          ? 'grid-cols-2 sm:grid-cols-4'
                          : 'grid-cols-1 sm:grid-cols-3'
                      }`}
                    >
                      {grp.words.map((w) => (
                        <button
                          key={w.en}
                          onClick={() => speakEnglish(w.en)}
                          className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-400 active:scale-95 text-center cursor-pointer shadow-xs"
                        >
                          <div className="text-3xl sm:text-4xl mb-1">{w.emoji}</div>
                          <div
                            className={`${
                              w.en.length >= 9 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                            } font-black text-slate-900 whitespace-nowrap`}
                          >
                            {w.en}
                          </div>
                          <div className="text-base font-bold text-slate-600 whitespace-nowrap">
                            {w.zh}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        });
      });
    }

    // 6. Let's Chant Page
    if (unit.chant) {
      list.push({
        id: `${unit.id}-chant`,
        shortTag: '🎵 韻文跟讀',
        title: unit.chant.title,
        render: () => (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950 flex items-center gap-3">
                <Music className="w-8 h-8 text-amber-500" />
                {unit.chant!.title}
              </h3>
              <button
                onClick={() =>
                  speakEnglish(unit.chant!.lines.map((l) => l.en).join(' '), 0.84)
                }
                className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xl font-extrabold cursor-pointer shadow-md"
              >
                <Volume2 className="w-6 h-6" />
                播放整首韻文
              </button>
            </div>
            <div className="space-y-3.5">
              {unit.chant!.lines.map((line, i) => (
                <div
                  key={i}
                  onClick={() => speakEnglish(line.en, 0.84)}
                  className="p-5 sm:p-6 rounded-3xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 active:scale-[0.99] cursor-pointer space-y-1"
                >
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    🎵 {line.en}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-600">{line.zh}</div>
                </div>
              ))}
            </div>
            {unit.chant!.extraNote && (
              <p className="text-lg font-extrabold text-amber-800">{unit.chant!.extraNote}</p>
            )}
          </div>
        ),
      });
    }

    // 7. Learn with Boka Interactive Pages (split cleanly so each fits 1 screen!)
    if (unit.bokaTip?.type === 'weather_y') {
      list.push({
        id: 'u1-boka-y',
        shortTag: '🤖 Boka 魔法',
        title: 'Learn with Boka：天氣字尾 -y（p.28）',
        render: () => (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🤖</span>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {unit.bokaTip!.title}
                </h3>
                <p className="text-lg font-bold text-slate-600">{unit.bokaTip!.description}</p>
              </div>
            </div>
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
                        : 'bg-amber-50/70 text-slate-900 border-amber-300'
                    }`}
                  >
                    <div className="text-5xl mb-2">{item.emoji}</div>
                    <div className="text-4xl font-black">
                      {isAdj ? (
                        item.special ? (
                          <>
                            sun<span className="text-amber-300 underline">ny</span>
                          </>
                        ) : (
                          <>
                            {item.noun}
                            <span className="text-amber-300 underline">y</span>
                          </>
                        )
                      ) : (
                        item.noun
                      )}
                    </div>
                    <div
                      className={`text-lg font-bold mt-2 ${
                        isAdj ? 'text-sky-100' : 'text-slate-600'
                      }`}
                    >
                      {isAdj ? item.adjZh : `${item.nounZh}（👆 點我加 +y 變身！）`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ),
      });
    }

    if (unit.bokaTip?.type === 'teen_ty') {
      list.push({
        id: 'u2-clock-lab',
        shortTag: '⏰ 互動撥鐘',
        title: '互動大時鐘報時器',
        render: () => (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-violet-50 rounded-3xl p-6 border-2 border-violet-200">
              <div>
                <div className="text-base font-extrabold text-violet-700">
                  ⏰ 點選下方數字調整時間：What time is it?
                </div>
                <div className="text-5xl sm:text-6xl font-black text-slate-900 font-mono mt-1">
                  {String(clockHour).padStart(2, '0')}:{String(clockMin).padStart(2, '0')}
                </div>
                <div className="text-3xl font-extrabold text-violet-700 mt-1">
                  {getClockSentence(clockHour, clockMin)}
                </div>
              </div>
              <button
                onClick={() =>
                  speakEnglish(`What time is it? ${getClockSentence(clockHour, clockMin)}`)
                }
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-violet-600 text-white text-xl font-extrabold cursor-pointer active:scale-95 shadow-md"
              >
                <Volume2 className="w-6 h-6" />
                聽問答發音
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-lg font-extrabold text-slate-700 block mb-2">
                  幾點 (Hour)：
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        setClockHour(h);
                        speakEnglish(getClockSentence(h, clockMin));
                      }}
                      className={`h-14 rounded-2xl font-black text-2xl cursor-pointer active:scale-90 ${
                        clockHour === h
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-lg font-extrabold text-slate-700 block mb-2">
                  幾分 (Minute)：
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                  {([0, 15, 20, 25, 30, 40, 50] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setClockMin(m);
                        speakEnglish(getClockSentence(clockHour, m));
                      }}
                      className={`py-3.5 rounded-2xl font-black text-2xl cursor-pointer active:scale-90 ${
                        clockMin === m
                          ? 'bg-fuchsia-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      :{String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ),
      });

      list.push({
        id: 'u2-boka-teen-ty',
        shortTag: '🤖 -teen / -ty',
        title: 'Learn with Boka：-teen 與 -ty 比較（p.42）',
        render: () => (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-5xl">🤖</span>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  13–19 (-teen) vs 整十數字 (-ty)
                </h3>
                <p className="text-lg font-bold text-slate-600">
                  點選數字比較發音！特別注意 40 是 forty（沒有 u 喔！）
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEEN_TY_PAIRS.map((pair) => (
                <div
                  key={pair.teenNum}
                  className="bg-amber-50/50 rounded-3xl p-3.5 sm:p-4 border-2 border-amber-200 flex items-center justify-between gap-2.5"
                >
                  <button
                    onClick={() => speakEnglish(pair.teenEn)}
                    className="flex-1 py-3 px-2 rounded-2xl bg-violet-100 hover:bg-violet-200 active:scale-95 text-center cursor-pointer min-w-0"
                  >
                    <div className="text-2xl sm:text-3xl font-black text-violet-950 whitespace-nowrap">
                      {pair.teenNum}
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-violet-800 whitespace-nowrap">
                      {pair.teenEn}
                    </div>
                  </button>
                  <span className="font-black text-xs sm:text-sm text-slate-400 shrink-0">VS</span>
                  <button
                    onClick={() => speakEnglish(pair.tyEn)}
                    className="flex-1 py-3 px-2 rounded-2xl bg-fuchsia-100 hover:bg-fuchsia-200 active:scale-95 text-center cursor-pointer min-w-0"
                  >
                    <div className="text-2xl sm:text-3xl font-black text-fuchsia-950 whitespace-nowrap">
                      {pair.tyNum}
                      {pair.tyNote && (
                        <span className="ml-1 text-xs font-extrabold text-rose-600 align-middle">
                          {pair.tyNote}
                        </span>
                      )}
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-fuchsia-800 whitespace-nowrap">
                      {pair.tyEn}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }

    if (unit.bokaTip?.type === 'my_your') {
      list.push({
        id: 'u3-boka-honest',
        shortTag: '🤖 品格與所有格',
        title: 'my / your 所有格 ＆ 誠實任務（p.53, p.60）',
        render: () => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border-3 border-rose-200 bg-rose-50/40 p-6 space-y-4">
              <h3 className="text-2xl font-extrabold text-slate-900">
                🤖 my（我的） vs your（你的）
              </h3>
              <div className="grid grid-cols-1 gap-3.5">
                <button
                  onClick={() => speakEnglish('This is my pen. This is my dog.')}
                  className="p-5 rounded-2xl bg-white border-2 border-rose-200 active:scale-95 text-left cursor-pointer"
                >
                  <div className="text-4xl mb-1">🙋🏻‍♂️🖊️</div>
                  <div className="text-3xl font-black text-rose-900">my pen</div>
                  <div className="text-lg font-bold text-slate-600">
                    我的筆（This is my dog.）
                  </div>
                </button>
                <button
                  onClick={() => speakEnglish('This is your pen. This is your dog.')}
                  className="p-5 rounded-2xl bg-white border-2 border-sky-200 active:scale-95 text-left cursor-pointer"
                >
                  <div className="text-4xl mb-1">👉🏻🖊️</div>
                  <div className="text-3xl font-black text-sky-900">your pen</div>
                  <div className="text-lg font-bold text-slate-600">
                    你的筆（This is your dog.）
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-3xl border-3 border-amber-200 bg-amber-50/40 p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  🌟 Do the Right Thing（p.53）
                </h3>
                <p className="text-xl font-extrabold text-amber-900">“Wow! A storybook!”</p>
                <p className="text-lg font-bold text-slate-600">
                  在教室撿到別人的故事書，該選哪一個？
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setHonestChoice('home');
                    playGentleRetry();
                    speakEnglish('Take it home.');
                  }}
                  className={`w-full p-4 rounded-2xl text-xl font-extrabold border-2 text-left cursor-pointer active:scale-95 ${
                    honestChoice === 'home'
                      ? 'bg-rose-100 border-rose-400 text-rose-900'
                      : 'bg-white border-slate-200 text-slate-800'
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
                  className={`w-full p-4 rounded-2xl text-xl font-extrabold border-2 text-left cursor-pointer active:scale-95 ${
                    honestChoice === 'lost'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  ✅ Take it to the Lost and Found.（送失物招領處）
                </button>
              </div>
              {honestChoice === 'lost' && (
                <div className="text-lg font-extrabold text-emerald-700">
                  🎉 Nice! 拾金不昧最誠實！
                </div>
              )}
            </div>
          </div>
        ),
      });
    }

    if (unit.bokaTip?.type === 'syllables') {
      list.push({
        id: 'u4-safety-drill',
        shortTag: '🪖 防災演練',
        title: '抗震保命三步驟（p.67）',
        render: () => (
          <div className="space-y-6 text-center">
            <h3 className="text-3xl font-extrabold text-emerald-950">
              🪖 Earthquake Safety 抗震保命三步驟
            </h3>
            <p className="text-xl font-bold text-slate-600">
              依序點擊三張大圖卡，大聲唸出英文防災動作口令！
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                  className="p-8 rounded-3xl bg-emerald-50 hover:bg-emerald-100 border-3 border-emerald-300 text-center cursor-pointer active:scale-95 shadow-sm"
                >
                  <div className="text-7xl mb-3">{s.emoji}</div>
                  <div className="text-3xl font-black text-emerald-950">{s.step}</div>
                  <div className="text-2xl font-extrabold text-emerald-700 mt-1">{s.zh}</div>
                </button>
              ))}
            </div>
          </div>
        ),
      });

      list.push({
        id: 'u4-syllables',
        shortTag: '👏 拍手數音節',
        title: 'Learn with Boka：Syllable Sort（p.74）',
        render: () => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                👏 拍拍手數音節（1 / 2 / 3 syllables）
              </h3>
              <span className="text-sm font-bold text-slate-500">一個母音發音代表一個音節！</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {SYLLABLE_WORDS.map((item) => {
                const picked = syllableQuizAnswers[item.word];
                const isCorrect = picked === item.count;
                return (
                  <div
                    key={item.word}
                    className="p-3.5 sm:p-4 rounded-3xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between gap-2.5"
                  >
                    <div
                      onClick={() => speakEnglish(item.word)}
                      className="cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl leading-none">{item.emoji}</span>
                          <span className="text-sm font-bold text-slate-600 whitespace-nowrap">
                            {item.zh}
                          </span>
                        </div>
                        <Volume2 className="w-5 h-5 text-slate-400 shrink-0" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 whitespace-nowrap">
                        {isCorrect ? item.parts : item.word}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
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
                          className={`py-2 px-1 rounded-xl text-sm sm:text-base font-extrabold whitespace-nowrap cursor-pointer active:scale-90 ${
                            picked === n
                              ? n === item.count
                                ? 'bg-emerald-500 text-white'
                                : 'bg-rose-400 text-white'
                              : 'bg-white border border-slate-200 text-slate-800'
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
        ),
      });
    }

    // 8. Review 2 Special Pages (Room Detective + Play & Say)
    if (unit.id === 'review-2') {
      list.push({
        id: 'r2-room-detective',
        shortTag: '🕵🏻‍♂️ 房間偵探',
        title: 'Where am I? 房間位置偵探（p.75–77）',
        render: () => (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                🕵🏻‍♂️ 聽線索找房間 Where am I?
              </h3>
              <button
                onClick={() => {
                  setPickedRoom(null);
                  setRoomIdx((i) => (i + 1) % ROOM_DETECTIVE_PUZZLES.length);
                }}
                className="px-5 py-3 rounded-2xl bg-teal-100 text-teal-950 font-extrabold text-base cursor-pointer active:scale-95"
              >
                換一題謎題 ↻
              </button>
            </div>
            <div className="p-6 rounded-3xl bg-teal-50 border-2 border-teal-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-2xl sm:text-3xl font-black text-teal-950 leading-snug">
                  “{ROOM_DETECTIVE_PUZZLES[roomIdx].clueEn}”
                </p>
                <button
                  onClick={() => speakEnglish(ROOM_DETECTIVE_PUZZLES[roomIdx].clueEn)}
                  className="px-5 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-5 h-5" />
                  唸線索
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
                    className={`p-6 rounded-3xl border-3 text-left cursor-pointer active:scale-95 ${
                      selected
                        ? isRight
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-md'
                          : 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-2xl font-black">🚪 {rm.name}</div>
                    <div className="text-lg font-bold text-slate-700 mt-2">{rm.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ),
      });

      list.push({
        id: 'r2-play-say',
        shortTag: '🎲 發音連線盤',
        title: 'Play and Say 25 字連線盤（p.78）',
        render: () => (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-2xl font-extrabold text-slate-900">
                🎲 Play and Say 長短母音 25 字盤
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'short_o', label: '短 o' },
                  { id: 'long_oe', label: '長 o_e' },
                  { id: 'short_u', label: '短 u' },
                  { id: 'long_ue', label: '長 u_e' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPlaySayFilter(f.id as typeof playSayFilter)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-extrabold cursor-pointer ${
                      playSayFilter === f.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {PLAY_AND_SAY_WORDS.map((w) => {
                const match = playSayFilter === 'all' || playSayFilter === w.pattern;
                return (
                  <button
                    key={w.en}
                    onClick={() => speakEnglish(w.en)}
                    className={`py-2.5 px-2 rounded-2xl border-2 text-center cursor-pointer active:scale-95 ${
                      match
                        ? 'bg-indigo-50 border-indigo-300 text-slate-900'
                        : 'bg-slate-50 border-slate-100 text-slate-300 opacity-40'
                    }`}
                  >
                    <div className="text-lg sm:text-2xl font-black whitespace-nowrap">{w.en}</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-600 truncate">
                      {w.zh}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ),
      });
    }

    // 9. Final Page: Self-Checklist & Practice Launchpad
    list.push({
      id: `${unit.id}-finish`,
      shortTag: '🏆 檢核與闖關',
      title: '自我檢核 ＆ 進入闖關測驗',
      render: () => (
        <div className="space-y-6">
          {unit.checklistItems && unit.checklistItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-emerald-600" />
                單元自我檢核表 Self-Checklist
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unit.checklistItems.map((chk) => {
                  const checked = !!completedChecklist[chk.key];
                  return (
                    <button
                      key={chk.key}
                      onClick={() => {
                        onToggleChecklist(chk.key);
                        if (!checked) playSuccessChime();
                      }}
                      className={`p-4 rounded-3xl border-3 flex items-center gap-3.5 text-left cursor-pointer active:scale-[0.98] ${
                        checked
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="w-7 h-7 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-7 h-7 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-extrabold text-lg">{chk.labelZh}</div>
                        <div className="text-sm font-bold text-slate-500">{chk.labelEn}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Gamepad2 className="w-7 h-7 text-amber-500" />
              準備好了嗎？選擇一個模式開始闖關集星！
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { tab: 'flashcards' as const, emoji: '🃏', title: '3D 點讀閃卡', bg: 'from-amber-400 to-orange-500' },
                { tab: 'quiz' as const, emoji: '🎧', title: '聽力選擇測驗', bg: 'from-sky-500 to-blue-600' },
                { tab: 'spelling' as const, emoji: '🔤', title: '方塊拼字王', bg: 'from-emerald-500 to-teal-600' },
                { tab: 'scramble' as const, emoji: '🚂', title: '句子火車重組', bg: 'from-purple-500 to-indigo-600' },
              ].map((btn) => (
                <button
                  key={btn.tab}
                  onClick={() => onStartPractice(btn.tab)}
                  className={`p-5 rounded-3xl bg-gradient-to-br ${btn.bg} text-white text-center shadow-lg active:scale-95 cursor-pointer space-y-2`}
                >
                  <div className="text-4xl sm:text-5xl">{btn.emoji}</div>
                  <div className="text-lg sm:text-xl font-black whitespace-nowrap">{btn.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    });

    return list;
  }, [
    unit,
    wordProgressMap,
    completedChecklist,
    revealedChars,
    transformedWeather,
    clockHour,
    clockMin,
    honestChoice,
    syllableQuizAnswers,
    roomIdx,
    pickedRoom,
    playSayFilter,
    onToggleChecklist,
    onStartPractice,
  ]);

  return (
    <PagedBookFrame
      pages={pages}
      currentIndex={pageIdx}
      onChangeIndex={setPageIdx}
      finishAction={{
        label: '🎧 開始闖關測驗 ▶',
        onClick: () => onStartPractice('quiz'),
      }}
    />
  );
};
