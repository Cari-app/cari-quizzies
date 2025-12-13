import { cn } from '@/lib/utils';
import { RendererProps } from './types';

export function PriceRenderer({ 
  component, 
  config 
}: RendererProps) {
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';
  const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
  const layout = config.priceLayout || 'horizontal';
  const title = config.priceTitle || 'Plano PRO';
  const prefix = config.pricePrefix || '';
  const priceVal = config.priceValue || 'R$ 89,90';
  const suffix = config.priceSuffix || '';
  const highlight = config.priceHighlight || '';
  const priceType = config.priceType || 'illustrative';
  const redirectUrl = config.priceRedirectUrl || '';
  
  // Custom styles
  const bgType = config.priceBgType || 'solid';
  const bgColor = config.priceBgColor;
  const gradientStart = config.priceGradientStart || '#667eea';
  const gradientEnd = config.priceGradientEnd || '#764ba2';
  const gradientAngle = config.priceGradientAngle ?? 135;
  const titleColor = config.priceTitleColor;
  const valueColor = config.priceValueColor;
  const prefixColor = config.pricePrefixColor;
  const borderColor = config.priceBorderColor;
  const borderWidth = config.priceBorderWidth ?? 1;
  const borderRadius = config.priceBorderRadius ?? 12;
  
  const bgStyle = bgType === 'transparent' 
    ? 'transparent'
    : bgType === 'gradient' 
      ? `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`
      : bgColor || undefined;

  const handlePriceClick = () => {
    if (priceType === 'redirect' && redirectUrl) {
      window.open(redirectUrl, '_blank');
    }
  };
  
  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div style={{ width: `${widthValue}%` }}>
        <div 
          onClick={handlePriceClick}
          className={cn(
            "relative p-4 transition-all",
            layout === 'horizontal' ? 'flex items-center justify-between gap-4' : 'flex flex-col gap-2',
            priceType === 'redirect' && redirectUrl && 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
          )}
          style={{
            background: bgStyle,
            borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
            borderStyle: borderWidth > 0 ? 'solid' : 'none',
            borderColor: borderColor || undefined,
            borderRadius: `${borderRadius}px`,
          }}
        >
          {/* Highlight badge */}
          {highlight && (
            <div className="absolute -top-3 left-4">
              <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-sm">
                {highlight}
              </span>
            </div>
          )}
          
          {/* Title */}
          <div className={cn(layout === 'vertical' && 'text-center', highlight && 'pt-2')}>
            <h3 
              className="font-semibold text-lg"
              style={{ color: titleColor || undefined }}
            >
              {title}
            </h3>
          </div>
          
          {/* Price section */}
          <div className={cn(
            "flex flex-col",
            layout === 'vertical' ? 'items-center' : 'items-end'
          )}>
            {prefix && (
              <span 
                className="text-xs font-medium"
                style={{ color: prefixColor || undefined }}
              >
                {prefix}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span 
                className="text-2xl font-bold"
                style={{ color: valueColor || undefined }}
              >
                {priceVal}
              </span>
            </div>
            {suffix && (
              <span 
                className="text-xs"
                style={{ color: prefixColor || undefined }}
              >
                {suffix}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
