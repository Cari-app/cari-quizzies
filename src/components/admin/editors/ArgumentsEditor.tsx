import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, GripVertical, Smile, Image, Upload, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EditorProps, ComponentConfig, ArgumentItem } from './types';
import { ComponentIdDisplay } from './shared';
import { cn } from '@/lib/utils';

const commonEmojis = ['📊', '💡', '🎯', '⭐', '🔥', '💪', '✨', '🚀', '💰', '❤️', '✅', '📈', '🏆', '💎', '🌟', '👍', '🔒', '⚡', '🎁', '📱'];

export function ArgumentsComponentTab({ component, config, updateConfig, onUpdateCustomId, advancedOpen, setAdvancedOpen }: EditorProps) {
  const argumentItems: ArgumentItem[] = config.argumentItems || [];
  const [stylingOpen, setStylingOpen] = useState(false);

  const addArgument = () => {
    const newArg: ArgumentItem = {
      id: crypto.randomUUID(),
      title: 'Titulo aqui',
      description: 'Descrição aqui oi tudo bem isso aqui e uma descrição',
      mediaType: 'none',
    };
    updateConfig({ argumentItems: [...argumentItems, newArg] });
  };

  const updateArgument = (id: string, updates: Partial<ArgumentItem>) => {
    const newItems = argumentItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateConfig({ argumentItems: newItems });
  };

  const removeArgument = (id: string) => {
    updateConfig({ argumentItems: argumentItems.filter(item => item.id !== id) });
  };

  const duplicateArgument = (item: ArgumentItem) => {
    const newArg: ArgumentItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    const index = argumentItems.findIndex(a => a.id === item.id);
    const newItems = [...argumentItems];
    newItems.splice(index + 1, 0, newArg);
    updateConfig({ argumentItems: newItems });
  };

  const handleImageUpload = async (id: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `arguments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(filePath);

      updateArgument(id, { imageUrl: publicUrl, mediaType: 'image' });
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
    }
  };

  return (
    <div className="space-y-4">
      {/* Layout */}
      <div>
        <Label className="text-xs text-muted-foreground">Layout</Label>
        <Select 
          value={config.argumentLayout || 'grid-2'} 
          onValueChange={(v) => updateConfig({ argumentLayout: v as ComponentConfig['argumentLayout'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">Lista</SelectItem>
            <SelectItem value="grid-2">Grade de 2 colunas</SelectItem>
            <SelectItem value="grid-3">Grade de 3 colunas</SelectItem>
            <SelectItem value="grid-4">Grade de 4 colunas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disposição */}
      <div>
        <Label className="text-xs text-muted-foreground">Disposição</Label>
        <Select 
          value={config.argumentDisposition || 'image-text'} 
          onValueChange={(v) => updateConfig({ argumentDisposition: v as ComponentConfig['argumentDisposition'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image-text">Imagem no topo</SelectItem>
            <SelectItem value="text-image">Texto no topo</SelectItem>
            <SelectItem value="image-left">Imagem à esquerda</SelectItem>
            <SelectItem value="image-right">Imagem à direita</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Argumentos */}
      <div className="border border-border rounded-lg p-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Argumentos</Label>
        
        <div className="space-y-3">
          {argumentItems.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg p-3 bg-muted/30 group"
            >
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-1 shrink-0 cursor-grab" />
                <div className="flex-1 space-y-2">
                  {/* Título */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Título</Label>
                    <RichTextInput
                      value={item.title}
                      onChange={(v) => updateArgument(item.id, { title: v })}
                      placeholder="Título"
                      minHeight="40px"
                      showBorder
                    />
                  </div>
                  {/* Descrição */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Descrição</Label>
                    <RichTextInput
                      value={item.description}
                      onChange={(v) => updateArgument(item.id, { description: v })}
                      placeholder="Descrição..."
                      minHeight="60px"
                      showBorder
                    />
                  </div>

                  {/* Media Type Selector */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateArgument(item.id, { mediaType: 'none', emoji: undefined, imageUrl: undefined })}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors",
                        item.mediaType === 'none' ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                      )}
                    >
                      Nenhum
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "px-2 py-1 text-xs rounded border transition-colors flex items-center gap-1",
                            item.mediaType === 'emoji' ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                          )}
                        >
                          <Smile className="w-3 h-3" />
                          {item.emoji || 'Emoji'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-5 gap-1">
                          {commonEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => updateArgument(item.id, { mediaType: 'emoji', emoji, imageUrl: undefined })}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <label
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-colors flex items-center gap-1 cursor-pointer",
                        item.mediaType === 'image' ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                      )}
                    >
                      <Image className="w-3 h-3" />
                      Imagem
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(item.id, file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Image preview */}
                  {item.mediaType === 'image' && item.imageUrl && (
                    <div className="relative w-16 h-16 rounded overflow-hidden border">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => duplicateArgument(item)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => removeArgument(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Argument button */}
        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={addArgument}
        >
          <Plus className="w-4 h-4 mr-2" />
          adicionar argumento
        </Button>
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <ComponentIdDisplay
            id={component.id}
            customId={component.customId}
            type={component.type}
            onUpdateCustomId={onUpdateCustomId}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
