import {
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

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
      { label: "Settings", href: ROUTES.settings, icon: Settings },
    ],
  },
];
