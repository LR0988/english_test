import React, { useState, useEffect } from 'react';
import { Volume2, Turtle } from 'lucide-react';
import {
  EMERGENCY_SCENARIOS,
  TAIWAN_CITIES_WEATHER,
  FAMOUS_CLOCKS,
} from '../data/curriculum';
import { speakEnglish, playSuccessChime } from '../lib/speech';
import { PagedBookFrame, BookPageSpec } from './PagedBookFrame';

interface CultureAndExtrasProps {
  topic: 'sos' | 'taiwan' | 'clocks';
  onBackHome: () => void;
}

export const CultureAndExtras: React.FC<CultureAndExtrasProps> = ({
  topic,
  onBackHome,
}) => {
  const [selectedDisasterId, setSelectedDisasterId] = useState('fire');
  const [townName, setTownName] = useState('A');
  const [activeCity, setActiveCity] = useState(TAIWAN_CITIES_WEATHER[0]);
  const [pageIdx, setPageIdx] = useState(0);

  useEffect(() => {
    setPageIdx(0);
  }, [topic]);

  const currentDisaster =
    EMERGENCY_SCENARIOS.find((d) => d.id === selectedDisasterId) ?? EMERGENCY_SCENARIOS[0];
  const sosSentence = `Help! There's a ${currentDisaster.wordEn}! It's ${currentDisaster.conditionEn} now! Please hurry! I'm in Town ${townName || 'A'}.`;

  if (topic === 'sos') {
    const sosPages: BookPageSpec[] = [
      {
        id: 'sos-step-1',
        shortTag: '1️⃣ 選災害與城鎮',
        title: 'Task: Let’s Write 緊急求救通報（p.84–85）',
        render: () => (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                🚨 第一步：點選發生的緊急狀況與所在城鎮
              </h2>
              <p className="text-lg font-bold text-slate-600 mt-1">
                點選災害單字聽發音，再按右下角「下一頁 ▶」產生求救明信片！
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
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
                    className={`p-4 sm:p-5 rounded-3xl border-3 text-center transition active:scale-95 cursor-pointer ${
                      active
                        ? 'bg-rose-600 text-white border-rose-700 shadow-lg'
                        : 'bg-slate-50 hover:bg-rose-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="text-4xl sm:text-5xl mb-2">{sc.emoji}</div>
                    <div className="font-black text-xl sm:text-2xl whitespace-nowrap">
                      {sc.wordEn}
                    </div>
                    <div
                      className={`text-base font-bold mt-0.5 whitespace-nowrap ${
                        active ? 'text-rose-100' : 'text-slate-600'
                      }`}
                    >
                      {sc.wordZh}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xl font-extrabold text-slate-800">所在城鎮 (Town)：</span>
              {['A', 'B', 'C', 'D', 'Taipei', 'Taichung'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTownName(t)}
                  className={`px-6 py-3.5 rounded-2xl text-xl font-extrabold cursor-pointer active:scale-95 ${
                    townName === t
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  Town {t}
                </button>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'sos-step-2',
        shortTag: '2️⃣ 朗讀求救信',
        title: '完成緊急求救通報句型！',
        render: () => (
          <div className="rounded-3xl bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 border-3 border-rose-300 p-7 sm:p-10 space-y-6 text-center">
            <div className="text-7xl">{currentDisaster.emoji}</div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 leading-relaxed">
              Help! There's a{' '}
              <span className="text-rose-600 underline">{currentDisaster.wordEn}</span>! It's{' '}
              <span className="text-amber-700 underline">{currentDisaster.conditionEn}</span> now!
              Please hurry! I'm in Town{' '}
              <span className="text-indigo-700 underline">{townName}</span>.
            </p>
            <p className="text-xl font-bold text-slate-700">
              救命！發生{currentDisaster.wordZh}了！現在{currentDisaster.conditionZh}！請快一點！我在{' '}
              {townName} 鎮。
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={() => speakEnglish(sosSentence, 0.9)}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-rose-600 text-white text-xl font-extrabold cursor-pointer active:scale-95 shadow-md"
              >
                <Volume2 className="w-6 h-6" />
                正常朗讀通報
              </button>
              <button
                onClick={() => speakEnglish(sosSentence, 0.58)}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-teal-600 text-white text-xl font-extrabold cursor-pointer active:scale-95 shadow-md"
              >
                <Turtle className="w-6 h-6" />
                慢速跟讀
              </button>
            </div>
          </div>
        ),
      },
    ];

    return (
      <PagedBookFrame
        pages={sosPages}
        currentIndex={pageIdx}
        onChangeIndex={setPageIdx}
        finishAction={{ label: '🏠 回章節地圖', onClick: onBackHome }}
      />
    );
  }

  if (topic === 'taiwan') {
    const twPages: BookPageSpec[] = [
      {
        id: 'tw-broadcast',
        shortTag: '🗺️ 臺灣氣象台',
        title: 'Picture Dictionary：臺灣城市與氣溫（p.86–87）',
        render: () => (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TAIWAN_CITIES_WEATHER.map((c) => {
                const selected = activeCity.cityEn === c.cityEn;
                return (
                  <button
                    key={c.cityEn}
                    onClick={() => {
                      setActiveCity(c);
                      speakEnglish(c.sentence);
                    }}
                    className={`p-6 rounded-3xl border-3 text-left transition active:scale-95 cursor-pointer ${
                      selected
                        ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white border-sky-400 shadow-xl'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
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
                    <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-black whitespace-nowrap">
                        {c.cityEn}
                      </span>
                      <span
                        className={`text-base sm:text-lg font-extrabold whitespace-nowrap ${
                          selected ? 'text-amber-200' : 'text-slate-500'
                        }`}
                      >
                        {c.cityZh}
                      </span>
                    </div>
                    <div
                      className={`text-sm sm:text-base font-bold mt-1 whitespace-nowrap truncate ${
                        selected ? 'text-sky-100' : 'text-slate-600'
                      }`}
                    >
                      {c.weatherEn} · {c.tempWords}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 to-sky-50 rounded-3xl p-7 border-3 border-sky-200 text-center space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-sky-600 text-white text-sm font-extrabold">
                📺 Liam 小小英語氣象主播
              </div>
              <div className="text-7xl">{activeCity.emoji}</div>
              <div className="text-4xl font-black text-slate-900">
                {activeCity.cityEn} — {activeCity.tempNum}°C
              </div>
              <p className="text-2xl font-extrabold text-sky-900 leading-snug">
                {activeCity.sentence}
              </p>
              <button
                onClick={() => speakEnglish(activeCity.sentence, 0.88)}
                className="w-full py-4 rounded-2xl bg-sky-600 text-white text-xl font-extrabold flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
              >
                <Volume2 className="w-6 h-6" />
                跟著主播唸一遍
              </button>
            </div>
          </div>
        ),
      },
    ];

    return (
      <PagedBookFrame
        pages={twPages}
        currentIndex={pageIdx}
        onChangeIndex={setPageIdx}
        finishAction={{ label: '🏠 回章節地圖', onClick: onBackHome }}
      />
    );
  }

  // Famous Clocks: 1 Giant Clock Landmark per Page!
  const clockPages: BookPageSpec[] = FAMOUS_CLOCKS.map((clk, idx) => ({
    id: `clock-${idx}`,
    shortTag: `${clk.emoji} ${clk.nameZh}`,
    title: `世界著名時鐘巡禮（${idx + 1} / ${FAMOUS_CLOCKS.length}）`,
    render: () => (
      <div className="max-w-3xl mx-auto w-full rounded-3xl bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50 border-3 border-violet-200 p-7 sm:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-4 py-1.5 rounded-full bg-white text-violet-900 border-2 border-violet-200 text-lg font-extrabold">
            {clk.countryZh} ({clk.countryEn})
          </span>
          <span className="font-mono text-4xl font-black text-violet-800 bg-white px-5 py-2 rounded-2xl border-2 border-violet-200 shadow-xs">
            {clk.timeDisplay}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <span className="text-6xl sm:text-8xl shrink-0">{clk.emoji}</span>
          <div className="min-w-0">
            <h2
              className={`${
                clk.nameEn.length > 18 ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl'
              } font-black text-slate-900 leading-tight`}
            >
              {clk.nameEn}
            </h2>
            <div className="text-xl sm:text-2xl font-extrabold text-violet-700 mt-1">
              {clk.nameZh}
            </div>
          </div>
        </div>

        <p className="text-xl font-bold text-slate-700 leading-relaxed">{clk.fact}</p>

        <div className="bg-white rounded-3xl p-6 border-2 border-violet-200 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xl font-bold text-slate-500">{clk.questionEn}</div>
            <div className="text-3xl font-black text-violet-800">{clk.answerEn}</div>
            <div className="text-lg font-bold text-slate-600">{clk.answerZh}</div>
          </div>
          <button
            onClick={() =>
              speakEnglish(`${clk.nameEn}, in ${clk.countryEn}. ${clk.questionEn} ${clk.answerEn}`)
            }
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-violet-600 text-white text-xl font-extrabold cursor-pointer active:scale-95 shadow-md"
          >
            <Volume2 className="w-6 h-6" />
            聽地標與報時
          </button>
        </div>
      </div>
    ),
  }));

  return (
    <PagedBookFrame
      pages={clockPages}
      currentIndex={pageIdx}
      onChangeIndex={setPageIdx}
      finishAction={{ label: '🏠 回章節地圖', onClick: onBackHome }}
    />
  );
};
