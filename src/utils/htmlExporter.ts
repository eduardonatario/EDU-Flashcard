import { Deck } from '../types';
import { parseVideoUrl } from './videoHelper';

export function generateStandaloneHTML(deck: Deck): string {
  const cards = deck.cards || [];
  const format = deck.cardAspectRatio || 'vertical';
  const isSquare = format === 'square';
  const isHorizontal = format === 'horizontal';
  const cardSize = deck.cardSize || 'medium';
  const safeTitle = escapeHTML(deck.title || 'Flashcards');
  const enableSound = !!deck.enableSound;

  const frontBgColor = deck.frontBgType === 'light-gray' 
    ? '#f1f5f9' 
    : deck.frontBgType === 'custom' 
    ? (deck.frontCustomBgColor || '#ffffff') 
    : '#ffffff';

  const frontTextColor = deck.frontBgType === 'custom'
    ? (deck.frontCustomTextColor || '#0f172a')
    : '#0f172a';

  const backBgColor = deck.backBgType === 'white'
    ? '#ffffff'
    : deck.backBgType === 'custom'
    ? (deck.backCustomBgColor || '#f1f5f9')
    : '#f1f5f9';

  const backTextColor = deck.backBgType === 'custom'
    ? (deck.backCustomTextColor || '#0f172a')
    : '#0f172a';

  const formatClass = isSquare ? 'fc-square' : isHorizontal ? 'fc-horizontal' : 'fc-vertical';
  const isSingleLarge = cards.length === 1 && cardSize === 'large';

  const cardsHTML = cards.map((card, idx) => {
    let frontBody = '';
    const frontIsVideo = card.frontContentType === 'video' && !!card.videoUrl;
    const frontIsImage = !frontIsVideo && card.frontContentType === 'image' && !!card.imageUrl;
    const frontIsImageText = !frontIsVideo && (card.frontContentType === 'image-text' || (!card.frontContentType && !!card.imageUrl)) && !!card.imageUrl;

    if (frontIsVideo) {
      const info = parseVideoUrl(card.videoUrl || '', card.videoAutoplay !== false);
      if (info && (info.type === 'youtube' || info.type === 'vimeo')) {
        frontBody = `<div class="fc-img-full" style="background:#000; position:relative;" onclick="event.stopPropagation();"><iframe src="${escapeHTML(info.embedUrl)}" style="width:100%;height:100%;border:0;position:absolute;top:0;left:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="Front Video"></iframe></div>`;
      } else {
        const isAuto = card.videoAutoplay !== false;
        frontBody = `<div class="fc-img-full" style="background:#000;" onclick="event.stopPropagation();"><video src="${escapeHTML(card.videoUrl)}" ${isAuto ? 'autoplay muted playsinline loop' : 'controls playsinline'} style="width:100%;height:100%;object-fit:cover;display:block;"></video></div>`;
      }
    } else if (frontIsImage) {
      frontBody = `<div class="fc-img-full"><img src="${escapeHTML(card.imageUrl)}" alt="${escapeHTML(card.imageAlt || 'Frente')}" loading="lazy" /></div>`;
    } else if (frontIsImageText) {
      const hasTitle = !!card.title;
      const hasText = card.text && card.text !== card.title;
      
      frontBody = `<div class="fc-standard-wrap">
          <div class="fc-standard-img"><img src="${escapeHTML(card.imageUrl)}" alt="${escapeHTML(card.imageAlt || 'Imagem Frente')}" loading="lazy" /></div>
          <div class="fc-standard-body">
            ${hasTitle ? `<h3 class="fc-title">${escapeHTML(card.title)}</h3>` : ''}
            ${hasText ? `<p class="fc-desc">${escapeHTML(card.text)}</p>` : ''}
            ${!hasTitle && !hasText ? `<p class="fc-desc" style="opacity: 0.5; font-style: italic;">Título &amp; Texto da Frente</p>` : ''}
          </div>
        </div>`;
    } else {
      const hasTitle = !!card.title;
      const hasText = card.text && card.text !== card.title;
      frontBody = `<div class="fc-text-wrap">
          ${hasTitle ? `<h3 class="fc-title">${escapeHTML(card.title)}</h3>` : ''}
          ${hasText ? `<p class="fc-desc">${escapeHTML(card.text)}</p>` : ''}
          ${!hasTitle && !hasText ? `<p class="fc-desc">Texto do Card</p>` : ''}
        </div>`;
    }

    let backBody = '';
    const backIsVideo = card.backContentType === 'video' && !!card.backVideoUrl;
    const backIsImage = !backIsVideo && card.backContentType === 'image' && !!card.backImageUrl;
    const backIsImageText = !backIsVideo && (card.backContentType === 'image-text' || (!card.backContentType && !!card.backImageUrl)) && !!card.backImageUrl;

    if (backIsVideo) {
      const info = parseVideoUrl(card.backVideoUrl || '', card.backVideoAutoplay !== false);
      if (info && (info.type === 'youtube' || info.type === 'vimeo')) {
        backBody = `<div class="fc-img-full" style="background:#000; position:relative;" onclick="event.stopPropagation();"><iframe src="${escapeHTML(info.embedUrl)}" style="width:100%;height:100%;border:0;position:absolute;top:0;left:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="Back Video"></iframe></div>`;
      } else {
        const isAuto = card.backVideoAutoplay !== false;
        backBody = `<div class="fc-img-full" style="background:#000;" onclick="event.stopPropagation();"><video src="${escapeHTML(card.backVideoUrl)}" ${isAuto ? 'autoplay muted playsinline loop' : 'controls playsinline'} style="width:100%;height:100%;object-fit:cover;display:block;"></video></div>`;
      }
    } else if (backIsImage) {
      backBody = `<div class="fc-img-full"><img src="${escapeHTML(card.backImageUrl)}" alt="Verso" loading="lazy" /></div>`;
    } else if (backIsImageText) {
      const hasTitle = !!card.backTitle;
      const hasText = card.backText && card.backText !== card.backTitle;

      backBody = `<div class="fc-standard-wrap">
          <div class="fc-standard-img"><img src="${escapeHTML(card.backImageUrl)}" alt="Verso" loading="lazy" /></div>
          <div class="fc-standard-body">
            ${hasTitle ? `<h3 class="fc-back-title">${escapeHTML(card.backTitle)}</h3>` : ''}
            ${hasText ? `<div class="fc-back-desc">${escapeHTML(card.backText)}</div>` : ''}
            ${!hasTitle && !hasText ? `<p class="fc-back-desc" style="opacity: 0.5; font-style: italic;">Título &amp; Texto do Verso</p>` : ''}
          </div>
        </div>`;
    } else {
      const hasTitle = !!card.backTitle;
      const hasText = card.backText && card.backText !== card.backTitle;

      backBody = `<div class="fc-text-wrap">
          ${hasTitle ? `<h3 class="fc-back-title">${escapeHTML(card.backTitle)}</h3>` : ''}
          ${hasText ? `<div class="fc-back-desc">${escapeHTML(card.backText)}</div>` : ''}
          ${!hasTitle && !hasText ? `<p class="fc-back-desc">Resposta</p>` : ''}
        </div>`;
    }

    return `        <div class="fc-item ${formatClass}" data-card-index="${idx}" role="button" tabindex="0" aria-label="Flashcard: clique para girar" onclick="window.fcFlipCard(this, event);">
          <div class="fc-flipper">
            <div class="fc-face fc-front">
              ${frontBody}
            </div>
            <div class="fc-face fc-back">
              ${backBody}
            </div>
          </div>
        </div>`;
  }).join('\n');

  let gridClass = 'fc-grid-3';
  if (cardSize === 'small') {
    if (cards.length === 1) gridClass = 'fc-grid-1';
    else if (cards.length === 2) gridClass = 'fc-grid-2';
    else if (cards.length === 3) gridClass = 'fc-grid-3';
    else gridClass = 'fc-grid-4';
  } else if (cardSize === 'large') {
    if (cards.length === 1) gridClass = 'fc-grid-1';
    else gridClass = 'fc-grid-2';
  } else {
    if (cards.length === 1) gridClass = 'fc-grid-1';
    else if (cards.length === 2) gridClass = 'fc-grid-2';
    else gridClass = 'fc-grid-3';
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    /* RESET & BASE */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      min-height: 100vh;
      background-color: #f8fafc;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .fc-page-wrapper {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 32px 16px;
    }

    .fc-main-container {
      width: 100%;
      max-width: 1160px;
      margin: 0 auto;
    }

    /* GRIDS */
    .fc-grid {
      display: grid;
      gap: 24px;
      width: 100%;
      justify-content: center;
      justify-items: center;
    }

    .fc-size-small .fc-grid {
      gap: 12px;
    }

    .fc-grid-1 {
      grid-template-columns: minmax(0, 1fr);
      max-width: 600px;
      margin: 0 auto;
    }

    .fc-size-small .fc-grid-1 {
      max-width: 290px;
    }

    .fc-grid-2 {
      grid-template-columns: minmax(0, 1fr);
      max-width: 860px;
      margin: 0 auto;
    }
    .fc-size-small .fc-grid-2 {
      max-width: 600px;
    }
    @media (min-width: 640px) {
      .fc-grid-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .fc-grid-3 {
      grid-template-columns: minmax(0, 1fr);
      max-width: 1100px;
      margin: 0 auto;
    }
    .fc-size-small .fc-grid-3 {
      max-width: 900px;
    }
    @media (min-width: 640px) {
      .fc-grid-3 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (min-width: 1024px) {
      .fc-grid-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .fc-grid-4 {
      grid-template-columns: minmax(0, 1fr);
      max-width: 1200px;
      margin: 0 auto;
    }
    .fc-size-small .fc-grid-4 {
      max-width: 1180px;
    }
    @media (min-width: 480px) {
      .fc-grid-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (min-width: 768px) {
      .fc-grid-4 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    @media (min-width: 1024px) {
      .fc-grid-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    /* CARD ITEM (3D SCENE) */
    .fc-item {
      width: 100%;
      position: relative;
      perspective: 1000px;
      -webkit-perspective: 1000px;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      outline: none;
    }

    /* FORMAT & DIMENSIONS - MEDIUM (DEFAULT) */
    .fc-size-medium .fc-item.fc-vertical {
      height: 380px;
      max-width: 340px;
      margin: 0 auto;
    }
    .fc-size-medium .fc-item.fc-square {
      aspect-ratio: 1 / 1;
      min-height: 290px;
      max-width: 340px;
      margin: 0 auto;
    }
    .fc-size-medium .fc-item.fc-horizontal {
      aspect-ratio: 16 / 10;
      min-height: 230px;
      max-width: 400px;
      margin: 0 auto;
    }

    /* FORMAT & DIMENSIONS - SMALL */
    .fc-size-small .fc-item.fc-vertical {
      height: 310px;
      max-width: 280px;
      margin: 0 auto;
    }
    .fc-size-small .fc-item.fc-square {
      aspect-ratio: 1 / 1;
      min-height: 250px;
      max-width: 280px;
      margin: 0 auto;
    }
    .fc-size-small .fc-item.fc-horizontal {
      aspect-ratio: 16 / 10;
      min-height: 190px;
      max-width: 320px;
      margin: 0 auto;
    }

    /* FORMAT & DIMENSIONS - LARGE */
    .fc-size-large .fc-item.fc-vertical {
      height: 480px;
      max-width: 440px;
      margin: 0 auto;
    }
    .fc-size-large .fc-item.fc-square {
      aspect-ratio: 1 / 1;
      min-height: 400px;
      max-width: 440px;
      margin: 0 auto;
    }
    .fc-size-large .fc-item.fc-horizontal {
      aspect-ratio: 16 / 10;
      min-height: 300px;
      max-width: 520px;
      margin: 0 auto;
    }

    /* SINGLE LARGE CARD */
    .fc-single-large .fc-item.fc-vertical {
      height: 540px;
      max-width: 500px;
      margin: 0 auto;
    }
    .fc-single-large .fc-item.fc-square {
      aspect-ratio: 1 / 1;
      min-height: 460px;
      max-width: 500px;
      margin: 0 auto;
    }
    .fc-single-large .fc-item.fc-horizontal {
      aspect-ratio: 16 / 10;
      min-height: 340px;
      max-width: 640px;
      margin: 0 auto;
    }

    /* FLIPPER CONTAINER */
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

    /* CARD FACES */
    .fc-face {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .fc-item:hover .fc-face {
      border-color: #60a5fa;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
    }

    .fc-front {
      background-color: ${frontBgColor};
      color: ${frontTextColor};
      transform: rotateY(0deg);
      -webkit-transform: rotateY(0deg);
    }

    .fc-back {
      background-color: ${backBgColor};
      color: ${backTextColor};
      transform: rotateY(180deg);
      -webkit-transform: rotateY(180deg);
    }

    /* FULL IMAGE */
    .fc-img-full {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 24px;
    }
    .fc-img-full img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      pointer-events: none;
    }

    /* TEXT ONLY */
    .fc-text-wrap {
      flex: 1;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
      overflow-y: auto;
    }

    /* STANDARD WRAP (IMAGE + TEXT) */
    .fc-standard-wrap {
      flex: 1;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .fc-standard-img {
      width: 100%;
      background-color: rgba(0, 0, 0, 0.04);
      overflow: hidden;
      flex-shrink: 0;
      border-radius: 24px 24px 0 0;
    }

    .fc-size-small .fc-standard-img { height: 110px; }
    .fc-size-medium .fc-standard-img { height: 150px; }
    .fc-size-large .fc-standard-img { height: 210px; }
    .fc-single-large .fc-standard-img { height: 250px; }

    .fc-item.fc-horizontal .fc-standard-img {
      height: 110px;
    }
    .fc-size-large .fc-item.fc-horizontal .fc-standard-img {
      height: 150px;
    }
    .fc-single-large .fc-item.fc-horizontal .fc-standard-img {
      height: 180px;
    }

    .fc-standard-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      pointer-events: none;
    }

    .fc-standard-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 16px 20px;
      overflow-y: auto;
    }

    /* TYPOGRAPHY */
    .fc-title, .fc-back-title {
      font-size: 1.125rem;
      font-weight: 800;
      line-height: 1.35;
      margin-bottom: 6px;
      color: inherit;
      word-break: break-word;
      letter-spacing: -0.02em;
    }

    .fc-size-small .fc-title, .fc-size-small .fc-back-title {
      font-size: 0.95rem;
      margin-bottom: 4px;
    }

    .fc-size-large .fc-title, .fc-size-large .fc-back-title {
      font-size: 1.35rem;
      margin-bottom: 8px;
    }

    .fc-single-large .fc-title, .fc-single-large .fc-back-title {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .fc-desc, .fc-back-desc {
      font-size: 0.875rem;
      line-height: 1.5;
      opacity: 0.85;
      color: inherit;
      word-break: break-word;
    }

    .fc-size-small .fc-desc, .fc-size-small .fc-back-desc {
      font-size: 0.8125rem;
    }

    .fc-size-large .fc-desc, .fc-size-large .fc-back-desc {
      font-size: 1rem;
    }

    .fc-single-large .fc-desc, .fc-single-large .fc-back-desc {
      font-size: 1.05rem;
    }
  </style>
</head>
<body>
  <div class="fc-page-wrapper fc-size-${cardSize} ${isSingleLarge ? 'fc-single-large' : ''}">
    <div class="fc-main-container">
      <div class="fc-grid ${gridClass}">
${cardsHTML}
      </div>
    </div>
  </div>

  <script>
    (function() {
      var enableSound = ${enableSound};
      var audioCtx = null;

      function playSound() {
        if (!enableSound) return;
        try {
          var AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          if (!audioCtx) audioCtx = new AudioContextClass();
          if (audioCtx.state === 'suspended') audioCtx.resume();
          var osc = audioCtx.createOscillator();
          var gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(340, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.09);
        } catch (e) {}
      }

      window.fcFlipCard = function(el, e) {
        if (!el) return;
        var card = (el.classList && el.classList.contains('fc-item')) ? el : (el.closest ? el.closest('.fc-item') : null);
        if (!card) return;
        var flipper = card.querySelector('.fc-flipper');
        if (flipper) {
          flipper.classList.toggle('is-flipped');
          playSound();
        }
      };

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
          var active = document.activeElement;
          if (active && active.classList && active.classList.contains('fc-item')) {
            e.preventDefault();
            window.fcFlipCard(active, e);
          }
        }
      });
    })();
  </script>
</body>
</html>`;
}

export function downloadDeckHTML(deck: Deck): void {
  const htmlContent = generateStandaloneHTML(deck);
  const safeFilename = (deck.title || 'flashcards')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 40) || 'flashcards';

  const filename = `flashcards_${safeFilename}.html`;

  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    
    setTimeout(() => {
      if (anchor.parentNode) {
        anchor.parentNode.removeChild(anchor);
      }
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.warn('Blob URL download failed, trying data URI:', err);
    const encodedUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = encodedUri;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      if (anchor.parentNode) {
        anchor.parentNode.removeChild(anchor);
      }
    }, 1000);
  }
}

export async function copyDeckHTMLToClipboard(deck: Deck): Promise<boolean> {
  const htmlContent = generateStandaloneHTML(deck);

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(htmlContent);
      return true;
    } catch (err) {
      console.warn('Clipboard writeText failed, using fallback:', err);
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = htmlContent;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    return successful;
  } catch (fallbackErr) {
    console.error('execCommand copy failed:', fallbackErr);
  }

  return false;
}

export function generateIframeEmbedCode(deck: Deck): string {
  const safeTitle = escapeHTML(deck.title || 'Flashcards');
  return `<!-- Flashcards Embed -->\n<iframe src="flashcards_${(deck.title || 'deck').toLowerCase().replace(/[^a-z0-9]/gi, '_')}.html" width="100%" height="600" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);" title="${safeTitle}"></iframe>`;
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
