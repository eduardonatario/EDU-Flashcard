export interface Flashcard {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: 'top' | 'side' | 'background';
  videoUrl?: string;
  videoAutoplay?: boolean;
  backTitle?: string;
  backText: string;
  backImageUrl?: string;
  backVideoUrl?: string;
  backVideoAutoplay?: boolean;
  accentColor?: string;
  isLearned?: boolean;
  cardType?: 'standard' | 'simple';
  frontContentType?: 'text' | 'image' | 'image-text' | 'video' | 'read';
  frontReadAutoplay?: boolean;
  frontReadLang?: 'pt-BR' | 'en-US';
  frontShowPlayButton?: boolean;
  frontAudioUrl?: string;
  frontAudioEnabled?: boolean;
  frontReadImageUrl?: string;
  backContentType?: 'text' | 'image' | 'image-text' | 'video' | 'read';
  backReadAutoplay?: boolean;
  backReadLang?: 'pt-BR' | 'en-US';
  backShowPlayButton?: boolean;
  backAudioUrl?: string;
  backAudioEnabled?: boolean;
  backReadImageUrl?: string;
}

export type ViewMode = 'player' | 'editor';
export type PlayerLayout = 'carousel' | 'grid';
export type CardSize = 'small' | 'medium' | 'large';
export type CardTheme = 'sleek-orange' | 'rise-blue' | 'slate-corporate' | 'emerald-green' | 'indigo-modern' | 'amber-warm' | 'rose-accent' | 'dark-elegance';

export interface DeckThemeConfig {
  id: CardTheme;
  name: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category?: string;
  cards: Flashcard[];
  createdAt: string;
  updatedAt: string;
  theme: CardTheme;
  defaultLayout: PlayerLayout;
  cardAspectRatio?: 'vertical' | 'square' | 'horizontal';
  cardSize?: CardSize;
  showProgressBar: boolean;
  enableSound: boolean;
  flipPromptText: string;
  backPromptText: string;
  frontBgType?: 'white' | 'light-gray' | 'custom';
  frontCustomBgColor?: string;
  frontCustomTextColor?: string;
  backBgType?: 'white' | 'light-gray' | 'custom';
  backCustomBgColor?: string;
  backCustomTextColor?: string;
}

export interface DeckExportOptions {
  includeInteractiveAudio: boolean;
  theme: CardTheme;
  layout: PlayerLayout;
  title: string;
  description: string;
}
