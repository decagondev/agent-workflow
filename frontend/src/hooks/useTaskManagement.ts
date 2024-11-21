import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { useWorkflow } from '../contexts/WorkflowContext';
import { Task, TaskStatus } from '../contexts/WorkflowContext';

export const useTaskManagement = () => {
  const { tasks, addTask, updateTaskStatus, moveTaskToNextStage } = useWorkflow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewTask = useCallback(async (taskData: Omit<Task, 'id' | 'status'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const createdTask = await apiService.createTask(taskData);
      addTask(createdTask);
      return createdTask;
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [addTask]);

  const processTaskToNextStage = useCallback(async (taskId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      switch(task.status) {
        case 'Todo':
          await apiService.triggerPlanning(taskId);
          break;
        case 'Ready to Code':
          await apiService.triggerCodeGeneration(taskId);
          break;
        case 'Code Generation':
          break;
        case 'Code Review':
          await apiService.reviewTask(taskId, true);
          break;
      }

      moveTaskToNextStage(taskId);
    } catch (err) {
      setError('Failed to process task to next stage');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [tasks, moveTaskToNextStage]);

  const manualUpdateTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.updateTaskStatus(taskId, newStatus);
      updateTaskStatus(taskId, newStatus);
    } catch (err) {
      setError('Failed to update task status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [updateTaskStatus]);

  const requestTaskRevision = useCallback(async (taskId: string, comments: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.reviewTask(taskId, false, comments);
      updateTaskStatus(taskId, 'Code Review');
    } catch (err) {
      setError('Failed to request task revision');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [updateTaskStatus]);

  return {
    createNewTask,
    processTaskToNextStage,
    manualUpdateTaskStatus,
    requestTaskRevision,
    isLoading,
    error
  };
};
