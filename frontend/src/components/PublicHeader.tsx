import { Link } from "@tanstack/react-router";
import { Logo, btn } from "./ui-kit";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <Link to="/"><Logo /></Link>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <a href="#departments" className="hover:text-foreground">Departments</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#about" className="hover:text-foreground">About</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className={btn.ghost}>Login</Link>
          <Link to="/register" className={btn.primary}>Register</Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <Logo className="text-foreground" />
        <span>© 2026 ExamPro. Online examination & self-assessment.</span>
        <span>support@exampro.et</span>
      </div>
    </footer>
  );
}
