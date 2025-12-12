import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface CarouselItem {
  id: string;
  image: string;
  description: string;
}

interface CarouselPlayerProps {
  items: CarouselItem[];
  layout: 'image-text' | 'text-only' | 'image-only';
  pagination?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  hasBorder?: boolean;
  width?: number;
  horizontalAlign?: 'start' | 'center' | 'end';
  imageRatio?: '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '9:16' | '21:9';
}

const aspectRatioClasses: Record<string, string> = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]',
  '2:3': 'aspect-[2/3]',
  '9:16': 'aspect-[9/16]',
};

export function CarouselPlayer({
  items,
  layout = 'image-text',
  pagination = true,
  autoplay = false,
  autoplayInterval = 3,
  hasBorder = false,
  width = 100,
  horizontalAlign = 'start',
  imageRatio = '4:3',
}: CarouselPlayerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const plugins = autoplay
    ? [Autoplay({ delay: autoplayInterval * 1000, stopOnInteraction: true })]
    : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', skipSnaps: false },
    plugins
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }[horizontalAlign];

  const showImage = layout !== 'text-only';
  const showText = layout !== 'image-only';

  if (items.length === 0) return null;

  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div
        className={cn(
          "rounded-2xl overflow-hidden",
          hasBorder && "border border-border shadow-sm"
        )}
        style={{ width: `${width}%` }}
      >
        {/* Embla Carousel */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex-[0_0_100%] min-w-0"
              >
                {/* Image */}
                {showImage && (
                  <div className={cn(aspectRatioClasses[imageRatio] || 'aspect-[4/3]', "bg-muted flex items-center justify-center")}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.description}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    )}
                  </div>
                )}

                {/* Text */}
                {showText && (
                  <p className="text-sm text-center py-4 px-4 text-foreground/80">
                    {item.description || 'Sem descrição'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
        {pagination && items.length > 1 && (
          <div className="flex justify-center gap-2 pb-4">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  idx === selectedIndex
                    ? "bg-foreground w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
