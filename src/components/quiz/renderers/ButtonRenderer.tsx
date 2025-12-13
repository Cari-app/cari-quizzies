import { cn } from '@/lib/utils';
import { RendererProps } from './types';

// Helper to convert hex to rgba
function hexToRgba(hex: string, opacity: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Get gradient direction CSS
function getGradientDirection(dir?: string): string {
  switch (dir) {
    case 'to-l': return 'to left';
    case 'to-t': return 'to top';
    case 'to-b': return 'to bottom';
    case 'to-tr': return 'to top right';
    case 'to-tl': return 'to top left';
    case 'to-br': return 'to bottom right';
    case 'to-bl': return 'to bottom left';
    default: return 'to right';
  }
}

// Get shadow CSS
function getShadow(shadow?: string): string {
  switch (shadow) {
    case 'sm': return '0 1px 2px 0 rgb(0 0 0 / 0.05)';
    case 'md': return '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    case 'lg': return '0 10px 15px -3px rgb(0 0 0 / 0.1)';
    case 'xl': return '0 20px 25px -5px rgb(0 0 0 / 0.1)';
    default: return 'none';
  }
}

// Get animation class
function getAnimationClass(animation?: string): string {
  switch (animation) {
    case 'pulse': return 'animate-pulse';
    case 'bounce': return 'animate-bounce';
    case 'shake': return 'animate-[shake_0.5s_ease-in-out_infinite]';
    default: return '';
  }
}

// Get hover class
function getHoverClass(hover?: string): string {
  switch (hover) {
    case 'darken': return 'hover:brightness-90';
    case 'lighten': return 'hover:brightness-110';
    case 'scale': return 'hover:scale-105';
    case 'lift': return 'hover:-translate-y-1 hover:shadow-lg';
    default: return '';
  }
}

export function ButtonRenderer({ 
  component, 
  config, 
  onNavigate, 
  onSubmit, 
  processTemplate 
}: RendererProps) {
  
  const handleClick = () => {
    const action = config.buttonAction || 'next';
    
    if (action === 'link' && config.buttonLink) {
      window.open(config.buttonLink, '_blank');
    } else if (action === 'submit') {
      onSubmit();
    } else {
      onNavigate(component.id);
    }
  };

  // Build background
  const opacity = config.buttonBgOpacity ?? 1;
  let background: string;
  
  if (config.buttonGradient) {
    const dir = getGradientDirection(config.buttonGradientDirection);
    const from = config.buttonGradientFrom || '#000000';
    const to = config.buttonGradientTo || '#333333';
    background = `linear-gradient(${dir}, ${hexToRgba(from, opacity)}, ${hexToRgba(to, opacity)})`;
  } else {
    const bgColor = config.buttonBgColor || '#000000';
    background = hexToRgba(bgColor, opacity);
  }

  // Build styles
  const style: React.CSSProperties = {
    background,
    color: config.buttonTextColor || '#ffffff',
    fontSize: config.buttonFontSize ? `${config.buttonFontSize}px` : '16px',
    borderRadius: `${config.buttonBorderRadius ?? 8}px`,
    borderWidth: config.buttonBorderWidth ? `${config.buttonBorderWidth}px` : '0',
    borderStyle: config.buttonBorderWidth ? 'solid' : 'none',
    borderColor: config.buttonBorderColor || '#000000',
    width: config.buttonFullWidth !== false ? '100%' : 'auto',
    padding: '12px 24px',
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: getShadow(config.buttonShadow),
    transition: 'all 0.2s ease',
  };

  const text = config.buttonText || 'Continuar';

  return (
    <div className="py-4">
      <button 
        onClick={handleClick} 
        style={style}
        className={cn(
          "inline-flex items-center justify-center",
          getAnimationClass(config.buttonAnimation),
          getHoverClass(config.buttonHoverEffect)
        )}
      >
        {processTemplate(text)}
      </button>
    </div>
  );
}
