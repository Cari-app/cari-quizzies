import { RendererProps } from './types';

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

  // Build styles directly from config
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
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  };

  const text = config.buttonText || 'Continuar';

  return (
    <div className="py-4">
      <button onClick={handleClick} style={style}>
        {processTemplate(text)}
      </button>
    </div>
  );
}
