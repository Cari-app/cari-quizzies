import { cn } from '@/lib/utils';
import { sanitizeEmbed } from '@/lib/sanitize';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import { CarouselPlayer } from '../CarouselPlayer';
import { RendererProps } from './types';

interface MediaRendererProps extends RendererProps {
  type: 'image' | 'video' | 'before_after' | 'carousel';
}

export function MediaRenderer({ component, config, type }: MediaRendererProps) {
  const widthValue = config.width || 100;
  const imageSize = config.imageSize || 200;
  const horizontalAlign = config.horizontalAlign || 'center';
  const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';

  if (type === 'image') {
    // Check if mediaUrl is an emoji (short text that doesn't start with http)
    const isEmoji = config.mediaUrl && config.mediaUrl.length <= 4 && !/^https?:\/\//.test(config.mediaUrl);
    
    if (!config.mediaUrl) {
      return (
        <div 
          style={{
            padding: '16px 0',
            width: '100%',
            display: 'flex',
            justifyContent: horizontalAlign === 'center' ? 'center' : horizontalAlign === 'end' ? 'flex-end' : 'flex-start'
          }}
        >
          <div 
            className="bg-muted flex items-center justify-center text-muted-foreground h-48"
            style={{ 
              width: `${imageSize}px`, 
              maxWidth: '100%',
              borderRadius: config.borderRadius ? `${config.borderRadius}px` : undefined
            }}
          >
            <span className="text-4xl">🖼️</span>
          </div>
        </div>
      );
    }

    // Render emoji
    if (isEmoji) {
      return (
        <div 
          style={{
            padding: '16px 0',
            width: '100%',
            display: 'flex',
            justifyContent: horizontalAlign === 'center' ? 'center' : horizontalAlign === 'end' ? 'flex-end' : 'flex-start'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
            <span style={{ fontSize: '3.75rem' }}>{config.mediaUrl}</span>
          </div>
        </div>
      );
    }

    // Render image URL
    return (
      <div 
        style={{
          padding: '16px 0',
          width: '100%',
          display: 'flex',
          justifyContent: horizontalAlign === 'center' ? 'center' : horizontalAlign === 'end' ? 'flex-end' : 'flex-start'
        }}
      >
        <img 
          src={config.mediaUrl} 
          alt={config.altText || ''} 
          style={{ 
            width: `${imageSize}px`,
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: config.borderRadius ? `${config.borderRadius}px` : undefined
          }}
        />
      </div>
    );
  }

  if (type === 'video') {
    if (config.videoType === 'embed' && config.embedCode) {
      return (
        <div className={cn("py-4 flex", justifyClass)}>
          <div 
            className="aspect-video rounded-lg overflow-hidden"
            style={{ width: `${widthValue}%` }}
            dangerouslySetInnerHTML={{ __html: sanitizeEmbed(config.embedCode) }}
          />
        </div>
      );
    }

    if (!config.mediaUrl) {
      return (
        <div className={cn("py-4 flex", justifyClass)}>
          <div 
            className="aspect-video bg-muted flex items-center justify-center text-muted-foreground rounded-lg"
            style={{ width: `${widthValue}%` }}
          >
            <span className="text-4xl">🎬</span>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("py-4 flex", justifyClass)}>
        <video 
          src={config.mediaUrl} 
          controls 
          className="aspect-video rounded-lg"
          style={{ 
            width: `${widthValue}%`,
            height: config.height ? `${config.height}px` : 'auto'
          }}
        />
      </div>
    );
  }

  if (type === 'before_after') {
    return (
      <div className={cn("py-4 flex", justifyClass)}>
        <div style={{ width: `${widthValue}%` }}>
          <BeforeAfterSlider
            image1={config.beforeImage || ''}
            image2={config.afterImage || ''}
            ratio={config.beforeAfterRatio || '1:1'}
            width={widthValue}
            horizontalAlign={horizontalAlign}
          />
        </div>
      </div>
    );
  }

  if (type === 'carousel') {
    const carouselItems = (config.carouselItems || []).map((item: any) => ({
      id: item.id,
      image: item.imageUrl || item.image || '',
      description: item.description || item.title || ''
    }));
    
    return (
      <div className={cn("py-4 flex", justifyClass)}>
        <div style={{ width: `${widthValue}%` }}>
          <CarouselPlayer 
            items={carouselItems}
            layout={config.carouselLayout || 'image-text'}
            pagination={config.carouselShowDots !== false}
            autoplay={config.carouselAutoPlay}
            autoplayInterval={config.carouselAutoPlayInterval || 3}
            hasBorder={config.carouselHasBorder}
            imageRatio={config.carouselAspectRatio || '4:3'}
          />
        </div>
      </div>
    );
  }

  return null;
}
