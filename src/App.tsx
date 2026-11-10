import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Cloud,
  Flame,
  LogOut,
  Turtle,
  Rabbit,
  BookmarkCheck,
  Trophy,
  Star,
} from 'lucide-react';
import {
  supabase,
  fetchAllUserProgress,
  LearnerProfile,
  WordProgressRow,
  QuizAttemptRow,
} from './lib/supabase';
import { setGlobalSpeechRate } from './lib/speech';
import {
  UNITS_DATA,
  VocabItem,
  getAllVocabWithUnit,
} from './data/curriculum';
import { LoginScreen } from './components/LoginScreen';
import { UnitExplorer } from './components/UnitExplorer';
import { PracticeArena } from './components/PracticeArena';
import { CultureAndExtras } from './components/CultureAndExtras';
import { GamesAndChecklist } from './components/GamesAndChecklist';

type MainView =
  | { kind: 'unit'; unitId: string }
  | {
      kind: 'practice';
      unitId: string;
      initialTab: 'flashcards' | 'quiz' | 'spelling' | 'scramble';
      isMistakeReview?: boolean;
    }
  | { kind: 'extras' }
  | {
      kind: 'games';
      sub: 'magic_e' | 'board_game' | 'word_hunt' | 'index_checklist';
    };

const AVATAR_CHOICES = ['🦁', '🦖', '🚀', '🦊', '🐼', '🐶', '⚡'];

