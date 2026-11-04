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
import { Logo } from "@/components/ui-kit";
import { departments, plans } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assessly — Start Learning At Home" },
      {
        name: "description",
        content: "Department-specific practice questions, timed mock exams, and past exit papers. Start with 5 free questions at home.",
      },
      { property: "og:title", content: "Assessly — Start Learning At Home" },
      {
        property: "og:description",
        content: "Practice real exit exam questions for your department at home. 5 free questions to start.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  {
    icon: UserPlus,
    title: "Create an account",
    text: "Register and choose your university department. Your 5 trial questions are ready immediately.",
  },
  {
    icon: ClipboardCheck,
    title: "Try five free questions",
    text: "Experience the real timed exam simulator and instant feedback with zero payment up front.",
  },
  {
    icon: Receipt,
    title: "Pay via Telebirr or CBE",
    text: "Submit your payment receipt screenshot and reference code for rapid administrative verification.",
  },
  {
    icon: GraduationCap,
    title: "Master timed exams",
    text: "Unlock full question banks, download study guides, and benchmark against departmental pass marks.",
  },
];

const faqs: [string, string][] = [
  ["How many free questions do I get?", "Every new candidate receives five free practice questions upon registration. No payment or bank receipt is required to test the platform."],
  ["How do I pay?", "We accept Telebirr transfers and direct Commercial Bank of Ethiopia (CBE) deposits. After paying, upload a photo or screenshot of your receipt in the Payments portal."],
  ["How long does payment approval take?", "Our team reviews submitted payment receipts regularly, usually approving requests within 1 to 3 hours (maximum 24h). Access is instantly unlocked upon approval."],
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
    <div className="min-h-screen bg-gradient-to-br from-[#cffafe] via-[#a7f3d0]/35 to-[#bae6fd]/50 selection:bg-brand/10 selection:text-brand p-3 sm:p-6 lg:p-8 flex flex-col justify-between">
      
      {/* ========================================================= */}
      {/* 1. MAIN FLOATING HERO CARD (MATCHING FREEPIK REFERENCE)   */}
      {/* ========================================================= */}
      <section className="w-full max-w-7xl mx-auto bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-cyan-950/10 border border-white/80 overflow-hidden flex flex-col justify-between min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-4rem)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Card Header (Hamburger + Brand + Navigation + Green Pill Button) */}
        <header className="w-full px-6 sm:px-10 lg:px-12 pt-6 sm:pt-8 flex items-center justify-between border-b border-slate-100/60 pb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-widest text-slate-500 uppercase">
            <Link to="/" className="text-slate-900 border-b-2 border-slate-900 pb-1 transition-colors">
              HOME
            </Link>
            <a href="#departments" className="hover:text-slate-900 transition-colors pb-1">
              DEPARTMENTS
            </a>
            <a href="#about" className="hover:text-slate-900 transition-colors pb-1">
              ABOUT
            </a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors pb-1">
              PRICING
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors pb-1">
              CONTACT
            </a>
          </nav>

          {/* Green Pill CTA Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-white px-6 py-2.5 text-xs font-bold tracking-wide shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isAdmin ? "Admin Portal" : "Dashboard"}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-white px-6 py-2.5 text-xs font-bold tracking-wide shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-100 bg-white px-6 py-4 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-1 text-slate-900 font-bold">
                Home
              </Link>
              <a href="#departments" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-slate-900">
                Departments
              </a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-slate-900">
                About
              </a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-slate-900">
                Pricing
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-slate-900">
                Contact & FAQ
              </a>
              {!user && (
                <div className="pt-3 border-t flex gap-2">
                  <Link to="/login" className="py-2 text-center text-xs font-semibold text-slate-700 flex-1 rounded-full border">
                    Log in
                  </Link>
                  <Link to="/register" className="py-2 text-center text-xs font-bold bg-[#4ade80] text-white rounded-full flex-1">
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}

        {/* Card Main Body (2 Columns matching Freepik vector composition) */}
        <div className="flex-1 px-6 sm:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 flex items-center">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
            
            {/* Left Column: Heading, Subtitle, Search Pill, Pagination Dots */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              
              {/* Category Subtitle */}
              <ScrollReveal animation="fade-down" delay={100}>
                <div className="text-xs sm:text-sm font-medium text-slate-400 mb-3 tracking-wide flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online education &bull; University Exit Exam</span>
                </div>
              </ScrollReveal>

              {/* Main Clean Headline */}
              <ScrollReveal animation="fade-up" delay={200}>
                <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-normal text-slate-700 tracking-tight leading-[1.08]">
                  Start learning <br />
                  <span className="font-extrabold text-slate-900">at home</span>
                </h1>
              </ScrollReveal>

              {/* Subtitle */}
              <ScrollReveal animation="fade-up" delay={300}>
                <p className="mt-4 text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed font-normal">
                  Prepare for your university exit exam with authentic department practice questions, realistic timed mock exams, and instant solutions. Start with 5 free questions.
                </p>
              </ScrollReveal>

              {/* Search Pill Bar (White Pill with Yellow Circular Button) */}
              <ScrollReveal animation="fade-up" delay={400}>
                <form
                  onSubmit={handleSearchScroll}
                  className="mt-6 sm:mt-8 flex items-center justify-between rounded-full border border-slate-200/90 bg-white shadow-sm hover:shadow-md pl-6 pr-2 py-2 max-w-md transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 hover:scale-[1.01]"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for?"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none pr-3"
                  />
                  <button
                    type="submit"
                    className="size-9 sm:size-10 rounded-full bg-[#facc15] hover:bg-[#eab308] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
                    title="Search departments"
                  >
                    <ArrowRight className="size-4 text-white stroke-[2.5]" />
                  </button>
                </form>
              </ScrollReveal>

              {/* 5 Pagination Dots at Bottom Left */}
              <ScrollReveal animation="fade-up" delay={500}>
                <div className="mt-8 sm:mt-12 flex items-center gap-2">
                  <span className="size-3 rounded-full bg-amber-400 ring-4 ring-amber-400/25 transition-all animate-pulse" />
                  <span className="size-2 rounded-full border border-slate-300 bg-white hover:border-amber-400 transition-colors" />
                  <span className="size-2 rounded-full border border-slate-300 bg-white hover:border-amber-400 transition-colors" />
                  <span className="size-2 rounded-full border border-slate-300 bg-white hover:border-amber-400 transition-colors" />
                  <span className="size-2 rounded-full border border-slate-300 bg-white hover:border-amber-400 transition-colors" />
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Freepik Education Vector Illustration */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <ScrollReveal animation="scale-in" delay={250} className="w-full flex justify-center">
                <div className="animate-float transition-transform duration-500 hover:scale-[1.02]">
                  <HeroStudyIllustration className="w-full max-w-[520px] drop-shadow-md" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* Card Subtle Bottom Bar */}
        <div className="px-6 sm:px-10 lg:px-12 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Assessly Online Exit Assessment System</span>
          <a href="#departments" className="hover:text-slate-600 transition-colors">
            Explore Curricula &darr;
          </a>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. AVAILABLE DEPARTMENTS CARD                             */}
      {/* ========================================================= */}
      <ScrollReveal
        as="section"
        id="departments"
        animation="fade-up"
        duration={700}
        className="w-full max-w-7xl mx-auto bg-white rounded-[32px] sm:rounded-[40px] shadow-xl shadow-cyan-950/5 border border-white/80 p-8 sm:p-12 lg:p-16 my-8 sm:my-10 transition-all duration-500 hover:shadow-2xl"
      >
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
              className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-500/40 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
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
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Practice now <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform duration-200" />
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
      </ScrollReveal>

      {/* ========================================================= */}
      {/* 3. HOW IT WORKS (FOUR CLEAR STEPS)                        */}
      {/* ========================================================= */}
      <ScrollReveal
        as="section"
        id="about"
        animation="fade-up"
        duration={700}
        className="w-full max-w-7xl mx-auto bg-white rounded-[32px] sm:rounded-[40px] shadow-xl shadow-cyan-950/5 border border-white/80 p-8 sm:p-12 lg:p-16 mb-8 sm:mb-10 transition-all duration-500 hover:shadow-2xl"
      >
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
              className="group relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2.5 hover:shadow-xl hover:scale-[1.02] hover:border-emerald-500/40 cursor-default"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-[#4ade80] group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xs">
                  <s.icon className="size-5 transition-transform duration-300" />
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors duration-200">
                {s.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">{s.text}</p>
            </ScrollReveal>
          ))}
        </ol>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* 4. AFFORDABLE PRICING SECTION                             */}
      {/* ========================================================= */}
      <ScrollReveal
        as="section"
        id="pricing"
        animation="fade-up"
        duration={700}
        className="w-full max-w-7xl mx-auto bg-white rounded-[32px] sm:rounded-[40px] shadow-xl shadow-cyan-950/5 border border-white/80 p-8 sm:p-12 lg:p-16 mb-8 sm:mb-10 transition-all duration-500 hover:shadow-2xl"
      >
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
              className={`relative flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02] border ${
                p.popular
                  ? "border-emerald-400 ring-2 ring-emerald-400/20 shadow-emerald-500/5 hover:ring-emerald-400/40"
                  : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl text-slate-900">{p.name}</h3>
                  {p.popular && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#4ade80] px-3 py-1 text-xs font-bold text-white shadow-xs animate-pulse">
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
                className={`mt-8 w-full rounded-full py-3 text-center text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 ${
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
      </ScrollReveal>

      {/* ========================================================= */}
      {/* 5. FREQUENTLY ASKED QUESTIONS                             */}
      {/* ========================================================= */}
      <ScrollReveal
        as="section"
        id="faq"
        animation="fade-up"
        duration={700}
        className="w-full max-w-7xl mx-auto bg-white rounded-[32px] sm:rounded-[40px] shadow-xl shadow-cyan-950/5 border border-white/80 p-8 sm:p-12 lg:p-16 mb-8 sm:mb-10 transition-all duration-500 hover:shadow-2xl"
      >
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
      </ScrollReveal>

      {/* Floating Scroll To Top Button */}
      <ScrollToTopButton />

      {/* Public Footer */}
      <ScrollReveal
        animation="fade-up"
        duration={600}
        delay={100}
        className="w-full max-w-7xl mx-auto bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-sm border border-white/80 transition-all duration-300 hover:shadow-md"
      >
        <PublicFooter />
      </ScrollReveal>
    </div>
  );
}
