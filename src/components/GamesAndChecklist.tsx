import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Turtle,
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
import { PagedBookFrame, BookPageSpec } from './PagedBookFrame';

interface GamesAndChecklistProps {
  activeSubView: 'magic_e' | 'board_game' | 'word_hunt' | 'checklist' | 'dictionary';
  completedItems: Record<string, boolean>;
  onToggleItem: (itemKey: string, category: 'checklist' | 'word_hunt' | 'magic_e') => void;
  onAwardXp: (xp: number, mode: string) => void;
  onBackHome: () => void;
}

const BOARD_TILES = [
  { pos: 0, label: '🏖️ 起點', q: '', a: '', options: [] as string[] },
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
    label: '🪄 Magic e',
    q: '把 kit（工具箱）加上字尾 e 變成風箏：',
    a: 'kite',
    options: ['kite', 'cute', 'cape'],
  },
  {
    pos: 6,
    label: '🌧️ 氣象關',
    q: '臺中是陰天怎麼說？',
    a: "It's cloudy in Taichung.",
    options: ["It's cloudy in Taichung.", 'Time to go home.', 'Raise your hand.'],
  },
  {
    pos: 7,
    label: '🪖 防災關',
    q: '地震保命三步驟：Drop! Cover! ___!',
    a: 'Hold on!',
    options: ['Hold on!', 'Wake up!', 'Be quiet.'],
  },
  {
    pos: 8,
    label: '🎃 終點島',
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

function chunkList<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const GamesAndChecklist: React.FC<GamesAndChecklistProps> = ({
  activeSubView,
  completedItems,
  onToggleItem,
  onAwardXp,
  onBackHome,
}) => {
  const [pageIdx, setPageIdx] = useState(0);
  const [foldedMap, setFoldedMap] = useState<Record<string, boolean>>({});
  const [playerPos, setPlayerPos] = useState(0);
  const [rpsMessage, setRpsMessage] = useState('點選「剪刀・石頭・布」贏過 Boka 前進闖關！');
  const [pendingTileIdx, setPendingTileIdx] = useState<number | null>(null);
  const [boardWon, setBoardWon] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('ALL');

  useEffect(() => {
    setPageIdx(0);
  }, [activeSubView, letterFilter, searchQuery]);

  const playRps = (choice: 'rock' | 'paper' | 'scissors') => {
    if (pendingTileIdx !== null || boardWon) return;
    const choices: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const bot = choices[Math.floor(Math.random() * 3)];
    const emojiMap = { rock: '✊ 石頭', paper: '✋ 布', scissors: '✌️ 剪刀' };

    if (choice === bot) {
      setRpsMessage(`平手！Liam 與 Boka 都出 ${emojiMap[choice]}，再出一次！`);
      return;
    }

    const win =
      (choice === 'rock' && bot === 'scissors') ||
      (choice === 'paper' && bot === 'rock') ||
      (choice === 'scissors' && bot === 'paper');

    if (!win) {
      playGentleRetry();
      setRpsMessage(`Boka 出 ${emojiMap[bot]} 贏了！答對題目仍可前進 1 格！`);
      setPendingTileIdx(Math.min(BOARD_TILES.length - 1, playerPos + 1));
    } else {
      playSuccessChime();
      const step = Math.min(BOARD_TILES.length - 1, playerPos + 2);
      setRpsMessage(`🎉 猜拳獲勝！Liam 出 ${emojiMap[choice]} 贏了 ${emojiMap[bot]}！答對衝第 ${step} 格！`);
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
        setRpsMessage(`✅ 答對了！「${tile.a}」成功佔領第 ${pendingTileIdx} 格！繼續出拳！`);
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

  // ==================== 1. GIANT 1-CARD-PER-PAGE MAGIC E BOOK ====================
  if (activeSubView === 'magic_e') {
    const magicPages: BookPageSpec[] = MAGIC_E_PAIRS.map((pair, idx) => {
      const hasE = !!foldedMap[pair.shortWord];
      const keyId = `magice_${pair.shortWord}`;
      return {
        id: `magic-${pair.shortWord}`,
        shortTag: pair.vowel,
        title: `Magic e 折疊字卡（${idx + 1} / ${MAGIC_E_PAIRS.length}）`,
        render: () => (
          <div className="max-w-2xl mx-auto w-full space-y-6 text-center">
            <div className="text-lg font-extrabold text-slate-600">
              👆 用手指點下方大字卡，把右邊的魔法 <code className="text-amber-700 font-black">e</code> 摺進來！
            </div>

            <div
              onClick={() => {
                const next = !hasE;
                setFoldedMap((p) => ({ ...p, [pair.shortWord]: next }));
                speakEnglish(next ? pair.longWord : pair.shortWord);
                playSuccessChime();
                if (next && !completedItems[keyId]) {
                  onToggleItem(keyId, 'magic_e');
                }
              }}
              className={`rounded-[2.5rem] border-4 p-8 sm:p-12 cursor-pointer transition active:scale-[0.98] select-none ${
                hasE
                  ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white border-amber-500 shadow-2xl'
                  : 'bg-amber-50 hover:bg-amber-100/80 text-slate-900 border-amber-300 shadow-md'
              }`}
            >
              <div className="text-8xl mb-4">
                {hasE ? pair.longEmoji : pair.shortEmoji}
              </div>

              <div className="flex items-center justify-center gap-2 my-4">
                <span className="text-6xl sm:text-7xl font-black tracking-wider">
                  {hasE ? pair.longWord.slice(0, -1) : pair.shortWord}
                </span>
                <span
                  className={`inline-flex items-center justify-center w-18 h-22 sm:w-20 sm:h-24 rounded-3xl font-black text-6xl sm:text-7xl transition-all duration-300 border-l-4 border-dashed ${
                    hasE
                      ? 'bg-white text-rose-600 border-rose-300 scale-105 shadow-xl ml-1'
                      : 'bg-slate-200/80 text-slate-400 border-slate-300 scale-90 opacity-45 ml-4'
                  }`}
                >
                  e
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-extrabold mt-4">
                {hasE ? `${pair.longWord} — ${pair.longZh}` : `${pair.shortWord} — ${pair.shortZh}`}
              </div>
              <div className={`text-lg font-bold mt-3 ${hasE ? 'text-amber-50' : 'text-slate-500'}`}>
                {hasE ? '✨ 已變身長母音！再點一下打開字尾 e' : '👆 點一下摺入魔法 e 變身長母音！'}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3.5">
              <button
                onClick={() => speakEnglish(pair.shortWord, 0.85)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 text-slate-900 font-extrabold text-lg whitespace-nowrap cursor-pointer active:scale-95"
              >
                <Volume2 className="w-5 h-5 shrink-0" />
                短母音：{pair.shortWord}
              </button>
              <button
                onClick={() => speakEnglish(pair.longWord, 0.85)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 text-white font-extrabold text-lg whitespace-nowrap cursor-pointer active:scale-95 shadow-sm"
              >
                <Turtle className="w-5 h-5 shrink-0" />
                長母音：{pair.longWord}
              </button>
            </div>
          </div>
        ),
      };
    });

    return (
      <PagedBookFrame
        pages={magicPages}
        currentIndex={pageIdx}
        onChangeIndex={setPageIdx}
        finishAction={{ label: '🏠 回魔法遊戲館', onClick: onBackHome }}
      />
    );
  }

  // ==================== 2. SINGLE-SCREEN BEACH BOARD GAME ====================
  if (activeSubView === 'board_game') {
    const activeQuestionTile = pendingTileIdx !== null ? BOARD_TILES[pendingTileIdx] : null;
    const gamePages: BookPageSpec[] = [
      {
        id: 'beach-rps',
        shortTag: '🏖️ 沙灘闖關',
        title: 'Rock, Paper, Scissors 沙灘猜拳桌遊',
        render: () => (
          <div className="space-y-5">
            {/* Top Status & RPS Controls */}
            <div className="bg-amber-50 rounded-3xl p-5 border-2 border-amber-300 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Dices className="w-9 h-9 text-amber-500 shrink-0" />
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{rpsMessage}</p>
              </div>

              {pendingTileIdx === null && !boardWon ? (
                <div className="flex gap-2.5 shrink-0">
                  <button
                    onClick={() => playRps('scissors')}
                    className="px-5 py-3.5 rounded-2xl bg-amber-400 text-slate-950 font-extrabold text-lg sm:text-xl whitespace-nowrap shadow-sm active:scale-95 cursor-pointer"
                  >
                    ✌️ 剪刀
                  </button>
                  <button
                    onClick={() => playRps('rock')}
                    className="px-5 py-3.5 rounded-2xl bg-sky-500 text-white font-extrabold text-lg sm:text-xl whitespace-nowrap shadow-sm active:scale-95 cursor-pointer"
                  >
                    ✊ 石頭
                  </button>
                  <button
                    onClick={() => playRps('paper')}
                    className="px-5 py-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-lg sm:text-xl whitespace-nowrap shadow-sm active:scale-95 cursor-pointer"
                  >
                    ✋ 布
                  </button>
                </div>
              ) : boardWon ? (
                <button
                  onClick={() => {
                    setPlayerPos(0);
                    setPendingTileIdx(null);
                    setBoardWon(false);
                    setRpsMessage('新的一局開始！請出拳前進！');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-amber-500 text-white font-extrabold text-xl cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" />
                  再玩一局
                </button>
              ) : null}
            </div>

            {/* If answering a tile question, show giant question panel; otherwise show 3x3 board */}
            {activeQuestionTile ? (
              <div className="bg-sky-50 rounded-3xl p-7 border-3 border-sky-400 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1.5 rounded-full bg-sky-600 text-white text-base font-extrabold">
                    第 {activeQuestionTile.pos} 格挑戰：{activeQuestionTile.label}
                  </span>
                  <button
                    onClick={() => speakEnglish(activeQuestionTile.q.replace(/\(.*\)/, ''))}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 text-white font-extrabold text-lg cursor-pointer active:scale-95"
                  >
                    <Volume2 className="w-5 h-5" />
                    唸題目
                  </button>
                </div>
                <div className="text-3xl font-black text-slate-900">{activeQuestionTile.q}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeQuestionTile.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => answerBoardQuestion(opt)}
                      className="p-5 rounded-3xl bg-white border-3 border-sky-200 hover:border-sky-500 font-extrabold text-2xl text-slate-900 text-left cursor-pointer active:scale-95 shadow-sm"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3.5">
                {BOARD_TILES.map((t) => {
                  const isHere = playerPos === t.pos;
                  const passed = playerPos > t.pos;
                  return (
                    <div
                      key={t.pos}
                      className={`p-4 rounded-3xl border-3 text-center flex flex-col items-center justify-between min-h-28 ${
                        isHere
                          ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-lg'
                          : passed
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black">#{t.pos}</span>
                      <div className="text-4xl my-1">{isHere ? '🦁' : passed ? '⭐' : '🐚'}</div>
                      <span className="text-sm sm:text-lg font-extrabold whitespace-nowrap">
                        {t.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ),
      },
    ];

    return (
      <PagedBookFrame
        pages={gamePages}
        currentIndex={0}
        onChangeIndex={() => {}}
        finishAction={{ label: '🏠 回魔法遊戲館', onClick: onBackHome }}
      />
    );
  }

  // ==================== 3. PAGED WORD HUNT ====================
  if (activeSubView === 'word_hunt') {
    const huntPages: BookPageSpec[] = [
      {
        id: 'hunt-cloud',
        shortTag: '🧙🏻‍♀️ 女巫帽尋字雲',
        title: `女巫帽尋字進度：${foundHuntCount} / ${WORD_HUNT_TARGETS.length}`,
        render: () => (
          <div className="rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 space-y-5 text-center">
            <div className="text-xl font-extrabold text-amber-300">
              🔍 點擊單字找出課本指定的 14 個通關字！（已找到 {foundHuntCount} / {WORD_HUNT_TARGETS.length}）
            </div>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
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
                    className={`px-5 py-3 rounded-full font-extrabold text-xl sm:text-2xl transition active:scale-95 cursor-pointer ${
                      found
                        ? 'bg-amber-400 text-slate-950 shadow-lg scale-105'
                        : 'bg-white/15 hover:bg-white/25 text-white border-2 border-white/25'
                    }`}
                  >
                    {found ? `⭐ ${item.word}` : item.word}
                  </button>
                );
              })}
            </div>
          </div>
        ),
      },
      {
        id: 'hunt-clues',
        shortTag: '📋 尋字線索表',
        title: '14 個指定通關單字檢核表',
        render: () => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WORD_HUNT_TARGETS.map((t) => {
              const done = !!completedItems[t.key];
              return (
                <div
                  key={t.key}
                  onClick={() => done && speakEnglish(t.word)}
                  className={`p-4 rounded-2xl border-2 text-base sm:text-lg font-extrabold flex items-center justify-between gap-2 ${
                    done
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="truncate">🔍 {t.hintZh}</span>
                  <span className="shrink-0 whitespace-nowrap">
                    {done ? `✅ ${t.word}` : '❓ 未尋獲'}
                  </span>
                </div>
              );
            })}
          </div>
        ),
      },
    ];

    return (
      <PagedBookFrame
        pages={huntPages}
        currentIndex={pageIdx}
        onChangeIndex={setPageIdx}
        finishAction={{ label: '🏠 回魔法遊戲館', onClick: onBackHome }}
      />
    );
  }

  // ==================== 4. PAGED SELF-CHECKLIST BOOK (1 Unit per Page!) ====================
  if (activeSubView === 'checklist') {
    const checkUnits = UNITS_DATA.filter((u) => u.checklistItems && u.checklistItems.length > 0);
    const checkPages: BookPageSpec[] = checkUnits.map((u) => ({
      id: `chk-${u.id}`,
      shortTag: `${u.heroEmoji} ${u.badge}`,
      title: `${u.badge} 自我檢核表（pp.103–108）`,
      render: () => (
        <div className="space-y-5 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{u.heroEmoji}</span>
            <div>
              <h3 className="text-3xl font-black text-slate-900">
                {u.badge}: {u.titleEn}
              </h3>
              <p className="text-lg font-bold text-slate-600">{u.titleZh}</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {u.checklistItems!.map((chk) => {
              const done = !!completedItems[chk.key];
              return (
                <button
                  key={chk.key}
                  onClick={() => {
                    onToggleItem(chk.key, 'checklist');
                    if (!done) playSuccessChime();
                  }}
                  className={`w-full p-5 rounded-3xl border-3 text-left flex items-center gap-4 cursor-pointer active:scale-[0.99] transition ${
                    done
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {done ? (
                    <CheckSquare className="w-8 h-8 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-8 h-8 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xl font-extrabold">{chk.labelZh}</div>
                    <div className="text-base font-bold text-slate-500">{chk.labelEn}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ),
    }));

    return (
      <PagedBookFrame
        pages={checkPages}
        currentIndex={pageIdx}
        onChangeIndex={setPageIdx}
        finishAction={{ label: '🏠 回魔法遊戲館', onClick: onBackHome }}
      />
    );
  }

  // ==================== 5. PAGED A-Z DICTIONARY (6 Giant Words per Page!) ====================
  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  const filteredWords = allIndexedWords.filter((w) => {
    const matchesLetter =
      letterFilter === 'ALL' || w.spellTarget[0]?.toUpperCase() === letterFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      w.en.toLowerCase().includes(q) ||
      w.zh.toLowerCase().includes(q) ||
      w.unitBadge.toLowerCase().includes(q);
    return matchesLetter && matchesSearch;
  });

  const dictChunks = chunkList(filteredWords, 6);
  const dictPages: BookPageSpec[] =
    dictChunks.length === 0
      ? [
          {
            id: 'dict-empty',
            shortTag: '📖 字典',
            title: 'A–Z 生字索引字典',
            render: () => (
              <div className="space-y-6 text-center">
                <p className="text-2xl font-extrabold text-slate-500">找不到符合的單字喔！</p>
                <button
                  onClick={() => {
                    setLetterFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-sky-600 text-white font-extrabold text-lg cursor-pointer"
                >
                  顯示全部單字
                </button>
              </div>
            ),
          },
        ]
      : dictChunks.map((chunk, idx) => ({
          id: `dict-page-${idx}`,
          shortTag: `📖 字典 (${filteredWords.length}字)`,
          title: `第 ${idx + 1} / ${dictChunks.length} 頁`,
          render: () => (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {alphabet.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setLetterFilter(letter)}
                      className={`min-w-10 h-10 px-2.5 rounded-xl text-sm font-extrabold cursor-pointer shrink-0 ${
                        letterFilter === letter
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64 shrink-0">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋單字或中文..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-sky-400 outline-none text-base font-extrabold"
                  />
                </div>
              </div>

              {/* 6 Giant Single-Line Dictionary Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {chunk.map((item) => {
                  const enSize =
                    item.en.length >= 15
                      ? 'text-xl sm:text-2xl'
                      : 'text-2xl sm:text-3xl';
                  return (
                    <button
                      key={item.key}
                      onClick={() => speakEnglish(item.en)}
                      className="p-4 rounded-3xl border-2 border-slate-200 hover:border-sky-400 bg-slate-50/50 active:scale-[0.98] flex flex-col justify-between gap-1.5 text-left cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl leading-none shrink-0">{item.emoji}</span>
                          <span className="inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-white whitespace-nowrap">
                            {item.unitBadge}
                          </span>
                          {item.page && (
                            <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
                              {item.page}
                            </span>
                          )}
                        </div>
                        <Volume2 className="w-5 h-5 text-sky-600 shrink-0" />
                      </div>
                      <div className="w-full">
                        <div className={`${enSize} font-black text-slate-900 whitespace-nowrap`}>
                          {item.en}{' '}
                          {item.moe1200 ? <span className="text-amber-600 text-base align-top">*</span> : null}
                        </div>
                        <div className="text-base sm:text-lg font-bold text-slate-600 truncate">
                          {item.zh}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ),
        }));

  return (
    <PagedBookFrame
      pages={dictPages}
      currentIndex={pageIdx}
      onChangeIndex={setPageIdx}
      finishAction={{ label: '🏠 回魔法遊戲館', onClick: onBackHome }}
    />
  );
};
