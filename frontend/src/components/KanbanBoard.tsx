import React from 'react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useTaskManagement } from '../hooks/useTaskManagement';
import TaskCard from './TaskCard';

const columnOrder: TaskStatus[] = [
  'Todo', 
  'Ready to Code', 
  'Code Generation', 
  'Code Review', 
  'Completed'
];

export const KanbanBoard: React.FC = () => {
  const { tasks } = useWorkflow();
  const { processTaskToNextStage } = useTaskManagement();

  const renderColumn = (status: TaskStatus) => {
    const columnTasks = tasks.filter(task => task.status === status);

    return (
      <div 
        key={status} 
        className="bg-gray-100 rounded-lg p-4 min-h-[400px] w-64"
      >
        <h2 className="text-xl font-bold mb-4 capitalize">{status}</h2>
        {columnTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onAdvance={() => processTaskToNextStage(task.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex space-x-4 p-6 overflow-x-auto">
      {columnOrder.map(renderColumn)}
    </div>
  );
};

export default KanbanBoard;
