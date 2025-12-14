import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Webhook, Loader2, CheckCircle2, XCircle, Save, Info, Settings2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface WebhookSettings {
  sendName?: boolean;
  sendEmail?: boolean;
  sendPhone?: boolean;
  customFieldIds?: string;
}

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  settings: WebhookSettings;
}

interface IntegrationsEditorProps {
  quizId: string;
}

export function IntegrationsEditor({ quizId }: IntegrationsEditorProps) {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);

  // Load webhooks
  useEffect(() => {
    loadWebhooks();
  }, [quizId]);

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_webhooks')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setWebhooks(data?.map(w => ({
        id: w.id,
        name: w.name,
        url: w.url,
        enabled: w.enabled ?? true,
        settings: (w.settings as WebhookSettings) || {},
      })) || []);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWebhook = () => {
    setEditingWebhook({
      id: '',
      name: 'Novo Webhook',
      url: '',
      enabled: true,
      settings: {
        sendName: true,
        sendEmail: true,
        sendPhone: true,
      },
    });
    setIsSheetOpen(true);
  };

  const handleEditWebhook = (webhook: WebhookItem) => {
    setEditingWebhook({ ...webhook });
    setIsSheetOpen(true);
  };

  const handleToggleWebhook = async (webhookId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('quiz_webhooks')
        .update({ enabled })
        .eq('id', webhookId);

      if (error) throw error;
      
      setWebhooks(webhooks.map(w => 
        w.id === webhookId ? { ...w, enabled } : w
      ));
    } catch (error) {
      console.error('Error toggling webhook:', error);
      toast.error('Erro ao atualizar webhook');
    }
  };

  const handleSaveWebhook = async () => {
    if (!editingWebhook) return;
    
    if (!editingWebhook.url) {
      toast.error('A URL do webhook é obrigatória');
      return;
    }

    setIsSaving(true);
    try {
      if (editingWebhook.id) {
        // Update existing
        const { error } = await supabase
          .from('quiz_webhooks')
          .update({
            name: editingWebhook.name,
            url: editingWebhook.url,
            enabled: editingWebhook.enabled,
            settings: JSON.parse(JSON.stringify(editingWebhook.settings)),
          })
          .eq('id', editingWebhook.id);

        if (error) throw error;
        
        setWebhooks(webhooks.map(w => 
          w.id === editingWebhook.id ? editingWebhook : w
        ));
      } else {
        // Create new
        const { data, error } = await supabase
          .from('quiz_webhooks')
          .insert({
            quiz_id: quizId,
            name: editingWebhook.name,
            url: editingWebhook.url,
            enabled: editingWebhook.enabled,
            settings: JSON.parse(JSON.stringify(editingWebhook.settings)),
          })
          .select()
          .single();

        if (error) throw error;
        
        setWebhooks([...webhooks, {
          id: data.id,
          name: data.name,
          url: data.url,
          enabled: data.enabled ?? true,
          settings: (data.settings as WebhookSettings) || {},
        }]);
      }

      toast.success('Webhook salvo com sucesso!');
      setIsSheetOpen(false);
      setEditingWebhook(null);
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error('Erro ao salvar webhook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) return;
    
    try {
      const { error } = await supabase
        .from('quiz_webhooks')
        .delete()
        .eq('id', webhookToDelete);

      if (error) throw error;
      
      setWebhooks(webhooks.filter(w => w.id !== webhookToDelete));
      toast.success('Webhook removido com sucesso!');
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Erro ao remover webhook');
    } finally {
      setDeleteDialogOpen(false);
      setWebhookToDelete(null);
    }
  };

  const handleTestWebhook = async () => {
    if (!editingWebhook?.url) {
      toast.error('Configure a URL do webhook primeiro');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await supabase.functions.invoke('n8n-webhook', {
        body: {
          quiz_id: quizId,
          event_type: 'test',
          data: {
            message: 'Teste de conexão do webhook',
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTestResult('success');
      toast.success('Webhook testado com sucesso!');
    } catch (error) {
      console.error('Webhook test error:', error);
      setTestResult('error');
      toast.error('Erro ao testar webhook');
    } finally {
      setIsTesting(false);
    }
  };

  const updateEditingSettings = (key: keyof WebhookSettings, value: any) => {
    if (!editingWebhook) return;
    setEditingWebhook({
      ...editingWebhook,
      settings: {
        ...editingWebhook.settings,
        [key]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Integrações</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Conecte seu quiz a ferramentas externas
          </p>
        </div>
        <Button onClick={handleAddWebhook} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Webhook
        </Button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-3">
        {webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
            <Webhook className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum webhook configurado</p>
            <Button onClick={handleAddWebhook} variant="outline" size="sm" className="mt-3 gap-2">
              <Plus className="w-4 h-4" />
              Adicionar primeiro webhook
            </Button>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div 
              key={webhook.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Webhook className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-medium">{webhook.name}</h3>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {webhook.url || 'URL não configurada'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch
                  checked={webhook.enabled}
                  onCheckedChange={(enabled) => handleToggleWebhook(webhook.id, enabled)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditWebhook(webhook)}
                  className="gap-2"
                >
                  <Settings2 className="w-4 h-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setWebhookToDelete(webhook.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Webhook className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <SheetTitle>{editingWebhook?.id ? 'Editar Webhook' : 'Novo Webhook'}</SheetTitle>
                <SheetDescription>Configure a integração de webhook</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {editingWebhook && (
            <div className="space-y-6 mt-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="webhook_name" className="text-sm font-medium">
                  Nome do Webhook
                </Label>
                <Input
                  id="webhook_name"
                  value={editingWebhook.name}
                  onChange={(e) => setEditingWebhook({ ...editingWebhook, name: e.target.value })}
                  placeholder="Ex: Lead para CRM"
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook_url" className="text-sm font-medium">
                  URL do Webhook
                </Label>
                <Input
                  id="webhook_url"
                  value={editingWebhook.url}
                  onChange={(e) => setEditingWebhook({ ...editingWebhook, url: e.target.value })}
                  placeholder="https://seu-servidor.com/webhook/..."
                />
              </div>

              {/* Field Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Campos a enviar</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Selecione quais campos serão enviados no webhook</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-name"
                      checked={editingWebhook.settings.sendName ?? true}
                      onCheckedChange={(checked) => updateEditingSettings('sendName', checked)}
                    />
                    <Label htmlFor="send-name" className="text-sm font-normal">Nome</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-email"
                      checked={editingWebhook.settings.sendEmail ?? true}
                      onCheckedChange={(checked) => updateEditingSettings('sendEmail', checked)}
                    />
                    <Label htmlFor="send-email" className="text-sm font-normal">Email</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-phone"
                      checked={editingWebhook.settings.sendPhone ?? true}
                      onCheckedChange={(checked) => updateEditingSettings('sendPhone', checked)}
                    />
                    <Label htmlFor="send-phone" className="text-sm font-normal">Telefone</Label>
                  </div>
                </div>
              </div>

              {/* Custom Field IDs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom-fields">IDs Personalizados</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">IDs dos componentes cujas respostas você quer incluir</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="custom-fields"
                  placeholder="altura, peso, objetivo"
                  value={editingWebhook.settings.customFieldIds || ''}
                  onChange={(e) => updateEditingSettings('customFieldIds', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separe os IDs por vírgula
                </p>
              </div>

              {/* Info */}
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Como disparar?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione o componente "Webhook" em qualquer etapa do quiz para disparar o webhook naquele ponto.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  onClick={handleSaveWebhook}
                  disabled={isSaving}
                  className="flex-1 gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={!editingWebhook.url || isTesting}
                  className="gap-2"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : testResult === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : testResult === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Webhook className="w-4 h-4" />
                  )}
                  Testar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O webhook será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWebhook}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
