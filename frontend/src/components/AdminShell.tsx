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

const createNavItem = (section: string, label: string, icon: NavItem["icon"]): NavItem => ({
  to: "/admin/$section",
  params: { section },
  label,
  icon,
});

const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  createNavItem("questions", "Questions", FileQuestion),
  createNavItem("departments", "Departments", Building2),
  createNavItem("resources", "Resources", BookOpen),
  s("students", "Students", Users),
  createNavItem("payments", "Payments", CreditCard),
  createNavItem("exams", "Exams", ClipboardList),
  createNavItem("reports", "Reports", BarChart3),
  createNavItem("settings", "Settings", Settings),
];

export function AdminShell({ children }: { children: ReactNode }) {
  return <AppShell nav={nav}>{children}</AppShell>;
}
