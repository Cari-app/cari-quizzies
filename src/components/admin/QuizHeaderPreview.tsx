import { ArrowLeft, ChevronLeft, ArrowLeftCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignSettings {
  headerStyle: 'default' | 'minimal' | 'steps' | 'line';
  logo: {
    type: 'image' | 'url' | 'emoji';
    value: string;
  };
  logoSizePixels?: number;
  logoPosition: 'left' | 'center' | 'right';
  logoAboveBar?: boolean;
  progressBar: 'hidden' | 'top' | 'bottom';
  primaryColor: string;
  textColor: string;
  headerDivider?: {
    show: boolean;
    color: string;
    thickness: number;
  };
  backIcon?: {
    color: string;
    size: 'small' | 'medium' | 'large';
    style: 'arrow' | 'chevron' | 'circle';
  };
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
  const logoSizePx = designSettings.logoSizePixels || 40;
  const logoAboveBar = designSettings.logoAboveBar ?? true;

  // Render back icon based on settings
  const renderBackIcon = () => {
    const iconStyle = designSettings.backIcon?.style || 'chevron';
    const iconSize = designSettings.backIcon?.size || 'medium';
    const sizeMap = { small: 'w-4 h-4', medium: 'w-5 h-5', large: 'w-6 h-6' };
    const className = sizeMap[iconSize];
    
    switch (iconStyle) {
      case 'arrow':
        return <ArrowLeft className={className} />;
      case 'circle':
        return <ArrowLeftCircle className={className} />;
      case 'chevron':
      default:
        return <ChevronLeft className={className} />;
    }
  };

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

  const dividerStyle = designSettings.headerDivider?.show !== false 
    ? `${designSettings.headerDivider?.thickness || 1}px solid ${designSettings.headerDivider?.color || designSettings.primaryColor}20`
    : 'none';

  const backIconColor = designSettings.backIcon?.color || designSettings.textColor;

  // Render Logo component
  const renderLogo = () => {
    if (!designSettings.logo.value) return null;
    
    if (designSettings.logo.type === 'emoji') {
      return (
        <span style={{ fontSize: `${logoSizePx}px`, lineHeight: 1 }}>
          {designSettings.logo.value}
        </span>
      );
    }
    
    return (
      <img 
        src={designSettings.logo.value} 
        alt="Logo" 
        className="object-contain"
        style={{ height: `${logoSizePx}px` }}
      />
    );
  };

  // Render progress bar
  const renderProgressBar = () => {
    if (!isTopProgress) return null;

    if (headerStyle === 'default') {
      return (
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
      );
    }

    if (headerStyle === 'minimal') {
      return (
        <span 
          className="text-sm font-medium"
          style={{ color: designSettings.textColor }}
        >
          {currentStageIndex + 1} / {totalStages}
        </span>
      );
    }

    if (headerStyle === 'steps') {
      return (
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
      );
    }

    return null;
  };

  // Logo above bar layout
  if (logoAboveBar && designSettings.logo.value) {
    return (
      <div 
        className="shrink-0"
        style={{ borderBottom: dividerStyle }}
      >
        {/* Logo row */}
        <div className={cn(
          "px-4 pt-3 pb-2 flex items-center",
          designSettings.logoPosition === 'center' && "justify-center",
          designSettings.logoPosition === 'right' && "justify-end",
          designSettings.logoPosition === 'left' && "justify-start"
        )}>
          {renderLogo()}
        </div>
        
        {/* Progress bar row */}
        {isTopProgress && (
          <div className="px-4 pb-3 flex items-center gap-3">
            {pageSettings.allowBack && (
              <button 
                className="p-1 rounded transition-colors hover:opacity-70 pointer-events-none"
                style={{ color: backIconColor }}
              >
                {renderBackIcon()}
              </button>
            )}
            {renderProgressBar()}
          </div>
        )}
      </div>
    );
  }

  // Original inline layout (logo beside bar)
  return (
    <div 
      className="shrink-0 p-3"
      style={{ borderBottom: dividerStyle }}
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
              style={{ color: backIconColor }}
            >
              {renderBackIcon()}
            </button>
          )}
          {renderLogo()}
          {renderProgressBar()}
        </div>
      )}

      {/* Minimal Style - Step counter */}
      {headerStyle === 'minimal' && (
        <div className="flex items-center justify-between">
          {pageSettings.allowBack ? (
            <button 
              className="p-1 rounded transition-colors hover:opacity-70 pointer-events-none"
              style={{ color: backIconColor }}
            >
              {renderBackIcon()}
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
              {renderLogo()}
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
              style={{ color: backIconColor }}
            >
              {renderBackIcon()}
            </button>
          )}
          {renderLogo()}
          {renderProgressBar()}
        </div>
      )}
    </div>
  );
}
