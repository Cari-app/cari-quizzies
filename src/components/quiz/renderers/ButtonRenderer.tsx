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

  // Build inline styles from config - these override everything
  const buttonStyle: React.CSSProperties = {};
  
  // Background: gradient > custom bgColor > default black
  if (config.buttonGradient) {
    const direction = 
      config.buttonGradientDirection === 'to-r' ? 'to right' :
      config.buttonGradientDirection === 'to-l' ? 'to left' :
      config.buttonGradientDirection === 'to-t' ? 'to top' :
      config.buttonGradientDirection === 'to-b' ? 'to bottom' :
      config.buttonGradientDirection === 'to-tr' ? 'to top right' :
      config.buttonGradientDirection === 'to-br' ? 'to bottom right' :
      config.buttonGradientDirection === 'to-tl' ? 'to top left' :
      config.buttonGradientDirection === 'to-bl' ? 'to bottom left' : 'to right';
    buttonStyle.background = `linear-gradient(${direction}, ${config.buttonGradientFrom || '#000000'}, ${config.buttonGradientTo || '#333333'})`;
  } else {
    buttonStyle.backgroundColor = config.buttonBgColor || '#000000';
  }
  
  // Text color
  buttonStyle.color = config.buttonTextColor || '#FFFFFF';
  
  // Border
  const borderWidth = config.buttonBorderWidth ?? 0;
  if (borderWidth > 0) {
    buttonStyle.borderWidth = `${borderWidth}px`;
    buttonStyle.borderStyle = 'solid';
    buttonStyle.borderColor = config.buttonBorderColor || '#000000';
  }
  
  // Border radius
  buttonStyle.borderRadius = `${config.buttonBorderRadius ?? 8}px`;
  
  // Font size
  if (config.buttonFontSize) {
    buttonStyle.fontSize = `${config.buttonFontSize}px`;
  }
  
  // Letter spacing
  if (config.buttonLetterSpacing) {
    buttonStyle.letterSpacing = `${config.buttonLetterSpacing}px`;
  }
  
  // Padding
  if (config.buttonPaddingX !== undefined) {
    buttonStyle.paddingLeft = `${config.buttonPaddingX}px`;
    buttonStyle.paddingRight = `${config.buttonPaddingX}px`;
  }
  if (config.buttonPaddingY !== undefined) {
    buttonStyle.paddingTop = `${config.buttonPaddingY}px`;
    buttonStyle.paddingBottom = `${config.buttonPaddingY}px`;
  }

  // Get button text - strip inline color styles to let our color work
  const rawText = config.buttonText || 'Continuar';
  const cleanText = rawText.replace(/color:\s*[^;]+;?/gi, '');

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
          getAnimationClass(config.buttonAnimation)
        )}
        style={buttonStyle}
      >
        {config.buttonIcon && config.buttonIconPosition === 'left' && (
          <span className="mr-2">{config.buttonIcon}</span>
        )}
        <span dangerouslySetInnerHTML={{ __html: processTemplate(cleanText) }} />
        {config.buttonIcon && config.buttonIconPosition !== 'left' && (
          <span className="ml-2">{config.buttonIcon}</span>
        )}
      </button>
    </div>
  );
}
