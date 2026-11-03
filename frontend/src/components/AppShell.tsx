import { Link, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "./ui-kit";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  params?: Record<string, string>;
};

export function AppShell({
  nav,
  user: defaultUser,
  role: defaultRole,
  children,
}: {
  nav: NavItem[];
  user?: string;
  role?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const userName = authUser?.fullName || defaultUser || "User";
  const userRole = authUser?.role || defaultRole || "STUDENT";

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r bg-card transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b px-5">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              params={n.params as never}
              activeOptions={{ exact: true }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground hover:translate-x-0.5 active:scale-[0.98]"
              activeProps={{ className: "bg-accent font-medium !text-primary shadow-xs" }}
            >
              <n.icon className="size-4 shrink-0" />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="size-4 shrink-0" /> <span>Logout</span>
          </button>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-foreground/30 backdrop-blur-xs transition-opacity duration-300 md:hidden animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="md:pl-60">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card px-4 md:px-8">
          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search…"
              className="w-full rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button
              aria-label="Notifications"
              className="text-muted-foreground hover:text-foreground"
            >
              <Bell className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-primary">
                {initials}
              </span>
              <div className="hidden text-sm leading-tight sm:block">
                <div className="font-medium">{userName}</div>
                <div className="text-xs text-muted-foreground">{userRole}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
