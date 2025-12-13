import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Plus, ChevronDown, GripVertical, Image, Smile, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ComponentIdDisplay } from './shared/ComponentIdDisplay';
import { MediaLibraryPicker } from '@/components/ui/media-library-picker';
import type { EditorProps, OptionItem, ComponentConfig } from './types';

const commonEmojis = ['✓', '✗', '👍', '👎', '⭐', '❤️', '🔥', '💡', '🎯', '💪', '🚀', '✨'];

export function OptionsComponentTab({ component, config, updateConfig, onUpdateCustomId }: EditorProps) {
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [optionMediaPickerOpen, setOptionMediaPickerOpen] = useState(false);
  const [optionMediaPickerTarget, setOptionMediaPickerTarget] = useState<string | null>(null);

  const addOption = () => {
    const currentOptions = config.options || [];
    const newOption: OptionItem = {
      id: crypto.randomUUID(),
      text: `Opção ${currentOptions.length + 1}`,
      value: `opt_${currentOptions.length + 1}`,
      points: 1,
      destination: 'next',
    };
    updateConfig({ options: [...currentOptions, newOption] });
  };

  const updateOption = (id: string, updates: Partial<OptionItem>) => {
    const options = (config.options || []).map(opt => 
      opt.id === id ? { ...opt, ...updates } : opt
    );
    updateConfig({ options });
  };

  const removeOption = (id: string) => {
    updateConfig({
      options: (config.options || []).filter(opt => opt.id !== id)
    });
  };

  const handleOptionImageUpload = async (optionId: string, file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para fazer upload.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/options/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(fileName, file);

      if (uploadError) {
        toast.error('Erro ao fazer upload da imagem.');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(fileName);

      updateOption(optionId, { imageUrl: publicUrl, mediaType: 'image' });
      toast.success('Imagem enviada!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da imagem.');
    }
  };

  const options = config.options || [];

  return (
    <div className="space-y-4">
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />

      {/* Options List */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Opções</Label>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={opt.id} className="border border-border rounded-lg overflow-hidden">
              <div 
                className="flex items-center gap-2 p-2 bg-background cursor-grab hover:bg-muted/50"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-medium w-5">{idx + 1}</span>
                
                {/* Media Selector */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-8 h-8 rounded border border-dashed border-border flex items-center justify-center hover:bg-muted/50 transition-colors shrink-0">
                      {opt.mediaType === 'icon' && opt.icon ? (
                        <span className="text-lg">{opt.icon}</span>
                      ) : opt.mediaType === 'image' && opt.imageUrl ? (
                        <img src={opt.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                      ) : (
                        <Image className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    {/* Tabs */}
                    <div className="flex p-1 bg-muted rounded-lg mb-3">
                      <button
                        type="button"
                        onClick={() => updateOption(opt.id, { mediaType: 'none', icon: undefined, imageUrl: undefined })}
                        className={cn(
                          "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors",
                          opt.mediaType === 'none' || !opt.mediaType ? "bg-background shadow-sm" : "hover:bg-background/50"
                        )}
                      >
                        Nenhum
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOption(opt.id, { mediaType: 'icon' })}
                        className={cn(
                          "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors",
                          opt.mediaType === 'icon' ? "bg-background shadow-sm" : "hover:bg-background/50"
                        )}
                      >
                        Emoji
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOption(opt.id, { mediaType: 'image' })}
                        className={cn(
                          "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors",
                          opt.mediaType === 'image' ? "bg-background shadow-sm" : "hover:bg-background/50"
                        )}
                      >
                        Imagem
                      </button>
                    </div>

                    {/* Emoji Grid */}
                    {opt.mediaType === 'icon' && (
                      <div className="grid grid-cols-6 gap-1">
                        {commonEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => updateOption(opt.id, { icon: emoji })}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-muted transition-colors",
                              opt.icon === emoji && "bg-muted ring-1 ring-primary"
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Image Upload */}
                    {opt.mediaType === 'image' && (
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setOptionMediaPickerTarget(opt.id);
                            setOptionMediaPickerOpen(true);
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Selecionar imagem
                        </Button>
                        {opt.imageUrl && (
                          <div className="relative w-full h-20 rounded overflow-hidden">
                            <img 
                              src={opt.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                
                <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                  <RichTextInput
                    value={opt.text}
                    onChange={(text) => updateOption(opt.id, { text })}
                    placeholder="Texto da opção"
                    className="border-0 bg-transparent min-h-[36px]"
                  />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setExpandedOptionId(expandedOptionId === opt.id ? null : opt.id); }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedOptionId === opt.id && "rotate-180")} />
                </button>
              </div>

              {expandedOptionId === opt.id && (
                <div className="p-3 border-t border-border bg-muted/20 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Pontos</Label>
                      <Input
                        type="number"
                        value={opt.points || 1}
                        onChange={(e) => updateOption(opt.id, { points: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Valor</Label>
                      <Input
                        value={opt.value}
                        onChange={(e) => updateOption(opt.id, { value: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Destino</Label>
                      <Select 
                        value={opt.destination || 'next'} 
                        onValueChange={(v) => updateOption(opt.id, { destination: v as OptionItem['destination'] })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="next">Próxima etapa</SelectItem>
                          <SelectItem value="submit">Enviar</SelectItem>
                          <SelectItem value="specific">Etapa específica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeOption(opt.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button variant="outline" size="sm" onClick={addOption} className="w-full mt-3">
          <Plus className="w-4 h-4 mr-2" />
          adicionar opção
        </Button>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="optRequired" 
              checked={config.required !== false}
              onChange={(e) => updateConfig({ required: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="optRequired" className="text-sm cursor-pointer font-medium">Seleção obrigatória</Label>
          </div>
          <p className="text-xs text-muted-foreground ml-5">O usuário é obrigado a selecionar alguma opção para prosseguir.</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="allowMultiple" 
              checked={config.allowMultiple || false}
              onChange={(e) => updateConfig({ allowMultiple: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="allowMultiple" className="text-sm cursor-pointer font-medium">Permitir múltipla escolha</Label>
          </div>
          <p className="text-xs text-muted-foreground ml-5">O usuário poderá selecionar mais de uma opção, a próxima etapa terá que ser definida através de componente do tipo "botão".</p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="autoAdvance" 
              checked={config.autoAdvance !== false}
              onChange={(e) => updateConfig({ autoAdvance: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="autoAdvance" className="text-sm cursor-pointer font-medium">Avançar automaticamente</Label>
          </div>
          <p className="text-xs text-muted-foreground ml-5">Avança para próxima etapa ao selecionar (apenas escolha única).</p>
        </div>
      </div>

      {/* Media Library Picker */}
      <MediaLibraryPicker
        open={optionMediaPickerOpen}
        onOpenChange={setOptionMediaPickerOpen}
        onSelect={(url) => {
          if (optionMediaPickerTarget) {
            updateOption(optionMediaPickerTarget, { imageUrl: url, mediaType: 'image' });
          }
        }}
        currentValue={optionMediaPickerTarget ? options.find(o => o.id === optionMediaPickerTarget)?.imageUrl : undefined}
      />
    </div>
  );
}
