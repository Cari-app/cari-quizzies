import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Webhook, Loader2, CheckCircle2, XCircle, ExternalLink, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IntegrationsEditorProps {
  quizId: string;
  webhookUrl: string;
  webhookEnabled: boolean;
  onWebhookUrlChange: (url: string) => void;
  onWebhookEnabledChange: (enabled: boolean) => void;
}

export function IntegrationsEditor({
  quizId,
  webhookUrl,
  webhookEnabled,
  onWebhookUrlChange,
  onWebhookEnabledChange,
}: IntegrationsEditorProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSaveWebhook = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({
          webhook_url: webhookUrl || null,
          webhook_enabled: webhookEnabled,
        })
        .eq('id', quizId);

      if (error) throw error;

      toast.success('Webhook salvo com sucesso!');
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error('Erro ao salvar webhook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
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

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Integrações</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conecte seu quiz a ferramentas externas
        </p>
      </div>

      {/* N8N Integration */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Webhook className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">N8N Webhook</CardTitle>
                <CardDescription>
                  Dispare automações quando o quiz for respondido
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={webhookEnabled}
              onCheckedChange={onWebhookEnabledChange}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook_url" className="text-sm font-medium">
              URL do Webhook
            </Label>
            <Input
              id="webhook_url"
              value={webhookUrl}
              onChange={(e) => onWebhookUrlChange(e.target.value)}
              placeholder="https://seu-n8n.com/webhook/..."
              className="h-10"
              disabled={!webhookEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Cole a URL do webhook do seu workflow N8N
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              size="sm"
              onClick={handleSaveWebhook}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar Webhook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestWebhook}
              disabled={!webhookEnabled || !webhookUrl || isTesting}
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
              Testar Webhook
            </Button>
            <a
              href="https://n8n.io/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
            >
              <ExternalLink className="w-3 h-3" />
              Documentação N8N
            </a>
          </div>

          {webhookEnabled && webhookUrl && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium mb-2">Eventos enviados:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <code className="bg-background px-1 rounded">quiz_completed</code> - Quando o quiz é finalizado</li>
                <li>• <code className="bg-background px-1 rounded">quiz_started</code> - Quando alguém inicia o quiz</li>
                <li>• <code className="bg-background px-1 rounded">lead_captured</code> - Quando um lead é capturado</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future integrations placeholder */}
      <Card className="border-dashed border-border opacity-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Webhook className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg text-muted-foreground">Mais integrações em breve</CardTitle>
              <CardDescription>
                Zapier, Make, e mais...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
