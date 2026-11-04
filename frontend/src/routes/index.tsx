import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ClipboardCheck, GraduationCap, Receipt, Sparkles, UserPlus } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/PublicHeader";
import { ScrollReveal, ScrollToTopButton } from "@/components/ScrollReveal";
import { btn } from "@/components/ui-kit";
import { departments, plans } from "@/lib/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assessly — Prepare Smart. Succeed Confidently." },
      { name: "description", content: "Department-based exam practice and self-assessment. Start with five free questions." },
      { property: "og:title", content: "Assessly — Prepare Smart. Succeed Confidently." },
      { property: "og:description", content: "Practice real exam questions for your department. Five free questions to start." },
    ],
  }),
  component: Index,
});

const steps = [
  { icon: UserPlus, title: "Create an account", text: "Register and choose your department. Your content is ready immediately." },
  { icon: ClipboardCheck, title: "Try five free questions", text: "Answer five questions at no cost to see how the platform works." },
  { icon: Receipt, title: "Pay and upload receipt", text: "Pay via Telebirr or bank transfer, then upload your receipt for review." },
  { icon: GraduationCap, title: "Practice and take exams", text: "After approval, get full access to questions, mock exams and resources." },
];

const faqs: [string, string][] = [
  ["How many free questions do I get?", "Every new student account receives five free questions. No payment is needed to try them."],
  ["How do I pay?", "Pay through Telebirr or a bank transfer to the account shown on the Payments page, then upload a photo or PDF of your receipt with the transaction reference."],
  ["How long does approval take?", "An administrator reviews receipts manually, usually within 24 hours. Your access is activated as soon as your payment is approved."],
  ["Can I study more than one department?", "Yes. The Annual plan includes two departments, or you can purchase a separate plan for each department."],
  ["What happens if my payment is rejected?", "You will see the reason on your Payments page. You can upload a corrected receipt at any time."],
];

function Index() {
  return (
    <div className="relative overflow-hidden selection:bg-brand/10 selection:text-brand">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-card">
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24">
          <ScrollReveal animation="fade-down" delay={50}>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand transition-all hover:bg-brand/10">
              <Sparkles className="size-3.5" />
              <span>Online examination & self-assessment</span>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={150}>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-primary md:text-5xl lg:text-6xl leading-[1.12]">
              Prepare Smart. <br />
              Succeed Confidently.
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={250}>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Practice department-specific questions, sit timed mock exams and track your progress — built for university exit and licensing exams.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={350}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className={`${btn.brand} group shadow-md shadow-brand/15`}>
                <span>Start Practicing</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <a href="#departments" className={btn.outline}>Explore Departments</a>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={450}>
            <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t pt-6">
              {[
                ["8,650+", "Practice questions"],
                ["6", "Departments"],
                ["5", "Free questions"],
              ].map(([v, l], i) => (
                <div
                  key={l}
                  className="transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <dt className="text-sm text-muted-foreground">{l}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">Steps</span>
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          </div>
        </ScrollReveal>

        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <ScrollReveal
              key={s.title}
              as="li"
              animation="fade-up"
              delay={i * 120}
              className="group relative rounded-xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand/40"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand transition-colors duration-200 group-hover:bg-brand group-hover:text-white">
                  <s.icon className="size-4.5" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold text-foreground group-hover:text-brand transition-colors duration-200">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </ScrollReveal>
          ))}
        </ol>
      </section>

      {/* Available Departments Section */}
      <section id="departments" className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <ScrollReveal animation="fade-up">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">Curriculum</span>
              <h2 className="text-2xl font-semibold tracking-tight">Available departments</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive question banks tailored to university department syllabi.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {departments.map((d, i) => (
              <ScrollReveal
                key={d.code}
                animation="scale-in"
                delay={i * 80}
                className="group rounded-xl border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-brand/50 hover:bg-card"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                    {d.name}
                  </h3>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                    {d.code}
                  </span>
                </div>
                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span>{d.questions.toLocaleString()} questions</span>
                  <span>·</span>
                  <span>{d.resources} resources</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">Affordable Plans</span>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Pricing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Prices in Ethiopian Birr. Access is activated promptly after an administrator approves your payment receipt.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <ScrollReveal
              key={p.id}
              animation="fade-up"
              delay={i * 120}
              className={`relative flex flex-col justify-between rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                p.popular
                  ? "border-brand ring-2 ring-brand/30 shadow-lg shadow-brand/5"
                  : "hover:border-foreground/20 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  {p.popular && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-white shadow-xs">
                      <Sparkles className="size-3" /> Most chosen
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    {p.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">ETB / {p.period}</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="size-4 shrink-0 text-success mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/register"
                className={`${p.popular ? btn.brand : btn.outline} mt-8 w-full shadow-xs`}
              >
                Get started
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="border-t bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_2fr]">
          <ScrollReveal animation="fade-right">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">Help & Answers</span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Everything you need to know about starting out, trials, and payment verification.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={100}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map(([q, a]) => (
                <AccordionItem key={q} value={q} className="border-b transition-colors duration-150">
                  <AccordionTrigger className="text-left font-medium hover:text-brand transition-colors py-4">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
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

      <PublicFooter />
    </div>
  );
}
