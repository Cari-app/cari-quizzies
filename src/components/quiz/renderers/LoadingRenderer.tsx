import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { RendererProps } from './types';

interface LoadingRendererProps extends RendererProps {
  loadingProgress: number;
  loadingActive: boolean;
}

export function LoadingRenderer({ 
  component, 
  config,
  loadingProgress,
  loadingActive,
  processTemplateHtml 
}: LoadingRendererProps) {
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';
  const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
  
  const showTitle = config.showLoadingTitle !== false;
  const showProgress = config.showLoadingProgress !== false;
  const bgColor = config.loadingBgColor;
  const textColor = config.loadingTextColor;
  const barColor = config.loadingBarColor;
  const borderColor = config.loadingBorderColor;
  const borderWidth = config.loadingBorderWidth ?? 0;
  const borderRadius = config.loadingBorderRadius ?? 12;

  return (
    <div className={cn("py-4 flex", justifyClass)}>
      <div 
        className={cn("flex flex-col items-center gap-3 p-6 text-center")}
        style={{
          width: `${widthValue}%`,
          backgroundColor: bgColor || undefined,
          borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
          borderStyle: borderWidth > 0 ? 'solid' : 'none',
          borderColor: borderColor || undefined,
          borderRadius: `${borderRadius}px`,
        }}
      >
        {showTitle && (
          <>
            <h3 
              className="text-lg font-semibold"
              style={{ color: textColor || undefined }}
              dangerouslySetInnerHTML={{ 
                __html: processTemplateHtml 
                  ? processTemplateHtml(config.loadingTitle || 'Carregando...') 
                  : (config.loadingTitle || 'Carregando...') 
              }}
            />
            {config.loadingDescription && (
              <p 
                className="text-sm text-muted-foreground"
                style={{ color: textColor ? `${textColor}99` : undefined }}
                dangerouslySetInnerHTML={{ 
                  __html: processTemplateHtml 
                    ? processTemplateHtml(config.loadingDescription) 
                    : config.loadingDescription 
                }}
              />
            )}
          </>
        )}
        
        {showProgress && (
          <div className="w-full max-w-xs">
            <Progress 
              value={loadingProgress} 
              className="h-2"
              style={{
                ['--progress-color' as any]: barColor || undefined,
              }}
            />
            <div 
              className="text-xs text-muted-foreground mt-1 text-center"
              style={{ color: textColor ? `${textColor}99` : undefined }}
            >
              {Math.round(loadingProgress)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
