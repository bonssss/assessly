import { BookOpen, CreditCard, FileText, LayoutDashboard, ListChecks, User } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell, type NavItem } from "./AppShell";

const nav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/exams", label: "My Exams", icon: FileText },
  { to: "/practice", label: "Practice Questions", icon: ListChecks },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/profile", label: "Profile", icon: User },
];

export function StudentShell({ children }: { children: ReactNode }) {
  return <AppShell nav={nav}>{children}</AppShell>;
}
