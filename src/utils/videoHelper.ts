export interface VideoEmbedInfo {
  type: 'youtube' | 'vimeo' | 'direct';
  embedUrl: string;
}

export function parseVideoUrl(url: string, autoplay: boolean = true): VideoEmbedInfo | null {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube checks
  // e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // e.g. https://youtu.be/dQw4w9WgXcQ
  // e.g. https://www.youtube.com/embed/dQw4w9WgXcQ
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = trimmed.match(ytRegex);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    // YouTube autoplay requires mute=1 in most browsers
    const autoParam = autoplay ? '&autoplay=1&mute=1&loop=1&playlist=' + videoId : '&autoplay=0';
    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1${autoParam}&controls=1&modestbranding=1`;
    return {
      type: 'youtube',
      embedUrl
    };
  }

  // Vimeo checks
  // e.g. https://vimeo.com/123456789
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:\w+\/)?videos\/|video\/|)(\d+)(?:|\/|\?))/i;
  const vimeoMatch = trimmed.match(vimeoRegex);

  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    const autoParam = autoplay ? '?autoplay=1&muted=1&loop=1' : '?autoplay=0';
    const embedUrl = `https://player.vimeo.com/video/${vimeoId}${autoParam}`;
    return {
      type: 'vimeo',
      embedUrl
    };
  }

  // Direct video file
  return {
    type: 'direct',
    embedUrl: trimmed
  };
}
