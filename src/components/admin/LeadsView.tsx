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

interface Stage {
  id: string;
  name: string;
  ordem: number;
}

interface LeadSession {
  id: string;
  started_at: string;
  completed_at: string | null;
  is_completed: boolean;
  email: string | null;
  phone: string | null;
  name: string | null;
  device_type: string | null;
  responses: Record<string, {
    value: any;
    type: string;
  }>;
}

interface LeadsViewProps {
  quizId: string;
  stages: { id: string; name: string }[];
}

export function LeadsView({ quizId, stages }: LeadsViewProps) {
  const [sessions, setSessions] = useState<LeadSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load sessions and responses
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        // Load sessions for this quiz
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('started_at', { ascending: false });

        if (sessionsError) throw sessionsError;

        if (!sessionsData || sessionsData.length === 0) {
          setSessions([]);
          setIsLoading(false);
          return;
        }

        // Load responses for all sessions
        const sessionIds = sessionsData.map(s => s.id);
        const { data: responsesData, error: responsesError } = await supabase
          .from('quiz_responses')
          .select('*')
          .in('session_id', sessionIds);

        if (responsesError) throw responsesError;

        // Group responses by session
        const responsesBySession: Record<string, Record<string, { value: any; type: string }>> = {};
        (responsesData || []).forEach(response => {
          if (!responsesBySession[response.session_id]) {
            responsesBySession[response.session_id] = {};
          }
          responsesBySession[response.session_id][response.stage_id] = {
            value: response.response_value,
            type: response.response_type || 'unknown',
          };
        });

        // Combine sessions with responses
        const combinedSessions: LeadSession[] = sessionsData.map(session => ({
          id: session.id,
          started_at: session.started_at,
          completed_at: session.completed_at,
          is_completed: session.is_completed || false,
          email: session.email,
          phone: session.phone,
          name: session.name,
          device_type: session.device_type,
          responses: responsesBySession[session.id] || {},
        }));

        setSessions(combinedSessions);
      } catch (error: any) {
        console.error('Error loading sessions:', error);
        toast.error('Erro ao carregar leads');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [quizId]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalVisitors = sessions.length;
    const leadsWithInteraction = sessions.filter(s => Object.keys(s.responses).length > 0).length;
    const interactionRate = totalVisitors > 0 ? (leadsWithInteraction / totalVisitors) * 100 : 0;
    const qualifiedLeads = sessions.filter(s => Object.keys(s.responses).length >= stages.length * 0.5).length;
    const completedFlows = sessions.filter(s => s.is_completed).length;

    return {
      totalVisitors,
      leadsWithInteraction,
      interactionRate,
      qualifiedLeads,
      completedFlows,
    };
  }, [sessions, stages.length]);

  // Filter sessions by search
  const filteredSessions = useMemo(() => {
    if (!searchTerm) return sessions;
    const term = searchTerm.toLowerCase();
    return sessions.filter(session => 
      session.name?.toLowerCase().includes(term) ||
      session.email?.toLowerCase().includes(term) ||
      session.phone?.toLowerCase().includes(term) ||
      Object.values(session.responses).some(r => 
        JSON.stringify(r.value).toLowerCase().includes(term)
      )
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
    const headers = ['Data', 'Nome', 'Email', 'Telefone', 'Dispositivo', ...stages.map(s => s.name), 'Completo'];
    const rows = filteredSessions.map(session => [
      format(new Date(session.started_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      session.name || '',
      session.email || '',
      session.phone || '',
      session.device_type || '',
      ...stages.map(stage => {
        const response = session.responses[stage.id];
        if (!response) return '';
        const value = response.value;
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      }),
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

  // Format response value for display
  const formatResponseValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      // Check for specific known fields
      if (value.text) return value.text;
      if (value.selected) return Array.isArray(value.selected) ? value.selected.join(', ') : value.selected;
      if (value.action === 'clicked') return 'clicked';
      
      // For input values, show the actual values
      const entries = Object.entries(value).filter(([key]) => 
        key !== 'action' && key !== 'clicked' && key !== 'optionId'
      );
      
      if (entries.length === 1) {
        // Single value - just show the value
        return String(entries[0][1]);
      } else if (entries.length > 1) {
        // Multiple values - show key: value pairs
        return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
      }
      
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Get color indicator for stage column
  const getStageColor = (index: number): string => {
    const colors = [
      'bg-emerald-500',
      'bg-yellow-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-blue-500',
      'bg-pink-500',
      'bg-teal-500',
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="border border-border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
            <Eye className="w-4 h-4" />
            Visitantes
          </div>
          <div className="text-3xl font-bold">
            {metrics.totalVisitors.toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Visitantes que acessaram o funil
          </p>
        </div>

        <div className="border border-border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
            <Users className="w-4 h-4" />
            Leads Adquiridos
          </div>
          <div className="text-3xl font-bold">
            {metrics.leadsWithInteraction.toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Iniciaram alguma interação com o funil
          </p>
        </div>

        <div className="border border-border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
            <TrendingUp className="w-4 h-4" />
            Taxa de Interação
          </div>
          <div className="text-3xl font-bold">
            {metrics.interactionRate.toFixed(0)}<span className="text-lg">%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Visitantes que interagiram com o funil
          </p>
        </div>

        <div className="border border-border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
            <Target className="w-4 h-4" />
            Leads Qualificados
          </div>
          <div className="text-3xl font-bold">
            {metrics.qualifiedLeads.toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            +50% de etapas interagidas
          </p>
        </div>

        <div className="border border-border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
            <CheckCircle className="w-4 h-4" />
            Fluxos Completos
          </div>
          <div className="text-3xl font-bold">
            {metrics.completedFlows.toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Passaram da última etapa do funil
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
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
      <div className="flex-1 border border-border rounded-lg overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={filteredSessions.length > 0 && selectedSessions.size === filteredSessions.length}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead className="min-w-[100px]">Entrada</TableHead>
                {stages.map((stage, index) => (
                  <TableHead key={stage.id} className="min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-4 rounded-full ${getStageColor(index)}`} />
                      <span className="truncate">{stage.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={stages.length + 2} className="text-center py-8 text-muted-foreground">
                    {sessions.length === 0 
                      ? 'Nenhum lead registrado ainda. Os dados aparecerão quando visitantes responderem o quiz.'
                      : 'Nenhum resultado encontrado para a pesquisa.'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
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
                    {stages.map((stage) => {
                      const response = session.responses[stage.id];
                      return (
                        <TableCell key={stage.id} className="text-sm">
                          {response ? (
                            <span className="truncate block max-w-[150px]" title={formatResponseValue(response.value)}>
                              {formatResponseValue(response.value) || 'clicked'}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
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
