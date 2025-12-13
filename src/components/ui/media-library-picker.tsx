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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
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
      <DialogContent className="max-w-3xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Biblioteca de Mídia
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Biblioteca
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Enviar
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link className="w-4 h-4" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : media.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Nenhuma imagem na biblioteca</p>
                <p className="text-sm text-muted-foreground">
                  Envie imagens ou adicione URLs para usar em seus quizzes
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "relative group aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
                        selectedId === item.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
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
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                        <span className="text-white text-xs truncate flex-1">
                          {formatSize(item.file_size)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id, item.file_url);
                          }}
                          className="p-1 text-white hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Select button */}
            {media.length > 0 && (
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSelect} disabled={!selectedId}>
                  Usar imagem selecionada
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="w-full max-w-md space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  uploading
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/50"
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
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  {uploading ? (
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {uploading ? 'Enviando...' : 'Clique para enviar'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, GIF até 5MB
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="w-full max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">URL da imagem</Label>
                <Input
                  id="image-url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={uploading}
                />
              </div>

              {urlInput && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Pré-visualização:</p>
                  <img
                    src={urlInput}
                    alt="Preview"
                    className="max-h-48 rounded mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}

              <Button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || uploading}
                className="w-full"
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
      </DialogContent>
    </Dialog>
  );
}
