import React, { useState } from 'react';
import { X, Plus, BookOpen, Sparkles, Layers, FileText } from 'lucide-react';
import { Deck, CardTheme } from '../types';
import { THEME_CONFIGS } from '../data/initialDecks';

interface NewDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDeck: (newDeck: Deck) => void;
}

const TEMPLATES = [
  {
    title: 'Conjunto em Branco',
    desc: 'Comece do zero com 1 card em branco para preencher seus próprios dados.',
    category: 'Geral',
    theme: 'rise-blue' as CardTheme,
    initialCardsCount: 1,
    cards: [
      {
        id: 'card-1',
        title: 'Pergunta ou Título do Card',
        text: 'Insira o contexto, pergunta ou situação problema que o colaborador deve analisar.',
        imageUrl: '',
        backTitle: 'Resposta & Procedimento',
        backText: 'Insira a resposta correta, a justificativa e o passo a passo de como agir.'
      }
    ]
  },
  {
    title: 'Treinamento de Onboarding & Cultura',
    desc: 'Valores corporativos, missão, conduta ética e canais de comunicação.',
    category: 'Recursos Humanos',
    theme: 'emerald-green' as CardTheme,
    initialCardsCount: 3,
    cards: [
      {
        id: 'card-1',
        title: 'Qual é o nosso principal valor corporativo?',
        text: 'Em situações de tomada de decisão com clientes ou parceiros, qual princípio deve guiar nossas escolhas?',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        backTitle: 'Transparência e Ética em Primeiro Lugar',
        backText: 'A transparência com o cliente e a integridade ética são inegociáveis em todos os processos da companhia.'
      },
      {
        id: 'card-2',
        title: 'Canal de Dúvidas e Ouvidoria',
        text: 'Onde encontrar suporte sigiloso para esclarecimento de políticas internas ou reporte de condutas?',
        imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
        backTitle: 'Canal de Ética Independente',
        backText: 'Acesse o portal da ouvidoria interna ou envie e-mail para o comitê de ética garantindo 100% de anonimato.'
      }
    ]
  }
];

export const NewDeckModal: React.FC<NewDeckModalProps> = ({
  isOpen,
  onClose,
  onCreateDeck
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [theme, setTheme] = useState<CardTheme>('rise-blue');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenTemplate = TEMPLATES[selectedTemplateIndex] || TEMPLATES[0];

    const newDeck: Deck = {
      id: 'deck-' + Date.now(),
      title: title.trim() || chosenTemplate.title,
      description: description.trim() || chosenTemplate.desc,
      category: category.trim() || chosenTemplate.category,
      theme,
      defaultLayout: 'carousel',
      showProgressBar: true,
      enableSound: true,
      flipPromptText: 'Clique para virar',
      backPromptText: 'Voltar para a frente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cards: chosenTemplate.cards.map((c, i) => ({
        ...c,
        id: `card-${Date.now()}-${i}`
      }))
    };

    onCreateDeck(newDeck);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Novo Conjunto de Flashcards</h3>
              <p className="text-xs text-slate-500">Crie um novo módulo de microlearning interativo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Escolha um Modelo Inicial
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={tpl.title}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateIndex(i);
                    setTitle(tpl.title);
                    setDescription(tpl.desc);
                    setCategory(tpl.category);
                    setTheme(tpl.theme);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplateIndex === i
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 mb-0.5">{tpl.title}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">{tpl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título do Conjunto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treinamento de Proteção de Dados"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descrição / Resumo
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Instruções de segurança da informação para novos colaboradores."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Categoria / Módulo
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Compliance, Gestão, Atendimento"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Criar Conjunto
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
