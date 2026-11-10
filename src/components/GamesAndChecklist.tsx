import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  Dices,
  RotateCcw,
} from 'lucide-react';
import {
  MAGIC_E_PAIRS,
  WORD_HUNT_TARGETS,
  UNITS_DATA,
  getAllVocabWithUnit,
} from '../data/curriculum';
import { speakEnglish, playSuccessChime, playGentleRetry } from '../lib/speech';

interface GamesAndChecklistProps {
  activeSubView: 'magic_e' | 'board_game' | 'word_hunt' | 'index_checklist';
  completedItems: Record<string, boolean>;
  onToggleItem: (itemKey: string, category: 'checklist' | 'word_hunt' | 'magic_e') => void;
  onAwardXp: (xp: number, mode: string) => void;
}

const BOARD_TILES = [
  { pos: 0, label: '🏖️ 起點 Start', q: '', a: '', options: [] as string[] },
  {
    pos: 1,
    label: '☀️ 天氣關',
    q: "How's the weather? (☀️)",
    a: "It's sunny.",
    options: ["It's sunny.", "It's rainy.", "It's twelve o'clock."],
  },
  {
    pos: 2,
    label: '⏰ 時間關',
    q: 'What time is it? (12:30)',
    a: "It's twelve thirty.",
    options: ["It's twelve thirty.", "It's windy.", "It's my pen."],
  },
  {
    pos: 3,
    label: '✏️ 文具關',
    q: 'Is this your pencil? (✅)',
    a: 'Yes, it is.',
    options: ['Yes, it is.', 'Yes, I can.', "It's hot."],
  },
  {
    pos: 4,
    label: '📦 位置關',
    q: "Where's the eraser? (在椅子下)",
    a: "It's under the chair.",
    options: ["It's under the chair.", "It's on the desk.", "It's sunny."],
  },
  {
    pos: 5,
    label: '🪄 Magic e 關',
    q: '把 kit（工具箱）加上字尾 e 變成風箏：',
    a: 'kite',
    options: ['kite', 'cute', 'cape'],
  },
  {
    pos: 6,
    label: '🌧️ 城市氣象關',
    q: '臺中是陰天怎麼說？',
    a: "It's cloudy in Taichung.",
    options: ["It's cloudy in Taichung.", 'Time to go home.', 'Raise your hand.'],
  },
  {
    pos: 7,
    label: '🪖 防災安全關',
    q: '地震保命三步驟：Drop! Cover! ___!',
    a: 'Hold on!',
    options: ['Hold on!', 'Wake up!', 'Be quiet.'],
  },
  {
    pos: 8,
    label: '🎃 萬聖節終點島',
    q: '不給糖就搗蛋怎麼說？',
    a: 'Trick or treat!',
    options: ['Trick or treat!', 'Line up, please.', 'How come?'],
  },
];

const CLOUD_DISTRACTORS = [
  'apple',
  'dog',
  'cat',
  'sing',
  'dance',
  'happy',
  'book',
  'kite',
  'cake',
  'water',
];

