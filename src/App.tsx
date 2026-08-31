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

const STORAGE_KEY = 'rise_flashcards_decks_v2';
const CURRENT_DECK_KEY = 'rise_flashcards_current_id_v2';

function migrateDecks(loadedDecks: Deck[]): Deck[] {
  const replaceText = (txt: string | undefined): string => {
    if (!txt) return '';
    const trimmed = txt.trim();
    if (
      trimmed === "Você recebe um e-mail urgente pedindo para você clicar em um link e redefinir sua senha corporativa imediatamente. O que você deve fazer?" || 
      trimmed === "Nunca clique no link! Verifique o remetente real (@domínio), não insira credenciais e reporte o e-mail suspeito imediatamente ao canal oficial de segurança."
    ) {
      return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean varius augue eget leo mattis aliquam.";
    }
    if (
      trimmed === "Identificação de Phishing (Cópia) (Cópia)" || 
      trimmed === "Nunca clique no link!"
    ) {
      return "Lorem ipsum dolor sit amet,";
    }
    return txt;
  };

  return loadedDecks.map(deck => {
    const updatedCards = deck.cards.map(card => {
      const frontType = card.frontContentType || (card.imageUrl ? 'image-text' : 'text');
      const backType = card.backContentType || (card.backImageUrl ? 'image-text' : 'text');
      return {
        ...card,
        frontContentType: frontType,
        backContentType: backType,
        title: replaceText(card.title),
        text: replaceText(card.text),
        backTitle: replaceText(card.backTitle),
        backText: replaceText(card.backText),
      };
    });

    return {
      ...deck,
      frontBgType: deck.frontBgType || 'white',
      backBgType: deck.backBgType || 'white',
      title: replaceText(deck.title),
      description: replaceText(deck.description),
      cards: updatedCards,
    };
  });
}

export default function App() {
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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
