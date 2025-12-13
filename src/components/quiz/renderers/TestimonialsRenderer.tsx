import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { RendererProps } from './types';

interface TestimonialItem {
  id: string;
  name: string;
  handle: string;
  rating: number;
  text: string;
  avatarUrl?: string;
  photoUrl?: string;
}

export function TestimonialsRenderer({ 
  component, 
  config 
}: RendererProps) {
  const testimonialItems = (config.testimonialItems || []) as TestimonialItem[];
  const layout = config.testimonialLayout || 'list';
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';
  const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
  const borderRadius = config.testimonialBorderRadius || 'small';
  const shadow = config.testimonialShadow || 'none';
  const spacing = config.testimonialSpacing || 'simple';
  
  const borderRadiusClass = {
    'none': 'rounded-none',
    'small': 'rounded-lg',
    'medium': 'rounded-xl',
    'large': 'rounded-2xl',
  }[borderRadius] || 'rounded-lg';
  
  const shadowClass = {
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg',
  }[shadow] || '';
  
  const spacingClass = {
    'compact': 'p-3 gap-2',
    'simple': 'p-4 gap-3',
    'relaxed': 'p-5 gap-4',
  }[spacing] || 'p-4 gap-3';

  const renderTestimonialCard = (item: TestimonialItem) => (
    <div 
      key={item.id} 
      className={cn(
        "border border-border bg-background flex flex-col h-full",
        borderRadiusClass,
        shadowClass,
        spacingClass
      )}
    >
      {/* Rating stars */}
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={cn("text-sm", i < item.rating ? "text-amber-400" : "text-muted-foreground/30")}>
            ★
          </span>
        ))}
      </div>
      
      {/* Author info */}
      <div className="flex items-center gap-2 mb-2">
        {item.avatarUrl && (
          <img src={item.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        )}
        <div>
          <div className="font-semibold text-sm">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.handle}</div>
        </div>
      </div>
      
      {/* Text */}
      <div 
        className="text-sm text-muted-foreground rich-text flex-1"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.text) }}
      />
      
      {/* Photo */}
      {item.photoUrl && (
        <img src={item.photoUrl} alt="" className={cn("w-full h-32 object-cover mt-3", borderRadiusClass)} />
      )}
    </div>
  );

  if (layout === 'carousel') {
    return (
      <TestimonialCarousel 
        items={testimonialItems}
        widthValue={widthValue}
        justifyClass={justifyClass}
        renderCard={renderTestimonialCard}
      />
    );
  }
  
  const gridClass = layout === 'grid-2' ? 'grid-cols-2' : 'grid-cols-1';
  
  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div 
        className={cn("grid gap-3", gridClass)}
        style={{ width: `${widthValue}%` }}
      >
        {testimonialItems.map((item) => renderTestimonialCard(item))}
      </div>
    </div>
  );
}

// Carousel component for testimonials
interface TestimonialCarouselProps {
  items: TestimonialItem[];
  widthValue: number;
  justifyClass: string;
  renderCard: (item: TestimonialItem) => React.ReactNode;
}

function TestimonialCarousel({ items, widthValue, justifyClass, renderCard }: TestimonialCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div className="relative group" style={{ width: `${widthValue}%` }}>
        <div ref={emblaRef} className="overflow-hidden rounded-2xl">
          <div className="flex">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="flex-shrink-0 min-w-0 px-2 transition-all duration-300" 
                style={{ flex: '0 0 90%' }}
              >
                <div className={cn(
                  "transition-all duration-300",
                  index === selectedIndex ? "scale-100 opacity-100" : "scale-95 opacity-60"
                )}>
                  {renderCard(item)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {items.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background hover:scale-110 hover:shadow-xl"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background hover:scale-110 hover:shadow-xl"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}
        
        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  i === selectedIndex 
                    ? "w-6 h-2.5 bg-primary shadow-sm" 
                    : "w-2.5 h-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
