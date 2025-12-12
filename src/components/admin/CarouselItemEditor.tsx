import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2, Upload, Image, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CarouselItem {
  id: string;
  image: string;
  description: string;
}

interface CarouselItemEditorProps {
  item: CarouselItem;
  index: number;
  totalItems: number;
  layout: 'image-text' | 'text-only' | 'image-only';
  onUpdate: (updates: Partial<CarouselItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function CarouselItemEditor({
  item,
  index,
  totalItems,
  layout,
  onUpdate,
  onRemove,
}: CarouselItemEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `carousel/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(filePath);

      onUpdate({ image: publicUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const showImage = layout !== 'text-only';
  const showDescription = layout !== 'image-only';

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Drag handle */}
      <div className="flex items-center justify-center py-1.5 border-b border-border bg-muted/30 cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="p-3 space-y-3">
        {/* Image upload area */}
        {showImage && (
          <div
            className={cn(
              "relative w-32 h-20 mx-auto rounded-lg overflow-hidden cursor-pointer transition-colors",
              item.image ? "bg-muted" : "bg-muted/50 border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : item.image ? (
              <img
                src={item.image}
                alt={item.description}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image className="w-6 h-6 text-muted-foreground/50" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </div>
        )}

        {/* Description */}
        {showDescription && (
          <Input
            value={item.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Descrição do slide"
            className="text-center text-sm"
          />
        )}

        {/* Delete button */}
        {totalItems > 1 && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
