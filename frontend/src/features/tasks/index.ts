/**
 * Public surface of the tasks feature. Other code imports ONLY from
 * here (frontend-standards §8).
 */
export { TasksTable } from "./components/tasks-table";
export { TaskDetail } from "./components/task-detail";
export { StatusBadge } from "./components/status-badge";
export { PriorityBadge } from "./components/priority-badge";
export { CreateTaskDialog } from "./components/create-task-dialog";
export { EditTaskDialog } from "./components/edit-task-dialog";
export {
  useTask,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAssignTask,
  useCompleteTask,
  useCancelTask,
} from "./hooks/use-tasks";
export {
  TASK_STATUS,
  TASK_PRIORITY,
  type Task,
  type TaskStatus,
  type TaskPriority,
  type TaskFilters,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "./types";
