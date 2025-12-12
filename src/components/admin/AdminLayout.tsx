import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileQuestion, ChevronLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileQuestion, label: 'Quizzes', path: '/admin' },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span className="font-medium text-sm">QuizFlow</span>
            </Link>
            
            <nav className="flex items-center gap-1">
              {navItems.slice(0, 2).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground text-sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar ao site
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}