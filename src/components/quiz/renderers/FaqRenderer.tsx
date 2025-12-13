import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, Minus, Plus } from 'lucide-react';
import { RendererProps } from './types';

export function FaqRenderer({ 
  component, 
  config 
}: RendererProps) {
  const faqItems = (config.faqItems || []) as Array<{ id: string; question: string; answer: string }>;
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';
  const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
  const detailType = config.faqDetailType || 'arrow';
  const firstOpen = config.faqFirstOpen !== false;
  
  const bgType = config.faqBgType || 'solid';
  const bgColor = config.faqBgColor;
  const gradientStart = config.faqGradientStart || '#667eea';
  const gradientEnd = config.faqGradientEnd || '#764ba2';
  const gradientAngle = config.faqGradientAngle ?? 135;
  const textColor = config.faqTextColor;
  const answerColor = config.faqAnswerColor;
  const borderColor = config.faqBorderColor;
  const borderWidth = config.faqBorderWidth ?? 1;
  const borderRadius = config.faqBorderRadius ?? 8;
  const iconColor = config.faqIconColor;

  const [openItems, setOpenItems] = useState<string[]>(firstOpen && faqItems[0] ? [faqItems[0].id] : []);
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const bgStyle = bgType === 'transparent' 
    ? 'transparent'
    : bgType === 'gradient' 
      ? `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`
      : bgColor || undefined;
  
  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div className="space-y-2" style={{ width: `${widthValue}%` }}>
        {faqItems.map((item) => {
          const isOpen = openItems.includes(item.id);
          return (
            <div 
              key={item.id} 
              className="overflow-hidden"
              style={{
                background: bgStyle,
                borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
                borderStyle: borderWidth > 0 ? 'solid' : 'none',
                borderColor: borderColor || undefined,
                borderRadius: `${borderRadius}px`,
              }}
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 transition-colors"
                onClick={() => toggleItem(item.id)}
              >
                <span 
                  className="font-medium text-sm"
                  style={{ color: textColor || undefined }}
                  dangerouslySetInnerHTML={{ __html: item.question }}
                />
                {detailType === 'arrow' ? (
                  <ChevronUp 
                    className={cn("w-4 h-4 transition-transform", !isOpen && "rotate-180")}
                    style={{ color: iconColor || undefined }}
                  />
                ) : (
                  isOpen ? (
                    <Minus className="w-4 h-4" style={{ color: iconColor || undefined }} />
                  ) : (
                    <Plus className="w-4 h-4" style={{ color: iconColor || undefined }} />
                  )
                )}
              </button>
              {isOpen && (
                <div 
                  className="px-4 pb-4 text-sm pt-3"
                  style={{ 
                    color: answerColor || undefined,
                    borderTopWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
                    borderTopStyle: borderWidth > 0 ? 'solid' : 'none',
                    borderTopColor: borderColor || undefined,
                  }}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