export const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [wordProgressMap, setWordProgressMap] = useState<Record<string, WordProgressRow>>({});
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [recentAttempts, setRecentAttempts] = useState<QuizAttemptRow[]>([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [view, setView] = useState<MainView>({ kind: 'unit', unitId: 'unit-1' });

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load progress from Supabase once logged in
  const loadCloudData = useCallback(async (userId: string) => {
    setSyncing(true);
    try {
      const data = await fetchAllUserProgress(userId);
      const todayStr = new Date().toISOString().slice(0, 10);

      let updatedProfile = data.profile;
      if (updatedProfile.last_study_date !== todayStr) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const nextStreak =
          updatedProfile.last_study_date === yesterday
            ? updatedProfile.streak_days + 1
            : Math.max(1, updatedProfile.streak_days);

        updatedProfile = {
          ...updatedProfile,
          streak_days: nextStreak,
          last_study_date: todayStr,
        };
        await supabase
          .from('learner_profiles')
          .update({
            streak_days: nextStreak,
            last_study_date: todayStr,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }

      setProfile(updatedProfile);
      setGlobalSpeechRate(Number(updatedProfile.speech_rate) || 0.9);

      const wMap: Record<string, WordProgressRow> = {};
      for (const w of data.words) {
        wMap[w.word_key] = w;
      }
      setWordProgressMap(wMap);

      const cMap: Record<string, boolean> = {};
      for (const c of data.checklist) {
        if (c.completed) cMap[c.item_key] = true;
      }
      setCompletedItems(cMap);
      setRecentAttempts(data.attempts);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      loadCloudData(session.user.id);
    }
  }, [session?.user?.id, loadCloudData]);

  // Helper: Add XP
  const addXp = async (deltaXp: number) => {
    if (!session?.user?.id || !profile || deltaXp <= 0) return;
    const nextXp = profile.total_xp + deltaXp;
    setProfile({ ...profile, total_xp: nextXp });
    setSyncing(true);
    await supabase
      .from('learner_profiles')
      .update({ total_xp: nextXp, updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id);
    setSyncing(false);
  };

  // Record Word Progress
  const handleRecordWordResult = async (
    word: VocabItem,
    isCorrect: boolean,
    familiarityOverride?: number
  ) => {
    if (!session?.user?.id) return;
    const existing = wordProgressMap[word.key];
    const nextCorrect = (existing?.correct_count ?? 0) + (isCorrect ? 1 : 0);
    const nextWrong = (existing?.wrong_count ?? 0) + (isCorrect ? 0 : 1);
    const nextFam =
      familiarityOverride ??
      (isCorrect
        ? Math.min(3, (existing?.familiarity ?? 0) + 1)
        : Math.max(1, (existing?.familiarity ?? 1) - 1));
    const nextNeedsReview = !isCorrect ? true : nextCorrect >= 2 ? false : existing?.needs_review ?? false;

    const unitOwner =
      UNITS_DATA.find((u) => u.vocab.some((v) => v.key === word.key))?.id ?? 'unit-1';

    const updatedRow: WordProgressRow = {
      word_key: word.key,
      unit_id: unitOwner,
      familiarity: nextFam,
      correct_count: nextCorrect,
      wrong_count: nextWrong,
      needs_review: nextNeedsReview,
    };

    setWordProgressMap((prev) => ({ ...prev, [word.key]: updatedRow }));
    setSyncing(true);
    await supabase.from('word_progress').upsert(
      {
        user_id: session.user.id,
        ...updatedRow,
        last_practiced_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,word_key' }
    );
    if (isCorrect) {
      await addXp(3);
    }
    setSyncing(false);
  };

  // Record Quiz / Game Attempt
  const handleFinishAttempt = async (
    unitId: string,
    mode: string,
    score: number,
    total: number
  ) => {
    if (!session?.user?.id || total <= 0) return;
    const ratio = score / total;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    const xpEarned = score * 5 + stars * 5;

    const newAttempt: QuizAttemptRow = {
      unit_id: unitId,
      mode,
      score,
      total_questions: total,
      stars_earned: stars,
      xp_earned: xpEarned,
      created_at: new Date().toISOString(),
    };

    setRecentAttempts((prev) => [newAttempt, ...prev.slice(0, 19)]);
    setSyncing(true);
    await Promise.all([
      supabase.from('quiz_attempts').insert({
        user_id: session.user.id,
        unit_id: unitId,
        mode,
        score,
        total_questions: total,
        stars_earned: stars,
        xp_earned: xpEarned,
      }),
      addXp(xpEarned),
    ]);
    setSyncing(false);
  };

  // Toggle Checklist / Word Hunt / Magic e item
  const handleToggleItem = async (
    itemKey: string,
    category: 'checklist' | 'word_hunt' | 'magic_e'
  ) => {
    if (!session?.user?.id) return;
    const nextVal = !completedItems[itemKey];
    setCompletedItems((prev) => ({ ...prev, [itemKey]: nextVal }));
    setSyncing(true);
    await supabase.from('checklist_progress').upsert(
      {
        user_id: session.user.id,
        item_key: itemKey,
        category,
        completed: nextVal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,item_key' }
    );
    if (nextVal) await addXp(5);
    setSyncing(false);
  };

  // Toggle Global Speech Rate
  const toggleSpeechSpeed = async () => {
    if (!profile || !session?.user?.id) return;
    const nextRate = profile.speech_rate < 0.75 ? 0.92 : 0.62;
    setGlobalSpeechRate(nextRate);
    setProfile({ ...profile, speech_rate: nextRate });
    await supabase
      .from('learner_profiles')
      .update({ speech_rate: nextRate })
      .eq('user_id', session.user.id);
  };

  // Change Avatar
  const pickAvatar = async (emoji: string) => {
    if (!profile || !session?.user?.id) return;
    setProfile({ ...profile, avatar_emoji: emoji });
    setShowAvatarPicker(false);
    await supabase
      .from('learner_profiles')
      .update({ avatar_emoji: emoji })
      .eq('user_id', session.user.id);
  };

  // Mistake Review Pool
  const mistakeVocabList = useMemo(() => {
    const all = getAllVocabWithUnit();
    return all.filter((v) => wordProgressMap[v.key]?.needs_review);
  }, [wordProgressMap]);

  const masteredCount = useMemo(() => {
    return Object.values(wordProgressMap).filter((w) => w.familiarity >= 2).length;
  }, [wordProgressMap]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-6xl animate-bounce">🦁</div>
          <div className="text-lg font-extrabold text-slate-700">正在開啟 Liam 的英語冒險島...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onSuccess={() => {}} />;
  }

  const level = Math.floor((profile?.total_xp ?? 0) / 100) + 1;
  const xpInLevel = (profile?.total_xp ?? 0) % 100;
  const isSlowSpeech = (profile?.speech_rate ?? 0.9) < 0.75;

  const currentUnit =
    UNITS_DATA.find(
      (u) =>
        (view.kind === 'unit' || view.kind === 'practice') && u.id === view.unitId
    ) ?? UNITS_DATA[3];

  return (
    <div className="min-h-screen bg-amber-50/60 flex flex-col">
      {/* ==================== STICKY HEADER ==================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Profile & Level */}
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowAvatarPicker((s) => !s)}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-3xl shadow-sm cursor-pointer hover:scale-105 transition"
              title="點擊更換小勇士頭像"
            >
              {profile?.avatar_emoji ?? '🦁'}
            </button>

            {showAvatarPicker && (
              <div className="absolute top-14 left-0 bg-white rounded-2xl shadow-xl border-2 border-amber-300 p-2.5 flex gap-1.5 z-50">
                {AVATAR_CHOICES.map((em) => (
                  <button
                    key={em}
                    onClick={() => pickAvatar(em)}
                    className="w-10 h-10 rounded-xl hover:bg-amber-100 text-2xl cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {profile?.display_name ?? 'Liam (黃尚霖)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                  Lv.{level}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                    style={{ width: `${xpInLevel}%` }}
                  />
                </div>
                <span className="text-[11px] font-extrabold text-amber-700">
                  {profile?.total_xp ?? 0} XP
                </span>
              </div>
            </div>
          </div>

          {/* Right: Stats & Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Streak */}
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-extrabold">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>連續 {profile?.streak_days ?? 1} 天</span>
            </div>

            {/* Mastered Words Count */}
            <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
              <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              <span>熟記 {masteredCount} 字</span>
            </div>

            {/* Mistake Review Book */}
            <button
              onClick={() => {
                if (mistakeVocabList.length > 0) {
                  setView({
                    kind: 'practice',
                    unitId: 'mistakes',
                    initialTab: 'quiz',
                    isMistakeReview: true,
                  });
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                mistakeVocabList.length > 0
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-default'
              }`}
              title={
                mistakeVocabList.length > 0
                  ? '點擊複習答錯過的單字'
                  : '目前沒有待複習錯題，太棒了！'
              }
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>錯題本 ({mistakeVocabList.length})</span>
            </button>

            {/* Speech Speed Toggle */}
            <button
              onClick={toggleSpeechSpeed}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer transition ${
                isSlowSpeech
                  ? 'bg-teal-600 text-white border-teal-700'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
              }`}
            >
              {isSlowSpeech ? <Turtle className="w-4 h-4" /> : <Rabbit className="w-4 h-4" />}
              <span>{isSlowSpeech ? '慢速跟讀中' : '正常語速'}</span>
            </button>

            {/* Cloud Sync Status */}
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold"
              title="學習進度自動同步至 Supabase"
            >
              <Cloud className={`w-3.5 h-3.5 ${syncing ? 'animate-pulse text-sky-500' : 'text-emerald-600'}`} />
              <span className="hidden md:inline">{syncing ? '同步中' : '已雲端同步'}</span>
            </div>

            {/* Sign Out */}
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
              title="登出"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MAIN LAYOUT ==================== */}
      <div className="max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Group 1: Starter & Get Ready */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border-2 border-amber-100 space-y-2">
            <div className="text-xs font-black text-amber-700 px-2 uppercase tracking-wider">
              一、課前複習（p.4–14）
            </div>
            {UNITS_DATA.filter((u) => u.section === 'starter').map((u) => {
              const active =
                (view.kind === 'unit' || view.kind === 'practice') && view.unitId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setView({ kind: 'unit', unitId: u.id })}
                  className={`w-full px-3 py-2.5 rounded-2xl text-left flex items-center gap-2.5 text-sm font-extrabold transition cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'hover:bg-amber-50 text-slate-700'
                  }`}
                >
                  <span className="text-xl">{u.heroEmoji}</span>
                  <div className="min-w-0">
                    <div className="truncate">{u.badge}</div>
                    <div
                      className={`text-[11px] font-semibold truncate ${
                        active ? 'text-amber-100' : 'text-slate-400'
                      }`}
                    >
                      {u.titleZh}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group 2: Core Units 1-4 & Reviews */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border-2 border-sky-100 space-y-2">
            <div className="text-xs font-black text-sky-700 px-2 uppercase tracking-wider">
              二、核心單元與複習（p.15–78）
            </div>
            {UNITS_DATA.filter((u) => u.section === 'core').map((u) => {
              const active =
                (view.kind === 'unit' || view.kind === 'practice') && view.unitId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setView({ kind: 'unit', unitId: u.id })}
                  className={`w-full px-3 py-2.5 rounded-2xl text-left flex items-center gap-2.5 text-sm font-extrabold transition cursor-pointer ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'hover:bg-sky-50 text-slate-700'
                  }`}
                >
                  <span className="text-xl">{u.heroEmoji}</span>
                  <div className="min-w-0">
                    <div className="truncate">
                      {u.badge}: {u.titleEn}
                    </div>
                    <div
                      className={`text-[11px] font-semibold truncate ${
                        active ? 'text-sky-100' : 'text-slate-400'
                      }`}
                    >
                      {u.pages}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group 3: Culture & Extras */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border-2 border-purple-100 space-y-2">
            <div className="text-xs font-black text-purple-700 px-2 uppercase tracking-wider">
              三、文化節慶與跨域（p.79–91）
            </div>
            {UNITS_DATA.filter((u) => u.section === 'culture').map((u) => {
              const active =
                (view.kind === 'unit' || view.kind === 'practice') && view.unitId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setView({ kind: 'unit', unitId: u.id })}
                  className={`w-full px-3 py-2.5 rounded-2xl text-left flex items-center gap-2.5 text-sm font-extrabold transition cursor-pointer ${
                    active
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'hover:bg-purple-50 text-slate-700'
                  }`}
                >
                  <span className="text-xl">{u.heroEmoji}</span>
                  <div className="min-w-0">
                    <div className="truncate">{u.titleEn}</div>
                    <div
                      className={`text-[11px] font-semibold truncate ${
                        active ? 'text-purple-100' : 'text-slate-400'
                      }`}
                    >
                      萬聖節（p.79–83）
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => setView({ kind: 'extras' })}
              className={`w-full px-3 py-2.5 rounded-2xl text-left flex items-center gap-2.5 text-sm font-extrabold transition cursor-pointer ${
                view.kind === 'extras'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'hover:bg-rose-50 text-slate-700'
              }`}
            >
              <span className="text-xl">🌏</span>
              <div className="min-w-0">
                <div className="truncate">求救寫作・臺灣氣溫・世界時鐘</div>
                <div
                  className={`text-[11px] font-semibold truncate ${
                    view.kind === 'extras' ? 'text-rose-100' : 'text-slate-400'
                  }`}
                >
                  第 84–91 頁跨域實境
                </div>
              </div>
            </button>
          </div>

          {/* Group 4: Games & Appendices */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border-2 border-emerald-100 space-y-2">
            <div className="text-xs font-black text-emerald-700 px-2 uppercase tracking-wider">
              四、魔法配件與檢核（p.92–112）
            </div>
            {[
              { sub: 'magic_e' as const, emoji: '🪄', title: 'Magic e 折疊翻翻卡', desc: '長短母音視覺變身' },
              { sub: 'board_game' as const, emoji: '🏖️', title: '沙灘猜拳闖關桌遊', desc: '四大核心句型對戰' },
              { sub: 'word_hunt' as const, emoji: '🧙🏻‍♀️', title: '女巫帽尋字雲 Word Hunt', desc: '第 112 頁放大鏡尋字' },
              { sub: 'index_checklist' as const, emoji: '📋', title: '自我檢核表 ＆ A–Z 索引', desc: '第 103–111 頁總檢核' },
            ].map((g) => {
              const active = view.kind === 'games' && view.sub === g.sub;
              return (
                <button
                  key={g.sub}
                  onClick={() => setView({ kind: 'games', sub: g.sub })}
                  className={`w-full px-3 py-2.5 rounded-2xl text-left flex items-center gap-2.5 text-sm font-extrabold transition cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'hover:bg-emerald-50 text-slate-700'
                  }`}
                >
                  <span className="text-xl">{g.emoji}</span>
                  <div className="min-w-0">
                    <div className="truncate">{g.title}</div>
                    <div
                      className={`text-[11px] font-semibold truncate ${
                        active ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {g.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Recent Quiz History */}
          {recentAttempts.length > 0 && (
            <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200 space-y-2">
              <div className="text-xs font-black text-slate-600 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                最新闖關紀錄
              </div>
              <div className="space-y-1.5">
                {recentAttempts.slice(0, 4).map((att, idx) => (
                  <div
                    key={att.id ?? idx}
                    className="text-xs bg-slate-50 rounded-xl px-3 py-2 flex items-center justify-between font-bold text-slate-700"
                  >
                    <span className="truncate">
                      {att.unit_id} ({att.mode})
                    </span>
                    <span className="text-amber-600 shrink-0">
                      {att.score}/{att.total_questions} {'⭐'.repeat(att.stars_earned)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Main Content Area */}
        <main className="lg:col-span-9 min-w-0">
          {view.kind === 'unit' && (
            <UnitExplorer
              unit={currentUnit}
              wordProgressMap={wordProgressMap}
              completedChecklist={completedItems}
              onToggleChecklist={(itemKey) => handleToggleItem(itemKey, 'checklist')}
              onStartPractice={(initialTab) =>
                setView({ kind: 'practice', unitId: currentUnit.id, initialTab })
              }
            />
          )}

          {view.kind === 'practice' && (
            <PracticeArena
              unitId={view.isMistakeReview ? 'mistakes' : currentUnit.id}
              unitTitle={
                view.isMistakeReview
                  ? `📌 Liam 的錯題複習特訓營（共 ${mistakeVocabList.length} 字）`
                  : `${currentUnit.badge}: ${currentUnit.titleEn}`
              }
              vocab={
                view.isMistakeReview && mistakeVocabList.length > 0
                  ? mistakeVocabList
                  : currentUnit.vocab
              }
              sentences={currentUnit.sentences}
              wordProgressMap={wordProgressMap}
              onRecordWordResult={handleRecordWordResult}
              onFinishAttempt={(mode, score, total) =>
                handleFinishAttempt(
                  view.isMistakeReview ? 'mistakes' : currentUnit.id,
                  mode,
                  score,
                  total
                )
              }
              onBack={() =>
                setView({
                  kind: 'unit',
                  unitId: view.isMistakeReview ? 'unit-1' : currentUnit.id,
                })
              }
              initialTab={view.initialTab}
            />
          )}

          {view.kind === 'extras' && <CultureAndExtras />}

          {view.kind === 'games' && (
            <GamesAndChecklist
              activeSubView={view.sub}
              completedItems={completedItems}
              onToggleItem={handleToggleItem}
              onAwardXp={(xp, mode) => handleFinishAttempt('games', mode, 1, 1).then(() => addXp(xp))}
            />
          )}
        </main>
      </div>
    </div>
  );
};
