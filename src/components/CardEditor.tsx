import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  RotateCw, 
  Check, 
  Eye, 
  Play,
  Link as LinkIcon, 
  Layers, 
  Sliders, 
  Settings as SettingsIcon, 
  Save, 
  Download
} from 'lucide-react';
import { Deck, Flashcard, CardTheme, PlayerLayout } from '../types';
import { downloadDeckHTML, copyDeckHTMLToClipboard } from '../utils/htmlExporter';

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
  const [deckLayout, setDeckLayout] = useState<PlayerLayout>(deck.defaultLayout || 'carousel');
  const [deckAspectRatio, setDeckAspectRatio] = useState<'vertical' | 'square'>(deck.cardAspectRatio || 'vertical');
  const [deckEnableSound, setDeckEnableSound] = useState(deck.enableSound ?? false);
  const [deckFlipPrompt, setDeckFlipPrompt] = useState(deck.flipPromptText || 'Clique para virar');
  const [deckBackPrompt, setDeckBackPrompt] = useState(deck.backPromptText || 'Voltar para a frente');
  const [deckBackBgType, setDeckBackBgType] = useState<'white' | 'light-gray' | 'custom'>(deck.backBgType || 'light-gray');
  const [deckBackCustomBgColor, setDeckBackCustomBgColor] = useState(deck.backCustomBgColor || '#f1f5f9');
  const [deckBackCustomTextColor, setDeckBackCustomTextColor] = useState(deck.backCustomTextColor || '#1e293b');

  const cards = deck.cards || [];
  const activeCardIndex = cards.findIndex((c) => c.id === selectedCardId);
  const activeCard = cards[activeCardIndex] || cards[0];

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
    const newCard: Flashcard = {
      id: 'card-' + Date.now(),
      title: 'Titulo frente',
      text: 'Frente do Flashcard',
      imageUrl: '',
      imageAlt: '',
      backTitle: 'Título verso',
      backText: 'Verso do Flashcard'
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

  // Delete card - reliable, immediate and safe without blocked alert/confirm
  const handleDeleteCard = (cardId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (cards.length <= 1) {
      // If only 1 card, reset its content cleanly instead of leaving broken state
      const freshCard: Flashcard = {
        id: 'card-' + Date.now(),
        title: 'Titulo frente',
        text: 'Frente do Flashcard',
        imageUrl: '',
        imageAlt: '',
        backTitle: 'Título verso',
        backText: 'Verso do Flashcard'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner with Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Configurações
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Gerencie os textos e imagens dos cards
          </p>
        </div>
      </div>

      {/* OPÇÕES DE APRESENTAÇÃO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Col 1: Áudio */}
          <div className="space-y-4">
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 border border-slate-150">
                <input
                  type="checkbox"
                  checked={deckEnableSound}
                  onChange={(e) => {
                    setDeckEnableSound(e.target.checked);
                    updateDeckSettings({ enableSound: e.target.checked });
                  }}
                  className="w-3.5 h-3.5 text-blue-600 rounded-sm focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Efeitos Sonoros Sutis</span>
                </div>
              </label>
            </div>
          </div>

          {/* Col 2: Cor do Verso */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cor do Verso (Ao Virar)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeckBackBgType('light-gray');
                    updateDeckSettings({ backBgType: 'light-gray' });
                  }}
                  className={`p-2 px-1 rounded-xl border text-center transition-all text-xs ${
                    deckBackBgType === 'light-gray'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  Cinza Claro
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeckBackBgType('white');
                    updateDeckSettings({ backBgType: 'white' });
                  }}
                  className={`p-2 px-1 rounded-xl border text-center transition-all text-xs ${
                    deckBackBgType === 'white'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  Branco
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeckBackBgType('custom');
                    updateDeckSettings({ backBgType: 'custom' });
                  }}
                  className={`p-2 px-1 rounded-xl border text-center transition-all text-xs ${
                    deckBackBgType === 'custom'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  Personalizado
                </button>
              </div>
            </div>

            {deckBackBgType === 'custom' && (
              <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Fundo</label>
                  <div className="flex gap-1 items-center">
                    <input
                      type="color"
                      value={deckBackCustomBgColor}
                      onChange={(e) => {
                        setDeckBackCustomBgColor(e.target.value);
                        updateDeckSettings({ backCustomBgColor: e.target.value });
                      }}
                      className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={deckBackCustomBgColor}
                      onChange={(e) => {
                        setDeckBackCustomBgColor(e.target.value);
                        updateDeckSettings({ backCustomBgColor: e.target.value });
                      }}
                      className="w-full px-1.5 py-0.5 text-[11px] border border-slate-300 rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Texto</label>
                  <div className="flex gap-1 items-center">
                    <input
                      type="color"
                      value={deckBackCustomTextColor}
                      onChange={(e) => {
                        setDeckBackCustomTextColor(e.target.value);
                        updateDeckSettings({ backCustomTextColor: e.target.value });
                      }}
                      className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={deckBackCustomTextColor}
                      onChange={(e) => {
                        setDeckBackCustomTextColor(e.target.value);
                        updateDeckSettings({ backCustomTextColor: e.target.value });
                      }}
                      className="w-full px-1.5 py-0.5 text-[11px] border border-slate-300 rounded"
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

          {/* CENTER COLUMN: CARD FORM EDITING (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
            {activeCard ? (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                
                {/* SIMPLE CARD EDITOR */}
                <div className="space-y-5">
                  {/* FRENTE SIMPLES */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Frente do Card</h3>
                      </div>

                      {/* Tipo de conteúdo Frente */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleUpdateCard('frontContentType', 'text')}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                            activeCard.frontContentType === 'text' || !activeCard.frontContentType ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Texto Curto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard('frontContentType', 'image');
                            if (!activeCard.imageUrl) {
                              handleUpdateCard('imageUrl', ABSTRACT_EXAMPLE_IMAGES[0]);
                            }
                          }}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                            activeCard.frontContentType === 'image' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Imagem
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard('frontContentType', 'image-text');
                            if (!activeCard.imageUrl) {
                              handleUpdateCard('imageUrl', ABSTRACT_EXAMPLE_IMAGES[0]);
                            }
                          }}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                            activeCard.frontContentType === 'image-text' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Imagem + texto
                        </button>
                      </div>
                    </div>

                    {/* Texto Curto ou Título + Texto */}
                    {activeCard.frontContentType === 'image-text' || activeCard.frontContentType === 'text' || !activeCard.frontContentType ? (
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
                            placeholder="Ex: Título ou Pergunta principal..."
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
                            placeholder="Ex: Detalhamento, dica ou subtítulo explicativo..."
                            className="w-full px-3.5 py-2 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden leading-relaxed"
                          />
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
                          placeholder="Ex: Qual é a capital da França?"
                          className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                        />
                      </div>
                    )}

                    {/* Se for Imagem ou Imagem + texto, mostrar campos adicionais de imagem abaixo */}
                    {(activeCard.frontContentType === 'image' || activeCard.frontContentType === 'image-text') && (
                      <div className="pt-2 border-t border-dashed border-slate-150">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Imagem da Frente
                        </label>
                        <div className="relative w-full">
                          <input
                            type="url"
                            value={activeCard.imageUrl || ''}
                            onChange={(e) => handleUpdateCard('imageUrl', e.target.value)}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                          />
                          <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <div className="mt-2.5">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Exemplos de Imagens Abstratas (1-clique)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ABSTRACT_EXAMPLE_IMAGES.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleUpdateCard('imageUrl', imgUrl)}
                                className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 shrink-0 ${
                                  activeCard.imageUrl === imgUrl ? 'border-blue-600 scale-105' : 'border-slate-200 hover:border-slate-400'
                                }`}
                                title={`Usar imagem abstrata ${i + 1}`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VERSO SIMPLES */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Verso do Card</h3>
                      </div>

                      {/* Tipo de conteúdo Verso */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleUpdateCard('backContentType', 'text')}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                            activeCard.backContentType === 'text' || !activeCard.backContentType ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Texto Curto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard('backContentType', 'image');
                            if (!activeCard.backImageUrl) {
                              handleUpdateCard('backImageUrl', ABSTRACT_EXAMPLE_IMAGES[1]);
                            }
                          }}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                            activeCard.backContentType === 'image' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Imagem
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateCard('backContentType', 'image-text');
                            if (!activeCard.backImageUrl) {
                              handleUpdateCard('backImageUrl', ABSTRACT_EXAMPLE_IMAGES[1]);
                            }
                          }}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                            activeCard.backContentType === 'image-text' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          Imagem + texto
                        </button>
                      </div>
                    </div>

                    {/* Texto Curto ou Título + Texto do Verso */}
                    {activeCard.backContentType === 'image-text' || activeCard.backContentType === 'text' || !activeCard.backContentType ? (
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
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Texto Curto do Verso (Opcional / Backup)
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
                          placeholder="Ex: Paris"
                          className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                        />
                      </div>
                    )}

                    {/* Se for Imagem ou Imagem + texto, mostrar campos adicionais de imagem abaixo */}
                    {(activeCard.backContentType === 'image' || activeCard.backContentType === 'image-text') && (
                      <div className="pt-2 border-t border-dashed border-slate-150">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Imagem do Verso
                        </label>
                        <div className="relative w-full">
                          <input
                            type="url"
                            value={activeCard.backImageUrl || ''}
                            onChange={(e) => handleUpdateCard('backImageUrl', e.target.value)}
                            placeholder="https://exemplo.com/resposta.jpg"
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                          />
                          <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <div className="mt-2.5">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Exemplos de Imagens Abstratas (1-clique)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ABSTRACT_EXAMPLE_IMAGES.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleUpdateCard('backImageUrl', imgUrl)}
                                className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 shrink-0 ${
                                  activeCard.backImageUrl === imgUrl ? 'border-emerald-600 scale-105' : 'border-slate-200 hover:border-slate-400'
                                }`}
                                title={`Usar imagem abstrata ${i + 1}`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form fields end */}

              </form>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                Selecione um card à esquerda para editar seus dados.
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: LIVE INTERACTIVE CARD PREVIEW (4 cols) */}
          <div className="lg:col-span-4 bg-slate-100/70 rounded-2xl border border-slate-200 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <div className="flex bg-slate-200 p-0.5 rounded-xl border border-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setDeckAspectRatio('vertical');
                    onUpdateDeck({ ...deck, cardAspectRatio: 'vertical' });
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                    deckAspectRatio === 'vertical'
                      ? 'bg-white text-slate-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Vertical
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeckAspectRatio('square');
                    onUpdateDeck({ ...deck, cardAspectRatio: 'square' });
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                    deckAspectRatio === 'square'
                      ? 'bg-white text-slate-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Quadrado
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewFlipped(!previewFlipped)}
                className="text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <RotateCw className="w-3 h-3" />
                <span>{previewFlipped ? 'Frente' : 'Verso'}</span>
              </button>
            </div>

            {activeCard && (
              <div className={`perspective-1000 w-full ${deckAspectRatio === 'square' ? 'aspect-square max-w-[340px] mx-auto' : 'h-[380px] sm:h-[400px]'}`}>
                <div 
                  onClick={() => setPreviewFlipped(!previewFlipped)}
                  className={`card-flipper relative w-full h-full transform-style-3d transition-transform duration-600 cursor-pointer select-none ${
                    previewFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* PREVIEW FRONT */}
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col overflow-hidden">
                    {activeCard.frontContentType === 'image-text' || activeCard.frontContentType === 'text' || !activeCard.frontContentType || activeCard.cardType === 'standard' ? (
                      <>
                        {activeCard.frontContentType === 'image-text' && activeCard.imageUrl && (
                          <div className="w-full h-36 bg-slate-100 overflow-hidden shrink-0">
                            <img 
                              src={activeCard.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover" 
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          </div>
                        )}

                        <div className="p-5 flex flex-col justify-center flex-1 text-center overflow-y-auto">
                          {activeCard.title && (
                            <h4 className="font-extrabold text-slate-800 text-lg sm:text-xl mb-1.5 leading-snug break-words max-w-xs mx-auto">
                              {activeCard.title}
                            </h4>
                          )}
                          {activeCard.text && activeCard.text !== activeCard.title && (
                            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed break-words max-w-xs mx-auto">
                              {activeCard.text}
                            </p>
                          )}
                          {!activeCard.title && !activeCard.text && (
                            <p className="text-slate-400 text-xs italic">Título & Texto da Frente</p>
                          )}
                        </div>
                      </>
                    ) : activeCard.frontContentType === 'image' && activeCard.imageUrl ? (
                      <div className="w-full h-full overflow-hidden">
                        <img 
                          src={activeCard.imageUrl} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 w-full h-full flex items-center justify-center p-6 sm:p-8 text-center">
                        <p className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-snug tracking-tight break-words max-w-xs">
                          {activeCard.text || activeCard.title || 'Texto Curto do Card'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PREVIEW BACK */}
                  <div 
                    className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl border border-slate-200 shadow-md flex flex-col overflow-hidden ${
                      deck.backBgType === 'white' ? 'bg-white text-slate-900' : 
                      deck.backBgType === 'custom' ? '' : 'bg-slate-100 text-slate-900'
                    }`}
                    style={deck.backBgType === 'custom' ? {
                      backgroundColor: deck.backCustomBgColor || '#f1f5f9',
                      color: deck.backCustomTextColor || '#1e293b'
                    } : {}}
                  >
                    {activeCard.backContentType === 'image-text' || activeCard.backContentType === 'text' || !activeCard.backContentType || activeCard.cardType === 'standard' ? (
                      <>
                        {activeCard.backContentType === 'image-text' && activeCard.backImageUrl && (
                          <div className="w-full h-32 bg-slate-200 overflow-hidden shrink-0">
                            <img 
                              src={activeCard.backImageUrl} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}

                        <div className="p-5 flex flex-col justify-center flex-1 text-center overflow-y-auto">
                          {activeCard.backTitle && (
                            <h4 className="font-extrabold text-current text-lg sm:text-xl mb-1.5 leading-snug break-words max-w-xs mx-auto">
                              {activeCard.backTitle}
                            </h4>
                          )}
                          {activeCard.backText && activeCard.backText !== activeCard.backTitle && (
                            <div className="text-current opacity-90 text-xs sm:text-sm leading-relaxed text-center max-w-xs mx-auto font-medium">
                              {activeCard.backText}
                            </div>
                          )}
                          {!activeCard.backTitle && !activeCard.backText && (
                            <p className="text-current opacity-60 text-xs italic">Título & Texto do Verso</p>
                          )}
                        </div>
                      </>
                    ) : activeCard.backContentType === 'image' && activeCard.backImageUrl ? (
                      <div className="w-full h-full overflow-hidden">
                        <img 
                          src={activeCard.backImageUrl} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="flex-1 w-full h-full flex items-center justify-center p-6 sm:p-8 text-center">
                        <p className="text-xl sm:text-2xl font-extrabold text-current leading-snug tracking-tight break-words max-w-xs">
                          {activeCard.backText || activeCard.backTitle || 'Resposta Curta'}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Clique no card acima para testar o giro 3D em tempo real.
            </p>
          </div>

        </div>

    </div>
  );
};
