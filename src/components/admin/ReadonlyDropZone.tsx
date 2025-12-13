import { cn } from '@/lib/utils';
import { sanitizeHtml, sanitizeEmbed } from '@/lib/sanitize';
import { CalendarIcon, ChevronUp, ChevronDown, Minus, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { DroppedComponent } from './DropZone';
import { getDefaultChartConfig } from './ChartEditor';
import { ChartPlayer } from '../quiz/ChartPlayer';
import { SlidingRuler } from '../quiz/SlidingRuler';
import { CarouselPlayer } from '../quiz/CarouselPlayer';
import { MetricsPlayer } from '../quiz/MetricsPlayer';
import { BeforeAfterSlider } from '../quiz/BeforeAfterSlider';

interface DesignSettings {
  primaryFont?: string;
  fontSize?: number;
  textColor?: string;
  primaryColor?: string;
}

interface ReadonlyDropZoneProps {
  components: DroppedComponent[];
  designSettings?: DesignSettings;
}

export function ReadonlyDropZone({ components, designSettings }: ReadonlyDropZoneProps) {
  const renderComponentPreview = (comp: DroppedComponent) => {
    const config = (comp.config || {}) as Record<string, any>;
    
    switch (comp.type) {
      case 'image':
        if (!config.imageUrl) {
          return (
            <div className="p-4">
              <div className="w-full h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </div>
          );
        }
        return (
          <div className="p-4">
            <img 
              src={config.imageUrl} 
              alt="" 
              className={cn(
                "w-full object-cover",
                config.imageBorderRadius === 'none' && 'rounded-none',
                config.imageBorderRadius === 'small' && 'rounded-md',
                config.imageBorderRadius === 'medium' && 'rounded-lg',
                config.imageBorderRadius === 'large' && 'rounded-xl',
                config.imageBorderRadius === 'full' && 'rounded-full',
              )}
              style={{ maxHeight: config.imageMaxHeight ? `${config.imageMaxHeight}px` : undefined }}
            />
          </div>
        );

      case 'video':
        if (!config.videoUrl) {
          return (
            <div className="p-4">
              <div className="w-full aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Vídeo</span>
              </div>
            </div>
          );
        }
        return (
          <div className="p-4">
            <div 
              className={cn(
                "aspect-video overflow-hidden",
                config.videoBorderRadius === 'none' && 'rounded-none',
                config.videoBorderRadius === 'small' && 'rounded-md',
                config.videoBorderRadius === 'medium' && 'rounded-lg',
                config.videoBorderRadius === 'large' && 'rounded-xl',
              )}
              dangerouslySetInnerHTML={{ __html: sanitizeEmbed(config.videoUrl) }}
            />
          </div>
        );

      case 'text':
        return (
          <div className={cn("p-4", config.textAlign === 'center' && 'text-center', config.textAlign === 'right' && 'text-right')}>
            <div 
              className="rich-text text-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.content || 'Bloco de texto') }}
            />
          </div>
        );

      case 'heading':
        return (
          <div className={cn("p-4", config.textAlign === 'center' && 'text-center', config.textAlign === 'right' && 'text-right')}>
            <div 
              className={cn(
                "rich-text font-bold",
                config.headingLevel === 'h1' && 'text-3xl',
                config.headingLevel === 'h2' && 'text-2xl',
                config.headingLevel === 'h3' && 'text-xl',
                config.headingLevel === 'h4' && 'text-lg',
              )}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.content || 'Título') }}
            />
          </div>
        );

      case 'input':
      case 'email':
      case 'phone':
      case 'number':
      case 'textarea':
        return (
          <div className="p-4">
            {config.label && <div className="rich-text font-medium mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} />}
            {comp.type === 'textarea' ? (
              <textarea 
                placeholder={config.placeholder || 'Digite aqui...'}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm resize-none"
                rows={3}
                disabled
              />
            ) : (
              <input 
                type={comp.type === 'email' ? 'email' : comp.type === 'number' ? 'number' : 'text'}
                placeholder={config.placeholder}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm"
                disabled
              />
            )}
          </div>
        );

      case 'button': {
        const style: React.CSSProperties = {
          backgroundColor: config.buttonBgColor || '#000000',
          color: config.buttonTextColor || '#ffffff',
          fontSize: config.buttonFontSize ? `${config.buttonFontSize}px` : '16px',
          borderRadius: `${config.buttonBorderRadius ?? 8}px`,
          borderWidth: config.buttonBorderWidth ? `${config.buttonBorderWidth}px` : '0',
          borderStyle: config.buttonBorderWidth ? 'solid' : 'none',
          borderColor: config.buttonBorderColor || '#000000',
          width: config.buttonFullWidth !== false ? '100%' : 'auto',
          padding: '12px 24px',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        };

        return (
          <div className="p-4">
            <button style={style}>
              {config.buttonText || 'Botão'}
            </button>
          </div>
        );
      }

      case 'options':
      case 'single':
      case 'multiple': {
        const optionStyle = config.optionStyle || 'simple';
        const optionLayout = config.optionLayout || 'list';
        const optionBorderRadius = config.optionBorderRadius || 'small';
        
        const getBorderRadius = () => {
          switch (optionBorderRadius) {
            case 'none': return 'rounded-none';
            case 'small': return 'rounded-md';
            case 'medium': return 'rounded-lg';
            case 'large': return 'rounded-xl';
            case 'full': return 'rounded-full';
            default: return 'rounded-md';
          }
        };
        
        const getLayoutClass = () => {
          switch (optionLayout) {
            case 'grid-2': return 'grid grid-cols-2 gap-2';
            case 'grid-3': return 'grid grid-cols-3 gap-2';
            default: return 'flex flex-col gap-2';
          }
        };
        
        return (
          <div className="p-4">
            {config.label && <div className="rich-text font-medium mb-3" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} />}
            <div className={getLayoutClass()}>
              {(config.options || []).map((opt: any, idx: number) => (
                <div 
                  key={opt.id || idx}
                  className={cn(
                    "px-4 py-3 border transition-colors",
                    getBorderRadius(),
                    idx === 0 ? "border-primary bg-primary/10" : "border-border"
                  )}
                >
                  {opt.imageUrl && (
                    <img src={opt.imageUrl} alt="" className="w-full h-20 object-cover rounded mb-2" />
                  )}
                  <span className="text-sm">{opt.text || `Opção ${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'spacer':
        return <div style={{ height: `${config.spacerHeight || 24}px` }} />;

      case 'divider':
        return (
          <div className="px-4">
            <hr className="border-border" />
          </div>
        );

      case 'card': {
        const cardBg = config.cardBackground || '#ffffff';
        const cardRadius = config.cardBorderRadius || 'medium';
        
        const getCardRadius = () => {
          switch (cardRadius) {
            case 'none': return 'rounded-none';
            case 'small': return 'rounded-md';
            case 'medium': return 'rounded-xl';
            case 'large': return 'rounded-2xl';
            default: return 'rounded-xl';
          }
        };
        
        return (
          <div className="p-4">
            <div 
              className={cn("p-4", getCardRadius())}
              style={{ backgroundColor: cardBg }}
            >
              <div 
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.cardContent || 'Conteúdo do card') }}
              />
            </div>
          </div>
        );
      }

      case 'carousel': {
        const items = config.carouselItems || [];
        return (
          <div className="p-4">
            <CarouselPlayer
              items={items}
              layout={config.carouselLayout || 'image-text'}
              pagination={config.carouselPagination !== false}
              autoplay={config.carouselAutoplay || false}
              autoplayInterval={config.carouselAutoplayInterval || 3}
              hasBorder={config.carouselBorder || false}
            />
          </div>
        );
      }

      case 'metrics': {
        const items = config.metricItems || [];
        return (
          <div className="p-4">
            <MetricsPlayer
              items={items}
              layout={config.metricsLayout || 'grid-2'}
              disposition={config.metricsDisposition || 'legend-chart'}
            />
          </div>
        );
      }

      case 'before-after': {
        return (
          <div className="p-4">
            <BeforeAfterSlider
              image1={config.beforeAfterImage1 || ''}
              image2={config.beforeAfterImage2 || ''}
              ratio={config.beforeAfterRatio || '1:1'}
              initialPosition={config.beforeAfterInitialPosition || 50}
            />
          </div>
        );
      }

      case 'charts': {
        const chartConfig = config.chartConfig || getDefaultChartConfig();
        return (
          <div className="p-4">
            <ChartPlayer config={chartConfig} />
          </div>
        );
      }

      case 'height':
      case 'weight': {
        const isRulerLayout = config.layoutType === 'ruler';
        const unit = config.unit || (comp.type === 'height' ? 'cm' : 'kg');
        const defaultVal = config.defaultValue || (comp.type === 'height' ? 170 : 70);
        const minVal = config.minValue || (comp.type === 'height' ? 100 : 30);
        const maxVal = config.maxValue || (comp.type === 'height' ? 220 : 200);
        
        if (isRulerLayout) {
          const altUnit = comp.type === 'height' ? 'pol' : 'lb';
          return (
            <div className="p-4">
<SlidingRuler
                value={defaultVal}
                onChange={() => {}}
                min={minVal}
                max={maxVal}
                step={1}
                unit={unit}
                altUnit={altUnit}
                barColor={config.barColor}
                valueColor={config.valueColor}
                toggleColor={config.toggleColor}
                tickColor={config.tickColor}
                labelColor={config.labelColor}
              />
            </div>
          );
        }
        
        return (
          <div className="p-4">
            {config.label && <div className="rich-text font-medium mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} />}
            <input 
              type="number"
              placeholder={config.placeholder}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm"
              disabled
            />
          </div>
        );
      }

      default:
        return (
          <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-2 m-4">
            <span className="text-lg">{comp.icon}</span>
            <span className="text-sm">{comp.name}</span>
          </div>
        );
    }
  };

  if (components.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Etapa vazia</p>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col items-center py-2.5 px-4 overflow-y-auto"
      style={{
        fontFamily: designSettings?.primaryFont || 'inherit',
        fontSize: designSettings?.fontSize ? `${designSettings.fontSize}px` : 'inherit',
        color: designSettings?.textColor || 'inherit',
      }}
    >
      <div className="w-full max-w-md my-auto">
        <div className="flex flex-wrap gap-2">
          {components.map((comp) => {
            const config = (comp.config || {}) as Record<string, any>;
            const widthValue = config.width || 100;
            const horizontalAlign = config.horizontalAlign || 'start';
            const verticalAlign = config.verticalAlign || 'auto';
            
            const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
            const alignClass = verticalAlign === 'center' ? 'items-center' : verticalAlign === 'end' ? 'items-end' : verticalAlign === 'start' ? 'items-start' : '';
            
            return (
              <div 
                key={comp.id}
                style={{ 
                  width: widthValue === 100 ? '100%' : `calc(${widthValue}% - 4px)`,
                  flexShrink: 0,
                }}
                className={cn(
                  "flex",
                  justifyClass,
                  alignClass
                )}
              >
                <div className="w-full overflow-hidden">
                  {renderComponentPreview(comp)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
