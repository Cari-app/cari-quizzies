import { cn } from '@/lib/utils';
import { 
  RendererProps, 
  getSizeClasses, 
  getShadowClass, 
  getFontWeight, 
  getHoverEffect, 
  getAnimationClass 
} from './types';

export function ButtonRenderer({ 
  component, 
  config, 
  onNavigate, 
  onSubmit, 
  processTemplate 
}: RendererProps) {
  const buttonAction = config.buttonAction || 'next';
  const isCustomStyle = config.buttonStyle === 'custom';
  const buttonWidth = config.buttonFullWidth !== false ? 'w-full' : 'w-auto';

  // Build custom style object
  const buttonCustomStyle: React.CSSProperties = {};
  
  if (isCustomStyle) {
    if (config.buttonGradient) {
      buttonCustomStyle.background = `linear-gradient(${
        config.buttonGradientDirection === 'to-r' ? 'to right' :
        config.buttonGradientDirection === 'to-l' ? 'to left' :
        config.buttonGradientDirection === 'to-t' ? 'to top' :
        config.buttonGradientDirection === 'to-b' ? 'to bottom' :
        config.buttonGradientDirection === 'to-tr' ? 'to top right' :
        config.buttonGradientDirection === 'to-br' ? 'to bottom right' :
        config.buttonGradientDirection === 'to-tl' ? 'to top left' :
        config.buttonGradientDirection === 'to-bl' ? 'to bottom left' : 'to right'
      }, ${config.buttonGradientFrom || '#3b82f6'}, ${config.buttonGradientTo || '#8b5cf6'})`;
    } else if (config.buttonBgColor) {
      buttonCustomStyle.backgroundColor = config.buttonBgColor;
    }
    if (config.buttonTextColor) {
      buttonCustomStyle.color = config.buttonTextColor;
    }
    if (config.buttonBorderColor && (config.buttonBorderWidth ?? 0) > 0) {
      buttonCustomStyle.borderColor = config.buttonBorderColor;
      buttonCustomStyle.borderWidth = `${config.buttonBorderWidth}px`;
      buttonCustomStyle.borderStyle = 'solid';
    }
  }
  
  if (config.buttonBorderRadius !== undefined) {
    buttonCustomStyle.borderRadius = `${config.buttonBorderRadius}px`;
  }
  if (config.buttonFontSize) {
    buttonCustomStyle.fontSize = `${config.buttonFontSize}px`;
  }
  if (config.buttonLetterSpacing) {
    buttonCustomStyle.letterSpacing = `${config.buttonLetterSpacing}px`;
  }
  if (config.buttonPaddingX) {
    buttonCustomStyle.paddingLeft = `${config.buttonPaddingX}px`;
    buttonCustomStyle.paddingRight = `${config.buttonPaddingX}px`;
  }
  if (config.buttonPaddingY) {
    buttonCustomStyle.paddingTop = `${config.buttonPaddingY}px`;
    buttonCustomStyle.paddingBottom = `${config.buttonPaddingY}px`;
  }

  // Determine text color for button content - force white for primary/default styles
  const isPrimaryOrDefault = !isCustomStyle && (!config.buttonStyle || config.buttonStyle === 'primary');
  const textColor = isCustomStyle && config.buttonTextColor 
    ? config.buttonTextColor 
    : (isPrimaryOrDefault ? '#FFFFFF' : undefined);

  // Strip ALL inline color/style from buttonText HTML to allow our color to work
  const cleanButtonText = (config.buttonText || 'Continuar')
    .replace(/style="[^"]*"/gi, '') // Remove all inline styles
    .replace(/style='[^']*'/gi, ''); // Also single quotes

  const buttonContent = (
    <>
      {config.buttonIcon && config.buttonIconPosition === 'left' && (
        <span className="mr-2">{config.buttonIcon}</span>
      )}
      <span 
        style={{ color: textColor }}
        dangerouslySetInnerHTML={{ __html: processTemplate(cleanButtonText) }} 
      />
      {config.buttonIcon && config.buttonIconPosition !== 'left' && (
        <span className="ml-2">{config.buttonIcon}</span>
      )}
    </>
  );

  const handleClick = () => {
    if (buttonAction === 'link' && config.buttonLink) {
      window.open(config.buttonLink, '_blank');
    } else if (buttonAction === 'submit') {
      onSubmit();
    } else {
      onNavigate(component.id);
    }
  };

  // Default/primary button style: black background with white text (inline to override CSS)
  const buttonStyles: React.CSSProperties = {};
  if (isPrimaryOrDefault) {
    buttonStyles.backgroundColor = '#000000';
    buttonStyles.color = '#FFFFFF';
  }

  return (
    <div className="py-4">
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200",
          buttonWidth,
          getSizeClasses(config.buttonSize),
          getShadowClass(config.buttonShadow),
          getFontWeight(config.buttonFontWeight),
          getHoverEffect(config.buttonHoverEffect),
          getAnimationClass(config.buttonAnimation),
          !isCustomStyle && config.buttonStyle === 'secondary' && "bg-secondary text-secondary-foreground",
          !isCustomStyle && config.buttonStyle === 'outline' && "border border-border bg-transparent",
          config.buttonBorderRadius === undefined && "rounded-lg"
        )}
        style={{ ...buttonStyles, ...buttonCustomStyle }}
      >
        {buttonContent}
      </button>
    </div>
  );
}
