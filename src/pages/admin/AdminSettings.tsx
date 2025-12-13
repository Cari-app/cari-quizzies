import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Loader2, Save, Palette, Type } from 'lucide-react';

export default function AdminSettings() {
  const { settings, isLoading, updateSettings, isUpdating } = useSiteSettings();
  
  const [formData, setFormData] = useState({
    site_name: 'Meu Site',
    logo_url: '',
    primary_color: '#84cc16',
    secondary_color: '#65a30d',
    accent_color: '#a3e635',
    background_color: '#ffffff',
    text_color: '#0a0a0a',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || 'Meu Site',
        logo_url: settings.logo_url || '',
        primary_color: settings.primary_color || '#84cc16',
        secondary_color: settings.secondary_color || '#65a30d',
        accent_color: settings.accent_color || '#a3e635',
        background_color: settings.background_color || '#ffffff',
        text_color: settings.text_color || '#0a0a0a',
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-base text-muted-foreground mt-2">
          Personalize a aparência do seu site
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Gerais */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              Informações Gerais
            </CardTitle>
            <CardDescription className="text-base">Nome e identidade do seu site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="site_name" className="text-sm font-medium">Nome do Site</Label>
              <Input
                id="site_name"
                value={formData.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                placeholder="Meu Site"
                className="h-11 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url" className="text-sm font-medium">URL do Logo</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
                className="h-11 rounded-lg"
              />
              {formData.logo_url && (
                <div className="mt-3 p-6 bg-accent/50 rounded-xl border border-border">
                  <img 
                    src={formData.logo_url} 
                    alt="Preview do logo" 
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cores */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary-foreground" />
              </div>
              Cores
            </CardTitle>
            <CardDescription className="text-base">Personalize as cores do seu site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primary_color" className="text-sm font-medium">Cor Primária</Label>
                <div className="flex gap-3">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-14 h-11 p-1.5 cursor-pointer rounded-lg"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    placeholder="#84cc16"
                    className="flex-1 h-11 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color" className="text-sm font-medium">Cor Secundária</Label>
                <div className="flex gap-3">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="w-14 h-11 p-1.5 cursor-pointer rounded-lg"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    placeholder="#65a30d"
                    className="flex-1 h-11 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent_color" className="text-sm font-medium">Cor de Destaque</Label>
                <div className="flex gap-3">
                  <Input
                    id="accent_color"
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="w-14 h-11 p-1.5 cursor-pointer rounded-lg"
                  />
                  <Input
                    value={formData.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    placeholder="#a3e635"
                    className="flex-1 h-11 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_color" className="text-sm font-medium">Cor de Fundo</Label>
                <div className="flex gap-3">
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="w-14 h-11 p-1.5 cursor-pointer rounded-lg"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 h-11 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_color" className="text-sm font-medium">Cor do Texto</Label>
                <div className="flex gap-3">
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => handleChange('text_color', e.target.value)}
                    className="w-14 h-11 p-1.5 cursor-pointer rounded-lg"
                  />
                  <Input
                    value={formData.text_color}
                    onChange={(e) => handleChange('text_color', e.target.value)}
                    placeholder="#0a0a0a"
                    className="flex-1 h-11 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isUpdating} className="gap-2 shadow-lime-md">
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
