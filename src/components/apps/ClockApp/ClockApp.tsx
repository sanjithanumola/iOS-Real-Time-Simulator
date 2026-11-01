import React, { useState, useEffect, useRef } from 'react';
import { Globe, AlarmClock, Timer as TimerIcon, Play, Pause, RotateCcw, Plus } from 'lucide-react';
import { soundService } from '../../../services/soundService';

export const ClockApp: React.FC = () => {
  const [tab, setTab] = useState<'world' | 'alarm' | 'stopwatch' | 'timer'>('stopwatch');

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${centiseconds < 10 ? '0' : ''}${centiseconds}`;
  };

  const handleStartStop = () => {
    soundService.playTap();
    setIsRunning(!isRunning);
  };

  const handleLapReset = () => {
    soundService.playTap();
    if (isRunning) {
      setLaps([stopwatchTime, ...laps]);
    } else {
      setStopwatchTime(0);
      setLaps([]);
    }
  };

  // Alarms
  const [alarms, setAlarms] = useState([
    { id: '1', time: '07:00 AM', label: 'Morning Alarm', enabled: true },
    { id: '2', time: '08:30 AM', label: 'Work Standup', enabled: false },
  ]);

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between pt-14 pb-4 px-4 select-none overflow-hidden">
      {/* Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* STOPWATCH */}
        {tab === 'stopwatch' && (
          <div className="flex-1 flex flex-col justify-between py-6">
            <div className="flex justify-center my-8">
              <span className="text-6xl font-light font-mono tracking-tight text-white">
                {formatStopwatch(stopwatchTime)}
              </span>
            </div>

            {/* Lap & Start Buttons */}
            <div className="flex items-center justify-between px-6 mb-6">
              <button
                onClick={handleLapReset}
                className="w-18 h-18 rounded-full bg-neutral-800 text-white font-medium text-sm active:bg-neutral-700 shadow"
              >
                {isRunning ? 'Lap' : 'Reset'}
              </button>

              <button
                onClick={handleStartStop}
                className={`w-18 h-18 rounded-full font-medium text-sm text-white shadow ${
                  isRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isRunning ? 'Stop' : 'Start'}
              </button>
            </div>

            {/* Laps List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-800">
              {laps.map((lap, index) => (
                <div key={index} className="py-2.5 flex justify-between text-sm px-2">
                  <span className="text-neutral-400 font-mono">Lap {laps.length - index}</span>
                  <span className="font-mono text-white">{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALARM */}
        {tab === 'alarm' && (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Alarms</h1>
            <div className="divide-y divide-neutral-800">
              {alarms.map((alarm) => (
                <div key={alarm.id} className="py-4 flex items-center justify-between">
                  <div>
                    <span className="text-4xl font-light">{alarm.time}</span>
                    <p className="text-xs text-neutral-400 mt-1">{alarm.label}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={alarm.enabled}
                    onChange={() => {
                      soundService.playTap();
                      setAlarms(
                        alarms.map((a) => (a.id === alarm.id ? { ...a, enabled: !a.enabled } : a))
                      );
                    }}
                    className="w-10 h-6 accent-emerald-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORLD CLOCK */}
        {tab === 'world' && (
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight mb-2">World Clock</h1>
            <div className="divide-y divide-neutral-800">
              <div className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-neutral-400">Today, +0HRS</p>
                  <p className="text-xl font-semibold">Cupertino</p>
                </div>
                <span className="text-3xl font-light font-mono">09:41</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-neutral-400">Today, +3HRS</p>
                  <p className="text-xl font-semibold">New York</p>
                </div>
                <span className="text-3xl font-light font-mono">12:41</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-neutral-400">Today, +8HRS</p>
                  <p className="text-xl font-semibold">London</p>
                </div>
                <span className="text-3xl font-light font-mono">17:41</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-neutral-400">Tomorrow, +16HRS</p>
                  <p className="text-xl font-semibold">Tokyo</p>
                </div>
                <span className="text-3xl font-light font-mono">01:41</span>
              </div>
            </div>
          </div>
        )}

        {/* TIMER */}
        {tab === 'timer' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-56 h-56 rounded-full border-4 border-amber-500/30 flex items-center justify-center relative">
              <span className="text-5xl font-mono font-light text-white">15:00</span>
            </div>
            <button
              onClick={() => soundService.playTap()}
              className="w-18 h-18 rounded-full bg-emerald-600 text-white font-medium text-sm shadow"
            >
              Start
            </button>
          </div>
        )}
      </div>

      {/* Clock Bottom Tab Bar */}
      <div className="h-14 border-t border-neutral-800 grid grid-cols-4 items-center text-center">
        <button
          onClick={() => {
            soundService.playTap();
            setTab('world');
          }}
          className={`text-[11px] font-medium ${tab === 'world' ? 'text-amber-500' : 'text-neutral-500'}`}
        >
          World Clock
        </button>
        <button
          onClick={() => {
            soundService.playTap();
            setTab('alarm');
          }}
          className={`text-[11px] font-medium ${tab === 'alarm' ? 'text-amber-500' : 'text-neutral-500'}`}
        >
          Alarm
        </button>
        <button
          onClick={() => {
            soundService.playTap();
            setTab('stopwatch');
          }}
          className={`text-[11px] font-medium ${tab === 'stopwatch' ? 'text-amber-500' : 'text-neutral-500'}`}
        >
          Stopwatch
        </button>
        <button
          onClick={() => {
            soundService.playTap();
            setTab('timer');
          }}
          className={`text-[11px] font-medium ${tab === 'timer' ? 'text-amber-500' : 'text-neutral-500'}`}
        >
          Timer
        </button>
      </div>
    </div>
  );
};
