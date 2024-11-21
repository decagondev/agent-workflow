import React from 'react';
import { 
  CircleIcon, 
  CheckCircleIcon, 
  AlertCircleIcon 
} from 'lucide-react';

type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

interface AgentStatusIndicatorProps {
  planningAgentStatus: AgentStatus;
  generationAgentStatus: AgentStatus;
  reviewAgentStatus: AgentStatus;
}

const statusColors = {
  idle: 'text-gray-500',
  working: 'text-yellow-500',
  completed: 'text-green-500',
  error: 'text-red-500'
};

const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({
  planningAgentStatus,
  generationAgentStatus,
  reviewAgentStatus
}) => {
  const renderAgentIcon = (status: AgentStatus) => {
    const baseClasses = `w-6 h-6 ${statusColors[status]}`;
    
    switch (status) {
      case 'idle':
        return <CircleIcon className={baseClasses} />;
      case 'working':
        return <CircleIcon className={`${baseClasses} animate-pulse`} />;
      case 'completed':
        return <CheckCircleIcon className={baseClasses} />;
      case 'error':
        return <AlertCircleIcon className={baseClasses} />;
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
      <div className="flex flex-col items-center">
        <span className="text-xs mb-1">Planning</span>
        {renderAgentIcon(planningAgentStatus)}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs mb-1">Generation</span>
        {renderAgentIcon(generationAgentStatus)}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs mb-1">Review</span>
        {renderAgentIcon(reviewAgentStatus)}
      </div>
    </div>
  );
};

export default AgentStatusIndicator;
