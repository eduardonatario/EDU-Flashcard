import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Video,
  RotateCw, 
  Link as LinkIcon,
  Upload,
  X
} from 'lucide-react';
import { Deck, Flashcard, PlayerLayout, CardSize } from '../types';
import { ReadCardFace } from './ReadCardFace';

export const ABSTRACT_EXAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80'
];

interface CardEditorProps {
  deck: Deck;
  onUpdateDeck: (updated: Deck) => void;
  onSwitchToPlayer: () => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  deck,
  onUpdateDeck,
  onSwitchToPlayer
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(
    deck.cards[0]?.id || ''
  );
  const [previewFlipped, setPreviewFlipped] = useState(false);

  // Deck settings state
  const [deckAspectRatio, setDeckAspectRatio] = useState<'vertical' | 'square'>(deck.cardAspectRatio || 'vertical');
  const [deckCardSize, setDeckCardSize] = useState<CardSize>(deck.cardSize || 'medium');
  const [deckEnableSound, setDeckEnableSound] = useState(deck.enableSound ?? false);
  
  // Front face color states
  const [deckFrontBgType, setDeckFrontBgType] = useState<'white' | 'light-gray' | 'custom'>(deck.frontBgType || 'white');
  const [deckFrontCustomBgColor, setDeckFrontCustomBgColor] = useState(deck.frontCustomBgColor || '#ffffff');
  const [deckFrontCustomTextColor, setDeckFrontCustomTextColor] = useState(deck.frontCustomTextColor || '#0f172a');

  // Back face color states
  const [deckBackBgType, setDeckBackBgType] = useState<'white' | 'light-gray' | 'custom'>(deck.backBgType || 'white');
  const [deckBackCustomBgColor, setDeckBackCustomBgColor] = useState(deck.backCustomBgColor || '#ffffff');
  const [deckBackCustomTextColor, setDeckBackCustomTextColor] = useState(deck.backCustomTextColor || '#0f172a');

  // Active side for card color customizer (Frente / Verso)
  const [colorTargetSide, setColorTargetSide] = useState<'front' | 'back'>('front');

  const cards = deck.cards || [];
  const activeCardIndex = cards.findIndex((c) => c.id === selectedCardId);
  const activeCard = cards[activeCardIndex] || cards[0];

  const frontFileInputRef = useRef<HTMLInputElement | null>(null);
  const backFileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to handle local image uploads
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isBack: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (isBack) {
        handleUpdateCard({
          backImageUrl: dataUrl,
          backContentType: activeCard.backContentType === 'text' ? 'image-text' : (activeCard.backContentType || 'image-text')
        });
      } else {
        handleUpdateCard({
          imageUrl: dataUrl,
          frontContentType: activeCard.frontContentType === 'text' ? 'image-text' : (activeCard.frontContentType || 'image-text')
        });
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value to allow re-uploading the same file if needed
    e.target.value = '';
  };

  // Update fields on the active card (supports single field or batch update object)
  const handleUpdateCard = (fieldOrUpdates: keyof Flashcard | Partial<Flashcard>, value?: any) => {
    if (!activeCard) return;
    const updatedCards = cards.map((c) => {
      if (c.id === activeCard.id) {
        if (typeof fieldOrUpdates === 'object') {
          return { ...c, ...fieldOrUpdates };
        } else {
          return { ...c, [fieldOrUpdates]: value };
        }
      }
      return c;
    });

    onUpdateDeck({
      ...deck,
      cards: updatedCards,
      updatedAt: new Date().toISOString()
    });
  };

  // Add a new blank card
  const handleAddCard = () => {
    let nextNum = cards.length + 1;
    let maxFound = 0;
    cards.forEach((c) => {
      const matchTitle = c.title?.match(/(?:Título do card|card)\s*(\d+)/i);
      if (matchTitle) {
        const val = parseInt(matchTitle[1], 10);
        if (!isNaN(val) && val > maxFound) maxFound = val;
      }
      const matchBack = c.backText?.match(/(?:Verso do Flashcard|Flashcard)\s*(\d+)/i);
      if (matchBack) {
        const val = parseInt(matchBack[1], 10);
        if (!isNaN(val) && val > maxFound) maxFound = val;
      }
    });

    if (maxFound >= nextNum) {
      nextNum = maxFound + 1;
    }

    const newCard: Flashcard = {
      id: 'card-' + Date.now(),
      title: `Título do card ${nextNum}`,
      text: 'Texto do card',
      imageUrl: '',
      imageAlt: '',
      backTitle: 'Título verso',
      backText: `Verso do Flashcard ${nextNum}`
    };

    const updatedCards = [...cards, newCard];
    onUpdateDeck({
      ...deck,
      cards: updatedCards,
      updatedAt: new Date().toISOString()
    });
    setSelectedCardId(newCard.id);
    setPreviewFlipped(false);
  };

