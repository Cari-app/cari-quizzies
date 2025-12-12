import { QuizScreen } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface ScreenPreviewProps {
  screen: QuizScreen;
}

export function ScreenPreview({ screen }: ScreenPreviewProps) {
  const renderContent = () => {
    switch (screen.type) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <h1 className="text-xl font-semibold mb-2">{screen.title}</h1>
            {screen.subtitle && <p className="text-sm text-muted-foreground mb-6">{screen.subtitle}</p>}
            <Button size="sm">
              {screen.buttonText || 'Começar'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        );

      case 'single-choice':
      case 'multiple-choice':
        return (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-1">{screen.title}</h2>
            {screen.subtitle && <p className="text-xs text-muted-foreground mb-4">{screen.subtitle}</p>}
            <div className="space-y-2">
              {screen.options?.map((opt, i) => (
                <div 
                  key={opt.id} 
                  className={cn(
                    "p-3 rounded border text-sm flex items-center justify-between",
                    i === 0 ? "border-foreground bg-accent" : "border-border"
                  )}
                >
                  <span>{opt.text}</span>
                  {i === 0 && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          </div>
        );

      case 'text-input':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-1">{screen.title}</h2>
            {screen.subtitle && <p className="text-xs text-muted-foreground mb-4">{screen.subtitle}</p>}
            <Input 
              placeholder={screen.placeholder || 'Digite aqui...'} 
              className="text-sm"
              type={screen.type === 'email' ? 'email' : screen.type === 'number' ? 'number' : 'text'}
            />
          </div>
        );

      case 'slider':
        return (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-1">{screen.title}</h2>
            {screen.subtitle && <p className="text-xs text-muted-foreground mb-6">{screen.subtitle}</p>}
            <div className="text-center mb-6">
              <span className="text-3xl font-semibold">{Math.round(((screen.sliderMin || 0) + (screen.sliderMax || 100)) / 2)}</span>
              {screen.sliderUnit && <span className="text-sm text-muted-foreground ml-1">{screen.sliderUnit}</span>}
            </div>
            <Slider 
              defaultValue={[50]} 
              min={screen.sliderMin || 0} 
              max={screen.sliderMax || 100} 
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{screen.sliderMin || 0}</span>
              <span>{screen.sliderMax || 100}</span>
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-1">{screen.title}</h2>
            {screen.subtitle && <p className="text-xs text-muted-foreground mb-6">{screen.subtitle}</p>}
            <div className="flex justify-center gap-2">
              {Array.from({ length: screen.sliderMax || 5 }, (_, i) => (
                <button 
                  key={i} 
                  className={cn(
                    "w-10 h-10 rounded-full border text-lg transition-colors",
                    i < 3 ? "bg-foreground text-background" : "border-border hover:bg-accent"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-16 h-16 rounded-full border-4 border-foreground border-t-transparent animate-spin mb-4" />
            <h2 className="text-lg font-semibold mb-1">{screen.title}</h2>
            {screen.subtitle && <p className="text-xs text-muted-foreground">{screen.subtitle}</p>}
          </div>
        );

      case 'result':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-background" />
            </div>
            <h1 className="text-xl font-semibold mb-2">{screen.title}</h1>
            {screen.subtitle && <p className="text-sm text-muted-foreground mb-6">{screen.subtitle}</p>}
            <Button size="sm">{screen.buttonText || 'Concluir'}</Button>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <h2 className="text-lg font-semibold mb-1">{screen.title}</h2>
            {screen.subtitle && <p className="text-xs text-muted-foreground">{screen.subtitle}</p>}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      {(screen.showProgress !== false || screen.allowBack !== false) && (
        <div className="p-3 border-b border-border flex items-center gap-3">
          {screen.allowBack !== false && (
            <button className="p-1 hover:bg-accent rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {screen.showProgress !== false && (
            <Progress value={33} className="h-1 flex-1" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Footer for non-welcome/result screens */}
      {screen.type !== 'welcome' && screen.type !== 'result' && screen.type !== 'progress' && (
        <div className="p-3 border-t border-border">
          <Button className="w-full" size="sm">
            Continuar
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}