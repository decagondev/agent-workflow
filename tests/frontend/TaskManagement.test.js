import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskManagementContext } from '../../contexts/TaskManagementContext';
import KanbanBoard from '../../components/KanbanBoard';

describe('Task Management', () => {
  const mockTasks = [
    { 
      id: '1', 
      title: 'Implement User Authentication', 
      status: 'TODO',
      agent: null 
    }
  ];

  const mockContextValue = {
    tasks: mockTasks,
    createTask: jest.fn(),
    moveTask: jest.fn(),
    updateTaskStatus: jest.fn()
  };

  test('renders Kanban board with initial tasks', () => {
    render(
      <TaskManagementContext.Provider value={mockContextValue}>
        <KanbanBoard />
      </TaskManagementContext.Provider>
    );

    expect(screen.getByText('Implement User Authentication')).toBeInTheDocument();
  });

  test('can move task between columns', async () => {
    render(
      <TaskManagementContext.Provider value={mockContextValue}>
        <KanbanBoard />
      </TaskManagementContext.Provider>
    );

    const task = screen.getByText('Implement User Authentication');
    fireEvent.dragStart(task);
    fireEvent.dragEnd(task);

    await waitFor(() => {
      expect(mockContextValue.moveTask).toHaveBeenCalled();
    });
  });

  test('creates new task', async () => {
    render(
      <TaskManagementContext.Provider value={mockContextValue}>
        <KanbanBoard />
      </TaskManagementContext.Provider>
    );

    const createTaskButton = screen.getByText('Create Task');
    fireEvent.click(createTaskButton);

    const titleInput = screen.getByPlaceholderText('Task Title');
    fireEvent.change(titleInput, { target: { value: 'New Test Task' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockContextValue.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Task'
        })
      );
    });
  });
});
