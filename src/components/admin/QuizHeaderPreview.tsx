import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignSettings {
  headerStyle: 'default' | 'minimal' | 'steps' | 'line';
  logo: {
    type: 'image' | 'url' | 'emoji';
    value: string;
  };
  logoSize: 'small' | 'medium' | 'large';
  logoPosition: 'left' | 'center' | 'right';
  progressBar: 'hidden' | 'top' | 'bottom';
  primaryColor: string;
  textColor: string;
}

interface PageSettings {
  allowBack?: boolean;
  showProgress?: boolean;
}

interface QuizHeaderPreviewProps {
  designSettings: DesignSettings;
  pageSettings: PageSettings;
  progressValue: number;
  currentStageIndex: number;
  totalStages: number;
  position?: 'top' | 'bottom';
}

export function QuizHeaderPreview({
  designSettings,
  pageSettings,
  progressValue,
  currentStageIndex,
  totalStages,
  position = 'top',
}: QuizHeaderPreviewProps) {
  const isTopProgress = position === 'top' && designSettings.progressBar === 'top';
  const isBottomProgress = position === 'bottom' && designSettings.progressBar === 'bottom';
  const headerStyle = designSettings.headerStyle || 'default';

  // Don't render if it's a bottom position component and progress isn't bottom
  if (position === 'bottom' && designSettings.progressBar !== 'bottom') {
    return null;
  }

  // Don't render if it's a top position component but progress is bottom or hidden (unless there's a logo)
  if (position === 'top' && designSettings.progressBar === 'bottom' && !designSettings.logo.value && !pageSettings.allowBack) {
    return null;
  }

  // For bottom progress bar - simple render
  if (isBottomProgress) {
    return (
      <div className="shrink-0 px-4 pb-4">
        {(headerStyle === 'default' || headerStyle === 'line') && (
          <div 
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: `${designSettings.primaryColor}30` }}
          >
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${progressValue}%`,
                backgroundColor: designSettings.primaryColor,
              }}
            />
          </div>
        )}
        {headerStyle === 'minimal' && (
          <div className="flex justify-center">
            <span 
              className="text-sm font-medium"
              style={{ color: designSettings.textColor }}
            >
              {currentStageIndex + 1} / {totalStages}
            </span>
          </div>
        )}
        {headerStyle === 'steps' && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalStages }).map((_, index) => (
              <div
                key={index}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: index === currentStageIndex ? '24px' : '8px',
                  backgroundColor: index <= currentStageIndex 
                    ? designSettings.primaryColor 
                    : `${designSettings.primaryColor}30`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Line style - just a thin progress bar at the very top
  if (headerStyle === 'line' && position === 'top' && isTopProgress) {
    return (
      <div className="shrink-0">
        <div 
          className="h-1 w-full"
          style={{ backgroundColor: `${designSettings.primaryColor}20` }}
        >
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progressValue}%`,
              backgroundColor: designSettings.primaryColor,
            }}
          />
        </div>
      </div>
    );
  }

  // Top header render
  const showHeader = designSettings.progressBar !== 'hidden' || designSettings.logo.value || pageSettings.allowBack;
  
  if (!showHeader && position === 'top') {
    return null;
  }

  return (
    <div 
      className="shrink-0 p-3"
      style={{ 
        borderBottom: `1px solid ${designSettings.textColor}15`,
      }}
    >
      {/* Default Style - Continuous progress bar */}
      {headerStyle === 'default' && (
        <div className={cn(
          "flex items-center gap-3",
          designSettings.logoPosition === 'center' && "justify-center",
          designSettings.logoPosition === 'right' && "justify-end"
        )}>
          {pageSettings.allowBack && (
            <button 
              className="p-1 rounded transition-colors hover:opacity-70 pointer-events-none"
              style={{ color: designSettings.textColor }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {designSettings.logo.value && (
            designSettings.logo.type === 'emoji' ? (
              <span 
                className={cn(
                  designSettings.logoSize === 'small' && 'text-xl',
                  designSettings.logoSize === 'medium' && 'text-2xl',
                  designSettings.logoSize === 'large' && 'text-4xl',
                )}
              >
                {designSettings.logo.value}
              </span>
            ) : (
              <img 
                src={designSettings.logo.value} 
                alt="Logo" 
                className={cn(
                  "object-contain",
                  designSettings.logoSize === 'small' && 'h-6',
                  designSettings.logoSize === 'medium' && 'h-8',
                  designSettings.logoSize === 'large' && 'h-12',
                )}
              />
            )
          )}
          {isTopProgress && (
            <div className="flex-1">
              <div 
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: `${designSettings.primaryColor}30` }}
              >
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${progressValue}%`,
                    backgroundColor: designSettings.primaryColor,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Minimal Style - Step counter */}
      {headerStyle === 'minimal' && (
        <div className="flex items-center justify-between">
          {pageSettings.allowBack ? (
            <button 
              className="p-1 rounded transition-colors hover:opacity-70 pointer-events-none"
              style={{ color: designSettings.textColor }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-6" />
          )}
          {designSettings.logo.value && (
            <div className={cn(
              "flex-1 flex",
              designSettings.logoPosition === 'center' && "justify-center",
              designSettings.logoPosition === 'right' && "justify-end",
              designSettings.logoPosition === 'left' && "justify-start"
            )}>
              {designSettings.logo.type === 'emoji' ? (
                <span 
                  className={cn(
                    designSettings.logoSize === 'small' && 'text-xl',
                    designSettings.logoSize === 'medium' && 'text-2xl',
                    designSettings.logoSize === 'large' && 'text-4xl',
                  )}
                >
                  {designSettings.logo.value}
                </span>
              ) : (
                <img 
                  src={designSettings.logo.value} 
                  alt="Logo" 
                  className={cn(
                    "object-contain",
                    designSettings.logoSize === 'small' && 'h-6',
                    designSettings.logoSize === 'medium' && 'h-8',
                    designSettings.logoSize === 'large' && 'h-12',
                  )}
                />
              )}
            </div>
          )}
          {isTopProgress ? (
            <span 
              className="text-sm font-medium"
              style={{ color: designSettings.textColor }}
            >
              {currentStageIndex + 1} / {totalStages}
            </span>
          ) : (
            <div className="w-6" />
          )}
        </div>
      )}

      {/* Steps Style - Segmented dots */}
      {headerStyle === 'steps' && (
        <div className="flex items-center gap-3">
          {pageSettings.allowBack && (
            <button 
              className="p-1 rounded transition-colors hover:opacity-70 pointer-events-none"
              style={{ color: designSettings.textColor }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {designSettings.logo.value && (
            designSettings.logo.type === 'emoji' ? (
              <span 
                className={cn(
                  designSettings.logoSize === 'small' && 'text-xl',
                  designSettings.logoSize === 'medium' && 'text-2xl',
                  designSettings.logoSize === 'large' && 'text-4xl',
                )}
              >
                {designSettings.logo.value}
              </span>
            ) : (
              <img 
                src={designSettings.logo.value} 
                alt="Logo" 
                className={cn(
                  "object-contain",
                  designSettings.logoSize === 'small' && 'h-6',
                  designSettings.logoSize === 'medium' && 'h-8',
                  designSettings.logoSize === 'large' && 'h-12',
                )}
              />
            )
          )}
          {isTopProgress && (
            <div className="flex-1 flex items-center justify-center gap-2">
              {Array.from({ length: totalStages }).map((_, index) => (
                <div
                  key={index}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: index === currentStageIndex ? '24px' : '8px',
                    backgroundColor: index <= currentStageIndex 
                      ? designSettings.primaryColor 
                      : `${designSettings.primaryColor}30`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
