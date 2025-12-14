import { QuizScreen } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { sanitizeHtml } from '@/lib/sanitize';

interface ScreenPreviewProps {
  screen: QuizScreen;
}

export function ScreenPreview({ screen }: ScreenPreviewProps) {
  const showHeader = screen.showHeader !== false && (screen.showProgress !== false || screen.allowBack !== false);
  const showTitle = screen.showTitle !== false && screen.title;
  const showSubtitle = screen.showSubtitle !== false && screen.subtitle;
  const showButton = screen.showButton !== false;

  const renderOptions = () => {
    if (!screen.options?.length) return null;
    
    return (
      <div className="space-y-3">
        {screen.options.map((opt, i) => (
          <div 
            key={opt.id} 
            className={cn(
              "p-4 rounded-lg border text-sm flex items-center justify-between cursor-pointer transition-colors",
              i === 0 ? "border-foreground bg-accent" : "border-border hover:bg-accent/50"
            )}
          >
            <span className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }} />
            {i === 0 && <Check className="w-5 h-5" />}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (screen.type) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            {showTitle && <h1 className="text-2xl font-semibold mb-3">{screen.title}</h1>}
            {showSubtitle && <p className="text-muted-foreground mb-8">{screen.subtitle}</p>}
            {showButton && (
              <Button className="w-full max-w-xs">
                {screen.buttonText || 'Começar'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        );

      case 'single-choice':
      case 'multiple-choice':
        return (
          <div className="p-6 flex flex-col h-full">
            {(showTitle || showSubtitle) && (
              <div className="mb-6">
                {showTitle && <h2 className="text-xl font-semibold mb-1">{screen.title}</h2>}
                {showSubtitle && <p className="text-sm text-muted-foreground">{screen.subtitle}</p>}
              </div>
            )}
            <div className="flex-1">
              {renderOptions()}
            </div>
          </div>
        );

      case 'text-input':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="p-6 flex flex-col h-full">
            {(showTitle || showSubtitle) && (
              <div className="mb-6">
                {showTitle && <h2 className="text-xl font-semibold mb-1">{screen.title}</h2>}
                {showSubtitle && <p className="text-sm text-muted-foreground">{screen.subtitle}</p>}
              </div>
            )}
            <Input 
              placeholder={screen.placeholder || 'Digite aqui...'} 
              className="text-base h-12"
              type={screen.type === 'email' ? 'email' : screen.type === 'number' ? 'number' : 'text'}
            />
          </div>
        );

      case 'slider':
        return (
          <div className="p-6 flex flex-col h-full">
            {(showTitle || showSubtitle) && (
              <div className="mb-6">
                {showTitle && <h2 className="text-xl font-semibold mb-1">{screen.title}</h2>}
                {showSubtitle && <p className="text-sm text-muted-foreground">{screen.subtitle}</p>}
              </div>
            )}
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-8">
                <span className="text-5xl font-semibold">{Math.round(((screen.sliderMin || 0) + (screen.sliderMax || 100)) / 2)}</span>
                {screen.sliderUnit && <span className="text-xl text-muted-foreground ml-2">{screen.sliderUnit}</span>}
              </div>
              <Slider 
                defaultValue={[50]} 
                min={screen.sliderMin || 0} 
                max={screen.sliderMax || 100} 
              />
              <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                <span>{screen.sliderMin || 0}</span>
                <span>{screen.sliderMax || 100}</span>
              </div>
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className="p-6 flex flex-col h-full">
            {(showTitle || showSubtitle) && (
              <div className="mb-6">
                {showTitle && <h2 className="text-xl font-semibold mb-1">{screen.title}</h2>}
                {showSubtitle && <p className="text-sm text-muted-foreground">{screen.subtitle}</p>}
              </div>
            )}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex gap-3">
                {Array.from({ length: screen.sliderMax || 5 }, (_, i) => (
                  <button 
                    key={i} 
                    className={cn(
                      "w-12 h-12 rounded-full border-2 text-lg font-medium transition-colors",
                      i < 3 ? "bg-foreground text-background border-foreground" : "border-border hover:bg-accent"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-16 h-16 rounded-full border-4 border-foreground border-t-transparent animate-spin mb-6" />
            {showTitle && <h2 className="text-xl font-semibold mb-2">{screen.title}</h2>}
            {showSubtitle && <p className="text-sm text-muted-foreground">{screen.subtitle}</p>}
          </div>
        );

      case 'result':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-background" />
            </div>
            {showTitle && <h1 className="text-2xl font-semibold mb-3">{screen.title}</h1>}
            {showSubtitle && <p className="text-muted-foreground mb-8">{screen.subtitle}</p>}
            {showButton && <Button className="w-full max-w-xs">{screen.buttonText || 'Concluir'}</Button>}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-border rounded-xl m-6">
            <p className="text-sm text-muted-foreground">Arraste componentes aqui</p>
            <p className="text-xs text-muted-foreground mt-1">ou configure na aba Etapa</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - Optional */}
      {showHeader && (
        <div className="p-4 border-b border-border flex items-center gap-4 shrink-0">
          {screen.allowBack !== false && (
            <button className="p-1 hover:bg-accent rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {screen.showProgress !== false && (
            <Progress value={33} className="h-1.5 flex-1" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Footer - Optional */}
      {showButton && screen.type !== 'welcome' && screen.type !== 'result' && screen.type !== 'progress' && (
        <div className="p-4 border-t border-border shrink-0">
          <Button className="w-full h-12">
            {screen.buttonText || 'Continuar'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}