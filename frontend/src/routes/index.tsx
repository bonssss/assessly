import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  GraduationCap,
  Menu,
  Receipt,
  Search,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { HeroStudyIllustration } from "@/components/EducationVectors";
import { PublicFooter } from "@/components/PublicHeader";
import { ScrollReveal, ScrollToTopButton } from "@/components/ScrollReveal";
import { Logo, btn } from "@/components/ui-kit";
import { departments, plans } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assessly — Start Learning & Practice at Home" },
      {
        name: "description",
        content: "Department-based exam practice and university exit assessments. Start with 5 free questions at home.",
      },
      { property: "og:title", content: "Assessly — Start Learning & Practice at Home" },
      {
        property: "og:description",
        content: "Practice real exam questions for your department. Five free questions to start.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  {
    icon: UserPlus,
    title: "Create an account",
    text: "Register and choose your university department. Your trial questions are ready immediately.",
  },
  {
    icon: ClipboardCheck,
    title: "Try five free questions",
    text: "Experience the real exam simulator and instant feedback with zero payment up front.",
  },
  {
    icon: Receipt,
    title: "Pay via Telebirr or CBE",
    text: "Submit your payment receipt and reference code for rapid administrative verification.",
  },
  {
    icon: GraduationCap,
    title: "Master timed exams",
    text: "Unlock full question banks, download study guides, and benchmark against departmental pass marks.",
  },
];

const faqs: [string, string][] = [
  ["How many free questions do I get?", "Every new candidate receives five free practice questions upon registration. No payment or receipt is required to test the platform."],
  ["How do I pay?", "We accept Telebirr transfers and direct Commercial Bank of Ethiopia (CBE) deposits. After paying, upload a photo or screenshot of your receipt in the Payments portal."],
  ["How long does payment approval take?", "Our team reviews submitted payment receipts regularly, usually approving requests within a few hours (maximum 24h). Access is instantly unlocked upon approval."],
  ["Can I practice multiple departments?", "Yes! You can enroll in multiple departments or upgrade to an Annual plan that includes multi-department access."],
  ["What if my receipt is rejected?", "You will receive an explanation note from the reviewer and can re-submit a legible receipt image anytime from your payments dashboard."],
];

