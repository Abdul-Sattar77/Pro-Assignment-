import { useState } from "react";
import type { Task, TaskStatus } from "../types";

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Review assignment #A-101",
    description: "Check submitted files and approve",
    status: "todo",
    priority: "high",
    dueDate: "2026-07-12",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Assign writer to #A-102",
    description: "Find available writer and assign",
    status: "doing",
    priority: "high",
    dueDate: "2026-07-11",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Send weekly update to client",
    description: "Prepare and send progress report",
    status: "doing",
    priority: "medium",
    dueDate: "2026-07-10",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Follow up on payment #INV-009",
    status: "done",
    priority: "low",
    createdAt: new Date().toISOString(),
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  function addTask(task: Omit<Task, "id" | "createdAt">) {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }

  function updateStatus(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function getByStatus(status: TaskStatus) {
    return tasks.filter((t) => t.status === status);
  }

  return { tasks, addTask, updateStatus, deleteTask, getByStatus };
}
