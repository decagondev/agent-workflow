export interface StatsData {
  totalTasks: number;
  inProgress: number;
  completed: number;
  successRate: number;
}

export interface TaskFormData {
  title: string;
  description: string;
}
