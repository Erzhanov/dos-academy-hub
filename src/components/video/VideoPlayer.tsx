import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Lock, Play } from 'lucide-react';

interface VideoPlayerProps {
  url: string | null;
  title: string;
  className?: string;
}

/**
 * Converts various video URLs to embeddable format
 * Supports: YouTube, Vimeo, and direct embed URLs
 */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Already an embed URL
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) {
    return url;
  }
  
  // YouTube formats:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/v/VIDEO_ID
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|v\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  
  // Vimeo formats:
  // https://vimeo.com/VIDEO_ID
  // https://player.vimeo.com/video/VIDEO_ID
  const vimeoRegex = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
  }
  
  // Return original URL if no match (might be a direct embed URL)
  return url;
}

/**
 * Detects the video platform from URL
 */
function getVideoPlatform(url: string): 'youtube' | 'vimeo' | 'other' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  return 'other';
}

export function VideoPlayer({ url, title, className }: VideoPlayerProps) {
  const embedUrl = url ? getEmbedUrl(url) : null;
  const platform = url ? getVideoPlatform(url) : null;
  
  if (!embedUrl) {
    return (
      <AspectRatio ratio={16 / 9} className={className}>
        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Бейне қолжетімсіз</p>
          </div>
        </div>
      </AspectRatio>
    );
  }
  
  return (
    <AspectRatio ratio={16 / 9} className={className}>
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </AspectRatio>
  );
}

export { getEmbedUrl, getVideoPlatform };
