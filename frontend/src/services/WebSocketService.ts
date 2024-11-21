import { toast } from "@/components/ui/use-toast";

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private url: string, 
    private onMessageCallback?: (event: MessageEvent) => void
  ) {}

  connect() {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        toast({
          title: "Connected",
          description: "Real-time workflow tracking enabled"
        });
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed', event);
        this.reconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error', error);
        toast({
          title: "Connection Error",
          description: "Unable to connect to real-time workflow service",
          variant: "destructive"
        });
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection', error);
    }
  }

  private handleMessage(data: any) {
    switch(data.type) {
      case 'TASK_STATUS_UPDATE':
        this.handleTaskStatusUpdate(data);
        break;
      case 'AGENT_ACTION':
        this.handleAgentAction(data);
        break;
      case 'WORKFLOW_PROGRESS':
        this.handleWorkflowProgress(data);
        break;
      default:
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
    }
  }

  private handleTaskStatusUpdate(data: any) {
    toast({
      title: "Task Update",
      description: `Task ${data.taskId} status changed to ${data.status}`
    });
  }

  private handleAgentAction(data: any) {
    toast({
      title: "Agent Action",
      description: `${data.agentType} performed ${data.action}`
    });
  }

  private handleWorkflowProgress(data: any) {
    toast({
      title: "Workflow Progress",
      description: `Progress: ${data.progress}%`
    });
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = Math.pow(2, this.reconnectAttempts) * 1000;
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts})`);
        this.connect();
      }, timeout);
    } else {
      toast({
        title: "Connection Lost",
        description: "Unable to restore WebSocket connection",
        variant: "destructive"
      });
    }
  }

  sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
      toast({
        title: "Send Failed",
        description: "Unable to send message. Check your connection.",
        variant: "destructive"
      });
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketService;
