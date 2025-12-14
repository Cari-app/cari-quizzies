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
  const optionBorderRadius = config.optionBorderRadius || 'small';
  const optionShadow = config.optionShadow || 'none';
  const optionSpacing = config.optionSpacing || 'simple';
  const detailType = config.detailType || 'checkbox';
  const detailPosition = config.detailPosition || 'start';
  const imagePosition = config.imagePosition || 'top';
  const imageRatio = config.imageRatio || '1:1';
  const isVertical = optionOrientation === 'vertical';
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';

  // Custom colors - EXACT same as DropZone
  const optionBgType = config.optionBgType || 'solid';
  const optionBgColor = config.optionBgColor;
  const optionGradientStart = config.optionGradientStart || '#000000';
  const optionGradientEnd = config.optionGradientEnd || '#333333';
  const optionGradientAngle = config.optionGradientAngle || 90;
  const optionTextColor = config.optionTextColor;
  const optionBorderColor = config.optionBorderColor;
  const optionBorderWidth = config.optionBorderWidth ?? 1;
  const selectedBgColor = config.optionSelectedBgColor || '#000000';
  const selectedTextColor = config.optionSelectedTextColor || '#ffffff';
  const selectedBorderColor = config.optionSelectedBorderColor || '#000000';
  
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }[horizontalAlign];
  
  // EXACT same as DropZone
  const getOptionStyle = (isSelected: boolean): React.CSSProperties => {
    const style: React.CSSProperties = {
      borderStyle: 'solid',
      borderWidth: `${optionBorderWidth}px`,
    };
    
    if (isSelected) {
      style.backgroundColor = selectedBgColor;
      style.color = selectedTextColor;
      style.borderColor = selectedBorderColor;
    } else {
      if (optionBgType === 'transparent') {
        style.backgroundColor = 'transparent';
      } else if (optionBgType === 'gradient') {
        style.background = `linear-gradient(${optionGradientAngle}deg, ${optionGradientStart}, ${optionGradientEnd})`;
      } else if (optionBgColor) {
        style.backgroundColor = optionBgColor;
      } else {
        style.backgroundColor = '#ffffff';
      }
      style.color = optionTextColor || '#000000';
      style.borderColor = optionBorderColor || '#000000';
    }
    
    return style;
  };
  
  const getLayoutClass = () => {
    switch (optionLayout) {
      case 'grid-2': return 'grid grid-cols-2';
      case 'grid-3': return 'grid grid-cols-3';
      case 'grid-4': return 'grid grid-cols-4';
      default: return 'flex flex-col';
    }
  };
  
  const getSpacing = () => {
    switch (optionSpacing) {
      case 'compact': return 'gap-1';
      case 'relaxed': return 'gap-4';
      default: return 'gap-2';
    }
  };
  
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
  
  const getShadow = () => {
    switch (optionShadow) {
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      default: return '';
    }
  };
  
  const getImageRatioClass = () => {
    switch (imageRatio) {
      case '16:9': return 'aspect-video';
      case '4:3': return 'aspect-[4/3]';
      case '3:2': return 'aspect-[3/2]';
      default: return 'aspect-square';
    }
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

  // EXACT same as DropZone
  const renderDetail = (isSelected: boolean, index: number) => {
    if (detailType === 'none') return null;
    
    // Use matching colors based on selected state
    const detailStyle: React.CSSProperties = isSelected 
      ? { borderColor: selectedTextColor, backgroundColor: selectedTextColor, color: selectedBgColor }
      : { borderColor: optionBorderColor || '#000000', backgroundColor: 'transparent', color: optionTextColor || '#000000' };
    
    if (detailType === 'number') {
      return (
        <div 
          className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium shrink-0"
          style={detailStyle}
        >
          {index + 1}
        </div>
      );
    }
    
    return (
      <div 
        className={cn(
          "w-5 h-5 border-2 flex items-center justify-center shrink-0",
          detailType === 'radio' || !config.allowMultiple ? "rounded-full" : "rounded"
        )}
        style={detailStyle}
      >
        {isSelected && <span className="text-xs">✓</span>}
      </div>
    );
  };

  // EXACT same as DropZone
  const renderOptionMedia = (opt: typeof options[0], vertical = false) => {
    if (opt.mediaType === 'icon' && opt.icon) {
      return <span className={cn("shrink-0", vertical ? "text-2xl" : "text-lg")}>{opt.icon}</span>;
    }
    if (opt.mediaType === 'image' && opt.imageUrl) {
      return <img src={opt.imageUrl} alt="" className={cn("object-cover rounded shrink-0", vertical ? "w-10 h-10" : "w-6 h-6")} />;
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
              style={getOptionStyle(value === opt.value)}
              className={cn(
                "flex-1 py-3 rounded-lg text-sm font-medium transition-colors"
              )}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Standard options rendering - MATCHES DropZone exactly
  return (
    <div className={cn("py-4 flex", justifyClass)}>
      <div style={{ width: `${widthValue}%` }}>
        {config.label && config.label.replace(/<[^>]*>/g, '').trim() && (
          <div 
            className="rich-text font-medium mb-1" 
            dangerouslySetInnerHTML={{ __html: processTemplateHtml ? processTemplateHtml(config.label) : config.label }} 
          />
        )}
        {config.description && config.description.replace(/<[^>]*>/g, '').trim() && (
          <div 
            className="rich-text text-muted-foreground mb-3" 
            dangerouslySetInnerHTML={{ __html: processTemplateHtml ? processTemplateHtml(config.description) : config.description }} 
          />
        )}
        <div className={cn(getLayoutClass(), getSpacing())}>
          {options.map((opt, i) => {
            const isSelected = selectedValues.includes(opt.value);
            
            // Image style - Use optionOrientation to determine layout
            if (optionStyle === 'image') {
              const isHorizontalLayout = optionOrientation === 'horizontal';
              const effectiveImagePosition = isHorizontalLayout ? 'left' : 'top';
              
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className={cn(
                    "border text-sm transition-colors overflow-hidden",
                    getBorderRadius(),
                    getShadow(),
                    isSelected ? "border-foreground bg-accent" : "border-border",
                    isHorizontalLayout ? "flex" : "flex flex-col"
                  )}
                >
                  {(effectiveImagePosition === 'top' || effectiveImagePosition === 'left') && (
                    <div className={cn(
                      "bg-muted flex items-center justify-center text-muted-foreground text-2xl",
                      getImageRatioClass(),
                      isHorizontalLayout ? "w-20" : "w-full"
                    )}>
                      {opt.imageUrl ? (
                        <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : '📷'}
                    </div>
                  )}
                  <div className={cn(
                    "p-3 flex items-center gap-2",
                    detailPosition === 'end' && "flex-row-reverse"
                  )}>
                    {renderDetail(isSelected, i)}
                    <span className="flex-1 rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} />
                  </div>
                </button>
              );
            }
            
            // Card style - EXACT same as DropZone
            if (optionStyle === 'card') {
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className={cn(
                    "p-4 text-sm transition-colors",
                    getBorderRadius(),
                    getShadow()
                  )}
                  style={getOptionStyle(isSelected)}
                >
                  <div className={cn(
                    isVertical 
                      ? "flex flex-col items-center text-center gap-2" 
                      : "flex items-center gap-3",
                    !isVertical && detailPosition === 'end' && "flex-row-reverse"
                  )}>
                    {isVertical && renderOptionMedia(opt, true)}
                    {!isVertical && renderDetail(isSelected, i)}
                    {!isVertical && renderOptionMedia(opt)}
                    <span 
                      className={cn(!isVertical && "flex-1", "rich-text")} 
                      style={{ color: isSelected ? selectedTextColor : (optionTextColor || '#000000') }} 
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} 
                    />
                    {isVertical && renderDetail(isSelected, i)}
                  </div>
                </button>
              );
            }
            
            // Pill style - EXACT same as DropZone
            if (optionStyle === 'pill') {
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className={cn(
                    "px-6 py-3 text-sm font-medium transition-all duration-200 rounded-full text-center",
                    getShadow()
                  )}
                  style={getOptionStyle(isSelected)}
                >
                  <div className={cn(
                    isVertical 
                      ? "flex flex-col items-center gap-2" 
                      : "flex items-center justify-center gap-2"
                  )}>
                    {renderOptionMedia(opt)}
                    <span 
                      className="rich-text" 
                      style={{ color: isSelected ? selectedTextColor : (optionTextColor || '#000000') }} 
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} 
                    />
                  </div>
                </button>
              );
            }

            // Glass style - EXACT same as DropZone
            if (optionStyle === 'glass') {
              const glassStyle = getOptionStyle(isSelected);
              if (!isSelected && optionBgType !== 'solid' && !optionBgColor) {
                glassStyle.backgroundColor = 'rgba(255,255,255,0.1)';
              }
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className={cn(
                    "p-4 text-sm transition-all duration-200 backdrop-blur-md",
                    getBorderRadius()
                  )}
                  style={glassStyle}
                >
                  <div className={cn(
                    isVertical 
                      ? "flex flex-col items-center gap-2" 
                      : "flex items-center gap-3"
                  )}>
                    {renderOptionMedia(opt)}
                    <span 
                      className={cn(!isVertical && "flex-1", "rich-text")} 
                      style={{ color: isSelected ? selectedTextColor : (optionTextColor || '#000000') }} 
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} 
                    />
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedBgColor }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: selectedTextColor }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            }

            // Minimal style - EXACT same as DropZone
            if (optionStyle === 'minimal') {
              const minimalStyle: React.CSSProperties = isSelected 
                ? { backgroundColor: `${selectedBgColor}20`, borderLeftColor: selectedBgColor, color: optionTextColor }
                : { borderLeftColor: 'transparent', color: optionTextColor };
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.value, opt.id)}
                  className="py-3 px-4 text-sm transition-all duration-200 border-b border-border/50 last:border-b-0 border-l-4"
                  style={minimalStyle}
                >
                  <div className={cn(
                    isVertical 
                      ? "flex flex-col items-center gap-2" 
                      : "flex items-center gap-3"
                  )}>
                    {renderOptionMedia(opt)}
                    <span 
                      className={cn(!isVertical && "flex-1 text-left", "rich-text")} 
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} 
                    />
                    <div 
                      className="w-2 h-2 rounded-full transition-all"
                      style={{ backgroundColor: isSelected ? selectedBgColor : 'rgba(0,0,0,0.2)' }}
                    />
                  </div>
                </button>
              );
            }
            
            // Simple style (default) - EXACT same as DropZone with custom colors
            return (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt.value, opt.id)}
                className={cn(
                  "p-3 text-sm transition-colors",
                  getBorderRadius(),
                  getShadow()
                )}
                style={getOptionStyle(isSelected)}
              >
                <div className={cn(
                  isVertical 
                    ? "flex flex-col items-center text-center gap-2" 
                    : "flex items-center gap-3",
                  !isVertical && detailPosition === 'end' && "flex-row-reverse"
                )}>
                  {isVertical && renderOptionMedia(opt, true)}
                  {!isVertical && renderDetail(isSelected, i)}
                  {!isVertical && renderOptionMedia(opt)}
                  <span 
                    className={cn(!isVertical && "flex-1", "rich-text")} 
                    style={{ color: isSelected ? selectedTextColor : (optionTextColor || '#000000') }} 
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} 
                  />
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
