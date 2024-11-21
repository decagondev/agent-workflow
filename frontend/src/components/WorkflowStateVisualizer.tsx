import React from 'react';
import { 
  ArrowRightIcon, 
  CheckIcon, 
  XIcon 
} from 'lucide-react';

type WorkflowState = 
  'Todo' | 
  'Ready to Code' | 
  'Generating' | 
  'Code Review' | 
  'Needs Revision' | 
  'Completed';

interface WorkflowStateVisualizerProps {
  currentState: WorkflowState;
}

const WorkflowStateVisualizer: React.FC<WorkflowStateVisualizerProps> = ({ 
  currentState 
}) => {
  const states: WorkflowState[] = [
    'Todo', 
    'Ready to Code', 
    'Generating', 
    'Code Review', 
    'Needs Revision', 
    'Completed'
  ];

  const getStateColor = (state: WorkflowState): string => {
    if (state === currentState) return 'bg-blue-500 text-white';
    if (states.indexOf(state) < states.indexOf(currentState)) return 'bg-green-500 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  const getStateIcon = (state: WorkflowState) => {
    const baseClasses = "w-5 h-5 mr-2";
    
    if (state === currentState) return <ArrowRightIcon className={baseClasses} />;
    if (states.indexOf(state) < states.indexOf(currentState)) return <CheckIcon className={baseClasses} />;
    return null;
  };

  return (
    <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
      {states.map((state, index) => (
        <React.Fragment key={state}>
          <div 
            className={`
              flex items-center px-3 py-1 rounded-full 
              transition-all duration-300 ease-in-out
              ${getStateColor(state)}
            `}
          >
            {getStateIcon(state)}
            <span className="text-xs font-medium">{state}</span>
          </div>
          {index < states.length - 1 && (
            <div className="h-0.5 w-8 bg-gray-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WorkflowStateVisualizer;
