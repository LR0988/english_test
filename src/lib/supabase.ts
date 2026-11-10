import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://ncynrrjfyzquyrwadxuh.supabase.co';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_WfwB6kmS-pSxcODLMq4OBA_dpNpkkzI';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface LearnerProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
  total_xp: number;
  streak_days: number;
  last_study_date: string | null;
  speech_rate: number;
}

export interface WordProgressRow {
  word_key: string;
  unit_id: string;
  familiarity: number; // 0..3
  correct_count: number;
  wrong_count: number;
  needs_review: boolean;
}

export interface ChecklistRow {
  item_key: string;
  category: 'checklist' | 'word_hunt' | 'story_read' | 'magic_e';
  completed: boolean;
}

export interface QuizAttemptRow {
  id?: number;
  unit_id: string;
  mode: string;
  score: number;
  total_questions: number;
  stars_earned: number;
  xp_earned: number;
  created_at?: string;
}

export function usernameToAuthEmail(username: string): string {
  const trimmed = username.trim().toLowerCase();
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed}@wonderworld.app`;
}

export async function signInWithUsernamePassword(username: string, password: string) {
  const email = usernameToAuthEmail(username);
  return supabase.auth.signInWithPassword({
    email,
    password: password.trim(),
  });
}

export async function fetchAllUserProgress(userId: string) {
  // Parallelize all independent queries (eliminating waterfalls)
  const [profileRes, wordsRes, checklistRes, attemptsRes] = await Promise.all([
    supabase
      .from('learner_profiles')
      .select('user_id, username, display_name, avatar_emoji, total_xp, streak_days, last_study_date, speech_rate')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('word_progress')
      .select('word_key, unit_id, familiarity, correct_count, wrong_count, needs_review')
      .eq('user_id', userId),
    supabase
      .from('checklist_progress')
      .select('item_key, category, completed')
      .eq('user_id', userId),
    supabase
      .from('quiz_attempts')
      .select('id, unit_id, mode, score, total_questions, stars_earned, xp_earned, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(25),
  ]);

  let profile: LearnerProfile | null = profileRes.data as LearnerProfile | null;

  if (!profile) {
    const defaultProfile: LearnerProfile = {
      user_id: userId,
      username: 'Liam',
      display_name: 'Liam (黃尚霖)',
      avatar_emoji: '🦁',
      total_xp: 0,
      streak_days: 1,
      last_study_date: new Date().toISOString().slice(0, 10),
      speech_rate: 0.9,
    };
    const { data: inserted } = await supabase
      .from('learner_profiles')
      .upsert(defaultProfile, { onConflict: 'user_id' })
      .select()
      .maybeSingle();
    profile = (inserted as LearnerProfile | null) ?? defaultProfile;
  }

  return {
    profile,
    words: (wordsRes.data ?? []) as WordProgressRow[],
    checklist: (checklistRes.data ?? []) as ChecklistRow[],
    attempts: (attemptsRes.data ?? []) as QuizAttemptRow[],
  };
}
