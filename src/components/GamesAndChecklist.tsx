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

// Distractor words mixed into the Witch's Hat cloud on p. 112
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
  // ==================== 1. Magic e State ====================
  const [foldedMap, setFoldedMap] = useState<Record<string, boolean>>({});

  // ==================== 2. Beach RPS Board Game State ====================
  const [playerPos, setPlayerPos] = useState(0);
  const [rpsMessage, setRpsMessage] = useState('出拳（剪刀・石頭・布）贏過 Boka 就能前進闖關！');
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
      setRpsMessage(`哎呀！Boka 出 ${emojiMap[bot]} 贏了，別氣餒，再猜拳一次前進 1 格！`);
      const step = Math.min(BOARD_TILES.length - 1, playerPos + 1);
      setPendingTileIdx(step);
    } else {
      playSuccessChime();
      const jump = 2;
      const step = Math.min(BOARD_TILES.length - 1, playerPos + jump);
      setRpsMessage(`🎉 猜拳獲勝！Liam 出 ${emojiMap[choice]} 贏了 ${emojiMap[bot]}！答對題目即可前進到第 ${step} 格！`);
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

  // ==================== 3. Word Hunt Cloud ====================
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
    // Deterministic interleave so the hat shape looks rich and neat
    const combined = [...targets];
    extras.forEach((ex, i) => {
      combined.splice(Math.min(combined.length, i * 2 + 1), 0, ex);
    });
    return combined;
  }, []);

  const foundHuntCount = WORD_HUNT_TARGETS.filter((t) => completedItems[t.key]).length;

  // ==================== 4. Full A-Z Index ====================
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('ALL');
  const allIndexedWords = useMemo(() => {
    const raw = getAllVocabWithUnit();
    // Deduplicate by spellTarget lowercase while preserving unit references
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

  // ==================== RENDER SUBVIEWS ====================
  if (activeSubView === 'magic_e') {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-amber-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
              書末拉頁配件｜Magic e 折疊翻翻字卡
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              🪄 Magic e 魔法字尾翻翻卡
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              點擊卡片把右邊的魔法 <code className="font-extrabold text-amber-700">e</code> 摺進來，聽聽看短母音怎麼一秒變成長母音！
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className={`rounded-3xl border-3 p-5 cursor-pointer transition select-none relative overflow-hidden ${
                  hasE
                    ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white border-amber-500 shadow-lg'
                    : 'bg-amber-50/60 hover:bg-amber-100/70 text-slate-900 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      hasE ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {pair.vowel}
                  </span>
                  <Volume2 className="w-4 h-4 opacity-80" />
                </div>

                <div className="flex items-center justify-center gap-1 my-3">
                  <span className="text-4xl mr-2">
                    {hasE ? pair.longEmoji : pair.shortEmoji}
                  </span>
                  <span className="text-4xl font-black tracking-wider">
                    {hasE ? pair.longWord.slice(0, -1) : pair.shortWord}
                  </span>
                  {/* Foldable Magic e Flap */}
                  <span
                    className={`inline-flex items-center justify-center w-10 h-12 rounded-xl font-black text-4xl transition-all duration-300 border-l-2 border-dashed ${
                      hasE
                        ? 'bg-white text-rose-600 border-rose-300 scale-105 shadow-md ml-0.5'
                        : 'bg-slate-200/70 text-slate-400 border-slate-300 scale-90 opacity-50 ml-2'
                    }`}
                  >
                    e
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-lg font-extrabold">
                    {hasE ? `${pair.longWord}（${pair.longZh}）` : `${pair.shortWord}（${pair.shortZh}）`}
                  </div>
                  <div className={`text-xs font-bold mt-1 ${hasE ? 'text-amber-50' : 'text-slate-500'}`}>
                    {hasE ? '👆 點擊把 e 打開變回短母音' : '👆 點擊把魔法 e 摺進來！'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeSubView === 'board_game') {
    const activeQuestionTile = pendingTileIdx !== null ? BOARD_TILES[pendingTileIdx] : null;
    return (
      <div className="bg-gradient-to-br from-sky-50 via-amber-50 to-yellow-100 rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-amber-300 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-600 text-white">
              書末拉頁桌遊｜Rock, Paper, Scissors 沙灘闖關大冒險
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              🏖️ 沙灘猜拳闖關桌遊（四大句型總複習）
            </h2>
          </div>

          <button
            onClick={() => {
              setPlayerPos(0);
              setPendingTileIdx(null);
              setBoardWon(false);
              setRpsMessage('新的一局開始！請出拳（剪刀・石頭・布）前進！');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-extrabold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            重新開始桌遊
          </button>
        </div>

        {/* Status Banner */}
        <div className="bg-white rounded-2xl p-4 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Dices className="w-8 h-8 text-amber-500 shrink-0" />
            <p className="font-extrabold text-slate-800">{rpsMessage}</p>
          </div>

          {pendingTileIdx === null && !boardWon && (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => playRps('scissors')}
                className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold shadow-sm cursor-pointer"
              >
                ✌️ 剪刀
              </button>
              <button
                onClick={() => playRps('rock')}
                className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold shadow-sm cursor-pointer"
              >
                ✊ 石頭
              </button>
              <button
                onClick={() => playRps('paper')}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-sm cursor-pointer"
              >
                ✋ 布
              </button>
            </div>
          )}
        </div>

        {/* Question Modal / Card when stepping onto a tile */}
        {activeQuestionTile && (
          <div className="bg-white rounded-3xl p-6 border-3 border-sky-400 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-100 text-sky-800">
                第 {activeQuestionTile.pos} 格挑戰：{activeQuestionTile.label}
              </span>
              <button
                onClick={() => speakEnglish(activeQuestionTile.q.replace(/\(.*\)/, ''))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                唸題目
              </button>
            </div>
            <div className="text-xl font-extrabold text-slate-900">{activeQuestionTile.q}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeQuestionTile.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => answerBoardQuestion(opt)}
                  className="p-4 rounded-2xl border-2 border-slate-200 hover:border-sky-400 hover:bg-sky-50 font-extrabold text-slate-800 text-left cursor-pointer transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Beach Path Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2.5">
          {BOARD_TILES.map((t) => {
            const isHere = playerPos === t.pos;
            const passed = playerPos > t.pos;
            return (
              <div
                key={t.pos}
                className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center justify-between min-h-28 transition ${
                  isHere
                    ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-md scale-105'
                    : passed
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-white/90 border-amber-200 text-slate-700'
                }`}
              >
                <span className="text-[11px] font-black opacity-75">#{t.pos}</span>
                <div className="text-2xl my-1">{isHere ? '🦁' : passed ? '⭐' : '🐚'}</div>
                <span className="text-xs font-extrabold leading-tight">{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeSubView === 'word_hunt') {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-400 text-slate-950">
              第 112 頁｜Word Hunt 女巫帽尋字雲
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 flex items-center gap-2">
              🧙🏻‍♀️ 女巫帽尋字大任務（Witch's Hat Word Hunt）
            </h2>
            <p className="text-sm text-purple-200 font-medium mt-1">
              拿出放大鏡 🔍，在魔法單字雲裡找出課本第 103–108 頁指定的 14 個通關單字！
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20 text-center">
            <div className="text-xs text-purple-200 font-bold">尋獲進度</div>
            <div className="text-2xl font-black text-amber-300">
              {foundHuntCount} / {WORD_HUNT_TARGETS.length}
            </div>
          </div>
        </div>

        {/* Witch Hat Word Cloud */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-purple-400/30 flex flex-col items-center space-y-3">
          <div className="text-5xl">🧙🏻‍♀️</div>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl">
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
                  className={`px-4 py-2 rounded-full font-extrabold text-base sm:text-lg transition cursor-pointer ${
                    found
                      ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 scale-105'
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                  }`}
                >
                  {found ? `⭐ ${item.word}` : item.word}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Clues List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {WORD_HUNT_TARGETS.map((t) => {
            const done = !!completedItems[t.key];
            return (
              <div
                key={t.key}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                  done
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-purple-200'
                }`}
              >
                <span>🔍 {t.hintZh}</span>
                <span>{done ? `✅ ${t.word}` : '❓'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== 4. INDEX & SELF-CHECKLIST (pp. 103–111) ====================
  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  return (
    <div className="space-y-8">
      {/* Full Self-Checklist Summary (pp. 103–108) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-emerald-200 space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-extrabold text-slate-900">
            📋 全書自我檢核總表 Self-Checklist（第 103–108 頁）
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UNITS_DATA.filter((u) => u.checklistItems && u.checklistItems.length > 0).map((u) => (
            <div key={u.id} className="rounded-2xl border-2 border-slate-100 p-4 space-y-2.5 bg-slate-50/50">
              <div className="font-extrabold text-slate-800 flex items-center gap-2">
                <span>{u.heroEmoji}</span>
                <span>
                  {u.badge}: {u.titleEn}
                </span>
              </div>
              <div className="space-y-2">
                {u.checklistItems!.map((chk) => {
                  const done = !!completedItems[chk.key];
                  return (
                    <button
                      key={chk.key}
                      onClick={() => {
                        onToggleItem(chk.key, 'checklist');
                        if (!done) playSuccessChime();
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 text-xs font-bold cursor-pointer transition ${
                        done
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50/50'
                      }`}
                    >
                      {done ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div>{chk.labelZh}</div>
                        <div className="text-[11px] text-slate-500">{chk.labelEn}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* A-Z Vocabulary Index (pp. 109–111) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-sky-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              📖 A–Z 全書生字索引字典 Index（第 109–111 頁）
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              共收錄 {allIndexedWords.length} 個課本詞彙，標註課次、頁碼、黑/藍/綠字級別與教育部 1,200 字詞 (*)。
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋英文或中文解釋..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-sky-400 outline-none text-sm font-bold"
            />
          </div>
        </div>

        {/* Alphabet Filter Pills */}
        <div className="flex flex-wrap gap-1">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setLetterFilter(letter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                letterFilter === letter
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Dictionary List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
          {filteredIndexWords.map((item) => (
            <button
              key={item.key}
              onClick={() => speakEnglish(item.en)}
              className="p-3 rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 flex items-center justify-between text-left cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <div className="min-w-0">
                  <div className="font-extrabold text-sm text-slate-900 truncate">
                    {item.en} {item.moe1200 ? <span className="text-amber-600">*</span> : null}
                  </div>
                  <div className="text-xs text-slate-600 truncate">{item.zh}</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span
                  className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    item.tier === 'core'
                      ? 'bg-slate-900 text-white'
                      : item.tier === 'phonics'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {item.unitBadge}
                </span>
                {item.page && (
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">{item.page}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
