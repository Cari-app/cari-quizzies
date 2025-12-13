import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Users, TrendingUp, Target, CheckCircle, Search, Download, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface LeadSession {
  id: string;
  quiz_id: string;
  quiz_name: string;
  started_at: string;
  completed_at: string | null;
  is_completed: boolean;
  email: string | null;
  phone: string | null;
  name: string | null;
  device_type: string | null;
}

export default function AdminLeads() {
  const [sessions, setSessions] = useState<LeadSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        // Load all quiz sessions with quiz name
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('quiz_sessions')
          .select(`
            *,
            quizzes:quiz_id (titulo)
          `)
          .order('started_at', { ascending: false });

        if (sessionsError) throw sessionsError;

        const formattedSessions: LeadSession[] = (sessionsData || []).map((s: any) => ({
          id: s.id,
          quiz_id: s.quiz_id,
          quiz_name: s.quizzes?.titulo || 'Quiz removido',
          started_at: s.started_at,
          completed_at: s.completed_at,
          is_completed: s.is_completed || false,
          email: s.email,
          phone: s.phone,
          name: s.name,
          device_type: s.device_type,
        }));

        setSessions(formattedSessions);
      } catch (error: any) {
        console.error('Error loading sessions:', error);
        toast.error('Erro ao carregar leads');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalLeads = sessions.length;
    const completedFlows = sessions.filter(s => s.is_completed).length;
    const withEmail = sessions.filter(s => s.email).length;
    const withPhone = sessions.filter(s => s.phone).length;

    return {
      totalLeads,
      completedFlows,
      withEmail,
      withPhone,
    };
  }, [sessions]);

  // Filter sessions by search
  const filteredSessions = useMemo(() => {
    if (!searchTerm) return sessions;
    const term = searchTerm.toLowerCase();
    return sessions.filter(session => 
      session.name?.toLowerCase().includes(term) ||
      session.email?.toLowerCase().includes(term) ||
      session.phone?.toLowerCase().includes(term) ||
      session.quiz_name?.toLowerCase().includes(term)
    );
  }, [sessions, searchTerm]);

  // Toggle session selection
  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  // Toggle all selection
  const toggleAllSelection = () => {
    if (selectedSessions.size === filteredSessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(filteredSessions.map(s => s.id)));
    }
  };

  // Delete selected sessions
  const handleDeleteSelected = async () => {
    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .delete()
        .in('id', Array.from(selectedSessions));

      if (error) throw error;

      setSessions(prev => prev.filter(s => !selectedSessions.has(s.id)));
      setSelectedSessions(new Set());
      toast.success(`${selectedSessions.size} lead(s) excluído(s)`);
    } catch (error: any) {
      toast.error('Erro ao excluir leads');
    }
    setDeleteDialogOpen(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Data', 'Quiz', 'Nome', 'Email', 'Telefone', 'Dispositivo', 'Completo'];
    const rows = filteredSessions.map(session => [
      format(new Date(session.started_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      session.quiz_name,
      session.name || '',
      session.email || '',
      session.phone || '',
      session.device_type || '',
      session.is_completed ? 'Sim' : 'Não',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('CSV exportado com sucesso');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border rounded-xl p-5 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
            <Users className="w-4 h-4" />
            Total de Leads
          </div>
          <div className="text-3xl font-semibold">{metrics.totalLeads}</div>
        </div>

        <div className="border border-border rounded-xl p-5 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
            <CheckCircle className="w-4 h-4" />
            Fluxos Completos
          </div>
          <div className="text-3xl font-semibold">{metrics.completedFlows}</div>
        </div>

        <div className="border border-border rounded-xl p-5 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
            <Target className="w-4 h-4" />
            Com Email
          </div>
          <div className="text-3xl font-semibold">{metrics.withEmail}</div>
        </div>

        <div className="border border-border rounded-xl p-5 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
            <TrendingUp className="w-4 h-4" />
            Com Telefone
          </div>
          <div className="text-3xl font-semibold">{metrics.withPhone}</div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedSessions.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir ({selectedSessions.size})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredSessions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredSessions.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">Nenhum lead encontrado</h3>
          <p className="text-sm text-muted-foreground">
            {sessions.length === 0 
              ? 'Os leads aparecerão aqui quando visitantes responderem seus quizzes.'
              : 'Nenhum resultado encontrado para a pesquisa.'
            }
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={filteredSessions.length > 0 && selectedSessions.size === filteredSessions.length}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSessions.has(session.id)}
                      onCheckedChange={() => toggleSessionSelection(session.id)}
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(session.started_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {session.quiz_name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {session.name || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {session.email || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {session.phone || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {session.is_completed ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-foreground/10 text-foreground">
                        Completo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Incompleto
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteSelected}
        title="Excluir leads"
        description={`Tem certeza que deseja excluir ${selectedSessions.size} lead(s)? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}
