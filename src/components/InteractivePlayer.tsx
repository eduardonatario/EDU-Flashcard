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
  const format = deck.cardAspectRatio || 'vertical';
  const isSquare = format === 'square';
  const isHorizontal = format === 'horizontal';
  const cardSize = deck.cardSize || 'medium';

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

  // Dimension classes based on card size and aspect ratio
  const isSingleLarge = cards.length === 1 && cardSize === 'large';

  const getCardDimensionClass = () => {
    if (isSingleLarge) {
      if (isSquare) return 'aspect-square w-full max-w-[780px] sm:max-w-[840px] mx-auto';
      if (isHorizontal) return 'aspect-[16/10] w-full max-w-[1040px] min-h-[460px] sm:min-h-[540px] mx-auto';
      return 'w-full max-w-[640px] sm:max-w-[720px] h-[660px] sm:h-[760px] mx-auto';
    }

    if (isSquare) {
      if (cardSize === 'small') return 'aspect-square max-w-[280px] mx-auto';
      if (cardSize === 'large') return 'aspect-square max-w-[560px] mx-auto';
      return 'aspect-square max-w-[330px] sm:max-w-[350px] mx-auto';
    }
    if (isHorizontal) {
      if (cardSize === 'small') return 'aspect-[16/10] max-w-[340px] min-h-[190px] mx-auto';
      if (cardSize === 'large') return 'aspect-[16/10] max-w-[680px] min-h-[380px] mx-auto';
      return 'aspect-[16/10] max-w-[420px] min-h-[240px] mx-auto';
    }
    // Vertical
    if (cardSize === 'small') return 'h-[310px] sm:h-[330px] max-w-[290px] mx-auto';
    if (cardSize === 'large') return 'h-[540px] sm:h-[620px] max-w-[480px] mx-auto';
    return 'h-[350px] sm:h-[380px] max-w-[340px] mx-auto';
  };

  // Image height based on card size and orientation
  const getFrontImgHeightClass = () => {
    if (isSingleLarge) {
      if (isHorizontal) return 'h-64 sm:h-80 lg:h-96';
      return 'h-72 sm:h-96 lg:h-[400px]';
    }
    if (isHorizontal) {
      if (cardSize === 'small') return 'h-24';
      if (cardSize === 'large') return 'h-48 sm:h-52';
      return 'h-28 sm:h-30';
    }
    if (cardSize === 'small') return 'h-28 sm:h-30';
    if (cardSize === 'large') return 'h-64 sm:h-72';
    return 'h-36 sm:h-40';
  };

  const getBackImgHeightClass = () => {
    if (isSingleLarge) {
      if (isHorizontal) return 'h-56 sm:h-72 lg:h-88';
      return 'h-64 sm:h-88 lg:h-[360px]';
    }
    if (isHorizontal) {
      if (cardSize === 'small') return 'h-20';
      if (cardSize === 'large') return 'h-44 sm:h-48';
      return 'h-24 sm:h-26';
    }
    if (cardSize === 'small') return 'h-24';
    if (cardSize === 'large') return 'h-52 sm:h-60';
    return 'h-32 sm:h-34';
  };

  // Grid spacing based on card size
  const getGridGapClass = () => {
    if (cardSize === 'small') return 'gap-2.5 sm:gap-3';
    if (cardSize === 'large') return 'gap-6 sm:gap-8';
    return 'gap-4 sm:gap-5';
  };

  // Container width based on card size
  const getContainerWidthClass = () => {
    if (isSingleLarge) return 'max-w-6xl';
    if (cardSize === 'small') return 'max-w-7xl';
    if (cardSize === 'large') return 'max-w-5xl';
    return 'max-w-5xl';
  };

  // Grid columns based on card size and count
  const getGridColsClass = () => {
    if (cards.length === 1) {
      if (cardSize === 'small') return 'grid-cols-1 max-w-xs mx-auto';
      if (cardSize === 'large') return 'grid-cols-1 w-full max-w-5xl mx-auto';
      return 'grid-cols-1 max-w-sm mx-auto';
    }

    if (cardSize === 'small') {
      if (cards.length === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto';
      if (cards.length === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto';
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }

    if (cardSize === 'large') {
      return 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto';
    }

    // Medium default
    if (cards.length === 2) return 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className={`w-full ${getContainerWidthClass()} mx-auto px-4 py-8 sm:px-6`}>
      {/* GRID DISPLAY OF CARDS */}
      <div className={`grid ${getGridGapClass()} ${getGridColsClass()} justify-center`}>
        {cards.map((card) => {
          const isFlipped = !!flippedCards[card.id];

          // Content type evaluation
          const frontIsImage = card.frontContentType === 'image' && !!card.imageUrl;
          const frontIsImageText = (card.frontContentType === 'image-text' || (!card.frontContentType && !!card.imageUrl)) && !!card.imageUrl;

          const backIsImage = card.backContentType === 'image' && !!card.backImageUrl;
          const backIsImageText = (card.backContentType === 'image-text' || (!card.backContentType && !!card.backImageUrl)) && !!card.backImageUrl;

          return (
            <div 
              key={card.id}
              className={`perspective-1000 w-full select-none cursor-pointer ${getCardDimensionClass()}`}
              onClick={() => handleCardFlip(card.id)}
            >
              <div 
                className={`card-flipper relative w-full h-full transform-style-3d transition-transform duration-600 ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* CARD FRONT FACE */}
                <div 
                  className={`absolute inset-0 w-full h-full backface-hidden rounded-3xl border border-slate-200 hover:border-blue-400 shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col ${
                    deck.frontBgType === 'light-gray' ? 'bg-slate-100 text-slate-900' :
                    deck.frontBgType === 'custom' ? '' : 'bg-white text-slate-900'
                  }`}
                  style={deck.frontBgType === 'custom' ? {
                    backgroundColor: deck.frontCustomBgColor || '#ffffff',
                    color: deck.frontCustomTextColor || '#0f172a'
                  } : {}}
                >
                  {frontIsImage ? (
                    /* IMAGE ONLY FRONT */
                    <div className="w-full h-full overflow-hidden">
                      <img 
                        src={card.imageUrl} 
                        alt={card.imageAlt || card.title || 'Imagem Frente'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : frontIsImageText ? (
                    /* IMAGE + TEXT FRONT */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className={`w-full ${getFrontImgHeightClass()} bg-slate-100 overflow-hidden relative shrink-0`}>
                        <img 
                          src={card.imageUrl} 
                          alt={card.imageAlt || card.title || 'Imagem Frente'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className={`flex flex-col justify-center flex-1 text-center overflow-y-auto ${
                        isSingleLarge ? 'p-6 sm:p-10 lg:p-12' : cardSize === 'small' ? 'p-3' : cardSize === 'large' ? 'p-8 sm:p-10' : 'p-4 sm:p-5'
                      }`}>
                        {card.title && (
                          <h3 className={`font-extrabold text-current mb-2 tracking-tight ${
                            isSingleLarge ? 'text-2xl sm:text-4xl lg:text-5xl' : cardSize === 'small' ? 'text-base sm:text-lg' : cardSize === 'large' ? 'text-2xl sm:text-4xl' : 'text-lg sm:text-xl'
                          }`}>
                            {card.title}
                          </h3>
                        )}
                        {card.text && card.text !== card.title && (
                          <p className={`text-current opacity-85 leading-relaxed max-w-2xl mx-auto ${
                            isSingleLarge ? 'text-base sm:text-xl lg:text-2xl' : cardSize === 'small' ? 'text-xs' : cardSize === 'large' ? 'text-base sm:text-xl' : 'text-xs sm:text-sm'
                          }`}>
                            {card.text}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* TEXT ONLY FRONT */
                    <div className={`flex-1 w-full h-full flex flex-col items-center justify-center text-center ${
                      isSingleLarge ? 'p-8 sm:p-14 lg:p-20' : cardSize === 'small' ? 'p-4' : cardSize === 'large' ? 'p-10 sm:p-14' : 'p-6 sm:p-7'
                    }`}>
                      {card.title && (
                        <h3 className={`font-extrabold text-current mb-2.5 tracking-tight ${
                          isSingleLarge ? 'text-3xl sm:text-5xl lg:text-6xl' : cardSize === 'small' ? 'text-lg sm:text-xl' : cardSize === 'large' ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-2xl'
                        }`}>
                          {card.title}
                        </h3>
                      )}
                      {card.text && card.text !== card.title && (
                        <p className={`text-current opacity-85 leading-relaxed max-w-2xl mx-auto ${
                          isSingleLarge ? 'text-lg sm:text-2xl' : cardSize === 'small' ? 'text-xs sm:text-sm' : cardSize === 'large' ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'
                        }`}>
                          {card.text}
                        </p>
                      )}
                      {!card.title && !card.text && (
                        <p className={`font-extrabold text-current leading-snug tracking-tight break-words max-w-lg ${
                          isSingleLarge ? 'text-3xl sm:text-5xl' : cardSize === 'small' ? 'text-lg sm:text-xl' : 'text-xl'
                        }`}>
                          Texto do Card
                        </p>
                      )}
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
                  {backIsImage ? (
                    /* IMAGE ONLY BACK */
                    <div className="w-full h-full overflow-hidden">
                      <img 
                        src={card.backImageUrl} 
                        alt={card.backTitle || 'Verso'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : backIsImageText ? (
                    /* IMAGE + TEXT BACK */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className={`w-full ${getBackImgHeightClass()} bg-slate-200 overflow-hidden relative shrink-0`}>
                        <img 
                          src={card.backImageUrl} 
                          alt={card.backTitle || 'Verso'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className={`flex flex-col justify-center flex-1 text-center overflow-y-auto ${
                        isSingleLarge ? 'p-6 sm:p-10 lg:p-12' : cardSize === 'small' ? 'p-3' : cardSize === 'large' ? 'p-8 sm:p-10' : 'p-4 sm:p-5'
                      }`}>
                        {card.backTitle && (
                          <h4 className={`font-extrabold text-current mb-2 tracking-tight ${
                            isSingleLarge ? 'text-2xl sm:text-4xl lg:text-5xl' : cardSize === 'small' ? 'text-base sm:text-lg' : cardSize === 'large' ? 'text-2xl sm:text-4xl' : 'text-lg sm:text-xl'
                          }`}>
                            {card.backTitle}
                          </h4>
                        )}
                        {card.backText && card.backText !== card.backTitle && (
                          <div className={`text-current opacity-90 leading-relaxed text-center max-w-2xl mx-auto ${
                            isSingleLarge ? 'text-base sm:text-xl lg:text-2xl' : cardSize === 'small' ? 'text-xs' : cardSize === 'large' ? 'text-base sm:text-xl' : 'text-xs sm:text-sm'
                          }`}>
                            {card.backText}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* TEXT ONLY BACK */
                    <div className={`flex-1 w-full h-full flex flex-col items-center justify-center text-center ${
                      isSingleLarge ? 'p-8 sm:p-14 lg:p-20' : cardSize === 'small' ? 'p-4' : cardSize === 'large' ? 'p-10 sm:p-14' : 'p-6 sm:p-7'
                    }`}>
                      {card.backTitle && (
                        <h4 className={`font-extrabold text-current mb-2.5 tracking-tight ${
                          isSingleLarge ? 'text-3xl sm:text-5xl lg:text-6xl' : cardSize === 'small' ? 'text-lg sm:text-xl' : cardSize === 'large' ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-2xl'
                        }`}>
                          {card.backTitle}
                        </h4>
                      )}
                      {card.backText && card.backText !== card.backTitle && (
                        <div className={`text-current opacity-90 leading-relaxed text-center max-w-2xl mx-auto ${
                          isSingleLarge ? 'text-lg sm:text-2xl' : cardSize === 'small' ? 'text-xs sm:text-sm' : cardSize === 'large' ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'
                        }`}>
                          {card.backText}
                        </div>
                      )}
                      {!card.backTitle && !card.backText && (
                        <p className={`font-extrabold text-current leading-snug tracking-tight break-words max-w-lg ${
                          isSingleLarge ? 'text-3xl sm:text-5xl' : cardSize === 'small' ? 'text-lg sm:text-xl' : 'text-xl'
                        }`}>
                          Resposta
                        </p>
                      )}
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
