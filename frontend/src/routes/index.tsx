import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ClipboardCheck, GraduationCap, Receipt, UserPlus } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/PublicHeader";
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
    <div>
      <PublicHeader />

      <section className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <p className="text-sm font-medium text-brand">Online examination & self-assessment</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-primary md:text-5xl">
            Prepare Smart. Succeed Confidently.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Practice department-specific questions, sit timed mock exams and track your progress — built for university exit and licensing exams.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className={btn.primary}>Start Practicing <ArrowRight className="size-4" /></Link>
            <a href="#departments" className={btn.outline}>Explore Departments</a>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t pt-6">
            {[["8,650+", "Practice questions"], ["6", "Departments"], ["5", "Free questions"]].map(([v, l]) => (
              <div key={l}><dt className="text-sm text-muted-foreground">{l}</dt><dd className="mt-1 text-2xl font-semibold">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title}>
              <div className="flex items-center gap-3">
                <s.icon className="size-5 text-brand" />
                <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="departments" className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Available departments</h2>
          <div className="mt-8 grid border-l border-t md:grid-cols-3">
            {departments.map((d) => (
              <div key={d.code} className="border-b border-r p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{d.name}</h3>
                  <span className="text-xs font-medium text-muted-foreground">{d.code}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{d.desc}</p>
                <p className="mt-4 text-xs text-muted-foreground">{d.questions.toLocaleString()} questions · {d.resources} resources</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
        <p className="mt-2 text-sm text-muted-foreground">Prices in Ethiopian Birr. Access is activated after an administrator approves your payment.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className={`rounded-lg border bg-card p-6 ${p.popular ? "border-brand ring-1 ring-brand" : ""}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                {p.popular && <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-brand">Most chosen</span>}
              </div>
              <p className="mt-4"><span className="text-3xl font-semibold">{p.price.toLocaleString()}</span> <span className="text-sm text-muted-foreground">ETB / {p.period}</span></p>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="size-4 text-success" />{f}</li>)}
              </ul>
              <Link to="/register" className={`${p.popular ? btn.primary : btn.outline} mt-6 w-full`}>Get started</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_2fr]">
          <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
          <Accordion type="single" collapsible>
            {faqs.map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
