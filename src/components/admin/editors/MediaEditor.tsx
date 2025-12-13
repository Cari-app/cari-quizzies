import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Upload } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MediaLibraryPicker } from '@/components/ui/media-library-picker';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

const commonEmojis = ['🖼️', '📷', '🌄', '🌅', '🏞️', '🎨', '✨', '💫', '🔥', '❤️', '⭐', '🎯', '💡', '🚀', '💪', '🎉'];

export function MediaComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: EditorProps) {
  const [mediaTab, setMediaTab] = useState<'image' | 'url' | 'emoji'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [imageMediaPickerOpen, setImageMediaPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para fazer upload.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Erro ao fazer upload da imagem.');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(fileName);

      updateConfig({ mediaUrl: publicUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  // Video component
  if (component.type === 'video') {
    return (
      <div className="space-y-4">
        <div className="flex p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => updateConfig({ videoType: 'url' })}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
              (config.videoType || 'url') === 'url' ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => updateConfig({ videoType: 'embed' })}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
              config.videoType === 'embed' ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            Embed
          </button>
        </div>

        {(config.videoType || 'url') === 'url' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">URL do vídeo</Label>
              <Input
                value={config.mediaUrl || ''}
                onChange={(e) => updateConfig({ mediaUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=... ou vimeo.com/..."
                className="mt-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Suporta YouTube, Vimeo, Panda Video, Vturb e outros provedores.
            </p>
            {config.mediaUrl && (
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎬</div>
                    <p className="text-xs">Preview do vídeo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {config.videoType === 'embed' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Código Embed</Label>
              <Textarea
                value={config.embedCode || ''}
                onChange={(e) => updateConfig({ embedCode: e.target.value })}
                placeholder='<iframe src="..." width="100%" height="100%"></iframe>'
                className="mt-1 font-mono text-xs min-h-[120px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Cole o código embed fornecido pela plataforma de vídeo.
            </p>
            {config.embedCode && (
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📹</div>
                    <p className="text-xs">Embed configurado</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-45")} />
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

  // Image/Audio component
  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />

      <div className="flex p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setMediaTab('image')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
            mediaTab === 'image' ? "bg-background shadow-sm" : "hover:bg-background/50"
          )}
        >
          Imagem
        </button>
        <button
          type="button"
          onClick={() => setMediaTab('url')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
            mediaTab === 'url' ? "bg-background shadow-sm" : "hover:bg-background/50"
          )}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setMediaTab('emoji')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
            mediaTab === 'emoji' ? "bg-background shadow-sm" : "hover:bg-background/50"
          )}
        >
          Emoji
        </button>
      </div>

      {mediaTab === 'image' && (
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setImageMediaPickerOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar imagem
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            JPG, PNG, GIF ou WebP. Máximo 5MB.
          </p>
          <MediaLibraryPicker
            open={imageMediaPickerOpen}
            onOpenChange={setImageMediaPickerOpen}
            onSelect={(url) => updateConfig({ mediaUrl: url })}
            currentValue={config.mediaUrl}
          />
          {config.mediaUrl && !config.mediaUrl.match(/^[\u{1F300}-\u{1F9FF}]/u) && (
            <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
              <img 
                src={config.mediaUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => updateConfig({ mediaUrl: '' })}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {mediaTab === 'url' && (
        <div className="space-y-3">
          <Input
            value={config.mediaUrl || ''}
            onChange={(e) => updateConfig({ mediaUrl: e.target.value })}
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {config.mediaUrl && (
            <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
              <img 
                src={config.mediaUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>
      )}

      {mediaTab === 'emoji' && (
        <div className="space-y-3">
          <div className="grid grid-cols-8 gap-1">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => updateConfig({ mediaUrl: emoji, altText: 'emoji' })}
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-xl rounded-md hover:bg-muted transition-colors",
                  config.mediaUrl === emoji && "bg-primary/20 ring-2 ring-primary"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-45")} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <ComponentIdDisplay
            id={component.id}
            customId={component.customId}
            type={component.type}
            onUpdateCustomId={onUpdateCustomId}
          />
          <div>
            <Label className="text-xs text-muted-foreground">Texto alternativo</Label>
            <Input
              value={config.altText || ''}
              onChange={(e) => updateConfig({ altText: e.target.value })}
              placeholder="Descrição da imagem..."
              className="mt-1"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
