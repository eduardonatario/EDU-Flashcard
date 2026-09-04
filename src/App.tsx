/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Deck, ViewMode } from './types';
import { INITIAL_DECKS } from './data/initialDecks';
import { Header } from './components/Header';
import { InteractivePlayer } from './components/InteractivePlayer';
import { CardEditor } from './components/CardEditor';
import { NewDeckModal } from './components/NewDeckModal';

const STORAGE_KEY = 'rise_flashcards_decks_v3';
const CURRENT_DECK_KEY = 'rise_flashcards_current_id_v3';

const ABSTRACT_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=800&q=80'
];

function migrateDecks(loadedDecks: Deck[]): Deck[] {
  const isDefaultOrOldTitle = (t: string | undefined): boolean => {
    if (!t) return true;
    const trimmed = t.trim();
    return [
      'O que é Phishing?',
      'Identificação Visual',
      'Autenticação Multifator (MFA)',
      'Titulo frente',
      'Pergunta ou Título do Card',
      'Lorem ipsum dolor sit amet,',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean varius augue eget leo mattis aliquam.'
    ].includes(trimmed);
  };

  const isDefaultOrOldText = (t: string | undefined): boolean => {
    if (!t) return true;
    const trimmed = t.trim();
    return [
      'O que é Phishing?',
      'Identifique o alerta de segurança',
      'Qual é o principal benefício do MFA nos acessos corporativos?',
      'Frente do Flashcard',
      'Insira o contexto, pergunta ou situação problema que o colaborador deve analisar.',
      'Lorem ipsum dolor sit amet,',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean varius augue eget leo mattis aliquam.',
      'Você recebe um e-mail urgente pedindo para você clicar em um link e redefinir sua senha corporativa imediatamente. O que você deve fazer?'
    ].includes(trimmed);
  };

  return loadedDecks.map(deck => {
    const updatedCards = deck.cards.map((card, idx) => {
      const frontType = card.frontContentType || (card.imageUrl ? 'image-text' : 'text');
      const backType = card.backContentType || (card.backImageUrl ? 'image-text' : 'text');

      let imageUrl = card.imageUrl;
      let frontContentType = frontType;
      if (deck.id === 'deck-principal' && idx < 3) {
        imageUrl = ABSTRACT_IMAGES[idx];
        frontContentType = 'image-text';
      }

      return {
        ...card,
        frontContentType,
        imageUrl,
        backContentType: backType,
        title: isDefaultOrOldTitle(card.title) || card.title === 'Título do card' ? `Título do card ${idx + 1}` : card.title,
        text: isDefaultOrOldText(card.text) ? 'Texto do card' : card.text,
        backText: (card.backText === 'Verso do Flashcard' || !card.backText) ? `Verso do Flashcard ${idx + 1}` : card.backText,
      };
    });

    return {
      ...deck,
      frontBgType: deck.frontBgType || 'white',
      backBgType: deck.backBgType || 'white',
      cards: updatedCards,
    };
  });
}

export default function App() {
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const savedV3 = localStorage.getItem(STORAGE_KEY);
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return migrateDecks(parsed);
        }
      }
      const savedV2 = localStorage.getItem('rise_flashcards_decks_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return migrateDecks(parsed);
        }
      }
    } catch {
      // Ignore
    }
    return migrateDecks(INITIAL_DECKS);
  });

  const [currentDeckId, setCurrentDeckId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_DECK_KEY);
      if (savedId && decks.some((d) => d.id === savedId)) {
        return savedId;
      }
    } catch {
      // Ignore
    }
    return decks[0]?.id || 'deck-principal';
  });

  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [isNewDeckModalOpen, setIsNewDeckModalOpen] = useState(false);

  // Save decks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [decks]);

  // Save currentDeckId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_DECK_KEY, currentDeckId);
    } catch (e) {
      console.error('Failed to save currentDeckId:', e);
    }
  }, [currentDeckId]);

  const currentDeck = decks.find((d) => d.id === currentDeckId) || decks[0] || INITIAL_DECKS[0];

  const handleUpdateDeck = (updatedDeck: Deck) => {
    setDecks((prev) =>
      prev.map((d) => (d.id === updatedDeck.id ? updatedDeck : d))
    );
  };

  const handleCreateDeck = (newDeck: Deck) => {
    setDecks((prev) => [newDeck, ...prev]);
    setCurrentDeckId(newDeck.id);
    setViewMode('editor');
  };

  const handleDeleteDeck = (deckId: string) => {
    if (decks.length <= 1) {
      alert('Você precisa ter pelo menos um conjunto de flashcards ativo.');
      return;
    }
    const filtered = decks.filter((d) => d.id !== deckId);
    setDecks(filtered);
    setCurrentDeckId(filtered[0].id);
    setViewMode('player');
  };

  const handleDuplicateDeck = (deckToDuplicate: Deck) => {
    const duplicated: Deck = {
      ...deckToDuplicate,
      id: 'deck-' + Date.now(),
      title: `${deckToDuplicate.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cards: deckToDuplicate.cards.map((c, i) => ({
        ...c,
        id: `card-${Date.now()}-${i}`
      }))
    };
    setDecks((prev) => [duplicated, ...prev]);
    setCurrentDeckId(duplicated.id);
    setViewMode('editor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Navigation Header */}
      <Header
        currentDeck={currentDeck}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {viewMode === 'player' && (
          <InteractivePlayer
            deck={currentDeck}
            onUpdateDeck={handleUpdateDeck}
            onSwitchToEditor={() => setViewMode('editor')}
          />
        )}

        {viewMode === 'editor' && (
          <CardEditor
            deck={currentDeck}
            onUpdateDeck={handleUpdateDeck}
            onSwitchToPlayer={() => setViewMode('player')}
          />
        )}
      </main>

      {/* New Deck Modal */}
      <NewDeckModal
        isOpen={isNewDeckModalOpen}
        onClose={() => setIsNewDeckModalOpen(false)}
        onCreateDeck={handleCreateDeck}
      />

    </div>
  );
}
