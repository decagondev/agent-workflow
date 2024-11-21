import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import WebSocketService from '@/services/websocketService';
import { toast } from "@/components/ui/use-toast";

interface AgentAction {
  type: 'PLAN' | 'GENERATE' | 'REVIEW' | 'APPROVE';
  taskId: string;
  payload?: any;
}

interface AgentInteractionState {
  isLoading: boolean;
  error: string | null;
  currentAction: AgentAction | null;
  agentLogs: string[];
}

const useAgentInteraction = (wsUrl: string) => {
  const [state, setState] = useState<AgentInteractionState>({
    isLoading: false,
    error: null,
    currentAction: null,
    agentLogs: []
  });

  const [wsService, setWsService] = useState<WebSocketService | null>(null);

  // Initialize WebSocket on hook mount
  useEffect(() => {
    const service = new WebSocketService(wsUrl, handleWebSocketMessage);
    service.connect();
    setWsService(service);

    return () => {
      service.close();
    };
  }, [wsUrl]);

  const handleWebSocketMessage = useCallback((message: any) => {
    switch(message.type) {
      case 'AGENT_LOG':
        setState(prev => ({
          ...prev,
          agentLogs: [...prev.agentLogs, message.log]
        }));
        break;
      case 'AGENT_ERROR':
        setState(prev => ({
          ...prev,
          error: message.errorMessage,
          isLoading: false
        }));
        toast({
          title: "Agent Error",
          description: message.errorMessage,
          variant: "destructive"
        });
        break;
    }
  }, []);

  const performAgentAction = useCallback(async (action: AgentAction) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      currentAction: action 
    }));

    try {
      const endpoint = `/tasks/${action.taskId}/${action.type.toLowerCase()}`;
      const response = await axios.post(endpoint, action.payload);

      setState(prev => ({
        ...prev,
        isLoading: false,
        currentAction: null
      }));

      toast({
        title: "Agent Action Completed",
        description: `${action.type} action successful for task ${action.taskId}`
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      toast({
        title: "Agent Action Failed",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    }
  }, []);

  const planTask = useCallback((taskId: string, details: any) => 
    performAgentAction({ 
      type: 'PLAN', 
      taskId, 
      payload: details 
    }), [performAgentAction]);

  const generateCode = useCallback((taskId: string, planDetails: any) => 
    performAgentAction({ 
      type: 'GENERATE', 
      taskId, 
      payload: planDetails 
    }), [performAgentAction]);

  const reviewCode = useCallback((taskId: string, codeDetails: any) => 
    performAgentAction({ 
      type: 'REVIEW', 
      taskId, 
      payload: codeDetails 
    }), [performAgentAction]);

  const approveTask = useCallback((taskId: string) => 
    performAgentAction({ 
      type: 'APPROVE', 
      taskId 
    }), [performAgentAction]);

  return {
    ...state,
    wsService,
    planTask,
    generateCode,
    reviewCode,
    approveTask
  };
};

export default useAgentInteraction;
