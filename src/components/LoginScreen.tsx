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
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-sky-100 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden">
        {/* Hero Top Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-6 py-8 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm text-5xl mb-3 shadow-inner animate-float">
            🦁
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Wonder World 2 全書互動學習樂園
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
            Liam 黃尚霖的英語冒險島
          </h1>
          <p className="text-amber-50 text-sm mt-1 font-medium">
            跨裝置雲端同步進度・發音點讀・闖關集星
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              小勇士帳號 (Username)
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="輸入帳號（例如 Liam）"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none text-lg font-bold text-slate-800 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              通關密碼 (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入通關密碼"
                className="w-full px-4 py-3.5 pr-12 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none text-lg font-bold text-slate-800 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="切換顯示密碼"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-bold">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-white font-extrabold text-lg shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
          >
            <LogIn className="w-5 h-5" />
            {loading ? '正在連線至雲端學習島...' : '出發開始複習！ Let’s Go!'}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>課本範圍：Starter・Get Ready・Units 1–4・Reviews・Halloween</span>
          </div>
        </form>
      </div>
    </div>
  );
};
