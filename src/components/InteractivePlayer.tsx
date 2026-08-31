import React, { useState } from 'react';
import { Sparkles, Layers } from 'lucide-react';
import { Deck } from '../types';
import { soundEffects } from '../utils/audio';

interface InteractivePlayerProps {
  deck: Deck;
  onUpdateDeck: (updated: Deck) => void;
  onSwitchToEditor: () => void;
}

export const InteractivePlayer: React.FC<InteractivePlayerProps> = ({
  deck,
  onSwitchToEditor
}) => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const cards = deck.cards || [];
  const isSquare = deck.cardAspectRatio === 'square';

  const handleCardFlip = (cardId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
    soundEffects.playFlipSound(deck.enableSound ?? false);
  };

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Este conjunto está sem flashcards</h2>
        <p className="text-sm text-slate-500 mb-6">
          Adicione seus primeiros cards com texto ou imagem para começar a visualizar.
        </p>
        <button
          onClick={onSwitchToEditor}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-600/20"
        >
          <Sparkles className="w-4 h-4" />
          Criar Primeiro Flashcard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* GRID DISPLAY OF CARDS - ONLY CARDS */}
      <div className={`grid gap-6 ${
        cards.length === 1 
          ? 'grid-cols-1 max-w-md mx-auto' 
          : cards.length === 2 
          ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {cards.map((card) => {
          const isFlipped = !!flippedCards[card.id];
          const isSimple = card.cardType === 'simple';
          const showFrontImage = card.frontContentType === 'image' || (!card.frontContentType && !!card.imageUrl && !card.text && !card.title);
          const showBackImage = card.backContentType === 'image' || (!card.backContentType && !!card.backImageUrl && !card.backText && !card.backTitle);

          return (
            <div 
              key={card.id}
              className={`perspective-1000 w-full select-none cursor-pointer ${
                isSquare ? 'aspect-square max-w-md mx-auto' : 'h-[380px] sm:h-[430px]'
              }`}
              onClick={() => handleCardFlip(card.id)}
            >
              <div 
                className={`card-flipper relative w-full h-full transform-style-3d transition-transform duration-600 ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* CARD FRONT FACE */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-3xl border border-slate-200 hover:border-blue-400 shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                  {card.frontContentType === 'image-text' || card.frontContentType === 'text' || !card.frontContentType || card.cardType === 'standard' ? (
                    /* IMAGE + TEXT OR TEXT ONLY FRONT */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {card.frontContentType === 'image-text' && card.imageUrl && (
                        <div className="w-full h-44 bg-slate-100 overflow-hidden relative shrink-0">
                          <img 
                            src={card.imageUrl} 
                            alt={card.imageAlt || card.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="p-6 flex flex-col justify-center flex-1 text-center overflow-y-auto">
                        {card.title && (
                          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">
                            {card.title}
                          </h3>
                        )}
                        {card.text && card.text !== card.title && (
                          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-md mx-auto">
                            {card.text}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : card.frontContentType === 'image' && card.imageUrl ? (
                    /* IMAGE ONLY FRONT */
                    <div className="w-full h-full overflow-hidden">
                      <img 
                        src={card.imageUrl} 
                        alt={card.imageAlt || 'Imagem Frente'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    /* TEXT ONLY FRONT */
                    <div className="flex-1 w-full h-full flex items-center justify-center p-8 sm:p-10 text-center">
                      <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-snug tracking-tight break-words max-w-md">
                        {card.text || card.title || 'Texto do Card'}
                      </p>
                    </div>
                  )}
                </div>

                {/* CARD BACK FACE */}
                <div 
                  className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl border border-slate-200 hover:border-blue-400 shadow-xl overflow-hidden flex flex-col ${
                    deck.backBgType === 'white' ? 'bg-white text-slate-900' : 
                    deck.backBgType === 'custom' ? '' : 'bg-slate-100 text-slate-900'
                  }`}
                  style={deck.backBgType === 'custom' ? {
                    backgroundColor: deck.backCustomBgColor || '#f1f5f9',
                    color: deck.backCustomTextColor || '#1e293b'
                  } : {}}
                >
                  {card.backContentType === 'image-text' || card.backContentType === 'text' || !card.backContentType || card.cardType === 'standard' ? (
                    /* IMAGE + TEXT OR TEXT ONLY BACK */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {card.backContentType === 'image-text' && card.backImageUrl && (
                        <div className="w-full h-36 bg-slate-200 overflow-hidden relative shrink-0">
                          <img 
                            src={card.backImageUrl} 
                            alt="Verso"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="p-6 flex flex-col justify-center flex-1 text-center overflow-y-auto">
                        {card.backTitle && (
                          <h4 className="text-xl sm:text-2xl font-extrabold text-current mb-2 tracking-tight">
                            {card.backTitle}
                          </h4>
                        )}
                        {card.backText && card.backText !== card.backTitle && (
                          <div className="text-current opacity-90 text-sm sm:text-base leading-relaxed text-center max-w-md mx-auto">
                            {card.backText}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : card.backContentType === 'image' && card.backImageUrl ? (
                    /* IMAGE ONLY BACK */
                    <div className="w-full h-full overflow-hidden">
                      <img 
                        src={card.backImageUrl} 
                        alt="Imagem Verso"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    /* TEXT ONLY BACK */
                    <div className="flex-1 w-full h-full flex items-center justify-center p-8 sm:p-10 text-center">
                      <p className="text-2xl sm:text-3xl font-extrabold text-current leading-snug tracking-tight break-words max-w-md">
                        {card.backText || card.backTitle || 'Resposta'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
