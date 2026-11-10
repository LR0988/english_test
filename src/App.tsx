import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Cloud,
  Flame,
  LogOut,
  Turtle,
  Rabbit,
  BookmarkCheck,
  Star,
  ZoomIn,
  LayoutGrid,
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
import { HomeLauncher, ShelfTab } from './components/HomeLauncher';
import { UnitExplorer } from './components/UnitExplorer';
import { PracticeArena } from './components/PracticeArena';
import { CultureAndExtras } from './components/CultureAndExtras';
import { GamesAndChecklist } from './components/GamesAndChecklist';

type MainView =
  | { kind: 'home' }
  | { kind: 'unit'; unitId: string }
  | {
      kind: 'practice';
      unitId: string;
      initialTab: 'flashcards' | 'quiz' | 'spelling' | 'scramble';
      isMistakeReview?: boolean;
    }
  | { kind: 'extras'; topic: 'sos' | 'taiwan' | 'clocks' }
  | {
      kind: 'games';
      sub: 'magic_e' | 'board_game' | 'word_hunt' | 'checklist' | 'dictionary';
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

  // Default to Extra-Large font mode on iPad for easy reading
  const [extraLargeFont, setExtraLargeFont] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem('liam_font_xl');
    return saved === null ? true : saved === '1';
  });

  // Step 1: Dedicated Chapter Selection Shelf, Step 2: Page-by-Page Content View
  const [shelfTab, setShelfTab] = useState<ShelfTab>('core');
  const [view, setView] = useState<MainView>({ kind: 'home' });

  useEffect(() => {
    const root = document.documentElement;
    if (extraLargeFont) {
      root.classList.add('font-xl');
      window.localStorage.setItem('liam_font_xl', '1');
    } else {
      root.classList.remove('font-xl');
      window.localStorage.setItem('liam_font_xl', '0');
    }
  }, [extraLargeFont]);

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
      <div className="h-[100dvh] bg-amber-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-7xl animate-bounce">🦁</div>
          <div className="text-2xl font-extrabold text-slate-700">正在開啟 Liam 的英語冒險島...</div>
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
    ) ?? UNITS_DATA[5];

  const activeScreenTitle = (() => {
    if (view.kind === 'unit') {
      return `${currentUnit.heroEmoji} ${currentUnit.badge}: ${currentUnit.titleEn}`;
    }
    if (view.kind === 'practice') {
      return view.isMistakeReview
        ? '📌 錯題複習特訓營'
        : `🎮 ${currentUnit.badge} 闖關練習`;
    }
    if (view.kind === 'extras') {
      if (view.topic === 'sos') return '🚨 緊急求救寫作 SOS';
      if (view.topic === 'taiwan') return '🌡️ 臺灣城市氣溫播報';
      return '🕰️ 世界著名時鐘巡禮';
    }
    if (view.kind === 'games') {
      if (view.sub === 'magic_e') return '🪄 Magic e 折疊翻翻卡';
      if (view.sub === 'board_game') return '🏖️ 沙灘猜拳闖關桌遊';
      if (view.sub === 'word_hunt') return '🧙🏻‍♀️ 女巫帽尋字雲';
      if (view.sub === 'checklist') return '📋 全書自我檢核本';
      return '📖 A–Z 生字點讀字典';
    }
    return '';
  })();

  return (
    <div className="h-[100dvh] bg-amber-50/70 flex flex-col overflow-hidden">
      {/* ==================== NATIVE IPAD APP TOP BAR ==================== */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Home Screen shows Liam Profile; Inside Chapter shows prominent Back-to-Chapters button */}
          {view.kind === 'home' ? (
            <div className="flex items-center gap-3 relative">
              <button
                onClick={() => setShowAvatarPicker((s) => !s)}
                className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-3xl shadow-xs cursor-pointer active:scale-95 transition"
                title="點擊更換小勇士頭像"
              >
                {profile?.avatar_emoji ?? '🦁'}
              </button>

              {showAvatarPicker && (
                <div className="absolute top-15 left-0 bg-white rounded-3xl shadow-2xl border-3 border-amber-300 p-3 flex gap-2 z-50">
                  {AVATAR_CHOICES.map((em) => (
                    <button
                      key={em}
                      onClick={() => pickAvatar(em)}
                      className="w-12 h-12 rounded-2xl hover:bg-amber-100 active:bg-amber-200 text-3xl cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    {profile?.display_name ?? 'Liam (黃尚霖)'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs sm:text-sm font-black">
                    Lv.{level}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 sm:w-32 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                      style={{ width: `${xpInLevel}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-700">
                    {profile?.total_xp ?? 0} XP
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setView({ kind: 'home' })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-base shadow-sm cursor-pointer shrink-0"
              >
                <LayoutGrid className="w-5 h-5 text-amber-300" />
                <span>章節選單</span>
              </button>
              <div className="font-extrabold text-slate-800 text-base sm:text-xl truncate">
                {activeScreenTitle}
              </div>
            </div>
          )}

          {/* Right: iPad Quick Controls */}
          <div className="flex items-center gap-2">
            {view.kind === 'home' && (
              <>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-orange-50 border-2 border-orange-200 text-orange-700 text-sm font-extrabold">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                  <span>{profile?.streak_days ?? 1} 天</span>
                </div>

                <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 text-sm font-extrabold">
                  <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  <span>熟記 {masteredCount} 字</span>
                </div>
              </>
            )}

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
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-extrabold border-2 transition active:scale-95 cursor-pointer ${
                mistakeVocabList.length > 0
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-default'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>錯題 ({mistakeVocabList.length})</span>
            </button>

            {/* Speech Speed Toggle */}
            <button
              onClick={toggleSpeechSpeed}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-extrabold border-2 cursor-pointer active:scale-95 transition ${
                isSlowSpeech
                  ? 'bg-teal-600 text-white border-teal-700'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-200'
              }`}
            >
              {isSlowSpeech ? <Turtle className="w-4 h-4" /> : <Rabbit className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSlowSpeech ? '慢速' : '正常'}</span>
            </button>

            {/* Font Size Toggle (A / A+) */}
            <button
              onClick={() => setExtraLargeFont((v) => !v)}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-2xl text-sm font-extrabold border-2 cursor-pointer active:scale-95 transition ${
                extraLargeFont
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="切換特大字體模式"
            >
              <ZoomIn className="w-4 h-4" />
              <span>{extraLargeFont ? 'A+' : 'A'}</span>
            </button>

            {/* Cloud Sync Indicator */}
            <div
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-2xl bg-slate-100 text-slate-600 text-xs font-extrabold"
              title="學習進度自動同步至 Supabase"
            >
              <Cloud className={`w-4 h-4 ${syncing ? 'animate-pulse text-sky-500' : 'text-emerald-600'}`} />
            </div>

            {view.kind === 'home' && (
              <button
                onClick={() => supabase.auth.signOut()}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 active:scale-95 transition cursor-pointer"
                title="登出"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==================== SINGLE-VIEWPORT APP STAGE ==================== */}
      <main className="flex-1 min-h-0 max-w-6xl w-full mx-auto px-4 sm:px-6 py-3 overflow-hidden">
        {view.kind === 'home' && (
          <HomeLauncher
            shelfTab={shelfTab}
            onChangeShelfTab={setShelfTab}
            wordProgressMap={wordProgressMap}
            completedItems={completedItems}
            recentAttempts={recentAttempts}
            onOpenUnit={(unitId) => setView({ kind: 'unit', unitId })}
            onOpenExtraTopic={(topic) => setView({ kind: 'extras', topic })}
            onOpenGame={(sub) => setView({ kind: 'games', sub })}
          />
        )}

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
            backLabel={view.isMistakeReview ? '返回章節選單' : '返回單元書頁'}
            onBack={() =>
              view.isMistakeReview
                ? setView({ kind: 'home' })
                : setView({ kind: 'unit', unitId: currentUnit.id })
            }
            initialTab={view.initialTab}
          />
        )}

        {view.kind === 'extras' && (
          <CultureAndExtras
            topic={view.topic}
            onBackHome={() => setView({ kind: 'home' })}
          />
        )}

        {view.kind === 'games' && (
          <GamesAndChecklist
            activeSubView={view.sub}
            completedItems={completedItems}
            onToggleItem={handleToggleItem}
            onAwardXp={(xp, mode) =>
              handleFinishAttempt('games', mode, 1, 1).then(() => addXp(xp))
            }
            onBackHome={() => setView({ kind: 'home' })}
          />
        )}
      </main>
    </div>
  );
};
