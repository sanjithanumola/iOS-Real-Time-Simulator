import React, { useState } from 'react';
import { Sun, CloudSun, CloudRain, Wind, Droplets } from 'lucide-react';
import { soundService } from '../../../services/soundService';

export const WeatherApp: React.FC = () => {
  const [cityIndex, setCityIndex] = useState(0);

  const cities = [
    { name: 'Cupertino', temp: '72°', condition: 'Mostly Sunny', high: '76°', low: '54°' },
    { name: 'New York', temp: '58°', condition: 'Partly Cloudy', high: '62°', low: '48°' },
    { name: 'Tokyo', temp: '65°', condition: 'Clear', high: '68°', low: '52°' },
    { name: 'London', temp: '51°', condition: 'Light Rain', high: '55°', low: '44°' },
  ];

  const current = cities[cityIndex];

  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-500 via-sky-600 to-blue-800 text-white flex flex-col justify-between pt-14 pb-6 px-4 select-none overflow-y-auto">
      {/* Current City Weather */}
      <div className="flex flex-col items-center mt-4">
        <h1 className="text-3xl font-semibold tracking-tight">{current.name}</h1>
        <span className="text-7xl font-extralight font-sans mt-1">{current.temp}</span>
        <p className="text-sm font-medium text-white/90 mt-1">{current.condition}</p>
        <p className="text-xs text-white/70 mt-0.5">
          H:{current.high} L:{current.low}
        </p>
      </div>

      {/* Hourly Forecast Pill Container */}
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-3 my-4 shadow-lg">
        <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-2">
          Hourly Forecast
        </p>
        <div className="flex items-center justify-between overflow-x-auto gap-3 py-1 scrollbar-none">
          {[
            { t: 'Now', temp: '72°' },
            { t: '10 AM', temp: '73°' },
            { t: '11 AM', temp: '75°' },
            { t: '12 PM', temp: '76°' },
            { t: '1 PM', temp: '75°' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 min-w-[45px]">
              <span className="text-[11px] font-medium">{item.t}</span>
              <CloudSun className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-semibold">{item.temp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast Card */}
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-lg space-y-2.5">
        <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1">
          7-Day Forecast
        </p>
        {[
          { day: 'Today', icon: CloudSun, high: '76°', low: '54°' },
          { day: 'Mon', icon: Sun, high: '78°', low: '55°' },
          { day: 'Tue', icon: CloudSun, high: '74°', low: '52°' },
          { day: 'Wed', icon: CloudRain, high: '68°', low: '50°' },
          { day: 'Thu', icon: Sun, high: '73°', low: '53°' },
        ].map((d, idx) => {
          const Icon = d.icon;
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="w-12 font-medium">{d.day}</span>
              <Icon className="w-4 h-4 text-amber-300" />
              <div className="flex items-center gap-2 font-mono">
                <span className="text-white/60">{d.low}</span>
                <div className="w-16 h-1 bg-white/20 rounded-full" />
                <span className="font-bold">{d.high}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* City Switcher Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {cities.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              soundService.playTap();
              setCityIndex(i);
            }}
            className={`w-2 h-2 rounded-full transition-all ${cityIndex === i ? 'bg-white w-4' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};
