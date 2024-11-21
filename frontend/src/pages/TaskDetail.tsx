import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { WorkflowStateVisualizer } from '@/components/WorkflowStateVisualizer';
import { AgentStatusIndicator } from '@/components/AgentStatusIndicator';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useToast } from '@/components/ui/use-toast';
import { 
  CodeIcon, 
  CommitIcon, 
  MessageCircleIcon, 
  ActivityIcon 
} from 'lucide-react';

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    getTaskById, 
    updateTask, 
    processTaskToNextStage,
    addTaskComment 
  } = useTaskManagement();

  const [task, setTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      if (taskId) {
        const fetchedTask = await getTaskById(taskId);
        setTask(fetchedTask);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleAddComment = async () => {
    if (task && newComment.trim()) {
      try {
        await addTaskComment(task.id, newComment);
        setNewComment('');
        toast({
          title: 'Comment Added',
          description: 'Your comment has been successfully added to the task.'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add comment.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleAdvanceTask = async () => {
    if (task) {
      try {
        await processTaskToNextStage(task.id);
        toast({
          title: 'Task Advanced',
          description: 'Task has been moved to the next stage.'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to advance task.',
          variant: 'destructive'
        });
      }
    }
  };

  if (!task) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{task.title}</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Back to Dashboard
          </Button>
          <Button 
            onClick={handleAdvanceTask}
            disabled={task.status === 'Completed'}
          >
            Advance Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowStateVisualizer currentState={task.status} />
            <AgentStatusIndicator 
              planningAgentStatus={task.planningAgentStatus}
              generationAgentStatus={task.generationAgentStatus}
              reviewAgentStatus={task.reviewAgentStatus}
            />
            <p className="mt-4">{task.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Status:</strong> {task.status}
              </div>
              <div>
                <strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}
              </div>
              <div>
                <strong>Last Updated:</strong> {new Date(task.updatedAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="code" className="md:col-span-3">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="code">
              <CodeIcon className="mr-2 h-4 w-4" /> Generated Code
            </TabsTrigger>
            <TabsTrigger value="review">
              <CommitIcon className="mr-2 h-4 w-4" /> Review Comments
            </TabsTrigger>
            <TabsTrigger value="discussion">
              <MessageCircleIcon className="mr-2 h-4 w-4" /> Task Discussion
            </TabsTrigger>
            <TabsTrigger value="activity">
              <ActivityIcon className="mr-2 h-4 w-4" /> Activity Log
            </TabsTrigger>
          </TabsList>
          <TabsContent value="code">
            <Card>
              <CardContent className="p-6">
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  {task.generatedCode || 'No code generated yet'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="review">
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-2">
                  {task.codeReviewComments?.map((comment, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded-md">
                      {comment}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="discussion">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                  <div>
                    {task.comments?.map((comment, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 p-3 rounded-md mb-2"
                      >
                        {comment.text}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activity">
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-2">
                  {task.activityLog?.map((entry, index) => (
                    <li 
                      key={index} 
                      className="bg-gray-50 p-3 rounded-md flex justify-between"
                    >
                      <span>{entry.action}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TaskDetail;
