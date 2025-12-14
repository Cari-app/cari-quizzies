import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Link, Trash2, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

interface MediaLibraryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  currentValue?: string;
}

export function MediaLibraryPicker({
  open,
  onOpenChange,
  onSelect,
  currentValue,
}: MediaLibraryPickerProps) {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'library' | 'upload' | 'url'>('library');

  // Fetch user's media library
  const fetchMedia = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      fetchMedia();
    }
  }, [open, user, fetchMedia]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas imagens');
      return;
    }

    // Validate file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 3MB');
      return;
    }

    setUploading(true);
    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(fileName);

      // Save to media library table
      const { error: dbError } = await supabase
        .from('user_media')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
        });

      if (dbError) throw dbError;

      toast.success('Imagem enviada com sucesso!');
      fetchMedia();
      setTab('library');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle URL submission
  const handleUrlSubmit = async () => {
    if (!urlInput.trim() || !user) return;

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      toast.error('URL inválida');
      return;
    }

    setUploading(true);
    try {
      // Save URL to media library
      const { error } = await supabase
        .from('user_media')
        .insert({
          user_id: user.id,
          file_name: urlInput.split('/').pop() || 'external-image',
          file_url: urlInput,
          mime_type: 'image/external',
        });

      if (error) throw error;

      toast.success('Imagem adicionada à biblioteca!');
      setUrlInput('');
      fetchMedia();
      setTab('library');
    } catch (error: any) {
      console.error('URL save error:', error);
      toast.error('Erro ao salvar URL: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle delete media
  const handleDelete = async (id: string, fileUrl: string) => {
    if (!user) return;

    try {
      // Try to delete from storage if it's a stored file
      if (fileUrl.includes('quiz-images')) {
        const path = fileUrl.split('/quiz-images/')[1];
        if (path) {
          await supabase.storage.from('quiz-images').remove([path]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('user_media')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Imagem removida!');
      fetchMedia();
      if (selectedId === id) setSelectedId(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Erro ao remover imagem: ' + error.message);
    }
  };

  // Handle selection
  const handleSelect = () => {
    const selected = media.find((m) => m.id === selectedId);
    if (selected) {
      onSelect(selected.file_url);
      onOpenChange(false);
    }
  };

  // Format file size
  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <ImageIcon className="w-5 h-5 text-primary" />
            Biblioteca de Mídia
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted/50">
              <TabsTrigger value="library" className="gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <ImageIcon className="w-4 h-4" />
                Biblioteca
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Upload className="w-4 h-4" />
                Enviar
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Link className="w-4 h-4" />
                URL
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-0 px-6 py-4">
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : media.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-1">Nenhuma imagem</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Envie imagens ou adicione URLs para começar sua biblioteca
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 -mx-2">
                <div className="grid grid-cols-4 gap-3 p-2">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "relative group aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200",
                        "bg-muted/50 border-2",
                        selectedId === item.id
                          ? "border-primary ring-4 ring-primary/20 scale-[0.98]"
                          : "border-transparent hover:border-primary/30 hover:scale-[0.98]"
                      )}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <img
                        src={item.file_url}
                        alt={item.file_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      
                      {/* Selection indicator */}
                      {selectedId === item.id && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white/90 text-xs font-medium truncate flex-1 mr-2">
                            {formatSize(item.file_size)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id, item.file_url);
                            }}
                            className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-red-500/80 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <div className="w-full max-w-sm">
              <div
                className={cn(
                  "border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer",
                  uploading
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload-input"
                  disabled={uploading}
                />
                <label
                  htmlFor="media-upload-input"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                    uploading ? "bg-primary/10" : "bg-muted"
                  )}>
                    {uploading ? (
                      <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {uploading ? 'Enviando...' : 'Clique para enviar'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, GIF • Máx 5MB
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url" className="text-sm font-medium">URL da imagem</Label>
                <Input
                  id="image-url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={uploading}
                  className="h-10"
                />
              </div>

              {urlInput && (
                <div className="rounded-xl overflow-hidden bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Pré-visualização</p>
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img
                      src={urlInput}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || uploading}
                className="w-full h-10"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Adicionar à biblioteca'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer with actions */}
        {tab === 'library' && media.length > 0 && (
          <div className="px-6 py-4 border-t bg-muted/30 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-9">
              Cancelar
            </Button>
            <Button onClick={handleSelect} disabled={!selectedId} className="h-9 px-6">
              Usar imagem
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
