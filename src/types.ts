export interface Flashcard {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: 'top' | 'side' | 'background';
  backTitle?: string;
  backText: string;
  backImageUrl?: string;
  accentColor?: string;
  isLearned?: boolean;
  cardType?: 'standard' | 'simple';
  frontContentType?: 'text' | 'image' | 'image-text';
  backContentType?: 'text' | 'image' | 'image-text';
}

export type ViewMode = 'player' | 'editor';
export type PlayerLayout = 'carousel' | 'grid';
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
  cardAspectRatio?: 'vertical' | 'square';
  showProgressBar: boolean;
  enableSound: boolean;
  flipPromptText: string;
  backPromptText: string;
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
