import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/admin': { title: 'Dashboard', subtitle: 'Visão geral do seu painel' },
  '/admin/quizzes': { title: 'Quizzes', subtitle: 'Gerencie seus quizzes' },
  '/admin/leads': { title: 'Leads', subtitle: 'Contatos capturados' },
  '/admin/analytics': { title: 'Analytics', subtitle: 'Métricas e estatísticas' },
  '/admin/media': { title: 'Mídia', subtitle: 'Biblioteca de arquivos' },
  '/admin/settings': { title: 'Configurações', subtitle: 'Personalize seu painel' },
  '/admin/help': { title: 'Ajuda', subtitle: 'Central de suporte' },
};

export function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const currentPage = pageTitles[location.pathname] || { title: 'Admin' };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <div 
        className={cn(
          "min-h-screen transition-all duration-300",
          collapsed ? "ml-[68px]" : "ml-[240px]"
        )}
      >
        <AdminHeader title={currentPage.title} subtitle={currentPage.subtitle} />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
