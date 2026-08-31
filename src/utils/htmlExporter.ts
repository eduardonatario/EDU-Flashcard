import { Deck } from '../types';

export function generateStandaloneHTML(deck: Deck): string {
  const cards = deck.cards || [];
  const isSquare = deck.cardAspectRatio === 'square';
  const safeTitle = escapeHTML(deck.title || 'Flashcards');
  const enableSound = !!deck.enableSound;

  const backStyle = deck.backBgType === 'white' 
    ? 'background-color: #ffffff; color: #0f172a;'
    : deck.backBgType === 'custom'
    ? `background-color: ${deck.backCustomBgColor || '#f1f5f9'}; color: ${deck.backCustomTextColor || '#1e293b'};`
    : 'background-color: #f1f5f9; color: #0f172a;';

  const cardsHTML = cards.map((card, idx) => {
    let frontBody = '';
    if (card.frontContentType === 'image' && card.imageUrl) {
      frontBody = `<div class="fc-img-full"><img src="${escapeHTML(card.imageUrl)}" alt="${escapeHTML(card.imageAlt || 'Frente')}" loading="lazy" /></div>`;
    } else {
      const hasImg = card.frontContentType === 'image-text' && card.imageUrl;
      const hasTitle = !!card.title;
      const hasText = card.text && card.text !== card.title;
      
      frontBody = `<div class="fc-standard-front">
          ${hasImg ? `<div class="fc-standard-img-wrap"><img src="${escapeHTML(card.imageUrl)}" alt="${escapeHTML(card.imageAlt || 'Imagem Frente')}" loading="lazy" /></div>` : ''}
          <div class="fc-standard-body">
            ${hasTitle && hasText ? `<h4 class="fc-title">${escapeHTML(card.title)}</h4><p class="fc-desc">${escapeHTML(card.text)}</p>` : ''}
            ${hasTitle && !hasText ? `<p class="fc-big-text">${escapeHTML(card.title)}</p>` : ''}
            ${!hasTitle && hasText ? `<p class="fc-big-text">${escapeHTML(card.text)}</p>` : ''}
            ${!hasTitle && !hasText ? `<p class="fc-big-text">Texto do Card</p>` : ''}
          </div>
        </div>`;
    }

    let backBody = '';
    if (card.backContentType === 'image' && card.backImageUrl) {
      backBody = `<div class="fc-img-full"><img src="${escapeHTML(card.backImageUrl)}" alt="Verso" loading="lazy" /></div>`;
    } else {
      const hasImg = card.backContentType === 'image-text' && card.backImageUrl;
      const hasTitle = !!card.backTitle;
      const hasText = card.backText && card.backText !== card.backTitle;

      backBody = `<div class="fc-standard-back">
          ${hasImg ? `<div class="fc-standard-back-img-wrap"><img src="${escapeHTML(card.backImageUrl)}" alt="Verso" loading="lazy" /></div>` : ''}
          <div class="fc-standard-body">
            ${hasTitle && hasText ? `<h4 class="fc-back-title">${escapeHTML(card.backTitle)}</h4><p class="fc-back-desc">${escapeHTML(card.backText)}</p>` : ''}
            ${hasTitle && !hasText ? `<p class="fc-big-text">${escapeHTML(card.backTitle)}</p>` : ''}
            ${!hasTitle && hasText ? `<p class="fc-big-text">${escapeHTML(card.backText)}</p>` : ''}
            ${!hasTitle && !hasText ? `<p class="fc-big-text">Resposta</p>` : ''}
          </div>
        </div>`;
    }

    return `      <div class="fc-item ${isSquare ? 'fc-square' : 'fc-vertical'}" data-card-index="${idx}" onclick="toggleCardFlip(this)">
        <div class="fc-flipper">
          <div class="fc-face fc-front">
            ${frontBody}
          </div>
          <div class="fc-face fc-back" style="${backStyle}">
            ${backBody}
          </div>
        </div>
      </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: transparent;
      color: #0f172a;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 24px 16px;
      line-height: 1.5;
    }

    .fc-container {
      width: 100%;
      max-width: 1152px;
      margin: 0 auto;
    }

    .fc-grid {
      display: grid;
      gap: 24px;
      width: 100%;
    }

    .fc-grid-1 {
      grid-template-columns: 1fr;
      max-width: 448px;
      margin: 0 auto;
    }

    .fc-grid-2 {
      grid-template-columns: 1fr;
      max-width: 768px;
      margin: 0 auto;
    }

    @media (min-width: 768px) {
      .fc-grid-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .fc-grid-3 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .fc-grid-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .fc-item {
      perspective: 1000px;
      -webkit-perspective: 1000px;
      width: 100%;
      user-select: none;
      cursor: pointer;
    }

    .fc-item.fc-vertical {
      height: 380px;
    }

    @media (min-width: 640px) {
      .fc-item.fc-vertical {
        height: 430px;
      }
    }

    .fc-item.fc-square {
      aspect-ratio: 1 / 1;
      max-width: 448px;
      margin: 0 auto;
    }

    .fc-flipper {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      -webkit-transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-transition: -webkit-transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 24px;
    }

    .fc-flipper.is-flipped {
      transform: rotateY(180deg);
      -webkit-transform: rotateY(180deg);
    }

    .fc-face {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .fc-item:hover .fc-face {
      border-color: #60a5fa;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.06);
    }

    .fc-front {
      background-color: #ffffff;
      transform: rotateY(0deg);
      -webkit-transform: rotateY(0deg);
    }

    .fc-back {
      transform: rotateY(180deg);
      -webkit-transform: rotateY(180deg);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.12);
    }

    .fc-img-full {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .fc-img-full img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .fc-center-text {
      flex: 1;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;
    }

    .fc-big-text {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1.35;
      letter-spacing: -0.02em;
      word-break: break-word;
      max-width: 448px;
      color: inherit;
    }

    @media (min-width: 640px) {
      .fc-big-text {
        font-size: 1.875rem;
      }
    }

    .fc-standard-front, .fc-standard-back {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      height: 100%;
    }

    .fc-standard-img-wrap {
      width: 100%;
      height: 176px;
      background-color: #f1f5f9;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
    }

    .fc-standard-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .fc-standard-back-img-wrap {
      width: 100%;
      height: 144px;
      background-color: rgba(0, 0, 0, 0.05);
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
    }

    .fc-standard-back-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .fc-standard-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      text-align: center;
      overflow-y: auto;
    }

    .fc-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 10px;
      letter-spacing: -0.01em;
    }

    @media (min-width: 640px) {
      .fc-title {
        font-size: 1.25rem;
      }
    }

    .fc-desc {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @media (min-width: 640px) {
      .fc-desc {
        font-size: 1rem;
      }
    }

    .fc-back-title {
      font-size: 1rem;
      font-weight: 800;
      color: inherit;
      margin-bottom: 8px;
    }

    @media (min-width: 640px) {
      .fc-back-title {
        font-size: 1.125rem;
      }
    }

    .fc-back-desc {
      color: inherit;
      opacity: 0.9;
      font-size: 0.875rem;
      line-height: 1.6;
      text-align: center;
      max-width: 448px;
      margin: 0 auto;
    }

    @media (min-width: 640px) {
      .fc-back-desc {
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="fc-container">
    <div class="fc-grid ${cards.length === 1 ? 'fc-grid-1' : cards.length === 2 ? 'fc-grid-2' : 'fc-grid-3'}">
${cardsHTML}
    </div>
  </div>

  <script>
    const enableSound = ${enableSound};
    let audioCtx = null;

    function playFlipSound() {
      if (!enableSound) return;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) {
          audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.09);
      } catch (e) {
        // Audio ignored if blocked by browser policy
      }
    }

    function toggleCardFlip(cardElement) {
      const flipper = cardElement.querySelector('.fc-flipper');
      if (flipper) {
        flipper.classList.toggle('is-flipped');
        playFlipSound();
      }
    }
  </script>
</body>
</html>`;
}

export function downloadDeckHTML(deck: Deck): void {
  const htmlContent = generateStandaloneHTML(deck);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeFilename = (deck.title || 'flashcards')
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 40);
  anchor.href = url;
  anchor.download = `flashcards_${safeFilename}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function copyDeckHTMLToClipboard(deck: Deck): Promise<boolean> {
  const htmlContent = generateStandaloneHTML(deck);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(htmlContent);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = htmlContent;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Failed to copy HTML:', err);
    return false;
  }
}

export function generateIframeEmbedCode(deck: Deck): string {
  const safeTitle = escapeHTML(deck.title || 'Flashcards');
  return `<!-- Flashcards Embed -->\n<iframe src="flashcards_${(deck.title || 'deck').toLowerCase().replace(/[^a-z0-9]/gi, '_')}.html" width="100%" height="600" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);" title="${safeTitle}"></iframe>`;
}

function escapeHTML(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