  // Delete card safely
  const handleDeleteCard = (cardId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (cards.length <= 1) {
      const freshCard: Flashcard = {
        id: 'card-' + Date.now(),
        title: 'Título do card 1',
        text: 'Texto do card',
        imageUrl: '',
        imageAlt: '',
        backTitle: 'Título verso',
        backText: 'Verso do Flashcard 1'
      };
      onUpdateDeck({
        ...deck,
        cards: [freshCard],
        updatedAt: new Date().toISOString()
      });
      setSelectedCardId(freshCard.id);
      return;
    }

    const cardIndex = cards.findIndex((c) => c.id === cardId);
    const updatedCards = cards.filter((c) => c.id !== cardId);

    onUpdateDeck({
      ...deck,
      cards: updatedCards,
      updatedAt: new Date().toISOString()
    });

    if (selectedCardId === cardId) {
      const nextIndex = Math.min(cardIndex, updatedCards.length - 1);
      setSelectedCardId(updatedCards[nextIndex]?.id || updatedCards[0].id);
    }
  };

  // Move card up
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const updated = [...cards];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onUpdateDeck({
      ...deck,
      cards: updated,
      updatedAt: new Date().toISOString()
    });
  };

  // Move card down
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === cards.length - 1) return;
    const updated = [...cards];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onUpdateDeck({
      ...deck,
      cards: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const updateDeckSettings = (fields: Partial<Deck>) => {
    onUpdateDeck({
      ...deck,
      ...fields,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* OPÇÕES GERAIS DE APRESENTAÇÃO E ESTILO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 mb-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Opções de Apresentação e Estilo
          </h3>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <input
              type="checkbox"
              checked={deckEnableSound}
              onChange={(e) => {
                setDeckEnableSound(e.target.checked);
                updateDeckSettings({ enableSound: e.target.checked });
              }}
              className="w-3.5 h-3.5 text-blue-600 rounded-sm focus:ring-blue-500"
            />
            <span>Efeitos Sonoros Sutis</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          
          {/* Opção 1: Tamanho dos Cards */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 h-full flex flex-col justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Tamanho dos Cards
            </label>
            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDeckCardSize('small');
                  updateDeckSettings({ cardSize: 'small' });
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs ${
                  deckCardSize === 'small'
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                Pequeno
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeckCardSize('medium');
                  updateDeckSettings({ cardSize: 'medium' });
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs ${
                  deckCardSize === 'medium'
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                Médio
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeckCardSize('large');
                  updateDeckSettings({ cardSize: 'large' });
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs ${
                  deckCardSize === 'large'
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                Grande
              </button>
            </div>
          </div>

          {/* Opção 2: Formato / Proporção */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 h-full flex flex-col justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Formato dos Cards
            </label>
            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDeckAspectRatio('vertical');
                  updateDeckSettings({ cardAspectRatio: 'vertical' });
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs ${
                  deckAspectRatio === 'vertical'
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                Vertical
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeckAspectRatio('square');
                  updateDeckSettings({ cardAspectRatio: 'square' });
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs ${
                  deckAspectRatio === 'square'
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                Quadrado
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeckAspectRatio('horizontal');
                  updateDeckSettings({ cardAspectRatio: 'horizontal' });
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs ${
                  deckAspectRatio === 'horizontal'
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                Horizontal
              </button>
            </div>
          </div>

          {/* Opção 3: Cor dos Cards (Frente e Verso) */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <label className="block text-xs font-bold text-slate-700">
                Cor dos Cards
              </label>
              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setColorTargetSide('front')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    colorTargetSide === 'front'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Frente
                </button>
                <button
                  type="button"
                  onClick={() => setColorTargetSide('back')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    colorTargetSide === 'back'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Verso
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (colorTargetSide === 'front') {
                    setDeckFrontBgType('white');
                    updateDeckSettings({ frontBgType: 'white' });
                  } else {
                    setDeckBackBgType('white');
                    updateDeckSettings({ backBgType: 'white' });
                  }
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs ${
                  (colorTargetSide === 'front' ? deckFrontBgType === 'white' : deckBackBgType === 'white')
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                Branco
              </button>
              <button
                type="button"
                onClick={() => {
                  if (colorTargetSide === 'front') {
                    setDeckFrontBgType('light-gray');
                    updateDeckSettings({ frontBgType: 'light-gray' });
                  } else {
                    setDeckBackBgType('light-gray');
                    updateDeckSettings({ backBgType: 'light-gray' });
                  }
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs ${
                  (colorTargetSide === 'front' ? deckFrontBgType === 'light-gray' : deckBackBgType === 'light-gray')
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                Cinza
              </button>
              <button
                type="button"
                onClick={() => {
                  if (colorTargetSide === 'front') {
                    setDeckFrontBgType('custom');
                    updateDeckSettings({ frontBgType: 'custom' });
                  } else {
                    setDeckBackBgType('custom');
                    updateDeckSettings({ backBgType: 'custom' });
                  }
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs ${
                  (colorTargetSide === 'front' ? deckFrontBgType === 'custom' : deckBackBgType === 'custom')
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                Personalizar
              </button>
            </div>

            {(colorTargetSide === 'front' ? deckFrontBgType === 'custom' : deckBackBgType === 'custom') && (
              <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-lg border border-slate-200 mt-1.5">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Fundo</label>
                  <div className="flex gap-1 items-center">
                    <input
                      type="color"
                      value={colorTargetSide === 'front' ? deckFrontCustomBgColor : deckBackCustomBgColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (colorTargetSide === 'front') {
                          setDeckFrontCustomBgColor(val);
                          updateDeckSettings({ frontCustomBgColor: val });
                        } else {
                          setDeckBackCustomBgColor(val);
                          updateDeckSettings({ backCustomBgColor: val });
                        }
                      }}
                      className="w-5 h-5 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={colorTargetSide === 'front' ? deckFrontCustomBgColor : deckBackCustomBgColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (colorTargetSide === 'front') {
                          setDeckFrontCustomBgColor(val);
                          updateDeckSettings({ frontCustomBgColor: val });
                        } else {
                          setDeckBackCustomBgColor(val);
                          updateDeckSettings({ backCustomBgColor: val });
                        }
                      }}
                      className="w-full px-1 py-0.5 text-[10px] border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Texto</label>
                  <div className="flex gap-1 items-center">
                    <input
                      type="color"
                      value={colorTargetSide === 'front' ? deckFrontCustomTextColor : deckBackCustomTextColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (colorTargetSide === 'front') {
                          setDeckFrontCustomTextColor(val);
                          updateDeckSettings({ frontCustomTextColor: val });
                        } else {
                          setDeckBackCustomTextColor(val);
                          updateDeckSettings({ backCustomTextColor: val });
                        }
                      }}
                      className="w-5 h-5 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={colorTargetSide === 'front' ? deckFrontCustomTextColor : deckBackCustomTextColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (colorTargetSide === 'front') {
                          setDeckFrontCustomTextColor(val);
                          updateDeckSettings({ frontCustomTextColor: val });
                        } else {
                          setDeckBackCustomTextColor(val);
                          updateDeckSettings({ backCustomTextColor: val });
                        }
                      }}
                      className="w-full px-1 py-0.5 text-[10px] border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CARDS MANAGEMENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: CARDS LIST (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Lista de Cards ({cards.length})
              </span>
              <button
                type="button"
                onClick={handleAddCard}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {cards.map((card, idx) => {
                const isSelected = card.id === activeCard?.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedCardId(card.id);
                      setPreviewFlipped(false);
                    }}
                    className={`group relative p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          #{idx + 1}
                        </span>
                        <h4 className={`text-xs font-bold truncate max-w-[140px] ${
                          isSelected ? 'text-blue-950' : 'text-slate-800'
                        }`}>
                          {card.title || 'Sem título'}
                        </h4>
                      </div>

                      {/* Card Reorder Actions */}
                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => handleMoveUp(idx, e)}
                          disabled={idx === 0}
                          title="Mover para cima"
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleMoveDown(idx, e)}
                          disabled={idx === cards.length - 1}
                          title="Mover para baixo"
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {card.text || 'Sem texto de pergunta...'}
                    </p>

                    {/* Remover card item directly in the card list */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      {card.imageUrl ? (
                        <span className="flex items-center gap-1 text-[10px] text-blue-700 font-medium">
                          <ImageIcon className="w-3 h-3" /> Imagem
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Card #{idx + 1}</span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteCard(card.id, e)}
                        className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 px-2 py-1 rounded-md transition-all border border-rose-200 hover:border-rose-600"
                        title="Remover este card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover card</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER / RIGHT COLUMN: CARD FORM EDITING (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
            {activeCard ? (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                
                <div className="space-y-5">
                  {/* FRENTE */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="space-y-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Frente do Card</h3>
                      </div>

                      {/* Tipo de conteúdo Frente - aligned on a single row */}
                      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleUpdateCard('frontContentType', 'text')}
                          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                            activeCard.frontContentType === 'text' || (!activeCard.frontContentType && !activeCard.imageUrl && !activeCard.videoUrl) ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Texto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard({
                              frontContentType: 'image',
                              imageUrl: activeCard.imageUrl || ABSTRACT_EXAMPLE_IMAGES[0]
                            });
                          }}
                          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                            activeCard.frontContentType === 'image' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Imagem
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard({
                              frontContentType: 'image-text',
                              imageUrl: activeCard.imageUrl || ABSTRACT_EXAMPLE_IMAGES[0]
                            });
                          }}
                          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                            activeCard.frontContentType === 'image-text' || (!activeCard.frontContentType && !!activeCard.imageUrl) ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Imagem + Texto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard({
                              frontContentType: 'video',
                              videoUrl: activeCard.videoUrl || ''
                            });
                          }}
                          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                            activeCard.frontContentType === 'video' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Vídeo
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo Frente: Vídeo, Ler card, Texto ou Imagem */}
                    {activeCard.frontContentType === 'read' ? (
                      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Título da frente (corpo maior) *
                          </label>
                          <input
                            type="text"
                            value={activeCard.title || ''}
                            onChange={(e) => handleUpdateCard('title', e.target.value)}
                            placeholder="Digite o título principal..."
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Trecho de texto da frente (corpo menor)
                          </label>
                          <textarea
                            value={activeCard.text || ''}
                            onChange={(e) => handleUpdateCard('text', e.target.value)}
                            placeholder="Digite o trecho de texto complementar..."
                            rows={3}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Modo de Reprodução
                          </label>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateCard('frontReadAutoplay', true)}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.frontReadAutoplay !== false
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Auto play
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateCard({ frontReadAutoplay: false, frontShowPlayButton: true })}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.frontReadAutoplay === false
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Aguardar play
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Exibição do Botão de Play
                          </label>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateCard('frontShowPlayButton', true)}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.frontShowPlayButton !== false
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Exibir Botão
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateCard({ frontShowPlayButton: false, frontReadAutoplay: true })}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.frontShowPlayButton === false
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Ocultar Botão
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Idioma da Leitura (TTS)
                          </label>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateCard('frontReadLang', 'pt-BR')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                (activeCard.frontReadLang || 'pt-BR') === 'pt-BR'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Português (Brasil)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateCard('frontReadLang', 'en-US')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.frontReadLang === 'en-US'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Inglês (English)
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            URL da imagem (opcional - ocupa todo o espaço do card, lendo o texto em segundo plano)
                          </label>
                          <input
                            type="text"
                            value={activeCard.frontReadImageUrl || ''}
                            onChange={(e) => handleUpdateCard('frontReadImageUrl', e.target.value)}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white mb-2"
                          />
                          <div className="flex flex-wrap gap-1.5">
                            {ABSTRACT_EXAMPLE_IMAGES.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleUpdateCard('frontReadImageUrl', imgUrl)}
                                className={`relative w-8 h-8 rounded-lg overflow-hidden border transition-all hover:scale-105 shrink-0 ${
                                  activeCard.frontReadImageUrl === imgUrl ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200'
                                }`}
                                title={`Exemplo ${i + 1}`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            URL do arquivo MP3 (opcional - substitui TTS se preenchido)
                          </label>
                          <input
                            type="text"
                            value={activeCard.frontAudioUrl || ''}
                            onChange={(e) => handleUpdateCard('frontAudioUrl', e.target.value)}
                            placeholder="https://exemplo.com/audio.mp3"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 italic mt-1">O título e o texto da frente serão lidos ou o áudio MP3 será reproduzido.</p>
                      </div>
                    ) : activeCard.frontContentType === 'video' ? (
                      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              URL do Vídeo da Frente (YouTube, MP4, etc.) *
                            </label>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                              <input
                                type="checkbox"
                                checked={activeCard.videoAutoplay !== false}
                                onChange={(e) => handleUpdateCard('videoAutoplay', e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              Auto play
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="url"
                              value={activeCard.videoUrl || ''}
                              onChange={(e) => handleUpdateCard('videoUrl', e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                            />
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          </div>
                        </div>
                      </div>
                    ) : activeCard.frontContentType === 'image-text' || activeCard.frontContentType === 'text' || !activeCard.frontContentType ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Título da frente (corpo maior) *
                          </label>
                          <input
                            type="text"
                            value={activeCard.title ?? ''}
                            onChange={(e) => {
                              handleUpdateCard('title', e.target.value);
                            }}
                            placeholder="Título do card"
                            className="w-full px-3.5 py-2.5 text-base font-extrabold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Trecho de texto da frente (corpo menor)
                          </label>
                          <textarea
                            rows={2.5}
                            value={activeCard.text ?? ''}
                            onChange={(e) => {
                              handleUpdateCard('text', e.target.value);
                            }}
                            placeholder="Texto do card"
                            className="w-full px-3.5 py-2 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden leading-relaxed"
                          />
                        </div>
                        {/* Áudio / Ler Card para texto */}
                        <div className="pt-3 border-t border-slate-200 space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Áudio / Ler Card
                            </label>
                            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                              {activeCard.frontAudioEnabled === true && (
                                <>
                                  <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCard('frontReadLang', 'pt-BR')}
                                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                                        (activeCard.frontReadLang || 'pt-BR') === 'pt-BR'
                                          ? 'bg-blue-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      Português
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCard('frontReadLang', 'en-US')}
                                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                                        activeCard.frontReadLang === 'en-US'
                                          ? 'bg-blue-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      Inglês
                                    </button>
                                  </div>

                                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 select-none">
                                    <input
                                      type="checkbox"
                                      checked={activeCard.frontReadAutoplay !== false}
                                      onChange={(e) => handleUpdateCard('frontReadAutoplay', e.target.checked)}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <span>Auto play</span>
                                  </label>

                                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 select-none">
                                    <input
                                      type="checkbox"
                                      checked={activeCard.frontShowPlayButton !== false}
                                      onChange={(e) => handleUpdateCard('frontShowPlayButton', e.target.checked)}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <span>Exibir Play</span>
                                  </label>
                                </>
                              )}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={activeCard.frontAudioEnabled === true}
                                  onChange={(e) => handleUpdateCard('frontAudioEnabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-7 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                          {activeCard.frontAudioEnabled === true && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">URL do arquivo MP3 (Opcional - se vazio, lê com a voz do navegador)</label>
                              <input
                                type="text"
                                value={activeCard.frontAudioUrl || ''}
                                onChange={(e) => handleUpdateCard('frontAudioUrl', e.target.value)}
                                placeholder="https://exemplo.com/audio.mp3"
                                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Texto Curto da Frente (Opcional / Backup)
                        </label>
                        <input
                          type="text"
                          value={activeCard.text ?? activeCard.title ?? ''}
                          onChange={(e) => {
                            handleUpdateCard({
                              text: e.target.value,
                              title: e.target.value
                            });
                          }}
                          placeholder="Título do card"
                          className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                        />
                      </div>
                    )}

                    {(activeCard.frontContentType === 'image' || activeCard.frontContentType === 'image-text' || (!activeCard.frontContentType && !!activeCard.imageUrl)) && (
                      <div className="pt-2 border-t border-dashed border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700">
                            Imagem da Frente
                          </label>
                          {activeCard.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateCard({
                                  imageUrl: '',
                                  frontContentType: activeCard.frontContentType === 'image' ? 'text' : activeCard.frontContentType
                                });
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remover Imagem
                            </button>
                          )}
                        </div>

                        {/* File Upload and URL Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <input
                              type="file"
                              ref={frontFileInputRef}
                              accept="image/*"
                              onChange={(e) => handleImageFileUpload(e, false)}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => frontFileInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shadow-2xs"
                            >
                              <Upload className="w-3.5 h-3.5 text-blue-600" />
                              Carregar do Computador
                            </button>
                          </div>

                          <div className="relative">
                            <input
                              type="url"
                              value={activeCard.imageUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateCard({
                                  imageUrl: val,
                                  frontContentType: activeCard.frontContentType === 'text' ? 'image-text' : (activeCard.frontContentType || 'image-text')
                                });
                              }}
                              placeholder="Ou cole o link da imagem..."
                              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                            />
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Exemplos de Imagens
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {ABSTRACT_EXAMPLE_IMAGES.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  handleUpdateCard({
                                    imageUrl: imgUrl,
                                    frontContentType: activeCard.frontContentType === 'text' ? 'image-text' : (activeCard.frontContentType || 'image-text')
                                  });
                                }}
                                className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 shrink-0 ${
                                  activeCard.imageUrl === imgUrl ? 'border-blue-600 ring-2 ring-blue-600/30 scale-105' : 'border-slate-200 hover:border-slate-400'
                                }`}
                                title={`Usar imagem abstrata ${i + 1}`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Áudio em Segundo Plano / Ler Card para imagem */}
                        {activeCard.frontContentType === 'image' && (
                          <div className="pt-3 border-t border-slate-200 space-y-2.5">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Áudio / Ler Card
                              </label>
                              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                                {activeCard.frontAudioEnabled === true && (
                                  <>
                                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateCard('frontReadLang', 'pt-BR')}
                                        className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                                          (activeCard.frontReadLang || 'pt-BR') === 'pt-BR'
                                            ? 'bg-blue-600 text-white shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        Português
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateCard('frontReadLang', 'en-US')}
                                        className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                                          activeCard.frontReadLang === 'en-US'
                                            ? 'bg-blue-600 text-white shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        Inglês
                                      </button>
                                    </div>

                                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 select-none">
                                      <input
                                        type="checkbox"
                                        checked={activeCard.frontReadAutoplay !== false}
                                        onChange={(e) => handleUpdateCard('frontReadAutoplay', e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                      />
                                      <span>Auto play</span>
                                    </label>

                                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 select-none">
                                      <input
                                        type="checkbox"
                                        checked={activeCard.frontShowPlayButton !== false}
                                        onChange={(e) => handleUpdateCard('frontShowPlayButton', e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                      />
                                      <span>Exibir Play</span>
                                    </label>
                                  </>
                                )}
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={activeCard.frontAudioEnabled === true}
                                    onChange={(e) => handleUpdateCard('frontAudioEnabled', e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-7 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                            </div>
                            {activeCard.frontAudioEnabled === true && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">URL do arquivo MP3 (Opcional - se vazio, lê com a voz do navegador)</label>
                                <input
                                  type="text"
                                  value={activeCard.frontAudioUrl || ''}
                                  onChange={(e) => handleUpdateCard('frontAudioUrl', e.target.value)}
                                  placeholder="https://exemplo.com/audio.mp3"
                                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* VERSO */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="space-y-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Verso do Card</h3>
                      </div>

                      {/* Tipo de conteúdo Verso - aligned on a single row */}
                      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleUpdateCard('backContentType', 'text')}
                          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                            activeCard.backContentType === 'text' || (!activeCard.backContentType && !activeCard.backImageUrl && !activeCard.backVideoUrl) ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Texto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard({
                              backContentType: 'image',
                              backImageUrl: activeCard.backImageUrl || ABSTRACT_EXAMPLE_IMAGES[1]
                            });
                          }}
                          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                            activeCard.backContentType === 'image' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Imagem
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard({
                              backContentType: 'image-text',
                              backImageUrl: activeCard.backImageUrl || ABSTRACT_EXAMPLE_IMAGES[1]
                            });
                          }}
                          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                            activeCard.backContentType === 'image-text' || (!activeCard.backContentType && !!activeCard.backImageUrl) ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Imagem + Texto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard({
                              backContentType: 'video',
                              backVideoUrl: activeCard.backVideoUrl || ''
                            });
                          }}
                          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap ${
                            activeCard.backContentType === 'video' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Vídeo
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo Verso: Vídeo, Ler card, Texto ou Imagem */}
                    {activeCard.backContentType === 'read' ? (
                      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Título do verso (corpo maior) *
                          </label>
                          <input
                            type="text"
                            value={activeCard.backTitle || ''}
                            onChange={(e) => handleUpdateCard('backTitle', e.target.value)}
                            placeholder="Digite o título principal do verso..."
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Trecho de texto do verso (corpo menor)
                          </label>
                          <textarea
                            value={activeCard.backText || ''}
                            onChange={(e) => handleUpdateCard('backText', e.target.value)}
                            placeholder="Digite o trecho de texto complementar do verso..."
                            rows={3}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-white resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Modo de Reprodução
                          </label>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateCard('backReadAutoplay', true)}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.backReadAutoplay !== false
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Auto play
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateCard({ backReadAutoplay: false, backShowPlayButton: true })}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.backReadAutoplay === false
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Aguardar play
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Exibição do Botão de Play
                          </label>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateCard('backShowPlayButton', true)}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.backShowPlayButton !== false
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Exibir Botão
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateCard({ backShowPlayButton: false, backReadAutoplay: true })}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.backShowPlayButton === false
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Ocultar Botão
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Idioma da Leitura (TTS)
                          </label>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateCard('backReadLang', 'pt-BR')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                (activeCard.backReadLang || 'pt-BR') === 'pt-BR'
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Português (Brasil)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateCard('backReadLang', 'en-US')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                                activeCard.backReadLang === 'en-US'
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Inglês (English)
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            URL da imagem (opcional - ocupa todo o espaço do card, lendo o texto em segundo plano)
                          </label>
                          <input
                            type="text"
                            value={activeCard.backReadImageUrl || ''}
                            onChange={(e) => handleUpdateCard('backReadImageUrl', e.target.value)}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-white mb-2"
                          />
                          <div className="flex flex-wrap gap-1.5">
                            {ABSTRACT_EXAMPLE_IMAGES.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleUpdateCard('backReadImageUrl', imgUrl)}
                                className={`relative w-8 h-8 rounded-lg overflow-hidden border transition-all hover:scale-105 shrink-0 ${
                                  activeCard.backReadImageUrl === imgUrl ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200'
                                }`}
                                title={`Exemplo ${i + 1}`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            URL do arquivo MP3 (opcional - substitui TTS se preenchido)
                          </label>
                          <input
                            type="text"
                            value={activeCard.backAudioUrl || ''}
                            onChange={(e) => handleUpdateCard('backAudioUrl', e.target.value)}
                            placeholder="https://exemplo.com/audio.mp3"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 italic mt-1">O título e o texto do verso serão lidos ou o áudio MP3 será reproduzido.</p>
                      </div>
                    ) : activeCard.backContentType === 'video' ? (
                      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              URL do Vídeo do Verso (YouTube, MP4, etc.) *
                            </label>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                              <input
                                type="checkbox"
                                checked={activeCard.backVideoAutoplay !== false}
                                onChange={(e) => handleUpdateCard('backVideoAutoplay', e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              Auto play
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="url"
                              value={activeCard.backVideoUrl || ''}
                              onChange={(e) => handleUpdateCard('backVideoUrl', e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                            />
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          </div>
                        </div>
                      </div>
                    ) : activeCard.backContentType === 'image-text' || activeCard.backContentType === 'text' || !activeCard.backContentType ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Título do verso (corpo maior) *
                          </label>
                          <input
                            type="text"
                            value={activeCard.backTitle ?? ''}
                            onChange={(e) => {
                              handleUpdateCard('backTitle', e.target.value);
                            }}
                            placeholder="Ex: Título ou Resposta principal..."
                            className="w-full px-3.5 py-2.5 text-base font-extrabold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Trecho de texto do verso (corpo menor)
                          </label>
                          <textarea
                            rows={2.5}
                            value={activeCard.backText ?? ''}
                            onChange={(e) => {
                              handleUpdateCard('backText', e.target.value);
                            }}
                            placeholder="Ex: Detalhamento, justificativa ou subtítulo explicativo..."
                            className="w-full px-3.5 py-2 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden leading-relaxed"
                          />
                        </div>
                        {/* Áudio / Ler Card para verso */}
                        <div className="pt-3 border-t border-slate-200 space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Áudio / Ler Card
                            </label>
                            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                              {activeCard.backAudioEnabled === true && (
                                <>
                                  <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCard('backReadLang', 'pt-BR')}
                                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                                        (activeCard.backReadLang || 'pt-BR') === 'pt-BR'
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      Português
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCard('backReadLang', 'en-US')}
                                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                                        activeCard.backReadLang === 'en-US'
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      Inglês
                                    </button>
                                  </div>

                                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 select-none">
                                    <input
                                      type="checkbox"
                                      checked={activeCard.backReadAutoplay !== false}
                                      onChange={(e) => handleUpdateCard('backReadAutoplay', e.target.checked)}
                                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <span>Auto play</span>
                                  </label>

                                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 select-none">
                                    <input
                                      type="checkbox"
                                      checked={activeCard.backShowPlayButton !== false}
                                      onChange={(e) => handleUpdateCard('backShowPlayButton', e.target.checked)}
                                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <span>Exibir Play</span>
                                  </label>
                                </>
                              )}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={activeCard.backAudioEnabled === true}
                                  onChange={(e) => handleUpdateCard('backAudioEnabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-7 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                              </label>
                            </div>
                          </div>
                          {activeCard.backAudioEnabled === true && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">URL do arquivo MP3 (Opcional - se vazio, lê com a voz do navegador)</label>
                              <input
                                type="text"
                                value={activeCard.backAudioUrl || ''}
                                onChange={(e) => handleUpdateCard('backAudioUrl', e.target.value)}
                                placeholder="https://exemplo.com/audio.mp3"
                                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Texto Curto do Verso do card
                        </label>
                        <input
                          type="text"
                          value={activeCard.backText ?? activeCard.backTitle ?? ''}
                          onChange={(e) => {
                            handleUpdateCard({
                              backText: e.target.value,
                              backTitle: e.target.value
                            });
                          }}
                          placeholder="Ex: Resposta do flashcard"
                          className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                        />
                      </div>
                    )}

                    {(activeCard.backContentType === 'image' || activeCard.backContentType === 'image-text' || (!activeCard.backContentType && !!activeCard.backImageUrl)) && (
                      <div className="pt-2 border-t border-dashed border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700">
                            Imagem do Verso
                          </label>
                          {activeCard.backImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateCard({
                                  backImageUrl: '',
                                  backContentType: activeCard.backContentType === 'image' ? 'text' : activeCard.backContentType
                                });
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remover Imagem
                            </button>
                          )}
                        </div>

                        {/* File Upload and URL Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <input
                              type="file"
                              ref={backFileInputRef}
                              accept="image/*"
                              onChange={(e) => handleImageFileUpload(e, true)}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => backFileInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shadow-2xs"
                            >
                              <Upload className="w-3.5 h-3.5 text-emerald-600" />
                              Carregar do Computador
                            </button>
                          </div>

                          <div className="relative">
                            <input
                              type="url"
                              value={activeCard.backImageUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateCard({
                                  backImageUrl: val,
                                  backContentType: activeCard.backContentType === 'text' ? 'image-text' : (activeCard.backContentType || 'image-text')
                                });
                              }}
                              placeholder="Ou cole o link da imagem..."
                              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                            />
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Exemplos de Imagens
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {ABSTRACT_EXAMPLE_IMAGES.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  handleUpdateCard({
                                    backImageUrl: imgUrl,
                                    backContentType: activeCard.backContentType === 'text' ? 'image-text' : (activeCard.backContentType || 'image-text')
                                  });
                                }}
                                className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 shrink-0 ${
                                  activeCard.backImageUrl === imgUrl ? 'border-emerald-600 ring-2 ring-emerald-600/30 scale-105' : 'border-slate-200 hover:border-slate-400'
                                }`}
                                title={`Usar imagem abstrata ${i + 1}`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Áudio em Segundo Plano / Ler Card para imagem verso */}
                        {activeCard.backContentType === 'image' && (
                          <div className="pt-3 border-t border-slate-200 space-y-2.5">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Áudio / Ler Card
                              </label>
                              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                                {activeCard.backAudioEnabled === true && (
                                  <>
                                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateCard('backReadLang', 'pt-BR')}
                                        className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                                          (activeCard.backReadLang || 'pt-BR') === 'pt-BR'
                                            ? 'bg-emerald-600 text-white shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        Português
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateCard('backReadLang', 'en-US')}
                                        className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                                          activeCard.backReadLang === 'en-US'
                                            ? 'bg-emerald-600 text-white shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        Inglês
                                      </button>
                                    </div>

                                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 select-none">
                                      <input
                                        type="checkbox"
                                        checked={activeCard.backReadAutoplay !== false}
                                        onChange={(e) => handleUpdateCard('backReadAutoplay', e.target.checked)}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                      />
                                      <span>Auto play</span>
                                    </label>

                                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-600 select-none">
                                      <input
                                        type="checkbox"
                                        checked={activeCard.backShowPlayButton !== false}
                                        onChange={(e) => handleUpdateCard('backShowPlayButton', e.target.checked)}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                      />
                                      <span>Exibir Play</span>
                                    </label>
                                  </>
                                )}
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={activeCard.backAudioEnabled === true}
                                    onChange={(e) => handleUpdateCard('backAudioEnabled', e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-7 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                              </div>
                            </div>
                            {activeCard.backAudioEnabled === true && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">URL do arquivo MP3 (Opcional - se vazio, lê com a voz do navegador)</label>
                                <input
                                  type="text"
                                  value={activeCard.backAudioUrl || ''}
                                  onChange={(e) => handleUpdateCard('backAudioUrl', e.target.value)}
                                  placeholder="https://exemplo.com/audio.mp3"
                                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-white"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </form>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                Selecione um card à esquerda para editar seus dados.
              </div>
            )}
          </div>

        </div>

    </div>
  );
};
