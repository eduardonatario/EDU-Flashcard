import React, { useState } from 'react';
import { 
  Layers, 
  Play, 
  Settings, 
  Download, 
  Copy, 
  Check
} from 'lucide-react';
import { Deck, ViewMode } from '../types';
import { downloadDeckHTML, copyDeckHTMLToClipboard } from '../utils/htmlExporter';

interface HeaderProps {
  currentDeck: Deck;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDeck,
  viewMode,
  onChangeViewMode
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHTML = async () => {
    const success = await copyDeckHTMLToClipboard(currentDeck);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadHTML = () => {
    downloadDeckHTML(currentDeck);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between shadow-xs">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100 text-white shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none">
              Flashcard
            </h1>
          </div>
        </div>

        {/* Navigation View Modes (Preview vs Configurações) */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onChangeViewMode('player')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'player'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('editor')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'editor'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configurações</span>
            </button>
          </nav>

          {/* Action Buttons: Copiar HTML & Baixar HTML */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              type="button"
              id="btnCopiarHTML"
              onClick={handleCopyHTML}
              title="Copiar código HTML independente para a área de transferência"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Copiar HTML</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btnBaixarHTML"
              onClick={handleDownloadHTML}
              title="Baixar arquivo HTML independente imediatamente"
              className="flex items-center gap-2 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-md shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar HTML</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