export const GamesAndChecklist: React.FC<GamesAndChecklistProps> = ({
  activeSubView,
  completedItems,
  onToggleItem,
  onAwardXp,
}) => {
  const [foldedMap, setFoldedMap] = useState<Record<string, boolean>>({});
  const [playerPos, setPlayerPos] = useState(0);
  const [rpsMessage, setRpsMessage] = useState('點選「剪刀・石頭・布」贏過 Boka 就能前進闖關！');
  const [pendingTileIdx, setPendingTileIdx] = useState<number | null>(null);
  const [boardWon, setBoardWon] = useState(false);

  const playRps = (choice: 'rock' | 'paper' | 'scissors') => {
    if (pendingTileIdx !== null || boardWon) return;
    const choices: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const bot = choices[Math.floor(Math.random() * 3)];
    const emojiMap = { rock: '✊ 石頭', paper: '✋ 布', scissors: '✌️ 剪刀' };

    if (choice === bot) {
      setRpsMessage(`平手！Liam 出 ${emojiMap[choice]}，Boka 也出 ${emojiMap[bot]}，再出一次拳！`);
      return;
    }

    const win =
      (choice === 'rock' && bot === 'scissors') ||
      (choice === 'paper' && bot === 'rock') ||
      (choice === 'scissors' && bot === 'paper');

    if (!win) {
      playGentleRetry();
      setRpsMessage(`哎呀！Boka 出 ${emojiMap[bot]} 贏了，答對題目仍可前進 1 格喔！`);
      const step = Math.min(BOARD_TILES.length - 1, playerPos + 1);
      setPendingTileIdx(step);
    } else {
      playSuccessChime();
      const jump = 2;
      const step = Math.min(BOARD_TILES.length - 1, playerPos + jump);
      setRpsMessage(`🎉 猜拳獲勝！Liam 出 ${emojiMap[choice]} 贏了 ${emojiMap[bot]}！答對題目直衝第 ${step} 格！`);
      setPendingTileIdx(step);
    }
  };

  const answerBoardQuestion = (opt: string) => {
    if (pendingTileIdx === null) return;
    const tile = BOARD_TILES[pendingTileIdx];
    if (opt === tile.a) {
      playSuccessChime();
      speakEnglish(tile.a);
      setPlayerPos(pendingTileIdx);
      setPendingTileIdx(null);
      if (pendingTileIdx >= BOARD_TILES.length - 1) {
        setBoardWon(true);
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        onAwardXp(30, 'board_game');
        setRpsMessage('🏆 恭喜 Liam 成功抵達沙灘終點島！獲得 +30 XP！');
      } else {
        setRpsMessage(`✅ 答對了！「${tile.a}」成功佔領第 ${pendingTileIdx} 格！繼續出拳吧！`);
      }
    } else {
      playGentleRetry();
      setRpsMessage(`💡 再想一下喔！提示：${tile.q}`);
    }
  };

  const witchCloudWords = useMemo(() => {
    const targets = WORD_HUNT_TARGETS.map((t) => ({
      word: t.word,
      key: t.key,
      isTarget: true,
      hintZh: t.hintZh,
    }));
    const extras = CLOUD_DISTRACTORS.map((w) => ({
      word: w,
      key: `dist_${w}`,
      isTarget: false,
      hintZh: '',
    }));
    const combined = [...targets];
    extras.forEach((ex, i) => {
      combined.splice(Math.min(combined.length, i * 2 + 1), 0, ex);
    });
    return combined;
  }, []);

  const foundHuntCount = WORD_HUNT_TARGETS.filter((t) => completedItems[t.key]).length;

  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('ALL');
  const allIndexedWords = useMemo(() => {
    const raw = getAllVocabWithUnit();
    const map = new Map<string, (typeof raw)[0]>();
    for (const item of raw) {
      const k = item.en.toLowerCase();
      if (!map.has(k)) map.set(k, item);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.spellTarget.localeCompare(b.spellTarget, 'en', { sensitivity: 'base' })
    );
  }, []);

  const filteredIndexWords = allIndexedWords.filter((w) => {
    const matchesLetter =
      letterFilter === 'ALL' ||
      w.spellTarget[0]?.toUpperCase() === letterFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      w.en.toLowerCase().includes(q) ||
      w.zh.toLowerCase().includes(q) ||
      w.unitBadge.toLowerCase().includes(q);
    return matchesLetter && matchesSearch;
  });

  // ==================== 1. MAGIC E FLIP CARDS ====================
  if (activeSubView === 'magic_e') {
    return (
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-amber-200 space-y-6">
        <div>
          <span className="text-sm font-extrabold px-4 py-1 rounded-full bg-amber-100 text-amber-900">
            書末拉頁配件｜Magic e 折疊翻翻字卡
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            🪄 Magic e 魔法字尾大翻翻卡
          </h2>
          <p className="text-lg text-slate-600 font-bold mt-1">
            用手指點一下字卡，把右邊的魔法 <code className="font-black text-amber-700">e</code> 摺進來，聽聽短母音一秒變長母音！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MAGIC_E_PAIRS.map((pair) => {
            const hasE = !!foldedMap[pair.shortWord];
            const keyId = `magice_${pair.shortWord}`;
            return (
              <div
                key={pair.shortWord}
                onClick={() => {
                  const next = !hasE;
                  setFoldedMap((p) => ({ ...p, [pair.shortWord]: next }));
                  speakEnglish(next ? pair.longWord : pair.shortWord);
                  playSuccessChime();
                  if (next && !completedItems[keyId]) {
                    onToggleItem(keyId, 'magic_e');
                  }
                }}
                className={`rounded-3xl border-4 p-6 sm:p-7 cursor-pointer transition active:scale-[0.98] select-none ${
                  hasE
                    ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white border-amber-500 shadow-xl'
                    : 'bg-amber-50/70 hover:bg-amber-100/70 text-slate-900 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-base font-extrabold px-3.5 py-1 rounded-full ${
                      hasE ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-950'
                    }`}
                  >
                    {pair.vowel}
                  </span>
                  <Volume2 className="w-6 h-6 opacity-85" />
                </div>

                <div className="flex items-center justify-center gap-2 my-4">
                  <span className="text-6xl mr-3">
                    {hasE ? pair.longEmoji : pair.shortEmoji}
                  </span>
                  <span className="text-5xl sm:text-6xl font-black tracking-wider">
                    {hasE ? pair.longWord.slice(0, -1) : pair.shortWord}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-14 h-16 rounded-2xl font-black text-5xl sm:text-6xl transition-all duration-300 border-l-3 border-dashed ${
                      hasE
                        ? 'bg-white text-rose-600 border-rose-300 scale-105 shadow-lg ml-1'
                        : 'bg-slate-200/80 text-slate-400 border-slate-300 scale-90 opacity-50 ml-3'
                    }`}
                  >
                    e
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-extrabold">
                    {hasE ? `${pair.longWord}（${pair.longZh}）` : `${pair.shortWord}（${pair.shortZh}）`}
                  </div>
                  <div className={`text-base font-bold mt-1.5 ${hasE ? 'text-amber-50' : 'text-slate-500'}`}>
                    {hasE ? '👆 點一下把 e 打開變回短母音' : '👆 點一下把魔法 e 摺進來！'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== 2. BEACH BOARD GAME ====================
  if (activeSubView === 'board_game') {
    const activeQuestionTile = pendingTileIdx !== null ? BOARD_TILES[pendingTileIdx] : null;
    return (
      <div className="bg-gradient-to-br from-sky-50 via-amber-50 to-yellow-100 rounded-[2rem] p-6 sm:p-8 shadow-sm border-3 border-amber-300 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-sm font-extrabold px-4 py-1 rounded-full bg-sky-600 text-white">
              書末拉頁桌遊｜Rock, Paper, Scissors
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              🏖️ 沙灘猜拳闖關桌遊
            </h2>
          </div>

          <button
            onClick={() => {
              setPlayerPos(0);
              setPendingTileIdx(null);
              setBoardWon(false);
              setRpsMessage('新的一局開始！請點選剪刀・石頭・布前進！');
            }}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 text-base font-extrabold cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            重新開始
          </button>
        </div>

        {/* Status & Big RPS Buttons */}
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 space-y-5">
          <div className="flex items-center gap-3.5">
            <Dices className="w-10 h-10 text-amber-500 shrink-0" />
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{rpsMessage}</p>
          </div>

          {pendingTileIdx === null && !boardWon && (
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => playRps('scissors')}
                className="py-5 rounded-3xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-extrabold text-2xl shadow-md cursor-pointer"
              >
                ✌️ 剪刀
              </button>
              <button
                onClick={() => playRps('rock')}
                className="py-5 rounded-3xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-extrabold text-2xl shadow-md cursor-pointer"
              >
                ✊ 石頭
              </button>
              <button
                onClick={() => playRps('paper')}
                className="py-5 rounded-3xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-2xl shadow-md cursor-pointer"
              >
                ✋ 布
              </button>
            </div>
          )}
        </div>

        {/* Question Card */}
        {activeQuestionTile && (
          <div className="bg-white rounded-3xl p-7 border-4 border-sky-400 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-extrabold px-4 py-1.5 rounded-full bg-sky-100 text-sky-900">
                第 {activeQuestionTile.pos} 格挑戰：{activeQuestionTile.label}
              </span>
              <button
                onClick={() => speakEnglish(activeQuestionTile.q.replace(/\(.*\)/, ''))}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 text-white text-base font-extrabold cursor-pointer active:scale-95"
              >
                <Volume2 className="w-5 h-5" />
                唸題目
              </button>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {activeQuestionTile.q}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeQuestionTile.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => answerBoardQuestion(opt)}
                  className="p-5 rounded-3xl border-3 border-slate-200 hover:border-sky-400 hover:bg-sky-50 font-extrabold text-xl sm:text-2xl text-slate-900 text-left cursor-pointer active:scale-95 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3x3 Spacious Beach Path Grid for iPad */}
        <div className="grid grid-cols-3 gap-4">
          {BOARD_TILES.map((t) => {
            const isHere = playerPos === t.pos;
            const passed = playerPos > t.pos;
            return (
              <div
                key={t.pos}
                className={`p-5 rounded-3xl border-3 text-center flex flex-col items-center justify-between min-h-36 transition ${
                  isHere
                    ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-lg scale-[1.03]'
                    : passed
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                      : 'bg-white/95 border-amber-200 text-slate-800'
                }`}
              >
                <span className="text-sm font-black opacity-75">第 {t.pos} 格</span>
                <div className="text-5xl my-2">{isHere ? '🦁' : passed ? '⭐' : '🐚'}</div>
                <span className="text-base sm:text-lg font-extrabold">{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== 3. WITCH'S HAT WORD HUNT ====================
  if (activeSubView === 'word_hunt') {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-sm font-extrabold px-4 py-1 rounded-full bg-amber-400 text-slate-950">
              第 112 頁｜Word Hunt 女巫帽尋字雲
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
              🧙🏻‍♀️ 女巫帽尋字大任務
            </h2>
            <p className="text-base sm:text-lg text-purple-200 font-bold mt-1">
              點擊下方大單字雲，找出課本指定的 14 個通關單字！
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm px-6 py-4 rounded-3xl border border-white/25 text-center">
            <div className="text-sm text-purple-200 font-extrabold">尋獲進度</div>
            <div className="text-3xl font-black text-amber-300">
              {foundHuntCount} / {WORD_HUNT_TARGETS.length}
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-purple-400/30 flex flex-col items-center space-y-4">
          <div className="text-6xl">🧙🏻‍♀️</div>
          <div className="flex flex-wrap justify-center gap-3.5 max-w-3xl">
            {witchCloudWords.map((item) => {
              const found = item.isTarget && !!completedItems[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    speakEnglish(item.word);
                    if (item.isTarget) {
                      playSuccessChime();
                      if (!found) {
                        onToggleItem(item.key, 'word_hunt');
                        if (foundHuntCount + 1 === WORD_HUNT_TARGETS.length) {
                          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                          onAwardXp(25, 'word_hunt');
                        }
                      }
                    } else {
                      playGentleRetry();
                    }
                  }}
                  className={`px-6 py-3.5 rounded-full font-extrabold text-xl sm:text-2xl transition active:scale-95 cursor-pointer ${
                    found
                      ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 scale-105'
                      : 'bg-white/15 hover:bg-white/25 text-white border-2 border-white/25'
                  }`}
                >
                  {found ? `⭐ ${item.word}` : item.word}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORD_HUNT_TARGETS.map((t) => {
            const done = !!completedItems[t.key];
            return (
              <div
                key={t.key}
                className={`p-4 rounded-2xl border-2 text-base font-extrabold flex items-center justify-between ${
                  done
                    ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-100'
                    : 'bg-white/5 border-white/15 text-purple-100'
                }`}
              >
                <span>🔍 {t.hintZh}</span>
                <span className="text-lg">{done ? `✅ ${t.word}` : '❓'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== 4. INDEX & SELF-CHECKLIST ====================
  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-emerald-200 space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-emerald-600" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            📋 全書自我檢核總表 Self-Checklist（第 103–108 頁）
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {UNITS_DATA.filter((u) => u.checklistItems && u.checklistItems.length > 0).map((u) => (
            <div
              key={u.id}
              className="rounded-3xl border-2 border-slate-200 p-5 sm:p-6 space-y-3.5 bg-slate-50/50"
            >
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <span className="text-3xl">{u.heroEmoji}</span>
                <span>
                  {u.badge}: {u.titleEn}
                </span>
              </div>
              <div className="space-y-2.5">
                {u.checklistItems!.map((chk) => {
                  const done = !!completedItems[chk.key];
                  return (
                    <button
                      key={chk.key}
                      onClick={() => {
                        onToggleItem(chk.key, 'checklist');
                        if (!done) playSuccessChime();
                      }}
                      className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-3.5 cursor-pointer active:scale-[0.99] transition ${
                        done
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-amber-50/50'
                      }`}
                    >
                      {done ? (
                        <CheckSquare className="w-7 h-7 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-7 h-7 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-lg font-extrabold">{chk.labelZh}</div>
                        <div className="text-base font-bold text-slate-500">{chk.labelEn}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-sky-200 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              📖 A–Z 全書生字大字索引（第 109–111 頁）
            </h2>
            <p className="text-base text-slate-600 font-bold mt-1">
              共收錄 {allIndexedWords.length} 個課本詞彙，點擊任一單字立即發音！
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋英文或中文解釋..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-sky-400 outline-none text-lg font-extrabold"
            />
          </div>
        </div>

        {/* Big Touch Alphabet Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setLetterFilter(letter)}
              className={`min-w-11 h-11 px-3 rounded-xl text-base font-extrabold cursor-pointer active:scale-90 ${
                letterFilter === letter
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[640px] overflow-y-auto pr-1">
          {filteredIndexWords.map((item) => (
            <button
              key={item.key}
              onClick={() => speakEnglish(item.en)}
              className="p-4 sm:p-5 rounded-3xl border-2 border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 active:scale-[0.99] flex items-center justify-between text-left cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-4xl shrink-0">{item.emoji}</span>
                <div className="min-w-0">
                  <div className="font-extrabold text-xl sm:text-2xl text-slate-900 break-words">
                    {item.en} {item.moe1200 ? <span className="text-amber-600">*</span> : null}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-600">{item.zh}</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span
                  className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full ${
                    item.tier === 'core'
                      ? 'bg-slate-900 text-white'
                      : item.tier === 'phonics'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-sky-100 text-sky-900'
                  }`}
                >
                  {item.unitBadge}
                </span>
                {item.page && (
                  <div className="text-xs text-slate-500 font-bold mt-1">{item.page}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
