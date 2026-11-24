import React, { useState, useRef, useEffect } from 'react';
import { PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons';

export const VoiceMessage = ({ audioUrl, isSender }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl min-w-[200px] sm:min-w-[240px] ${
      isSender ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-100'
    }`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <button 
        type="button" 
        onClick={togglePlay} 
        className="text-2xl flex items-center justify-center hover:scale-105 transition-transform focus:outline-none"
      >
        {isPlaying ? (
          <PauseCircleFilled className={isSender ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
        ) : (
          <PlayCircleFilled className={isSender ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-300 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between items-center text-[10px] opacity-80 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
