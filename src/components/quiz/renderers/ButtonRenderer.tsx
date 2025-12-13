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
  const buttonWidth = config.buttonFullWidth !== false ? 'w-full' : 'w-auto';

  // Build button style object - always apply custom colors when set
  const buttonStyle: React.CSSProperties = {};
  
  // Background: gradient > custom color > default black
  if (config.buttonGradient) {
    buttonStyle.background = `linear-gradient(${
      config.buttonGradientDirection === 'to-r' ? 'to right' :
      config.buttonGradientDirection === 'to-l' ? 'to left' :
      config.buttonGradientDirection === 'to-t' ? 'to top' :
      config.buttonGradientDirection === 'to-b' ? 'to bottom' :
      config.buttonGradientDirection === 'to-tr' ? 'to top right' :
      config.buttonGradientDirection === 'to-br' ? 'to bottom right' :
      config.buttonGradientDirection === 'to-tl' ? 'to top left' :
      config.buttonGradientDirection === 'to-bl' ? 'to bottom left' : 'to right'
    }, ${config.buttonGradientFrom || '#000000'}, ${config.buttonGradientTo || '#333333'})`;
  } else {
    buttonStyle.backgroundColor = config.buttonBgColor || '#000000';
  }
  
  // Text color: custom > default white
  buttonStyle.color = config.buttonTextColor || '#FFFFFF';
  
  // Border
  if (config.buttonBorderColor && (config.buttonBorderWidth ?? 0) > 0) {
    buttonStyle.borderColor = config.buttonBorderColor;
    buttonStyle.borderWidth = `${config.buttonBorderWidth}px`;
    buttonStyle.borderStyle = 'solid';
  }
  
  // Border radius
  if (config.buttonBorderRadius !== undefined) {
    buttonStyle.borderRadius = `${config.buttonBorderRadius}px`;
  }
  
  // Font size
  if (config.buttonFontSize) {
    buttonStyle.fontSize = `${config.buttonFontSize}px`;
  }
  
  // Letter spacing
  if (config.buttonLetterSpacing) {
    buttonStyle.letterSpacing = `${config.buttonLetterSpacing}px`;
  }
  
  // Padding
  if (config.buttonPaddingX) {
    buttonStyle.paddingLeft = `${config.buttonPaddingX}px`;
    buttonStyle.paddingRight = `${config.buttonPaddingX}px`;
  }
  if (config.buttonPaddingY) {
    buttonStyle.paddingTop = `${config.buttonPaddingY}px`;
    buttonStyle.paddingBottom = `${config.buttonPaddingY}px`;
  }

  // Process button text - strip inline color styles so our color applies
  const processButtonText = (text: string) => {
    // Strip only color styles, keep font-size, font-weight, etc.
    return text.replace(/color:\s*[^;]+;?/gi, '');
  };

  const buttonText = processButtonText(config.buttonText || 'Continuar');

  const buttonContent = (
    <>
      {config.buttonIcon && config.buttonIconPosition === 'left' && (
        <span className="mr-2">{config.buttonIcon}</span>
      )}
      <span dangerouslySetInnerHTML={{ __html: processTemplate(buttonText) }} />
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
          config.buttonBorderRadius === undefined && "rounded-lg"
        )}
        style={buttonStyle}
      >
        {buttonContent}
      </button>
    </div>
  );
}
