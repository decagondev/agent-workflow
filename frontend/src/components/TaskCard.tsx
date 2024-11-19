import React from 'react';
import { Task } from '../contexts/WorkflowContext';

interface TaskCardProps {
  task: Task;
  onAdvance: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onAdvance }) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Todo': return 'bg-gray-200';
      case 'Ready to Code': return 'bg-blue-200';
      case 'Code Generation': return 'bg-yellow-200';
      case 'Code Review': return 'bg-purple-200';
      case 'Completed': return 'bg-green-200';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div 
      className={`
        ${getStatusColor(task.status)} 
        rounded-lg p-4 mb-4 shadow-md
        hover:shadow-lg transition-shadow duration-300
      `}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{task.title}</h3>
        <span 
          className="
            px-2 py-1 rounded-full text-xs font-semibold
            bg-white text-gray-800
          "
        >
          {task.status}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-4">
        {task.description}
      </p>
      <div className="flex justify-between items-center">
        {task.status !== 'Completed' && (
          <button 
            onClick={onAdvance}
            className="
              bg-blue-500 text-white px-3 py-1 rounded
              hover:bg-blue-600 transition-colors
            "
          >
            Advance
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
