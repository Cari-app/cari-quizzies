import { HelpCircle, MessageCircle, Book, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminHelp() {
  const helpItems = [
    {
      icon: Book,
      title: 'Documentação',
      description: 'Guias completos para usar todas as funcionalidades',
      action: 'Ver Docs',
    },
    {
      icon: Video,
      title: 'Tutoriais em Vídeo',
      description: 'Aprenda passo a passo com nossos vídeos',
      action: 'Assistir',
    },
    {
      icon: MessageCircle,
      title: 'Suporte',
      description: 'Fale com nossa equipe de suporte',
      action: 'Contato',
    },
  ];

  return (
    <div className="animate-fade-in max-w-2xl">
      {/* Help Cards */}
      <div className="space-y-4">
        {helpItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-5 rounded-xl border border-border bg-card flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {item.action}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-8 p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-semibold">Perguntas Frequentes</h3>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Como criar meu primeiro quiz?</p>
            <p className="text-muted-foreground mt-1">
              Vá para a seção Quizzes e clique em "Novo Quiz". Use o editor visual para adicionar perguntas e configurar o fluxo.
            </p>
          </div>
          <div>
            <p className="font-medium">Como publicar um quiz?</p>
            <p className="text-muted-foreground mt-1">
              Após criar seu quiz, clique em "Publicar" no editor. O quiz estará disponível através do slug configurado.
            </p>
          </div>
          <div>
            <p className="font-medium">Como ver os leads capturados?</p>
            <p className="text-muted-foreground mt-1">
              Acesse a seção "Leads" no menu lateral para ver todos os contatos capturados através dos seus quizzes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
