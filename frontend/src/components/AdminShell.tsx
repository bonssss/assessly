import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  CreditCard,
  FileQuestion,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { AppShell, type NavItem } from "./AppShell";

const s = (section: string, label: string, icon: NavItem["icon"]): NavItem => ({
  to: "/admin/$section",
  params: { section },
  label,
  icon,
});

const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  s("questions", "Questions", FileQuestion),
  s("departments", "Departments", Building2),
  s("resources", "Resources", BookOpen),
  s("students", "Students", Users),
  s("payments", "Payments", CreditCard),
  s("exams", "Exams", ClipboardList),
  s("reports", "Reports", BarChart3),
  s("settings", "Settings", Settings),
];

export function AdminShell({ children }: { children: ReactNode }) {
  return <AppShell nav={nav}>{children}</AppShell>;
}
