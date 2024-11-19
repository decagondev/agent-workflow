import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type TaskStatus = 'Todo' | 'Ready to Code' | 'Code Generation' | 'Code Review' | 'Completed';
export type AgentStatus = 'Idle' | 'Planning' | 'Generating' | 'Reviewing';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedAgent?: string;
  generatedCode?: string;
  reviewComments?: string[];
}

interface WorkflowContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  moveTaskToNextStage: (taskId: string) => void;
  getCurrentAgentStatus: (taskId: string) => AgentStatus | null;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'Todo' as TaskStatus
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  }, []);

  const moveTaskToNextStage = useCallback((taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          switch(task.status) {
            case 'Todo':
              return { ...task, status: 'Ready to Code' };
            case 'Ready to Code':
              return { ...task, status: 'Code Generation' };
            case 'Code Generation':
              return { ...task, status: 'Code Review' };
            case 'Code Review':
              return { ...task, status: 'Completed' };
            default:
              return task;
          }
        }
        return task;
      })
    );
  }, []);

  const getCurrentAgentStatus = useCallback((taskId: string): AgentStatus | null => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    switch(task.status) {
      case 'Ready to Code':
        return 'Planning';
      case 'Code Generation':
        return 'Generating';
      case 'Code Review':
        return 'Reviewing';
      default:
        return 'Idle';
    }
  }, [tasks]);

  const contextValue = {
    tasks,
    addTask,
    updateTaskStatus,
    moveTaskToNextStage,
    getCurrentAgentStatus
  };

  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
