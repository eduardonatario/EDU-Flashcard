import React, { useState } from 'react';
import { Play, Square } from 'lucide-react';

export const ReadCardFace: React.FC<{
  title?: string;
  text?: string;
  autoplay?: boolean;
  lang?: 'pt-BR' | 'en-US';
  showPlayButton?: boolean;
  audioUrl?: string;
  isActiveFace?: boolean;
  readImageUrl?: string;
  isPreview?: boolean;
  audioOnly?: boolean;
}> = ({ title, text, autoplay = true, lang = 'pt-BR', showPlayButton = true, audioUrl, isActiveFace = true, readImageUrl, isPreview = false, audioOnly = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const fullText = title === text ? (title || '') : [title, text].filter(Boolean).join('. ');
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const startAudio = (manual: boolean = false) => {
    stopAudio();
    if (!isActiveFace && !manual && !isPreview) return;
    setIsPlaying(true);

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audio.play().catch(() => setIsPlaying(false));
    } else if (fullText && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = lang;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    if (autoplay && (isActiveFace || isPreview)) {
      const t = setTimeout(() => {
        startAudio(false);
      }, 400);
      return () => {
        clearTimeout(t);
        stopAudio();
      };
    } else {
      stopAudio();
      return () => {
        stopAudio();
      };
    }
  }, [fullText, autoplay, lang, audioUrl, isActiveFace, isPreview]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio(true);
    }
  };

  if (audioOnly) {
    return (
      <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
        {showPlayButton !== false && (
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            {isPlaying ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            {isPlaying ? 'Stop' : 'Play'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center text-center p-6 sm:p-8 relative select-none">
      {readImageUrl && (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <img
            src={readImageUrl}
            alt={title || 'Read Card Image'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      {showPlayButton !== false && (
        <button
          type="button"
          onClick={togglePlay}
          className={`absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
            readImageUrl ? 'bg-white/90 text-slate-800 hover:bg-white backdrop-blur-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          {isPlaying ? (
            <Square className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          {isPlaying ? 'Stop' : 'Play'}
        </button>
      )}
      {!readImageUrl && (
        <>
          {title && (
            <h3 className="font-extrabold text-current text-xl sm:text-2xl mb-2 tracking-tight">
              {title}
            </h3>
          )}
          {text && text !== title && (
            <p className="text-current opacity-85 text-sm sm:text-base max-w-md mx-auto">
              {text}
            </p>
          )}
          {!title && !text && (
            <p className="text-current opacity-50 text-xs italic">Modo Ler Card</p>
          )}
        </>
      )}
    </div>
  );
};
