import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileQuestion, 
  Users, 
  Eye, 
  TrendingUp,
  Plus,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  totalQuizzes: number;
  activeQuizzes: number;
  totalLeads: number;
  totalViews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData>({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalLeads: 0,
    totalViews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get quiz stats
        const { data: quizzes } = await supabase
          .from('quizzes')
          .select('id, is_active');
        
        // Get leads count
        const { count: leadsCount } = await supabase
          .from('quiz_sessions')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalQuizzes: quizzes?.length || 0,
          activeQuizzes: quizzes?.filter(q => q.is_active).length || 0,
          totalLeads: leadsCount || 0,
          totalViews: 0, // Would need a views table
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      label: 'Total de Quizzes',
      value: stats.totalQuizzes,
      icon: FileQuestion,
      change: '+2 este mês',
      href: '/admin/quizzes',
    },
    {
      label: 'Quizzes Ativos',
      value: stats.activeQuizzes,
      icon: TrendingUp,
      change: 'Publicados',
      href: '/admin/quizzes',
    },
    {
      label: 'Total de Leads',
      value: stats.totalLeads,
      icon: Users,
      change: '+12% vs mês anterior',
      href: '/admin/leads',
    },
    {
      label: 'Visualizações',
      value: stats.totalViews,
      icon: Eye,
      change: 'Últimos 30 dias',
      href: '/admin/analytics',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.href}
              className="group p-5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-semibold mt-1 tracking-tight">
                    {isLoading ? '—' : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Quiz CTA */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center shrink-0">
              <Plus className="w-6 h-6 text-background" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Criar Novo Quiz</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comece a capturar leads criando um quiz interativo e personalizado.
              </p>
              <Link to="/admin/quiz/new">
                <Button className="mt-4 gap-2" size="sm">
                  Criar Quiz
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* View Analytics CTA */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Ver Analytics</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe o desempenho dos seus quizzes e conversões.
              </p>
              <Link to="/admin/analytics">
                <Button variant="outline" className="mt-4 gap-2" size="sm">
                  Ver Métricas
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4">Atividade Recente</h3>
        <div className="text-sm text-muted-foreground text-center py-8">
          Nenhuma atividade recente para mostrar.
        </div>
      </div>
    </div>
  );
}
