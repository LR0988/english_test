import React, { useState } from 'react';
import { BookOpen, Sparkles, Eye, EyeOff, LogIn } from 'lucide-react';
import { signInWithUsernamePassword } from '../lib/supabase';

interface LoginScreenProps {
  onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('Liam');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('請輸入帳號與密碼喔！');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithUsernamePassword(username, password);
    setLoading(false);

    if (error) {
      setErrorMsg('帳號或密碼不正確，請輸入 Liam 的專屬帳號密碼再試一次！');
      return;
    }
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-sky-100 to-emerald-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl border-4 border-amber-300 overflow-hidden">
        {/* Hero Top Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-8 py-9 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/25 backdrop-blur-sm text-6xl mb-4 shadow-inner animate-float">
            🦁
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wide mb-2">
            <Sparkles className="w-4 h-4" />
            Wonder World 2 全書互動學習樂園
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Liam 黃尚霖的英語冒險島
          </h1>
          <p className="text-amber-50 text-base mt-2 font-bold">
            iPad 觸控大字版・發音點讀・闖關集星
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 sm:p-10 space-y-6">
          <div>
            <label className="block text-base font-extrabold text-slate-700 mb-2">
              小勇士帳號 (Username)
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="輸入帳號（例如 Liam）"
              className="w-full px-5 py-4 rounded-2xl border-3 border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none text-2xl font-extrabold text-slate-800 transition"
            />
          </div>

          <div>
            <label className="block text-base font-extrabold text-slate-700 mb-2">
              通關密碼 (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入通關密碼"
                className="w-full px-5 py-4 pr-14 rounded-2xl border-3 border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none text-2xl font-extrabold text-slate-800 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-slate-600 rounded-xl"
                aria-label="切換顯示密碼"
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-5 py-4 rounded-2xl text-base font-extrabold">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-white font-extrabold text-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-60"
          >
            <LogIn className="w-7 h-7" />
            {loading ? '正在連線至雲端學習島...' : '出發開始複習！ Let’s Go!'}
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pt-1 font-bold">
            <BookOpen className="w-5 h-5 text-amber-500 shrink-0" />
            <span>課本範圍：Starter・Get Ready・Units 1–4・Reviews・Halloween</span>
          </div>
        </form>
      </div>
    </div>
  );
};
