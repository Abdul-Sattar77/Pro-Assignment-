/**
 * Public surface of the assignments feature. Other code imports ONLY from
 * here (frontend-standards §8).
 */
export { AssignmentsTable } from "./components/assignments-table";
export { AssignmentDetail } from "./components/assignment-detail";
export { AssignmentActions } from "./components/assignment-actions";
export { StatusBadge } from "./components/status-badge";
export { PriorityBadge } from "./components/priority-badge";
export { AssignmentTimeline } from "./components/assignment-timeline";
export { AttachmentList } from "./components/attachment-list";
export { VoiceNotesList } from "./components/voice-notes-list";
export { AssignManagerDialog } from "./components/assign-manager-dialog";
export { CreateAssignmentDialog } from "./components/create-assignment-dialog";
export { EditAssignmentDialog } from "./components/edit-assignment-dialog";
export {
  useAssignment,
  useAssignments,
  useAssignmentAction,
  useAssignmentAttachments,
  useAssignManager,
  useAssignWriter,
  useCreateAssignment,
  useDeleteAttachment,
  useUpdateAssignment,
  useUploadAttachment,
} from "./hooks/use-assignments";
export {
  ASSIGNMENT_STATUS,
  ASSIGNMENT_PRIORITY,
  type Assignment,
  type AssignmentAction,
  type AssignmentAttachment,
  type AssignmentPriority,
  type AssignmentStatus,
  type AdminAssignmentFilters,
  type UpdateAssignmentPayload,
} from "./types";
