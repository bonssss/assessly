import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, btn } from "./ui-kit";
import { ScrollProgressBar } from "./ScrollReveal";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <ScrollProgressBar />
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? "border-b bg-card/85 backdrop-blur-md shadow-xs border-border/80"
            : "border-b border-transparent bg-card",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
          <Link to="/" className="transition-transform duration-200 hover:scale-[1.02]">
            <Logo />
          </Link>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <a href="#about" className="transition-colors hover:text-foreground">
              How it Works
            </a>
            <a href="#departments" className="transition-colors hover:text-foreground">
              Departments
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <Link to="/login" className={btn.ghost}>
              Login
            </Link>
            <Link to="/register" className={btn.primary}>
              Register
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <Logo className="text-foreground" />
        <span>© 2026 Assessly. Online examination & self-assessment.</span>
        <a href="mailto:support@assessly.com" className="transition-colors hover:text-foreground">
          support@assessly.com
        </a>
      </div>
    </footer>
  );
}
