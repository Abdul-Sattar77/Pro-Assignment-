import {
  BarChart3,
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  PieChart,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
  AlertCircle,
  History,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown only when the user has this permission (omit = always shown). */
  permission?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Sidebar navigation registry — single source of truth. Items are filtered
 * per-user by permission (UX only; the backend enforces authorization).
 * Modules appear here as they come online.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard },
    ],
  },
  {
    title: "Work",
    items: [
      {
        label: "Assignments",
        href: ROUTES.assignments,
        icon: FileText,
        permission: "assignments.view",
      },
      {
        label: "Leads",
        href: ROUTES.leads,
        icon: UserRound,
        permission: "leads.view",
      },
      {
        label: "Tasks",
        href: ROUTES.tasks,
        icon: CheckSquare,
        permission: "tasks.view",
      },
      {
        label: "Calendar",
        href: ROUTES.calendar,
        icon: Calendar,
        permission: "tasks.view",
      },
      {
        label: "Files",
        href: ROUTES.files,
        icon: FolderOpen,
        permission: "files.view",
      },
      {
        label: "Messages",
        href: ROUTES.messaging,
        icon: MessageSquare,
        permission: "messages.view",
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        label: "Finance",
        href: ROUTES.finance,
        icon: Wallet,
        permission: "finance.view",
      },
      {
        label: "Reports",
        href: ROUTES.reports,
        icon: BarChart3,
        permission: "reports.view",
      },
      {
        label: "Analytics",
        href: ROUTES.analytics,
        icon: PieChart,
        permission: "analytics.view",
      },
      {
        label: "Complaints",
        href: ROUTES.complaints,
        icon: AlertCircle,
        permission: "complaints.view",
      },
      {
        label: "Templates",
        href: ROUTES.documentTemplates,
        icon: FileText,
        permission: "document_templates.view",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Users",
        href: ROUTES.users,
        icon: Users,
        permission: "users.view",
      },
      {
        label: "Roles",
        href: ROUTES.roles,
        icon: ShieldCheck,
        permission: "roles.view",
      },
      {
        label: "Audit Logs",
        href: ROUTES.auditLogs,
        icon: History,
        permission: "audit_logs.view",
      },
      {
        label: "Settings",
        href: ROUTES.settings,
        icon: Settings,
      },
    ],
  },
];
