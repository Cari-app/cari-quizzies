import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { LayoutGrid, RefreshCw, BarChart3 } from 'lucide-react';
import { AnalyticsStageNode } from './AnalyticsStageNode';
import { AnimatedEdge } from './AnimatedEdge';
import { useFlowAnalytics } from './useFlowAnalytics';

interface Stage {
  id: string;
  name: string;
  components: any[];
  position?: { x: number; y: number };
  connections?: { targetId: string; sourceHandle?: string }[];
}

interface FlowAnalyticsCanvasProps {
  quizId: string;
  stages: Stage[];
  selectedStageId: string | null;
  onSelectStage: (stageId: string) => void;
}

const nodeTypes = {
  analyticsStage: AnalyticsStageNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

const createEdgeStyle = () => ({
  stroke: 'hsl(var(--muted-foreground))',
  strokeWidth: 1.5,
  strokeDasharray: '5,5',
});

const createMarkerEnd = () => ({
  type: MarkerType.ArrowClosed as const,
  color: 'hsl(var(--muted-foreground))',
  width: 15,
  height: 15,
});

export function FlowAnalyticsCanvas({ 
  quizId,
  stages, 
  selectedStageId, 
  onSelectStage,
}: FlowAnalyticsCanvasProps) {
  const { stageAnalytics, totalSessions, isLoading, refetch } = useFlowAnalytics(quizId, true);

  // Build ordered stage list for conversion calculation
  const orderedStageIds = useMemo(() => stages.map(s => s.id), [stages]);

  // Convert stages to nodes with analytics data
  const buildNodes = useCallback((stgs: Stage[], selId: string | null): Node[] => {
    return stgs.map((stage, index) => {
      const analytics = stageAnalytics.get(stage.id);
      const previousStageId = index > 0 ? orderedStageIds[index - 1] : null;
      const previousAnalytics = previousStageId ? stageAnalytics.get(previousStageId) : null;
      
      // Calculate conversion rate from previous stage
      let conversionRate: number | null = null;
      if (index > 0 && previousAnalytics && previousAnalytics.totalLeads > 0) {
        conversionRate = ((analytics?.totalLeads || 0) / previousAnalytics.totalLeads) * 100;
      }

      return {
        id: stage.id,
        type: 'analyticsStage',
        position: stage.position || { x: 100 + (index % 4) * 250, y: 100 + Math.floor(index / 4) * 220 },
        data: { 
          label: stage.name, 
          components: stage.components,
          index: index + 1,
          isSelected: stage.id === selId,
          totalLeads: analytics?.totalLeads || 0,
          recentActivity: analytics?.recentActivity || 0,
          conversionRate,
          previousStageLeads: previousAnalytics?.totalLeads || null,
        },
        selected: stage.id === selId,
      };
    });
  }, [stageAnalytics, orderedStageIds]);

  // Calculate activity level for edges based on recent activity
  const getEdgeActivityLevel = useCallback((targetStageId: string): number => {
    const analytics = stageAnalytics.get(targetStageId);
    if (!analytics) return 0;
    
    const activity = analytics.recentActivity;
    if (activity === 0) return 0;
    if (activity <= 5) return 1;
    if (activity <= 15) return 2;
    return 3;
  }, [stageAnalytics]);

  // Convert connections to edges with activity data
  const buildEdges = useCallback((stgs: Stage[]): Edge[] => {
    const edges: Edge[] = [];
    stgs.forEach((stage) => {
      if (stage.connections && stage.connections.length > 0) {
        stage.connections.forEach((conn, connIndex) => {
          edges.push({
            id: `${stage.id}-${conn.targetId}-${conn.sourceHandle || 'default'}-${connIndex}`,
            source: stage.id,
            target: conn.targetId,
            sourceHandle: conn.sourceHandle || 'default',
            type: 'animated',
            style: createEdgeStyle(),
            markerEnd: createMarkerEnd(),
            data: {
              activityLevel: getEdgeActivityLevel(conn.targetId),
            },
          });
        });
      }
    });
    return edges;
  }, [getEdgeActivityLevel]);

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes(stages, selectedStageId));
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(stages));

  // Sync nodes when stages or analytics change
  useEffect(() => {
    setNodes(buildNodes(stages, selectedStageId));
  }, [stages, selectedStageId, stageAnalytics, buildNodes, setNodes]);

  // Sync edges when stages connections or analytics change
  useEffect(() => {
    setEdges(buildEdges(stages));
  }, [stages, stageAnalytics, buildEdges, setEdges]);

  // Handle node click
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectStage(node.id);
    },
    [onSelectStage]
  );

  // Auto-organize nodes
  const handleAutoOrganize = useCallback(() => {
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: { 
        x: 100 + (index % 4) * 250, 
        y: 100 + Math.floor(index / 4) * 220 
      },
    }));
    setNodes(updatedNodes);
  }, [nodes, setNodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        className="bg-muted/30"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Panel position="top-left" className="flex gap-2">
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-sm">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{totalSessions} sessões totais</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAutoOrganize}
            className="bg-background shadow-sm"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Organizar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            disabled={isLoading}
            className="bg-background shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </Panel>
        
        {/* Legend */}
        <Panel position="bottom-left" className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-sm">
          <div className="text-[10px] text-muted-foreground space-y-1">
            <div className="font-medium mb-2">Legenda</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>Leads por etapa</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>Atividade recente (5 min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 rounded bg-primary animate-pulse"></div>
              <span>Fluxo ativo</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
              <span className="text-green-600">↑ ≥80%</span>
              <span className="text-yellow-600">→ 50-79%</span>
              <span className="text-red-600">↓ &lt;50%</span>
            </div>
          </div>
        </Panel>

        <Controls 
          className="!bg-background !border-border !shadow-sm [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          showInteractive={false}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="hsl(var(--muted-foreground) / 0.2)" 
        />
      </ReactFlow>
    </div>
  );
}
