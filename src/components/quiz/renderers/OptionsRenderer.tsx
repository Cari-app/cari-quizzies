import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { RendererProps, ComponentConfig } from './types';

interface OptionsRendererProps extends RendererProps {
  type: 'options' | 'single_choice' | 'multiple_choice' | 'yesno';
}

export function OptionsRenderer({ 
  component, 
  config, 
  value, 
  onInputChange, 
  onNavigateByOption,
  processTemplate,
  processTemplateHtml 
}: OptionsRendererProps) {
  const comp = component;
  const customId = comp.customId || config.customId;

  const handleInputChange = (val: any) => {
    if (onInputChange) {
      onInputChange(comp.id, customId, val);
    }
  };

  // For options component types
  const options = (config.options || []) as Array<{
    id: string;
    text: string;
    value: string;
    imageUrl?: string;
    icon?: string;
    mediaType?: 'none' | 'icon' | 'image';
  }>;
  
  const allowMultiple = config.allowMultiple;
  const autoAdvance = config.autoAdvance !== false;
  const optionStyle = config.optionStyle || 'simple';
  const optionLayout = config.optionLayout || 'list';
  const optionOrientation = config.optionOrientation || 'vertical';
  const optionBorderRadius = config.optionBorderRadius || 'medium';
  const optionShadow = config.optionShadow || 'none';
  const detailType = config.detailType || 'none';
  const detailPosition = config.detailPosition || 'start';
  const imagePosition = config.imagePosition || 'left';
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';
  
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }[horizontalAlign];

  const getGridClass = () => ({
    'list': 'grid-cols-1',
    'grid-2': 'grid-cols-2',
    'grid-3': 'grid-cols-3',
    'grid-4': 'grid-cols-4',
  }[optionLayout] || 'grid-cols-1');
  
  const isVertical = optionOrientation === 'vertical';
  
  const getBorderRadius = () => ({
    'none': 'rounded-none',
    'small': 'rounded',
    'medium': 'rounded-lg',
    'large': 'rounded-xl',
    'full': 'rounded-full',
  }[optionBorderRadius] || 'rounded-lg');
  
  const getShadow = () => ({
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg',
  }[optionShadow] || '');
  
  const getImageRatioClass = () => {
    const ratio = config.imageRatio || '1:1';
    return {
      '1:1': 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '3:2': 'aspect-[3/2]',
    }[ratio] || 'aspect-square';
  };

  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  const handleOptionClick = (optValue: string, optId: string) => {
    if (allowMultiple) {
      const newValues = selectedValues.includes(optValue)
        ? selectedValues.filter(v => v !== optValue)
        : [...selectedValues, optValue];
      handleInputChange(newValues);
    } else {
      handleInputChange(optValue);
      if (autoAdvance && onNavigateByOption) {
        const optText = options.find(o => o.id === optId)?.text;
        setTimeout(() => onNavigateByOption(comp.id, optId, optText), 150);
      }
    }
  };

  const renderDetail = (isSelected: boolean, index: number) => {
    if (detailType === 'none') return null;
    if (detailType === 'checkbox') {
      return (
        <div className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
          isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
        )}>
          {isSelected && (
            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      );
    }
    if (detailType === 'radio') {
      return (
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
          isSelected ? "border-primary" : "border-muted-foreground/30"
        )}>
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
      );
    }
    if (detailType === 'number') {
      return (
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {index + 1}
        </div>
      );
    }
    return null;
  };

  const renderOptionMedia = (opt: typeof options[0], large = false) => {
    if (opt.mediaType === 'icon' && opt.icon) {
      return <span className={large ? "text-4xl" : "text-xl"}>{opt.icon}</span>;
    }
    if (opt.mediaType === 'image' && opt.imageUrl) {
      return (
        <img 
          src={opt.imageUrl} 
          alt="" 
          className={cn(
            "object-cover rounded",
            large ? "w-16 h-16" : "w-8 h-8",
            config.transparentImageBg && "bg-transparent"
          )} 
        />
      );
    }
    return null;
  };

  // YesNo component
  if (component.type === 'yesno') {
    const yesNoOptions = config.options || [
      { id: '1', text: 'Sim', value: 'yes' },
      { id: '2', text: 'Não', value: 'no' }
    ];
    
    return (
      <div className="py-4">
        {config.label && (
          <div 
            className="rich-text text-sm font-medium mb-3" 
            dangerouslySetInnerHTML={{ __html: processTemplateHtml ? processTemplateHtml(config.label) : config.label }} 
          />
        )}
        <div className="flex gap-3">
          {yesNoOptions.map((opt: any) => (
            <button
              key={opt.id}
              onClick={() => handleInputChange(opt.value)}
              className={cn(
                "flex-1 py-3 rounded-lg text-sm font-medium transition-colors",
                value === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:border-primary/50"
              )}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Standard options rendering
  return (
    <div className={cn("py-4 flex", justifyClass)}>
      <div style={{ width: `${widthValue}%` }}>
        {config.label && (
          <div 
            className="rich-text text-sm font-medium mb-3" 
            dangerouslySetInnerHTML={{ __html: processTemplateHtml ? processTemplateHtml(config.label) : config.label }} 
          />
        )}
        <div className={cn("grid gap-2", getGridClass())}>
          {options.map((opt, i) => {
            const isSelected = selectedValues.includes(opt.value);
            const isHorizontal = imagePosition === 'left' || imagePosition === 'right';

            // Image style
            if (optionStyle === 'image') {
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className={cn(
                    "border text-sm overflow-hidden transition-colors",
                    getBorderRadius(),
                    getShadow(),
                    isSelected ? "border-primary bg-primary/20" : "border-border bg-transparent hover:border-primary/50",
                    isHorizontal ? "flex" : "flex flex-col"
                  )}
                >
                  {(imagePosition === 'top' || imagePosition === 'left') && (
                    <div className={cn(
                      "bg-muted flex items-center justify-center text-muted-foreground text-2xl",
                      getImageRatioClass(),
                      isHorizontal ? "w-20 shrink-0" : "w-full"
                    )}>
                      {opt.imageUrl ? (
                        <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : '📷'}
                    </div>
                  )}
                  <div className={cn(
                    "p-3 flex items-center gap-2 flex-1",
                    detailPosition === 'end' && "flex-row-reverse"
                  )}>
                    {renderDetail(isSelected, i)}
                    <span className="flex-1 rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} />
                  </div>
                  {(imagePosition === 'bottom' || imagePosition === 'right') && (
                    <div className={cn(
                      "bg-muted flex items-center justify-center text-muted-foreground text-2xl",
                      getImageRatioClass(),
                      isHorizontal ? "w-20 shrink-0" : "w-full"
                    )}>
                      {opt.imageUrl ? (
                        <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : '📷'}
                    </div>
                  )}
                </button>
              );
            }

            // Card style
            if (optionStyle === 'card') {
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className={cn(
                    "p-4 border text-sm transition-colors",
                    isVertical ? "text-center" : "text-left",
                    getBorderRadius(),
                    getShadow(),
                    isSelected ? "border-primary bg-primary/20" : "border-border bg-transparent hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    isVertical 
                      ? "flex flex-col items-center gap-2" 
                      : "flex items-center gap-3",
                    !isVertical && detailPosition === 'end' && "flex-row-reverse"
                  )}>
                    {isVertical && renderOptionMedia(opt, true)}
                    {!isVertical && renderDetail(isSelected, i)}
                    {!isVertical && renderOptionMedia(opt)}
                    <span className={cn(!isVertical && "flex-1", "rich-text")} dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} />
                    {isVertical && renderDetail(isSelected, i)}
                  </div>
                </button>
              );
            }

            // Pill style
            if (optionStyle === 'pill') {
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className={cn(
                    "px-6 py-3 text-sm font-medium transition-all duration-200 rounded-full",
                    getShadow(),
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                      : "bg-muted/50 text-foreground hover:bg-primary/20 hover:scale-102"
                  )}
                >
                  <div className={cn(
                    isVertical 
                      ? "flex flex-col items-center gap-2" 
                      : "flex items-center justify-center gap-2"
                  )}>
                    {renderOptionMedia(opt)}
                    <span className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} />
                  </div>
                </button>
              );
            }

            // Glass style
            if (optionStyle === 'glass') {
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className={cn(
                    "p-4 text-sm transition-all duration-200 backdrop-blur-md",
                    getBorderRadius(),
                    isSelected 
                      ? "bg-primary/30 border-2 border-primary shadow-lg" 
                      : "bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40"
                  )}
                >
                  <div className={cn(
                    isVertical 
                      ? "flex flex-col items-center gap-2" 
                      : "flex items-center gap-3"
                  )}>
                    {renderOptionMedia(opt)}
                    <span className="flex-1 rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} />
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            }

            // Minimal style
            if (optionStyle === 'minimal') {
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className={cn(
                    "py-3 px-4 text-sm transition-all duration-200 border-b border-border/50 last:border-b-0",
                    isSelected 
                      ? "bg-primary/10 border-l-4 border-l-primary" 
                      : "hover:bg-muted/30 hover:border-l-4 hover:border-l-primary/30"
                  )}
                >
                  <div className={cn(
                    isVertical 
                      ? "flex flex-col items-center gap-2" 
                      : "flex items-center gap-3"
                  )}>
                    {renderOptionMedia(opt)}
                    <span className={cn(!isVertical && "flex-1 text-left", "rich-text")} dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} />
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      isSelected ? "bg-primary scale-150" : "bg-muted-foreground/30"
                    )} />
                  </div>
                </button>
              );
            }

            // Simple style (default)
            return (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt.value, opt.id)}
                className={cn(
                  "p-3 border text-sm transition-colors",
                  isVertical ? "text-center" : "text-left",
                  getBorderRadius(),
                  getShadow(),
                  isSelected ? "border-primary bg-primary/20" : "border-border bg-transparent hover:border-primary/50"
                )}
              >
                <div className={cn(
                  isVertical 
                    ? "flex flex-col items-center gap-2" 
                    : "flex items-center gap-3",
                  !isVertical && detailPosition === 'end' && "flex-row-reverse"
                )}>
                  {isVertical && renderOptionMedia(opt, true)}
                  {!isVertical && renderDetail(isSelected, i)}
                  {!isVertical && renderOptionMedia(opt)}
                  <span className={cn(!isVertical && "flex-1", "rich-text")} dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} />
                  {isVertical && renderDetail(isSelected, i)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
