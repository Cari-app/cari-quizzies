import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Minus, Copy } from 'lucide-react';
import { ComponentConfig } from './ComponentEditor';
import { toast } from 'sonner';

interface SpacerComponentEditorProps {
  config: ComponentConfig;
  updateConfig: (updates: Partial<ComponentConfig>) => void;
  customId?: string;
  componentId: string;
  onUpdateCustomId: (customId: string) => void;
  generateSlug: (text: string) => string;
  advancedOpen: boolean;
  setAdvancedOpen: (open: boolean) => void;
}

export function SpacerComponentEditor({
  config,
  updateConfig,
  customId,
  componentId,
  onUpdateCustomId,
  generateSlug,
  advancedOpen,
  setAdvancedOpen,
}: SpacerComponentEditorProps) {
  // Local state for smooth slider interaction
  const [localHeight, setLocalHeight] = useState(config.height ?? 24);
  const [isDragging, setIsDragging] = useState(false);
  
  // Sync local state when config changes externally (and not dragging)
  useEffect(() => {
    if (!isDragging) {
      setLocalHeight(config.height ?? 24);
    }
  }, [config.height, isDragging]);

  // Handle slider change - only update local state for fluid UI
  const handleSliderChange = useCallback((value: number[]) => {
    setIsDragging(true);
    setLocalHeight(value[0]);
  }, []);

  // Handle slider commit (mouse up / touch end) - update parent
  const handleSliderCommit = useCallback((value: number[]) => {
    setIsDragging(false);
    updateConfig({ height: value[0] });
  }, [updateConfig]);

  // Handle increment button
  const handleIncrement = useCallback(() => {
    const newValue = Math.min(300, localHeight + 10);
    setLocalHeight(newValue);
    updateConfig({ height: newValue });
  }, [localHeight, updateConfig]);

  // Handle decrement button
  const handleDecrement = useCallback(() => {
    const newValue = Math.max(0, localHeight - 10);
    setLocalHeight(newValue);
    updateConfig({ height: newValue });
  }, [localHeight, updateConfig]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs text-muted-foreground">Altura do espaço</Label>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={handleDecrement}
              disabled={localHeight <= 0}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-medium min-w-[52px] text-center tabular-nums">
              {localHeight}px
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={handleIncrement}
              disabled={localHeight >= 300}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <Slider
          value={[localHeight]}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          min={0}
          max={300}
          step={1}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
          <span>0px</span>
          <span>150px</span>
          <span>300px</span>
        </div>
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">ID Customizado</Label>
              <div className="flex gap-1 mt-1">
                <Input
                  value={customId || ''}
                  onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
                  placeholder={`spacer_${componentId.slice(0, 8)}`}
                  className="flex-1 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(customId || componentId);
                    toast.success('ID copiado!');
                  }}
                  title="Copiar ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
              <span className="text-muted-foreground/60">UUID:</span>
              <span className="truncate flex-1">{componentId}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(componentId);
                  toast.success('UUID copiado!');
                }}
                className="hover:text-foreground transition-colors"
                title="Copiar UUID"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
