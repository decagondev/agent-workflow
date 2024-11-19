import axios from 'axios';
import { Task, TaskStatus } from '../contexts/WorkflowContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiService = {
  createTask: async (taskData: Omit<Task, 'id' | 'status'>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks/create`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  getTaskDetails: async (taskId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  },

  updateTaskStatus: async (taskId: string, status: TaskStatus) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  triggerPlanning: async (taskId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/plan`);
      return response.data;
    } catch (error) {
      console.error('Error triggering planning:', error);
      throw error;
    }
  },

  triggerCodeGeneration: async (taskId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/generate`);
      return response.data;
    } catch (error) {
      console.error('Error triggering code generation:', error);
      throw error;
    }
  },
  reviewTask: async (taskId: string, approved: boolean, comments?: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/review`, { 
        approved, 
        comments 
      });
      return response.data;
    } catch (error) {
      console.error('Error reviewing task:', error);
      throw error;
    }
  }
};
