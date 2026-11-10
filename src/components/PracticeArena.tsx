import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Turtle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Star,
  Keyboard,
  LayoutGrid,
  ArrowLeft,
  Sparkles,
  Trophy,
  Delete,
} from 'lucide-react';
import { VocabItem, SentenceItem } from '../data/curriculum';
import { speakEnglish, playSuccessChime, playGentleRetry } from '../lib/speech';
import { WordProgressRow } from '../lib/supabase';

type PracticeTab = 'flashcards' | 'quiz' | 'spelling' | 'scramble';

interface PracticeArenaProps {
  unitId: string;
  unitTitle: string;
  vocab: VocabItem[];
  sentences: SentenceItem[];
  wordProgressMap: Record<string, WordProgressRow>;
  onRecordWordResult: (word: VocabItem, isCorrect: boolean, familiarityOverride?: number) => void;
  onFinishAttempt: (mode: string, score: number, total: number) => void;
  onBack: () => void;
  initialTab?: PracticeTab;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  unitTitle,
  vocab,
  sentences,
  wordProgressMap,
  onRecordWordResult,
  onFinishAttempt,
  onBack,
  initialTab = 'flashcards',
}) => {
  const [tab, setTab] = useState<PracticeTab>(initialTab);

  // ==================== 1. Flashcards State ====================
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // ==================== 2. Quiz State ====================
  const quizQuestions = useMemo(() => {
    const pool = shuffleArray(vocab).slice(0, Math.min(8, vocab.length));
    return pool.map((target, idx) => {
      const distractors = shuffleArray(vocab.filter((v) => v.key !== target.key))
        .slice(0, 3);
      const options = shuffleArray([target, ...distractors]);
      const isListening = idx % 2 === 0;
      return {
        target,
        options,
        isListening,
      };
    });
  }, [vocab]);

  const [qIdx, setQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    if (tab === 'quiz' && !quizDone && quizQuestions[qIdx]?.isListening) {
      speakEnglish(quizQuestions[qIdx].target.en);
    }
  }, [tab, qIdx, quizDone, quizQuestions]);

  // ==================== 3. Spelling State ====================
  const [onlyCoreWords, setOnlyCoreWords] = useState(true);
  const [inputMode, setInputMode] = useState<'tiles' | 'keyboard'>('tiles');
  const spellingPool = useMemo(() => {
    const filtered = onlyCoreWords
      ? vocab.filter((v) => v.tier === 'core' || v.tier === 'phonics')
      : vocab;
    return filtered.length > 0 ? filtered : vocab;
  }, [vocab, onlyCoreWords]);

  const [spellIdx, setSpellIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [pickedTileIndices, setPickedTileIndices] = useState<number[]>([]);
  const [spellStatus, setSpellStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [spellScore, setSpellScore] = useState(0);
  const [spellDone, setSpellDone] = useState(false);

  const currentSpellWord = spellingPool[spellIdx % Math.max(1, spellingPool.length)];
  const letterTiles = useMemo(() => {
    if (!currentSpellWord) return [];
    const chars = currentSpellWord.spellTarget.split('');
    const extraLetters = 'aeioubcdfghlmnprst'.split('');
    const bonus = shuffleArray(extraLetters).slice(0, Math.min(3, Math.max(1, 10 - chars.length)));
    return shuffleArray([...chars, ...bonus]);
  }, [currentSpellWord]);

  // ==================== 4. Sentence Scramble State ====================
  const scramblePool = useMemo(() => {
    return sentences.filter((s) => s.en.split(' ').length >= 3);
  }, [sentences]);
  const [scrIdx, setScrIdx] = useState(0);
  const [pickedWordIndices, setPickedWordIndices] = useState<number[]>([]);
  const [scrStatus, setScrStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [scrScore, setScrScore] = useState(0);
  const [scrDone, setScrDone] = useState(false);

  const currentSentence = scramblePool[scrIdx % Math.max(1, scramblePool.length)];
  const wordTokens = useMemo(() => {
    if (!currentSentence) return [];
    return shuffleArray(currentSentence.en.split(' '));
  }, [currentSentence]);

  const switchTab = (next: PracticeTab) => {
    setTab(next);
    setFlipped(false);
    if (next === 'quiz') {
      setQIdx(0);
      setSelectedOpt(null);
      setQuizScore(0);
      setQuizDone(false);
    } else if (next === 'spelling') {
      setSpellIdx(0);
      setTypedText('');
      setPickedTileIndices([]);
      setSpellStatus('idle');
      setSpellScore(0);
      setSpellDone(false);
    } else if (next === 'scramble') {
      setScrIdx(0);
      setPickedWordIndices([]);
      setScrStatus('idle');
      setScrScore(0);
      setScrDone(false);
    }
  };

  const handleQuizPick = (opt: VocabItem) => {
    if (selectedOpt) return;
    setSelectedOpt(opt.key);
    const currentQ = quizQuestions[qIdx];
    const ok = opt.key === currentQ.target.key;
    speakEnglish(opt.en);
    if (ok) {
      playSuccessChime();
      setQuizScore((s) => s + 1);
      onRecordWordResult(currentQ.target, true);
    } else {
      playGentleRetry();
      onRecordWordResult(currentQ.target, false);
    }
  };

  const nextQuizQuestion = () => {
    if (qIdx + 1 >= quizQuestions.length) {
      setQuizDone(true);
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      onFinishAttempt('quiz', quizScore, quizQuestions.length);
    } else {
      setSelectedOpt(null);
      setQIdx((i) => i + 1);
    }
  };

  const currentBuiltSpelling =
    inputMode === 'tiles'
      ? pickedTileIndices.map((i) => letterTiles[i]).join('')
      : typedText.trim();

  const checkSpelling = () => {
    if (!currentSpellWord || spellStatus !== 'idle') return;
    const isOk =
      currentBuiltSpelling.toLowerCase() === currentSpellWord.spellTarget.toLowerCase();
    if (isOk) {
      setSpellStatus('correct');
      playSuccessChime();
      speakEnglish(currentSpellWord.en);
      setSpellScore((s) => s + 1);
      onRecordWordResult(currentSpellWord, true);
    } else {
      setSpellStatus('wrong');
      playGentleRetry();
      onRecordWordResult(currentSpellWord, false);
    }
  };

  const nextSpellingWord = () => {
    if (spellIdx + 1 >= spellingPool.length) {
      setSpellDone(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onFinishAttempt('spelling', spellScore, spellingPool.length);
    } else {
      setSpellIdx((i) => i + 1);
      setTypedText('');
      setPickedTileIndices([]);
      setSpellStatus('idle');
    }
  };

  const builtSentence = pickedWordIndices.map((i) => wordTokens[i]).join(' ');

  const checkScramble = () => {
    if (!currentSentence || scrStatus !== 'idle') return;
    const isOk = builtSentence.trim() === currentSentence.en.trim();
    if (isOk) {
      setScrStatus('correct');
      playSuccessChime();
      speakEnglish(currentSentence.en);
      setScrScore((s) => s + 1);
    } else {
      setScrStatus('wrong');
      playGentleRetry();
    }
  };

  const nextScramble = () => {
    if (scrIdx + 1 >= scramblePool.length) {
      setScrDone(true);
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      onFinishAttempt('sentence', scrScore, scramblePool.length);
    } else {
      setScrIdx((i) => i + 1);
      setPickedWordIndices([]);
      setScrStatus('idle');
    }
  };

  const currentCard = vocab[cardIdx % Math.max(1, vocab.length)];
  const currentCardProgress = currentCard ? wordProgressMap[currentCard.key] : undefined;

  return (
    <div className="space-y-6">
      {/* Top Bar - Big iPad Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border-2 border-amber-200">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-extrabold text-base sm:text-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            返回課文
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{unitTitle}</h2>
            <p className="text-sm text-slate-500 font-bold">iPad 觸控大字闖關區</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5">
          {[
            { id: 'flashcards', label: '🃏 點讀閃卡' },
            { id: 'quiz', label: '🎧 聽音選擇' },
            { id: 'spelling', label: '🔤 拼字闖關' },
            ...(scramblePool.length > 0 ? [{ id: 'scramble', label: '🚂 句子火車' }] : []),
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => switchTab(m.id as PracticeTab)}
              className={`px-5 py-3.5 rounded-2xl font-extrabold text-base sm:text-lg transition active:scale-95 cursor-pointer ${
                tab === m.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'bg-amber-50 text-amber-950 hover:bg-amber-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== TAB 1: EXTRA-LARGE IPAD FLASHCARDS ==================== */}
      {tab === 'flashcards' && currentCard && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-md border-2 border-amber-200 max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <span className="text-lg font-extrabold text-slate-600">
              字卡 {cardIdx + 1} / {vocab.length}
            </span>
            <span
              className={`px-4 py-1.5 rounded-full text-sm sm:text-base font-extrabold ${
                currentCard.tier === 'core'
                  ? 'bg-slate-900 text-white'
                  : currentCard.tier === 'phonics'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-sky-100 text-sky-900'
              }`}
            >
              {currentCard.tier === 'core'
                ? '⬛ 黑色應用字（必背聽說讀寫）'
                : currentCard.tier === 'phonics'
                  ? '🟩 綠色自然發音字'
                  : '🟦 藍色認識字（口語練習）'}
            </span>
          </div>

          {/* Giant 3D Flip Card */}
          <div
            onClick={() => {
              setFlipped((f) => !f);
              speakEnglish(currentCard.en);
            }}
            className="perspective-1000 cursor-pointer select-none my-4"
          >
            <div
              className={`relative h-88 sm:h-96 w-full rounded-[2rem] transition-transform duration-500 transform-style-3d ${
                flipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden rounded-[2rem] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 border-4 border-amber-300 flex flex-col items-center justify-center p-8 text-center shadow-inner">
                <div className="text-8xl mb-5">{currentCard.emoji}</div>
                <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-wide">
                  {currentCard.en}
                </div>
                {currentCard.moe1200 && (
                  <span className="mt-3 text-sm font-extrabold text-amber-800 bg-amber-200/80 px-3.5 py-1 rounded-full">
                    ★ 教育部基本 1,200 字詞
                  </span>
                )}
                <p className="text-base text-slate-500 mt-6 font-extrabold">
                  👆 點一下卡片翻面看中文解釋並聽發音
                </p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[2rem] bg-gradient-to-br from-sky-500 to-indigo-600 text-white border-4 border-sky-300 flex flex-col items-center justify-center p-8 text-center shadow-lg">
                <div className="text-7xl mb-4">{currentCard.emoji}</div>
                <div className="text-4xl sm:text-5xl font-extrabold mb-3">{currentCard.zh}</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-100">
                  {currentCard.en}
                </div>
                {currentCard.category && (
                  <span className="mt-4 text-sm bg-white/20 px-4 py-1.5 rounded-full font-extrabold">
                    {currentCard.category} {currentCard.page ? `｜${currentCard.page}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Big Audio Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-7">
            <button
              onClick={() => speakEnglish(currentCard.en, 0.92)}
              className="py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-extrabold text-xl shadow-md flex items-center justify-center gap-2.5 cursor-pointer transition"
            >
              <Volume2 className="w-6 h-6" />
              正常發音
            </button>
            <button
              onClick={() => speakEnglish(currentCard.en, 0.58)}
              className="py-4 px-6 rounded-2xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-extrabold text-xl shadow-md flex items-center justify-center gap-2.5 cursor-pointer transition"
            >
              <Turtle className="w-6 h-6" />
              慢速跟讀
            </button>
          </div>

          {/* Self-Rating Stars & Prev/Next */}
          <div className="mt-7 pt-6 border-t-2 border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-600">熟練星等：</span>
              {[1, 2, 3].map((lvl) => {
                const active = (currentCardProgress?.familiarity ?? 0) >= lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      playSuccessChime();
                      onRecordWordResult(currentCard, lvl >= 2, lvl);
                    }}
                    className="p-2 cursor-pointer transition active:scale-125"
                    title={`標記 ${lvl} 顆星`}
                  >
                    <Star
                      className={`w-9 h-9 ${
                        active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setFlipped(false);
                  setCardIdx((i) => (i - 1 + vocab.length) % vocab.length);
                }}
                className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 font-extrabold text-lg cursor-pointer"
              >
                ← 上一張
              </button>
              <button
                onClick={() => {
                  setFlipped(false);
                  const next = (cardIdx + 1) % vocab.length;
                  setCardIdx(next);
                  speakEnglish(vocab[next].en);
                }}
                className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-lg cursor-pointer shadow-md"
              >
                下一張 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: LARGE QUIZ ==================== */}
      {tab === 'quiz' && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-md border-2 border-sky-200 max-w-3xl mx-auto">
          {quizDone ? (
            <div className="text-center py-10 space-y-5">
              <Trophy className="w-20 h-20 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-4xl font-extrabold text-slate-900">
                闖關完成！得分 {quizScore} / {quizQuestions.length}
              </h3>
              <p className="text-lg text-slate-600 font-bold">
                答錯的單字已經自動收進頂端的「錯題本」囉！
              </p>
              <button
                onClick={() => switchTab('quiz')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-extrabold text-xl cursor-pointer shadow-md"
              >
                <RotateCcw className="w-6 h-6" />
                再挑戰一次
              </button>
            </div>
          ) : quizQuestions[qIdx] ? (
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-base sm:text-lg font-extrabold text-sky-800 bg-sky-100 px-4 py-1.5 rounded-full">
                  第 {qIdx + 1} / {quizQuestions.length} 題
                </span>
                <span className="text-lg font-extrabold text-amber-600">目前得分：{quizScore}</span>
              </div>

              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-3xl p-7 text-center mb-6 border-2 border-sky-100">
                {quizQuestions[qIdx].isListening ? (
                  <div className="space-y-4">
                    <p className="text-lg font-extrabold text-sky-800">
                      🎧 聽音辨字：請聽發音選出正確的意思！
                    </p>
                    <div className="flex flex-wrap justify-center gap-3.5">
                      <button
                        onClick={() => speakEnglish(quizQuestions[qIdx].target.en, 0.9)}
                        className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-xl shadow-md cursor-pointer"
                      >
                        <Volume2 className="w-7 h-7" />
                        播放題目發音
                      </button>
                      <button
                        onClick={() => speakEnglish(quizQuestions[qIdx].target.en, 0.58)}
                        className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-lg cursor-pointer"
                      >
                        <Turtle className="w-6 h-6" />
                        慢速
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-extrabold text-indigo-700">👀 看中文選英文：</p>
                    <div className="text-7xl py-1">{quizQuestions[qIdx].target.emoji}</div>
                    <div className="text-4xl font-extrabold text-slate-900">
                      {quizQuestions[qIdx].target.zh}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizQuestions[qIdx].options.map((opt) => {
                  const isTarget = opt.key === quizQuestions[qIdx].target.key;
                  const isPicked = selectedOpt === opt.key;
                  let btnStyle =
                    'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-900';
                  if (selectedOpt) {
                    if (isTarget) {
                      btnStyle =
                        'bg-emerald-50 border-emerald-500 text-emerald-950 ring-4 ring-emerald-200';
                    } else if (isPicked) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-200 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleQuizPick(opt)}
                      className={`p-6 rounded-3xl border-3 font-extrabold text-left flex items-center gap-4 transition active:scale-[0.98] cursor-pointer ${btnStyle}`}
                    >
                      <span className="text-5xl shrink-0">{opt.emoji}</span>
                      <div>
                        <div className="text-2xl sm:text-3xl leading-snug">
                          {quizQuestions[qIdx].isListening ? opt.zh : opt.en}
                        </div>
                        {selectedOpt && (
                          <div className="text-base font-bold text-slate-600 mt-1">
                            {opt.en} — {opt.zh}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedOpt && (
                <div className="mt-7 flex justify-end">
                  <button
                    onClick={nextQuizQuestion}
                    className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xl shadow-md cursor-pointer"
                  >
                    {qIdx + 1 >= quizQuestions.length ? '查看成績 🏆' : '下一題 →'}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ==================== TAB 3: IPAD GIANT TILE SPELLING ==================== */}
      {tab === 'spelling' && currentSpellWord && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-md border-2 border-emerald-200 max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b-2 border-slate-100">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setInputMode('tiles')}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-base font-extrabold cursor-pointer active:scale-95 ${
                  inputMode === 'tiles'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                iPad 點選字母方塊
              </button>
              <button
                onClick={() => setInputMode('keyboard')}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-base font-extrabold cursor-pointer active:scale-95 ${
                  inputMode === 'keyboard'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Keyboard className="w-5 h-5" />
                鍵盤打字
              </button>
            </div>

            <label className="inline-flex items-center gap-2.5 text-base font-extrabold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyCoreWords}
                onChange={(e) => {
                  setOnlyCoreWords(e.target.checked);
                  setSpellIdx(0);
                  setPickedTileIndices([]);
                  setTypedText('');
                  setSpellStatus('idle');
                }}
                className="rounded accent-emerald-600 w-5 h-5"
              />
              只考必背黑色字＆自然發音字
            </label>
          </div>

          {spellDone ? (
            <div className="text-center py-10 space-y-5">
              <Sparkles className="w-20 h-20 text-emerald-500 mx-auto" />
              <h3 className="text-4xl font-extrabold text-slate-900">
                拼字大挑戰完成！答對 {spellScore} / {spellingPool.length} 字
              </h3>
              <button
                onClick={() => switchTab('spelling')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xl cursor-pointer"
              >
                <RotateCcw className="w-6 h-6" />
                再練一輪
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-lg font-extrabold text-slate-600">
                <span>
                  單字 {spellIdx + 1} / {spellingPool.length}
                </span>
                <span>得分：{spellScore}</span>
              </div>

              {/* Prompt Box */}
              <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl p-7 text-center space-y-4">
                <div className="text-7xl">{currentSpellWord.emoji}</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {currentSpellWord.zh}
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => speakEnglish(currentSpellWord.spellTarget, 0.88)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-lg font-extrabold cursor-pointer shadow-sm"
                  >
                    <Volume2 className="w-5 h-5" />
                    聽發音拼字
                  </button>
                  <button
                    onClick={() => speakEnglish(currentSpellWord.spellTarget, 0.55)}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-lg font-extrabold cursor-pointer shadow-sm"
                  >
                    <Turtle className="w-5 h-5" />
                    慢速
                  </button>
                </div>
              </div>

              {/* Giant iPad Letter Tiles */}
              {inputMode === 'tiles' ? (
                <div className="space-y-5">
                  <div className="min-h-22 p-4 rounded-3xl bg-slate-50 border-3 border-dashed border-slate-300 flex flex-wrap items-center justify-center gap-2.5">
                    {pickedTileIndices.length === 0 ? (
                      <span className="text-lg text-slate-400 font-extrabold">
                        請點選下方大字母方塊拼出單字（共 {currentSpellWord.spellTarget.length} 個字元）
                      </span>
                    ) : (
                      pickedTileIndices.map((tileIdx, pos) => (
                        <button
                          key={`${tileIdx}-${pos}`}
                          disabled={spellStatus !== 'idle'}
                          onClick={() =>
                            setPickedTileIndices((prev) => prev.filter((_, idx) => idx !== pos))
                          }
                          className="w-15 h-16 sm:w-16 sm:h-18 rounded-2xl bg-amber-400 text-slate-950 font-black text-3xl shadow-md active:scale-90 cursor-pointer"
                        >
                          {letterTiles[tileIdx]}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    {letterTiles.map((ch, idx) => {
                      const used = pickedTileIndices.includes(idx);
                      return (
                        <button
                          key={idx}
                          disabled={used || spellStatus !== 'idle'}
                          onClick={() => setPickedTileIndices((prev) => [...prev, idx])}
                          className={`w-16 h-17 sm:w-18 sm:h-19 rounded-2xl font-black text-3xl border-b-4 transition active:scale-90 cursor-pointer ${
                            used
                              ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                              : 'bg-white hover:bg-emerald-50 text-slate-900 border-emerald-400 shadow-md'
                          }`}
                        >
                          {ch === ' ' ? '␣' : ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={typedText}
                    disabled={spellStatus !== 'idle'}
                    onChange={(e) => setTypedText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (spellStatus === 'idle') checkSpelling();
                        else nextSpellingWord();
                      }
                    }}
                    placeholder={`輸入英文單字（${currentSpellWord.spellTarget.length} 個字元）`}
                    className="w-full text-center text-4xl font-black py-5 px-5 rounded-3xl border-3 border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
                  />
                </div>
              )}

              {spellStatus !== 'idle' && (
                <div
                  className={`p-5 rounded-3xl flex flex-wrap items-center justify-between gap-3 ${
                    spellStatus === 'correct'
                      ? 'bg-emerald-50 border-3 border-emerald-400 text-emerald-950'
                      : 'bg-rose-50 border-3 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-3 text-xl font-extrabold">
                    {spellStatus === 'correct' ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                        <span>太棒了！完全正確：{currentSpellWord.spellTarget}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
                        <span>正確拼法是：{currentSpellWord.spellTarget}（已收進錯題本）</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={nextSpellingWord}
                    className="px-7 py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold text-lg cursor-pointer active:scale-95"
                  >
                    下一字 →
                  </button>
                </div>
              )}

              {spellStatus === 'idle' && (
                <div className="flex flex-wrap justify-center gap-3.5">
                  {inputMode === 'tiles' && (
                    <button
                      onClick={() => setPickedTileIndices((prev) => prev.slice(0, -1))}
                      disabled={pickedTileIndices.length === 0}
                      className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-950 font-extrabold text-lg cursor-pointer active:scale-95"
                    >
                      <Delete className="w-5 h-5" />
                      退一格
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setPickedTileIndices([]);
                      setTypedText('');
                    }}
                    className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-lg cursor-pointer active:scale-95"
                  >
                    清除重拼
                  </button>
                  <button
                    onClick={checkSpelling}
                    disabled={!currentBuiltSpelling}
                    className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xl shadow-md cursor-pointer active:scale-95"
                  >
                    送出檢查 ✓
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: GIANT SENTENCE SCRAMBLE TRAIN ==================== */}
      {tab === 'scramble' && currentSentence && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-md border-2 border-purple-200 max-w-3xl mx-auto">
          {scrDone ? (
            <div className="text-center py-10 space-y-5">
              <Trophy className="w-20 h-20 text-purple-500 mx-auto" />
              <h3 className="text-4xl font-extrabold text-slate-900">
                句子火車全數到站！得分 {scrScore} / {scramblePool.length}
              </h3>
              <button
                onClick={() => switchTab('scramble')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-xl cursor-pointer"
              >
                <RotateCcw className="w-6 h-6" />
                再玩一次
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-lg font-extrabold text-slate-600">
                <span>
                  第 {scrIdx + 1} / {scramblePool.length} 句
                </span>
                <span>得分：{scrScore}</span>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-7 text-center space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-purple-200 text-purple-950 text-sm font-extrabold">
                  🚂 請點選單字車廂排成正確的英文句子
                </span>
                <div className="text-3xl font-extrabold text-slate-900">{currentSentence.zh}</div>
                <button
                  onClick={() => speakEnglish(currentSentence.en)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-lg font-extrabold cursor-pointer shadow-sm"
                >
                  <Volume2 className="w-5 h-5" />
                  聽句子提示
                </button>
              </div>

              {/* Train Track */}
              <div className="min-h-24 p-5 rounded-3xl bg-amber-50/70 border-3 border-dashed border-amber-300 flex flex-wrap items-center gap-3">
                <span className="text-4xl mr-1">🚂</span>
                {pickedWordIndices.length === 0 ? (
                  <span className="text-lg text-slate-400 font-extrabold">
                    點選下方大單字卡接上火車車廂...
                  </span>
                ) : (
                  pickedWordIndices.map((wIdx, pos) => (
                    <button
                      key={`${wIdx}-${pos}`}
                      disabled={scrStatus !== 'idle'}
                      onClick={() =>
                        setPickedWordIndices((prev) => prev.filter((_, idx) => idx !== pos))
                      }
                      className="px-5 py-3.5 rounded-2xl bg-purple-600 text-white font-extrabold text-2xl shadow-md active:scale-95 cursor-pointer"
                    >
                      {wordTokens[wIdx]}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled Word Bank */}
              <div className="flex flex-wrap justify-center gap-3.5">
                {wordTokens.map((tok, idx) => {
                  const used = pickedWordIndices.includes(idx);
                  return (
                    <button
                      key={idx}
                      disabled={used || scrStatus !== 'idle'}
                      onClick={() => {
                        speakEnglish(tok);
                        setPickedWordIndices((prev) => [...prev, idx]);
                      }}
                      className={`px-6 py-4 rounded-2xl font-extrabold text-2xl border-3 transition active:scale-95 cursor-pointer ${
                        used
                          ? 'bg-slate-100 text-slate-300 border-slate-200'
                          : 'bg-white hover:bg-purple-50 text-slate-900 border-purple-300 shadow-md'
                      }`}
                    >
                      {tok}
                    </button>
                  );
                })}
              </div>

              {scrStatus !== 'idle' ? (
                <div
                  className={`p-5 rounded-3xl flex flex-wrap items-center justify-between gap-3 ${
                    scrStatus === 'correct'
                      ? 'bg-emerald-50 border-3 border-emerald-400 text-emerald-950'
                      : 'bg-rose-50 border-3 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="text-xl font-extrabold">
                    {scrStatus === 'correct'
                      ? `🎉 太強了！${currentSentence.en}`
                      : `💡 正確句子是：${currentSentence.en}`}
                  </div>
                  <button
                    onClick={nextScramble}
                    className="px-7 py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold text-lg cursor-pointer active:scale-95"
                  >
                    下一句 →
                  </button>
                </div>
              ) : (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setPickedWordIndices([])}
                    className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-800 font-extrabold text-lg cursor-pointer active:scale-95"
                  >
                    全部重排
                  </button>
                  <button
                    onClick={checkScramble}
                    disabled={pickedWordIndices.length !== wordTokens.length}
                    className="px-10 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-extrabold text-xl shadow-md cursor-pointer active:scale-95"
                  >
                    發車檢查 ✓
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
