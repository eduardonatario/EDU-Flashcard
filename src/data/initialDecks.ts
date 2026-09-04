import { Deck } from '../types';

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-principal',
    title: 'Flashcards de Treinamento',
    description: 'Conceitos fundamentais de segurança e boas práticas.',
    category: 'Treinamento Essencial',
    theme: 'rise-blue',
    defaultLayout: 'carousel',
    cardAspectRatio: 'vertical',
    cardSize: 'medium',
    showProgressBar: false,
    enableSound: false,
    flipPromptText: 'Clique para virar',
    backPromptText: 'Voltar para a frente',
    frontBgType: 'white',
    frontCustomBgColor: '#ffffff',
    frontCustomTextColor: '#0f172a',
    backBgType: 'white',
    backCustomBgColor: '#ffffff',
    backCustomTextColor: '#0f172a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cards: [
      {
        id: 'card-1',
        title: 'Título do card 1',
        text: 'Texto do card',
        cardType: 'standard',
        frontContentType: 'image-text',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        imageAlt: 'Imagem abstrata 1',
        imagePosition: 'top',
        backTitle: 'Título verso',
        backText: 'Verso do Flashcard 1',
        backContentType: 'text'
      },
      {
        id: 'card-2',
        title: 'Título do card 2',
        text: 'Texto do card',
        cardType: 'standard',
        frontContentType: 'image-text',
        imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
        imageAlt: 'Imagem abstrata 2',
        imagePosition: 'top',
        backTitle: 'Título verso',
        backText: 'Verso do Flashcard 2',
        backContentType: 'text'
      },
      {
        id: 'card-3',
        title: 'Título do card 3',
        text: 'Texto do card',
        cardType: 'standard',
        frontContentType: 'image-text',
        imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=800&q=80',
        imageAlt: 'Imagem abstrata 3',
        imagePosition: 'top',
        backTitle: 'Título verso',
        backText: 'Verso do Flashcard 3',
        backContentType: 'text'
      }
    ]
  }
];

export const THEME_CONFIGS: Record<string, any> = {
  'sleek-orange': {
    id: 'sleek-orange',
    name: 'Sleek Interface (Laranja & Slate)',
    primaryColor: '#f97316', // Orange 500
    accentColor: '#ea580c', // Orange 600
    bgGradient: 'from-orange-50/50 via-white to-slate-50',
    cardBorder: 'border-slate-200 hover:border-orange-400',
    badgeBg: 'bg-orange-100 text-orange-800',
    badgeText: 'text-orange-600',
    buttonBg: 'bg-orange-600 hover:bg-orange-700 text-white',
    topBarBg: 'bg-orange-500',
  },
  'rise-blue': {
    id: 'rise-blue',
    name: 'Articulate Blue (Padrão Rise)',
    primaryColor: '#0284c7', // Sky 600
    accentColor: '#38bdf8',
    bgGradient: 'from-sky-50 via-white to-slate-50',
    cardBorder: 'border-sky-200 hover:border-sky-400',
    badgeBg: 'bg-sky-100 text-sky-800',
    badgeText: 'text-sky-700',
    buttonBg: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
  'slate-corporate': {
    id: 'slate-corporate',
    name: 'Corporate Slate (Executivo)',
    primaryColor: '#334155', // Slate 700
    accentColor: '#64748b',
    bgGradient: 'from-slate-100 via-white to-gray-50',
    cardBorder: 'border-slate-300 hover:border-slate-500',
    badgeBg: 'bg-slate-200 text-slate-800',
    badgeText: 'text-slate-700',
    buttonBg: 'bg-slate-800 hover:bg-slate-900 text-white',
  },
  'emerald-green': {
    id: 'emerald-green',
    name: 'Emerald Green (Treinamentos & Saúde)',
    primaryColor: '#059669', // Emerald 600
    accentColor: '#34d399',
    bgGradient: 'from-emerald-50 via-white to-teal-50',
    cardBorder: 'border-emerald-200 hover:border-emerald-400',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    badgeText: 'text-emerald-700',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  'indigo-modern': {
    id: 'indigo-modern',
    name: 'Indigo Tech (Moderno)',
    primaryColor: '#4f46e5', // Indigo 600
    accentColor: '#818cf8',
    bgGradient: 'from-indigo-50 via-white to-slate-50',
    cardBorder: 'border-indigo-200 hover:border-indigo-400',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    badgeText: 'text-indigo-700',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  'amber-warm': {
    id: 'amber-warm',
    name: 'Amber Warm (Criatividade & Educação)',
    primaryColor: '#d97706', // Amber 600
    accentColor: '#fbbf24',
    bgGradient: 'from-amber-50 via-white to-orange-50',
    cardBorder: 'border-amber-200 hover:border-amber-400',
    badgeBg: 'bg-amber-100 text-amber-900',
    badgeText: 'text-amber-700',
    buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  'rose-accent': {
    id: 'rose-accent',
    name: 'Rose Coral (Dinâmico)',
    primaryColor: '#e11d48', // Rose 600
    accentColor: '#fb7185',
    bgGradient: 'from-rose-50 via-white to-pink-50',
    cardBorder: 'border-rose-200 hover:border-rose-400',
    badgeBg: 'bg-rose-100 text-rose-800',
    badgeText: 'text-rose-700',
    buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  'dark-elegance': {
    id: 'dark-elegance',
    name: 'Dark Elegance (Modo Escuro Corporativo)',
    primaryColor: '#2563eb', // Blue 600
    accentColor: '#60a5fa',
    bgGradient: 'from-slate-900 via-slate-850 to-gray-900',
    cardBorder: 'border-slate-700 hover:border-slate-500',
    badgeBg: 'bg-slate-800 text-blue-400',
    badgeText: 'text-blue-400',
    buttonBg: 'bg-blue-600 hover:bg-blue-500 text-white',
  }
};
