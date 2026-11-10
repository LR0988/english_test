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

  // Reset sub-states on tab switch
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

  // Quiz Answer Handler
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

  // Spelling Check Handler
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

  // Sentence Scramble Check
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
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-3xl p-4 shadow-sm border-2 border-amber-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            返回課文重點
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">{unitTitle}</h2>
            <p className="text-xs text-slate-500 font-medium">互動闖關練習場・進度即時儲存至雲端</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'flashcards', label: '🃏 點讀閃卡' },
            { id: 'quiz', label: '🎧 聽音選擇' },
            { id: 'spelling', label: '🔤 雙模拼字' },
            ...(scramblePool.length > 0 ? [{ id: 'scramble', label: '🚂 句子火車' }] : []),
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => switchTab(m.id as PracticeTab)}
              className={`px-4 py-2 rounded-2xl font-extrabold text-sm transition cursor-pointer ${
                tab === m.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== TAB 1: FLASHCARDS ==================== */}
      {tab === 'flashcards' && currentCard && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-200 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-500">
              字卡 {cardIdx + 1} / {vocab.length}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                currentCard.tier === 'core'
                  ? 'bg-slate-900 text-white'
                  : currentCard.tier === 'phonics'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-sky-100 text-sky-800'
              }`}
            >
              {currentCard.tier === 'core'
                ? '⬛ 黑色應用字（必背聽說讀寫）'
                : currentCard.tier === 'phonics'
                  ? '🟩 綠色自然發音字'
                  : '🟦 藍色認識字（口語練習）'}
            </span>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => {
              setFlipped((f) => !f);
              speakEnglish(currentCard.en);
            }}
            className="perspective-1000 cursor-pointer select-none my-4"
          >
            <div
              className={`relative h-72 w-full rounded-3xl transition-transform duration-500 transform-style-3d ${
                flipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 border-4 border-amber-300 flex flex-col items-center justify-center p-6 text-center shadow-inner">
                <div className="text-7xl mb-4">{currentCard.emoji}</div>
                <div className="text-4xl font-extrabold text-slate-900 tracking-wide">
                  {currentCard.en}
                </div>
                {currentCard.moe1200 && (
                  <span className="mt-2 text-xs font-bold text-amber-700 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                    ★ 教育部基本 1,200 字詞
                  </span>
                )}
                <p className="text-xs text-slate-500 mt-4 font-bold">👆 點擊卡片翻看中文解釋並聽發音</p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white border-4 border-sky-300 flex flex-col items-center justify-center p-6 text-center shadow-lg">
                <div className="text-5xl mb-3">{currentCard.emoji}</div>
                <div className="text-3xl font-extrabold mb-2">{currentCard.zh}</div>
                <div className="text-xl font-bold text-sky-100">{currentCard.en}</div>
                {currentCard.category && (
                  <span className="mt-3 text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                    {currentCard.category} {currentCard.page ? `｜${currentCard.page}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Audio + Familiarity Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => speakEnglish(currentCard.en, 0.92)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold shadow-sm cursor-pointer transition"
            >
              <Volume2 className="w-5 h-5" />
              正常發音
            </button>
            <button
              onClick={() => speakEnglish(currentCard.en, 0.6)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-extrabold shadow-sm cursor-pointer transition"
            >
              <Turtle className="w-5 h-5" />
              慢速跟讀
            </button>
          </div>

          {/* Self-Rating Stars */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">熟練度標記：</span>
              {[1, 2, 3].map((lvl) => {
                const active = (currentCardProgress?.familiarity ?? 0) >= lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      playSuccessChime();
                      onRecordWordResult(currentCard, lvl >= 2, lvl);
                    }}
                    className="p-1 cursor-pointer transition hover:scale-110"
                    title={`標記 ${lvl} 顆星`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFlipped(false);
                  setCardIdx((i) => (i - 1 + vocab.length) % vocab.length);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-sm cursor-pointer"
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
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm cursor-pointer shadow-sm"
              >
                下一張 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: LISTENING & VOCAB QUIZ ==================== */}
      {tab === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-sky-200 max-w-2xl mx-auto">
          {quizDone ? (
            <div className="text-center py-8 space-y-4">
              <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-3xl font-extrabold text-slate-800">
                闖關完成！得分 {quizScore} / {quizQuestions.length}
              </h3>
              <p className="text-slate-600 font-medium">
                答錯的單字已經自動幫 Liam 收進「錯題複習本」囉！
              </p>
              <button
                onClick={() => switchTab('quiz')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                再挑戰一次
              </button>
            </div>
          ) : quizQuestions[qIdx] ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-sky-700 bg-sky-50 px-3 py-1 rounded-full">
                  第 {qIdx + 1} / {quizQuestions.length} 題
                </span>
                <span className="text-sm font-bold text-amber-600">目前得分：{quizScore}</span>
              </div>

              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-3xl p-6 text-center mb-6 border-2 border-sky-100">
                {quizQuestions[qIdx].isListening ? (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-sky-700">🎧 聽音辨字：請聽發音選出正確的意思！</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => speakEnglish(quizQuestions[qIdx].target.en, 0.9)}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-lg shadow-md cursor-pointer"
                      >
                        <Volume2 className="w-6 h-6" />
                        播放題目發音
                      </button>
                      <button
                        onClick={() => speakEnglish(quizQuestions[qIdx].target.en, 0.58)}
                        className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm cursor-pointer"
                      >
                        <Turtle className="w-5 h-5" />
                        慢速
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-indigo-700">👀 看中文選英文：</p>
                    <div className="text-5xl">{quizQuestions[qIdx].target.emoji}</div>
                    <div className="text-3xl font-extrabold text-slate-800">
                      {quizQuestions[qIdx].target.zh}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {quizQuestions[qIdx].options.map((opt) => {
                  const isTarget = opt.key === quizQuestions[qIdx].target.key;
                  const isPicked = selectedOpt === opt.key;
                  let btnStyle =
                    'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800';
                  if (selectedOpt) {
                    if (isTarget) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200';
                    } else if (isPicked) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-200 opacity-55';
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleQuizPick(opt)}
                      className={`p-4 rounded-2xl border-2 font-extrabold text-left flex items-center gap-3 transition cursor-pointer ${btnStyle}`}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <div>
                        <div className="text-lg">
                          {quizQuestions[qIdx].isListening ? opt.zh : opt.en}
                        </div>
                        {selectedOpt && (
                          <div className="text-xs font-semibold text-slate-500">
                            {opt.en} — {opt.zh}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedOpt && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={nextQuizQuestion}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base shadow-md cursor-pointer"
                  >
                    {qIdx + 1 >= quizQuestions.length ? '查看成績 🏆' : '下一題 →'}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ==================== TAB 3: DUAL-MODE SPELLING ==================== */}
      {tab === 'spelling' && currentSpellWord && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-emerald-200 max-w-2xl mx-auto">
          {/* Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputMode('tiles')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                  inputMode === 'tiles'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                平板點選字母方塊
              </button>
              <button
                onClick={() => setInputMode('keyboard')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                  inputMode === 'keyboard'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                鍵盤打字輸入
              </button>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
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
                className="rounded accent-emerald-600 w-4 h-4"
              />
              只考黑色應用字＆自然發音字（跳過藍色認識字）
            </label>
          </div>

          {spellDone ? (
            <div className="text-center py-8 space-y-4">
              <Sparkles className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-3xl font-extrabold text-slate-800">
                拼字大挑戰完成！答對 {spellScore} / {spellingPool.length} 字
              </h3>
              <button
                onClick={() => switchTab('spelling')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                再練一輪
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                <span>
                  單字 {spellIdx + 1} / {spellingPool.length}
                </span>
                <span>得分：{spellScore}</span>
              </div>

              {/* Prompt Box */}
              <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl p-6 text-center space-y-3">
                <div className="text-6xl">{currentSpellWord.emoji}</div>
                <div className="text-2xl font-extrabold text-slate-800">{currentSpellWord.zh}</div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => speakEnglish(currentSpellWord.spellTarget, 0.88)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    聽發音拼字
                  </button>
                  <button
                    onClick={() => speakEnglish(currentSpellWord.spellTarget, 0.55)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold cursor-pointer"
                  >
                    <Turtle className="w-4 h-4" />
                    慢速
                  </button>
                </div>
              </div>

              {/* Input Area */}
              {inputMode === 'tiles' ? (
                <div className="space-y-4">
                  {/* Answer Slots */}
                  <div className="min-h-16 p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-wrap items-center justify-center gap-2">
                    {pickedTileIndices.length === 0 ? (
                      <span className="text-sm text-slate-400 font-bold">
                        請依序點選下方字母方塊拼出單字（共 {currentSpellWord.spellTarget.length} 個字元）
                      </span>
                    ) : (
                      pickedTileIndices.map((tileIdx, pos) => (
                        <button
                          key={`${tileIdx}-${pos}`}
                          disabled={spellStatus !== 'idle'}
                          onClick={() =>
                            setPickedTileIndices((prev) => prev.filter((_, idx) => idx !== pos))
                          }
                          className="w-11 h-12 rounded-xl bg-amber-400 text-slate-900 font-extrabold text-xl shadow-sm hover:bg-amber-300 cursor-pointer"
                        >
                          {letterTiles[tileIdx]}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Available Letter Tiles */}
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {letterTiles.map((ch, idx) => {
                      const used = pickedTileIndices.includes(idx);
                      return (
                        <button
                          key={idx}
                          disabled={used || spellStatus !== 'idle'}
                          onClick={() => setPickedTileIndices((prev) => [...prev, idx])}
                          className={`w-12 h-13 rounded-2xl font-extrabold text-xl border-b-4 transition cursor-pointer ${
                            used
                              ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                              : 'bg-white hover:bg-emerald-50 text-slate-800 border-emerald-300 shadow-sm active:translate-y-0.5'
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
                    className="w-full text-center text-2xl font-extrabold py-4 px-4 rounded-2xl border-2 border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
                  />
                </div>
              )}

              {/* Feedback Banner */}
              {spellStatus !== 'idle' && (
                <div
                  className={`p-4 rounded-2xl flex items-center justify-between ${
                    spellStatus === 'correct'
                      ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-900'
                      : 'bg-rose-50 border-2 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-extrabold">
                    {spellStatus === 'correct' ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <span>太棒了！完全正確：{currentSpellWord.spellTarget}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-rose-600" />
                        <span>正確拼法是：{currentSpellWord.spellTarget}（已加入錯題複習）</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={nextSpellingWord}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-sm cursor-pointer"
                  >
                    下一字 →
                  </button>
                </div>
              )}

              {spellStatus === 'idle' && (
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setPickedTileIndices([]);
                      setTypedText('');
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
                  >
                    清除重拼
                  </button>
                  <button
                    onClick={checkSpelling}
                    disabled={!currentBuiltSpelling}
                    className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-base shadow-md cursor-pointer"
                  >
                    送出檢查 ✓
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: SENTENCE SCRAMBLE TRAIN ==================== */}
      {tab === 'scramble' && currentSentence && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-purple-200 max-w-2xl mx-auto">
          {scrDone ? (
            <div className="text-center py-8 space-y-4">
              <Trophy className="w-16 h-16 text-purple-500 mx-auto" />
              <h3 className="text-3xl font-extrabold text-slate-800">
                句子火車全數到站！得分 {scrScore} / {scramblePool.length}
              </h3>
              <button
                onClick={() => switchTab('scramble')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                再玩一次
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                <span>
                  第 {scrIdx + 1} / {scramblePool.length} 句
                </span>
                <span>得分：{scrScore}</span>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-6 text-center space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-200 text-purple-900 text-xs font-extrabold">
                  🚂 請將單字車廂排成正確的英文句子
                </span>
                <div className="text-2xl font-extrabold text-slate-800">{currentSentence.zh}</div>
                <button
                  onClick={() => speakEnglish(currentSentence.en)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  聽句子提示
                </button>
              </div>

              {/* Train Track */}
              <div className="min-h-20 p-4 rounded-2xl bg-amber-50/70 border-2 border-dashed border-amber-300 flex flex-wrap items-center gap-2">
                <span className="text-2xl mr-1">🚂</span>
                {pickedWordIndices.length === 0 ? (
                  <span className="text-sm text-slate-400 font-bold">點選下方單字接上火車車廂...</span>
                ) : (
                  pickedWordIndices.map((wIdx, pos) => (
                    <button
                      key={`${wIdx}-${pos}`}
                      disabled={scrStatus !== 'idle'}
                      onClick={() =>
                        setPickedWordIndices((prev) => prev.filter((_, idx) => idx !== pos))
                      }
                      className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-extrabold text-lg shadow-sm cursor-pointer"
                    >
                      {wordTokens[wIdx]}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled Word Bank */}
              <div className="flex flex-wrap justify-center gap-3">
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
                      className={`px-4 py-3 rounded-2xl font-extrabold text-lg border-2 transition cursor-pointer ${
                        used
                          ? 'bg-slate-100 text-slate-300 border-slate-200'
                          : 'bg-white hover:bg-purple-50 text-slate-800 border-purple-300 shadow-sm'
                      }`}
                    >
                      {tok}
                    </button>
                  );
                })}
              </div>

              {scrStatus !== 'idle' ? (
                <div
                  className={`p-4 rounded-2xl flex items-center justify-between ${
                    scrStatus === 'correct'
                      ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-900'
                      : 'bg-rose-50 border-2 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="font-extrabold">
                    {scrStatus === 'correct'
                      ? `🎉 太強了！${currentSentence.en}`
                      : `💡 正確句子是：${currentSentence.en}`}
                  </div>
                  <button
                    onClick={nextScramble}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-sm cursor-pointer"
                  >
                    下一句 →
                  </button>
                </div>
              ) : (
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setPickedWordIndices([])}
                    className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer"
                  >
                    重排
                  </button>
                  <button
                    onClick={checkScramble}
                    disabled={pickedWordIndices.length !== wordTokens.length}
                    className="px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-extrabold shadow-md cursor-pointer"
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
