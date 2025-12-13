import { BarChart3 } from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Analytics em Breve</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Estamos trabalhando em um painel de analytics completo para você acompanhar 
          o desempenho dos seus quizzes.
        </p>
      </div>
    </div>
  );
}