function Index() {
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDepts = departments.filter((d) =>
    searchQuery.trim() === ""
      ? true
      : d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchScroll = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById("departments");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 selection:bg-brand/10 selection:text-brand">
      {/* ========================================================= */}
      {/* 1. FULL SCREEN HERO SECTION (EDGE-TO-EDGE, NO PADDING GAPS)*/}
      {/* ========================================================= */}
      <section className="relative w-full min-h-screen bg-white flex flex-col justify-between overflow-hidden">
        {/* Subtle decorative background organic glow */}
        <div className="pointer-events-none absolute -top-24 right-0 w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-br from-[#cffafe]/60 via-[#e0f2fe]/40 to-transparent blur-3xl -z-10" />
        <div className="pointer-events-none absolute bottom-0 -left-20 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-tr from-[#dcfce7]/50 via-[#f0fdf4]/30 to-transparent blur-3xl -z-10" />

        {/* Top Navigation Bar (Full Width) */}
        <header className="w-full border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <Link to="/" className="hover:opacity-90 transition-opacity">
                <Logo />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-widest text-slate-500 uppercase">
              <Link to="/" className="text-slate-900 transition-colors">
                HOME
              </Link>
              <a href="#departments" className="hover:text-slate-900 transition-colors">
                DEPARTMENTS
              </a>
              <a href="#about" className="hover:text-slate-900 transition-colors">
                HOW IT WORKS
              </a>
              <a href="#pricing" className="hover:text-slate-900 transition-colors">
                PRICING
              </a>
              <a href="#faq" className="hover:text-slate-900 transition-colors">
                FAQ
              </a>
            </nav>

            {/* Sign Up / Dashboard Pill Button */}
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className="rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-white px-6 py-2.5 text-xs font-bold tracking-wide shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  {isAdmin ? "Admin Portal" : "Student Dashboard"}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-white px-6 py-2.5 text-xs font-bold tracking-wide shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                  >
                    Start Free Trial
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Dropdown Nav Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-4 shadow-lg animate-in fade-in slide-in-from-top-2">
              <nav className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-slate-900">
                  Home
                </Link>
                <a href="#departments" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-slate-900">
                  Departments & Curricula
                </a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-slate-900">
                  How It Works
                </a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-slate-900">
                  Pricing Plans (ETB)
                </a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-slate-900">
                  FAQ & Support
                </a>
                {!user && (
                  <div className="pt-3 border-t flex gap-2">
                    <Link to="/login" className="py-2 text-center text-xs font-semibold text-slate-700 flex-1 rounded-full border">
                      Log in
                    </Link>
                    <Link to="/register" className="py-2 text-center text-xs font-bold bg-[#4ade80] text-white rounded-full flex-1">
                      Start Free Trial
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </header>

        {/* Hero Main Content Row (Expanded Viewport Height) */}
        <div className="flex-1 w-full mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 py-10 lg:py-16 flex items-center">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
            
            {/* Left Column: Heading, Subtitle, Search Pill, Pagination */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <ScrollReveal animation="fade-down" delay={50}>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/60 max-w-fit mb-4">
                  <ShieldCheck className="size-3.5 text-emerald-600" /> Ethiopian University Exit Exam Portal
                </span>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={150}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-slate-700 tracking-tight leading-[1.08]">
                  Ace your exit exam <br />
                  <span className="font-extrabold text-slate-900">from home</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={250}>
                <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed">
                  Practice department-specific questions, sit realistic timed mock exams with instant auto-grading, and download past solutions. Start with 5 free questions.
                </p>
              </ScrollReveal>

              {/* Pill Search Bar */}
              <ScrollReveal animation="fade-up" delay={350}>
                <form
                  onSubmit={handleSearchScroll}
                  className="mt-6 sm:mt-8 flex items-center justify-between rounded-full border border-slate-200/90 bg-white shadow-sm hover:shadow-md pl-5 pr-2 py-1.5 sm:py-2 transition-all max-w-md focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search department (e.g. Computer Science, Medicine, Law)..."
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none pr-3"
                  />
                  <button
                    type="submit"
                    className="size-9 sm:size-10 rounded-full bg-[#facc15] hover:bg-[#eab308] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
                    title="Find department questions"
                  >
                    <ArrowRight className="size-4 text-white stroke-[2.5]" />
                  </button>
                </form>
              </ScrollReveal>

              {/* Value proposition badges */}
              <ScrollReveal animation="fade-up" delay={450}>
                <div className="mt-8 flex flex-wrap gap-4 sm:gap-6 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="size-4 text-emerald-500" />
                    <span>8,500+ MoE Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-4 text-amber-500" />
                    <span>Timed Mock Exams</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="size-4 text-blue-500" />
                    <span>5 Free Trial Questions</span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Pagination Dots at Bottom Left */}
              <ScrollReveal animation="fade-up" delay={550}>
                <div className="mt-8 sm:mt-12 flex items-center gap-2">
                  <span className="size-3 rounded-full bg-amber-400 ring-4 ring-amber-400/25 transition-all" />
                  <span className="size-2 rounded-full border border-slate-300 bg-white" />
                  <span className="size-2 rounded-full border border-slate-300 bg-white" />
                  <span className="size-2 rounded-full border border-slate-300 bg-white" />
                  <span className="size-2 rounded-full border border-slate-300 bg-white" />
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Freepik-Style Education Vector Illustration */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <ScrollReveal animation="scale-in" delay={200}>
                <HeroStudyIllustration className="w-full max-w-[540px] drop-shadow-md" />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. AVAILABLE DEPARTMENTS / CURRICULUM SECTION             */}
      {/* ========================================================= */}
      <section id="departments" className="mx-auto max-w-6xl px-6 py-20 border-b">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col gap-1 text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Department Curriculum
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Choose your field of study
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Curated exam collections matched directly to university exit exam syllabi.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDepts.map((d, i) => (
            <ScrollReveal
              key={d.code}
              animation="scale-in"
              delay={i * 70}
              className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  {d.code}
                </span>
                <span className="text-xs text-slate-400 font-medium">{d.questions.toLocaleString()} Qs</span>
              </div>
              <h3 className="mt-4 font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                {d.name}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {d.desc}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">{d.resources} resources</span>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Practice now <ArrowRight className="size-3" />
                </Link>
              </div>
            </ScrollReveal>
          ))}
          {filteredDepts.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-slate-400">
              No departments matched &ldquo;{searchQuery}&rdquo;. Try another search term.
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. HOW IT WORKS (FOUR CLEAR STEPS)                        */}
      {/* ========================================================= */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Clear Path
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              How Assessly works
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Simple, transparent steps from initial registration to full exit exam readiness.
            </p>
          </div>
        </ScrollReveal>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <ScrollReveal
              key={s.title}
              as="li"
              animation="fade-up"
              delay={i * 100}
              className="group relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-emerald-500/40"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-[#4ade80] group-hover:text-white transition-colors duration-200 shadow-xs">
                  <s.icon className="size-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors duration-200">
                {s.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">{s.text}</p>
            </ScrollReveal>
          ))}
        </ol>
      </section>

      {/* ========================================================= */}
      {/* 4. AFFORDABLE PRICING SECTION                             */}
      {/* ========================================================= */}
      <section id="pricing" className="border-y bg-slate-50/70 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Simple Pricing
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                Pay in Ethiopian Birr
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Start with 5 free questions. Upgrade anytime via Telebirr or CBE bank transfer.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((p, i) => (
              <ScrollReveal
                key={p.id}
                animation="fade-up"
                delay={i * 100}
                className={`relative flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border ${
                  p.popular
                    ? "border-emerald-400 ring-2 ring-emerald-400/20 shadow-emerald-500/5"
                    : "border-slate-200/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xl text-slate-900">{p.name}</h3>
                    {p.popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#4ade80] px-3 py-1 text-xs font-bold text-white shadow-xs">
                        <Sparkles className="size-3" /> Popular
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                      {p.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">ETB / {p.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-xs sm:text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span className="text-slate-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/register"
                  className={`mt-8 w-full rounded-full py-3 text-center text-xs font-bold shadow-xs transition-all ${
                    p.popular
                      ? "bg-[#4ade80] hover:bg-[#22c55e] text-white shadow-emerald-500/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  Get started
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FREQUENTLY ASKED QUESTIONS                             */}
      {/* ========================================================= */}
      <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] items-start">
          <ScrollReveal animation="fade-right">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Help & Support
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                Frequently asked questions
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Quick answers on registration, trial practice, and Telebirr / CBE payment approval.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={100}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map(([q, a]) => (
                <AccordionItem key={q} value={q} className="border-b border-slate-200/80 py-2">
                  <AccordionTrigger className="text-left font-bold text-slate-800 hover:text-emerald-600 transition-colors py-3 text-sm sm:text-base">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 text-xs sm:text-sm leading-relaxed pb-3">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </section>

      {/* Floating Scroll To Top Button */}
      <ScrollToTopButton />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
