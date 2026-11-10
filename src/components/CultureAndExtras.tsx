import React, { useState } from 'react';
import { Volume2, Turtle, AlertTriangle, ThermometerSun, Globe } from 'lucide-react';
import {
  EMERGENCY_SCENARIOS,
  TAIWAN_CITIES_WEATHER,
  FAMOUS_CLOCKS,
} from '../data/curriculum';
import { speakEnglish, playSuccessChime } from '../lib/speech';

export const CultureAndExtras: React.FC = () => {
  const [selectedDisasterId, setSelectedDisasterId] = useState('fire');
  const [townName, setTownName] = useState('A');
  const [activeCity, setActiveCity] = useState(TAIWAN_CITIES_WEATHER[0]);

  const currentDisaster =
    EMERGENCY_SCENARIOS.find((d) => d.id === selectedDisasterId) ?? EMERGENCY_SCENARIOS[0];

  const sosSentence = `Help! There's a ${currentDisaster.wordEn}! It's ${currentDisaster.conditionEn} now! Please hurry! I'm in Town ${townName || 'A'}.`;

  return (
    <div className="space-y-8">
      {/* ==================== 1. TASK: LET'S WRITE (pp. 84–85) ==================== */}
      <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-rose-200 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-sm font-extrabold px-3.5 py-1 rounded-full bg-rose-100 text-rose-800">
              第 84–85 頁｜Task: Let’s Write
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
              🚨 任務寫作：緊急求救通報產生器（Emergency SOS）
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-bold mt-1">
              認識災害單字與 <code className="bg-slate-100 px-2 py-0.5 rounded">there's = there is（有……）</code>，點選災害與所在城鎮完成英文求救通報！
            </p>
          </div>
        </div>

        {/* Disaster Picker - Large Touch Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {EMERGENCY_SCENARIOS.map((sc) => {
            const active = sc.id === selectedDisasterId;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedDisasterId(sc.id);
                  speakEnglish(sc.wordEn);
                  playSuccessChime();
                }}
                className={`p-5 rounded-3xl border-3 text-center transition active:scale-95 cursor-pointer ${
                  active
                    ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                    : 'bg-slate-50 hover:bg-rose-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="text-5xl mb-2">{sc.emoji}</div>
                <div className="font-extrabold text-xl">{sc.wordEn}</div>
                <div className={`text-base font-bold mt-0.5 ${active ? 'text-rose-100' : 'text-slate-600'}`}>
                  {sc.wordZh}
                </div>
              </button>
            );
          })}
        </div>

        {/* Town Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-lg font-extrabold text-slate-800">選擇所在城鎮 (Town)：</span>
          {['A', 'B', 'C', 'D', 'Taipei', 'Taichung'].map((t) => (
            <button
              key={t}
              onClick={() => setTownName(t)}
              className={`px-5 py-3 rounded-2xl text-lg font-extrabold cursor-pointer active:scale-95 transition ${
                townName === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              Town {t}
            </button>
          ))}
        </div>

        {/* Generated SOS Postcard */}
        <div className="rounded-3xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-3 border-rose-300 p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-base font-extrabold text-rose-800">
              📢 完成的求救通報句型
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => speakEnglish(sosSentence, 0.9)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-base sm:text-lg font-extrabold cursor-pointer shadow-sm"
              >
                <Volume2 className="w-5 h-5" />
                正常朗讀通報
              </button>
              <button
                onClick={() => speakEnglish(sosSentence, 0.58)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-base sm:text-lg font-extrabold cursor-pointer shadow-sm"
              >
                <Turtle className="w-5 h-5" />
                慢速跟讀
              </button>
            </div>
          </div>

          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-relaxed">
            Help! There's a <span className="text-rose-600 underline">{currentDisaster.wordEn}</span>! It's{' '}
            <span className="text-amber-700 underline">{currentDisaster.conditionEn}</span> now! Please hurry! I'm in Town{' '}
            <span className="text-indigo-700 underline">{townName}</span>.
          </p>
          <p className="text-lg font-bold text-slate-700">
            救命！發生{currentDisaster.wordZh}了！現在{currentDisaster.conditionZh}！請快一點！我在 {townName} 鎮。
          </p>
        </div>
      </section>

      {/* ==================== 2. PICTURE DICTIONARY: TAIWAN CITIES & TEMPS (pp. 86–87) ==================== */}
      <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-sky-200 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-sky-100 text-sky-600 shrink-0">
            <ThermometerSun className="w-8 h-8" />
          </div>
          <div>
            <span className="text-sm font-extrabold px-3.5 py-1 rounded-full bg-sky-100 text-sky-800">
              第 86–87 頁｜Picture Dictionary
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
              🗺️ 圖解字典：臺灣四大城市與攝氏氣溫（degrees Celsius °C）
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-bold mt-1">
              點選城市卡片，立即化身小小英語氣象主播！
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TAIWAN_CITIES_WEATHER.map((c) => {
            const selected = activeCity.cityEn === c.cityEn;
            return (
              <button
                key={c.cityEn}
                onClick={() => {
                  setActiveCity(c);
                  speakEnglish(c.sentence);
                }}
                className={`p-6 rounded-3xl border-3 text-left transition active:scale-[0.99] cursor-pointer ${
                  selected
                    ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white border-sky-400 shadow-lg'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-5xl">{c.emoji}</span>
                  <span
                    className={`text-4xl font-black ${
                      selected ? 'text-amber-300' : 'text-sky-700'
                    }`}
                  >
                    {c.tempNum}°C
                  </span>
                </div>
                <div className="mt-3 text-2xl sm:text-3xl font-extrabold">
                  {c.cityEn}（{c.cityZh}）
                </div>
                <div className={`text-lg font-bold mt-1 ${selected ? 'text-sky-100' : 'text-slate-600'}`}>
                  {c.weatherEn}（{c.weatherZh}）・{c.tempWords}
                </div>
              </button>
            );
          })}
        </div>

        {/* Forecast TV Broadcast Box */}
        <div className="bg-gradient-to-br from-amber-50 to-sky-50 rounded-3xl p-7 border-3 border-sky-200 text-center space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-sky-600 text-white text-sm font-extrabold">
            📺 Liam 小小氣象主播台
          </div>
          <div className="text-7xl">{activeCity.emoji}</div>
          <div className="text-4xl font-black text-slate-900">
            {activeCity.cityEn} — {activeCity.tempNum}°C
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-sky-900">{activeCity.sentence}</p>
          <button
            onClick={() => speakEnglish(activeCity.sentence, 0.88)}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xl font-extrabold cursor-pointer shadow-md"
          >
            <Volume2 className="w-6 h-6" />
            跟著主播唸一遍
          </button>
        </div>
      </section>

      {/* ==================== 3. AROUND THE WORLD: FAMOUS CLOCKS (pp. 90–91) ==================== */}
      <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-violet-200 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-violet-100 text-violet-600 shrink-0">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <span className="text-sm font-extrabold px-3.5 py-1 rounded-full bg-violet-100 text-violet-800">
              第 90–91 頁｜Around the World
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
              🕰️ 世界著名時鐘巡禮（Famous Clocks）
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-bold mt-1">
              環遊英國、德國、美國與日本四大著名時鐘地標（補充字：famous 著名的）！
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FAMOUS_CLOCKS.map((clk) => (
            <div
              key={clk.nameEn}
              className="rounded-3xl border-2 border-violet-200 bg-violet-50/40 p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold px-3.5 py-1.5 rounded-full bg-white text-violet-900 border border-violet-200">
                    {clk.countryZh} ({clk.countryEn})
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-violet-800 bg-white px-4 py-1.5 rounded-2xl border border-violet-200">
                    {clk.timeDisplay}
                  </span>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <span className="text-5xl">{clk.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{clk.nameEn}</h3>
                    <div className="text-lg font-bold text-slate-600">{clk.nameZh}</div>
                  </div>
                </div>

                <p className="text-base font-semibold text-slate-700 leading-relaxed">{clk.fact}</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border-2 border-violet-100 flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-bold text-slate-500">{clk.questionEn}</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-violet-800">
                    {clk.answerEn}
                  </div>
                  <div className="text-base font-bold text-slate-600">{clk.answerZh}</div>
                </div>
                <button
                  onClick={() =>
                    speakEnglish(
                      `${clk.nameEn}, in ${clk.countryEn}. ${clk.questionEn} ${clk.answerEn}`
                    )
                  }
                  className="w-14 h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 active:scale-90 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                  title="聽地標與報時發音"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
