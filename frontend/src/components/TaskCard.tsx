import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WorkflowStateVisualizer } from './WorkflowStateVisualizer';
import { AgentStatusIndicator } from './AgentStatusIndicator';
import { Task, TaskStatus } from '@/types';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask }) => {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const getStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case 'Todo': return 'bg-gray-200 text-gray-800';
      case 'In Progress': return 'bg-blue-200 text-blue-800';
      case 'Code Review': return 'bg-yellow-200 text-yellow-800';
      case 'Completed': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const handleApprove = () => {
    onUpdateTask(task.id, { status: 'Completed' });
    setIsDetailDialogOpen(false);
  };

  const handleRequestRevision = () => {
    onUpdateTask(task.id, { status: 'Needs Revision' });
    setIsDetailDialogOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{task.title}</h3>
        <Badge className={getStatusBadgeColor(task.status)}>{task.status}</Badge>
      </div>
      
      <WorkflowStateVisualizer currentState={task.status} />
      
      <AgentStatusIndicator 
        planningAgentStatus={task.planningAgentStatus}
        generationAgentStatus={task.generationAgentStatus}
        reviewAgentStatus={task.reviewAgentStatus}
      />
      
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">{task.description.slice(0, 100)}...</p>
        <Button variant="outline" onClick={() => setIsDetailDialogOpen(true)}>
          View Details
        </Button>
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
            <DialogDescription>Detailed Task Information</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <h4 className="font-semibold">Description</h4>
              <p>{task.description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Generated Code</h4>
              <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
                {task.generatedCode || 'No code generated yet'}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold">Code Review Comments</h4>
              <ul className="list-disc pl-5">
                {task.codeReviewComments?.map((comment, index) => (
                  <li key={index} className="mb-2">{comment}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleRequestRevision}>
              Request Revision
            </Button>
            <Button onClick={handleApprove}>Approve Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskCard;
