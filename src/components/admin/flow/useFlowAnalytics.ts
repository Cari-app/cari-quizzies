import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StageAnalytics {
  stageId: string;
  totalLeads: number;
  recentActivity: number; // activity in last 5 minutes
}

interface FlowAnalytics {
  stageAnalytics: Map<string, StageAnalytics>;
  totalSessions: number;
  isLoading: boolean;
  refetch: () => void;
}

export function useFlowAnalytics(quizId: string | undefined, enabled: boolean = false): FlowAnalytics {
  const [stageData, setStageData] = useState<Map<string, StageAnalytics>>(new Map());
  const [totalSessions, setTotalSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!quizId || !enabled) return;
    
    setIsLoading(true);
    try {
      // Fetch all sessions for this quiz
      const { data: sessions } = await supabase
        .from('quiz_sessions')
        .select('id, started_at, last_stage_index, is_completed')
        .eq('quiz_id', quizId);

      // Fetch all responses grouped by stage
      const { data: responses } = await supabase
        .from('quiz_responses')
        .select('stage_id, session_id, created_at')
        .in('session_id', sessions?.map(s => s.id) || []);

      // Fetch stage IDs for this quiz
      const { data: stages } = await supabase
        .from('etapas')
        .select('id, ordem')
        .eq('quiz_id', quizId)
        .order('ordem', { ascending: true });

      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const analyticsMap = new Map<string, StageAnalytics>();

      // Initialize all stages with 0
      stages?.forEach(stage => {
        analyticsMap.set(stage.id, {
          stageId: stage.id,
          totalLeads: 0,
          recentActivity: 0,
        });
      });

      // Count responses per stage
      const stageResponseCounts = new Map<string, Set<string>>();
      const recentActivityCounts = new Map<string, number>();

      responses?.forEach(response => {
        // Count unique sessions per stage
        if (!stageResponseCounts.has(response.stage_id)) {
          stageResponseCounts.set(response.stage_id, new Set());
        }
        stageResponseCounts.get(response.stage_id)!.add(response.session_id);

        // Count recent activity
        const responseTime = new Date(response.created_at);
        if (responseTime > fiveMinutesAgo) {
          recentActivityCounts.set(
            response.stage_id,
            (recentActivityCounts.get(response.stage_id) || 0) + 1
          );
        }
      });

      // Update analytics map with counts
      stageResponseCounts.forEach((sessionSet, stageId) => {
        if (analyticsMap.has(stageId)) {
          analyticsMap.set(stageId, {
            stageId,
            totalLeads: sessionSet.size,
            recentActivity: recentActivityCounts.get(stageId) || 0,
          });
        }
      });

      // For first stage, count all sessions that started
      if (stages && stages.length > 0) {
        const firstStageId = stages[0].id;
        const firstStageData = analyticsMap.get(firstStageId);
        if (firstStageData && sessions) {
          analyticsMap.set(firstStageId, {
            ...firstStageData,
            totalLeads: Math.max(firstStageData.totalLeads, sessions.length),
          });
        }
      }

      setStageData(analyticsMap);
      setTotalSessions(sessions?.length || 0);
    } catch (error) {
      console.error('Error fetching flow analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [quizId, enabled]);

  // Real-time subscription
  useEffect(() => {
    if (!quizId || !enabled) return;

    // Subscribe to new sessions
    const sessionsChannel = supabase
      .channel(`analytics-sessions-${quizId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_sessions',
          filter: `quiz_id=eq.${quizId}`,
        },
        () => {
          console.log('Session update detected, refreshing analytics...');
          fetchAnalytics();
        }
      )
      .subscribe();

    // Subscribe to new responses
    const responsesChannel = supabase
      .channel(`analytics-responses-${quizId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_responses',
        },
        () => {
          console.log('Response update detected, refreshing analytics...');
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [quizId, enabled]);

  return {
    stageAnalytics: stageData,
    totalSessions,
    isLoading,
    refetch: fetchAnalytics,
  };
}
