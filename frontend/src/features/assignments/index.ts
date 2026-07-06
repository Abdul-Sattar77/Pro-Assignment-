/**
 * Public surface of the assignments feature. Other code imports ONLY from
 * here (frontend-standards §8).
 */
export { AssignmentsTable } from "./components/assignments-table";
export { AssignmentDetail } from "./components/assignment-detail";
export { OrderForm } from "./components/order-form";
export { AssignmentActions } from "./components/assignment-actions";
export { StatusBadge } from "./components/status-badge";
export { AssignmentTimeline } from "./components/assignment-timeline";
export {
  useAssignment,
  useAssignments,
  useAssignmentAction,
  useAssignWriter,
  useCreateAssignment,
} from "./hooks/use-assignments";
export {
  ASSIGNMENT_STATUS,
  type Assignment,
  type AssignmentAction,
  type AssignmentStatus,
} from "./types";
