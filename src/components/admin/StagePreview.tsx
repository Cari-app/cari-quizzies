import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { DroppedComponent } from './DropZone';
import { ChartPlayer } from '../quiz/ChartPlayer';
import { SlidingRuler } from '../quiz/SlidingRuler';
import { CalendarIcon } from 'lucide-react';
import { QuizDesignSettings } from './DesignEditor';

interface StagePreviewProps {
  components: DroppedComponent[];
  designSettings: QuizDesignSettings;
}

export function StagePreview({ components, designSettings }: StagePreviewProps) {
  const renderComponentPreview = (comp: DroppedComponent) => {
    const config = (comp.config || {}) as Record<string, any>;
    
    const getBorderRadius = () => {
      switch (designSettings.borderRadius) {
        case 'none': return 'rounded-none';
        case 'small': return 'rounded';
        case 'medium': return 'rounded-lg';
        case 'large': return 'rounded-xl';
        case 'full': return 'rounded-full';
        default: return 'rounded-lg';
      }
    };

    const getSpacing = () => {
      switch (designSettings.spacing) {
        case 'compact': return 'p-3';
        case 'normal': return 'p-4';
        case 'spacious': return 'p-6';
        default: return 'p-4';
      }
    };

    switch (comp.type) {
      case 'image':
        return config.imageUrl ? (
          <div className={getSpacing()}>
            <img 
              src={config.imageUrl} 
              alt="" 
              className={cn("w-full object-cover", getBorderRadius())}
              style={{ maxHeight: '300px' }}
            />
          </div>
        ) : (
          <div className={cn(getSpacing(), "bg-muted/30 flex items-center justify-center h-40", getBorderRadius())}>
            <span className="text-muted-foreground text-sm">Imagem</span>
          </div>
        );

      case 'video':
        return config.videoUrl ? (
          <div className={getSpacing()}>
            <div className={cn("aspect-video bg-black", getBorderRadius(), "overflow-hidden")}>
              <iframe 
                src={config.videoUrl} 
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className={cn(getSpacing(), "bg-muted/30 flex items-center justify-center h-32", getBorderRadius())}>
            <span className="text-muted-foreground text-sm">Vídeo</span>
          </div>
        );

      case 'text':
        return (
          <div 
            className={cn(
              getSpacing(),
              designSettings.alignment === 'center' && 'text-center',
              designSettings.alignment === 'right' && 'text-right',
            )}
          >
            <div 
              className="rich-text"
              style={{ 
                color: designSettings.textColor,
                fontFamily: designSettings.secondaryFont,
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.content || 'Bloco de texto') }}
            />
          </div>
        );

      case 'heading':
        const headingLevel = config.headingLevel || 'h2';
        const sizeClasses = {
          h1: designSettings.titleSize === 'xlarge' ? 'text-4xl' : designSettings.titleSize === 'large' ? 'text-3xl' : 'text-2xl',
          h2: designSettings.titleSize === 'xlarge' ? 'text-3xl' : designSettings.titleSize === 'large' ? 'text-2xl' : 'text-xl',
          h3: designSettings.titleSize === 'xlarge' ? 'text-2xl' : designSettings.titleSize === 'large' ? 'text-xl' : 'text-lg',
          h4: 'text-lg',
        };
        return (
          <div 
            className={cn(
              getSpacing(),
              designSettings.alignment === 'center' && 'text-center',
              designSettings.alignment === 'right' && 'text-right',
            )}
          >
            <div 
              className={cn("font-bold", sizeClasses[headingLevel as keyof typeof sizeClasses] || 'text-xl')}
              style={{ 
                color: designSettings.titleColor,
                fontFamily: designSettings.primaryFont,
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.content || 'Título') }}
            />
          </div>
        );

      case 'button':
        return (
          <div className={getSpacing()}>
            <button
              className={cn(
                "w-full py-3 px-6 font-medium text-white transition-colors",
                getBorderRadius(),
              )}
              style={{ backgroundColor: designSettings.primaryColor }}
            >
              {config.buttonText || 'Continuar'}
            </button>
          </div>
        );

      case 'input':
      case 'email':
      case 'phone':
      case 'number':
      case 'textarea':
        return (
          <div className={getSpacing()}>
            {config.label && (
              <div 
                className="font-medium mb-2"
                style={{ 
                  color: designSettings.textColor,
                  fontFamily: designSettings.primaryFont,
                }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} 
              />
            )}
            {comp.type === 'textarea' ? (
              <textarea 
                placeholder={config.placeholder || 'Digite aqui...'}
                className={cn("w-full px-4 py-3 border text-sm resize-none", getBorderRadius())}
                style={{ 
                  backgroundColor: `${designSettings.textColor}08`,
                  borderColor: `${designSettings.textColor}20`,
                  color: designSettings.textColor,
                }}
                rows={3}
                disabled
              />
            ) : (
              <input 
                type="text"
                placeholder={config.placeholder}
                className={cn("w-full px-4 py-3 border text-sm", getBorderRadius())}
                style={{ 
                  backgroundColor: `${designSettings.textColor}08`,
                  borderColor: `${designSettings.textColor}20`,
                  color: designSettings.textColor,
                }}
                disabled
              />
            )}
          </div>
        );

      case 'single':
      case 'multiple':
      case 'options':
        const options = config.options || [];
        return (
          <div className={getSpacing()}>
            {config.label && (
              <div 
                className="font-medium mb-3"
                style={{ 
                  color: designSettings.textColor,
                  fontFamily: designSettings.primaryFont,
                }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} 
              />
            )}
            <div className="space-y-2">
              {options.slice(0, 3).map((opt: any, idx: number) => (
                <div 
                  key={opt.id || idx}
                  className={cn("px-4 py-3 border cursor-pointer transition-colors", getBorderRadius())}
                  style={{ 
                    borderColor: idx === 0 ? designSettings.primaryColor : `${designSettings.textColor}20`,
                    backgroundColor: idx === 0 ? `${designSettings.primaryColor}10` : 'transparent',
                    color: designSettings.textColor,
                  }}
                >
                  {opt.text || `Opção ${idx + 1}`}
                </div>
              ))}
              {options.length > 3 && (
                <p className="text-xs text-center opacity-50" style={{ color: designSettings.textColor }}>
                  +{options.length - 3} opções
                </p>
              )}
            </div>
          </div>
        );

      case 'spacer':
        const height = config.spacerHeight || 24;
        return <div style={{ height: `${height}px` }} />;

      case 'divider':
        return (
          <div className={getSpacing()}>
            <hr style={{ borderColor: `${designSettings.textColor}20` }} />
          </div>
        );

      default:
        return (
          <div 
            className={cn(getSpacing(), "text-sm opacity-60")}
            style={{ color: designSettings.textColor }}
          >
            {comp.name || comp.type}
          </div>
        );
    }
  };

  if (components.length === 0) {
    return (
      <div 
        className="flex-1 flex items-center justify-center p-6"
        style={{ color: designSettings.textColor }}
      >
        <p className="text-sm opacity-40">Etapa vazia</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {components.map((comp) => (
        <div key={comp.id}>
          {renderComponentPreview(comp)}
        </div>
      ))}
    </div>
  );
}
