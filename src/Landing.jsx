import { useState } from "react";

const FORMSPREE_URL = "https://formspree.io/f/xrenjwlb";

const esempio = [
  { day: "Mon", dish: "Barley with courgette and mint", score: 8.4 },
  { day: "Tue", dish: "Baked sea bream with fennel", score: 9.1 },
  { day: "Wed", dish: "Chickpea and rosemary stew", score: 8.8 },
  { day: "Thu", dish: "Herb-roasted chicken breast", score: 7.9 },
  { day: "Fri", dish: "Farro salad with tomatoes", score: 8.6 },
  { day: "Sat", dish: "Turkey with leeks", score: 8.2 },
  { day: "Sun", dish: "Lentil soup with chard", score: 9.3 },
];

const benefits = [
  {
    label: "Your body",
    title: "Your numbers, not someone's average",
    body: "Calories and protein worked out from your height, weight, age and how much you actually move — not a flat 2,000 a day that fits nobody in particular.",
  },
  {
    label: "Your city",
    title: "What's in season where you shop",
    body: "In Milan in July, tomatoes and courgettes cost a third of what they do in January. NutriAI plans around what's good and cheap right now, where you are.",
  },
  {
    label: "Your fridge",
    title: "Starts with what you've already got",
    body: "Half a cabbage and two eggs sitting there? Those go in first. Smaller shop, less thrown away, and a Thursday that quietly finishes Tuesday.",
  },
];

const steps = [
  { n: "01", title: "Answer five questions", body: "Your goal, your body, your city, anything you can't eat, and how long you'll really spend cooking on a Tuesday." },
  { n: "02", title: "Your week shows up", body: "Seven dinners, each with a health score, the full recipe, and something to swap it for. Plus a shopping list sorted by aisle." },
  { n: "03", title: "It gets to know you", body: "Tell it what you cooked and what you skipped. Next week leans toward the food you actually make." },
];

function SignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  async function submit() {
    if (!email.includes("@")) return setStatus("invalid");
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-[2rem] bg-emerald-950 p-12 text-center text-white sm:p-16">
        <p style={{ fontFamily: "'Fraunces', serif" }} className="text-4xl italic">
          You're in.
        </p>
        <p className="mx-auto mt-4 max-w-sm leading-relaxed text-emerald-100/80">
          I'll write when the first version is ready — probably with a few questions
          about how you cook.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] bg-emerald-950 text-white shadow-[0_30px_70px_-30px_rgba(6,78,59,0.6)]">
      <div className="grid gap-12 p-10 sm:p-14 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Ten seats
          </p>
          <h2
            style={{ fontFamily: "'Fraunces', serif" }}
            className="mt-5 text-[34px] leading-[1.1] sm:text-[42px]"
          >
            Ten people who are
            <span className="block italic text-emerald-300">tired of deciding.</span>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-emerald-100/70">
            Use it for a month, free, and tell me everything that's wrong with it.
            I'd rather hear it now than after I've built the wrong thing.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="your@email.com"
              className="w-full rounded-full bg-white/10 px-6 py-4 text-white placeholder-emerald-200/40 outline-none ring-1 ring-white/15 transition focus:bg-white/15 focus:ring-white/50 sm:max-w-xs"
            />
            <button
              onClick={submit}
              disabled={status === "sending"}
              className="group rounded-full bg-white px-8 py-4 font-medium text-emerald-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(255,255,255,0.4)] active:translate-y-0 active:scale-[0.985] disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {status === "sending" ? "Sending" : "Take a seat"}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </button>
          </div>

          <p className="mt-4 text-sm text-emerald-200/60">
            {status === "invalid" && "That doesn't look like an email address."}
            {status === "error" && "Something went wrong. Try again in a moment."}
            {status === "idle" && "No spam, no newsletter. One email when it's ready."}
            {status === "sending" && "\u00A0"}
          </p>
        </div>

        <div className="rounded-3xl bg-white/[0.06] p-8 ring-1 ring-white/10">
          <p className="leading-relaxed text-emerald-50/90">
            I'm building this on my own, in Milan, because every Sunday I lost an hour
            staring into the fridge — and every meal planner I tried handed me quinoa
            bowls I was never going to make.
          </p>
          <p className="mt-5 text-sm text-emerald-400">— Matteo, building NutriAI</p>
        </div>
      </div>
    </div>
  );
}

export default function Landing({ onSignIn }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f2f7f1] text-stone-900 selection:bg-emerald-200">

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.14]"
        style={{
          backgroundImage: "radial-gradient(#16a34a 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed -left-52 -top-48 h-[40rem] w-[40rem] rounded-full bg-emerald-300/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none fixed -right-60 top-[30rem] h-[38rem] w-[38rem] rounded-full bg-lime-300/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none fixed bottom-[-14rem] left-1/4 h-[34rem] w-[34rem] rounded-full bg-teal-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">

        <header className="flex items-center justify-between py-7">
          <span className="text-[13px] font-semibold uppercase tracking-[0.22em]">NutriAI</span>
          <button
            onClick={onSignIn}
            className="rounded-full border border-emerald-900/20 bg-white/60 px-5 py-2 text-sm font-medium text-emerald-900 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-900/50 hover:bg-white active:translate-y-0"
          >
            Sign in
          </button>
        </header>

        <section className="grid gap-14 border-t border-emerald-900/10 py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div className="fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800">
              Weekly meal planning
            </p>
            <h1
              style={{ fontFamily: "'Fraunces', serif" }}
              className="mt-6 text-[52px] leading-[1.02] tracking-tight sm:text-[64px]"
            >
              What are you eating this week?
              <span className="mt-1 block italic text-emerald-800">Already decided.</span>
            </h1>
            <p className="mt-7 max-w-md text-[18px] leading-relaxed text-stone-600">
              Seven dinners built around your body, your city and what's already in your
              fridge. Every one comes with the recipe and something to swap it for.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={onSignIn}
                className="group rounded-full bg-emerald-900 px-8 py-4 font-medium text-white shadow-[0_8px_24px_-10px_rgba(6,78,59,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-[0_14px_32px_-12px_rgba(6,78,59,0.8)] active:translate-y-0 active:scale-[0.985]"
              >
                <span className="flex items-center gap-2">
                  Start your week
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </button>
              <a href="#how" className="text-sm text-stone-500 underline decoration-stone-300 underline-offset-4 transition hover:text-emerald-900 hover:decoration-emerald-900">
                See how it works
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-stone-500">
              <span>Free while in beta</span>
              <span className="h-1 w-1 rounded-full bg-emerald-800/30" />
              <span>90 seconds to set up</span>
              <span className="h-1 w-1 rounded-full bg-emerald-800/30" />
              <span>Nothing to install</span>
            </div>
          </div>

          <div className="fade-up rounded-[1.75rem] border border-emerald-900/10 bg-white/85 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_28px_60px_-26px_rgba(6,78,59,0.3)] backdrop-blur-sm" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
              <p className="text-sm font-medium">A week, for example</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-amber-800">health score</p>
            </div>
            <div className="mt-1">
              {esempio.map((d, i) => (
                <div
                  key={d.day}
                  className="fade-up flex items-center gap-4 border-b border-stone-100 py-3.5 last:border-0"
                  style={{ animationDelay: `${0.25 + i * 0.07}s` }}
                >
                  <span className="w-8 shrink-0 text-[11px] uppercase tracking-[0.14em] text-stone-400">
                    {d.day}
                  </span>
                  <span className="flex-1 text-[15px] leading-snug">{d.dish}</span>
                  <span className="shrink-0 text-[13px] font-semibold tabular-nums text-amber-900">
                    {d.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <p className="pt-4 text-[11px] leading-relaxed text-stone-400">
              Scores come from real saturated fat, fibre and salt values, measured against
              WHO / EFSA / CREA daily guidance.
            </p>
          </div>
        </section>

        <section className="grid gap-12 border-t border-emerald-900/10 py-20 sm:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800">
                {b.label}
              </p>
              <h3
                style={{ fontFamily: "'Fraunces', serif" }}
                className="mt-4 text-[22px] leading-snug"
              >
                {b.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-stone-600">{b.body}</p>
            </div>
          ))}
        </section>

        <section id="how" className="border-t border-emerald-900/10 py-20">
          <h2
            style={{ fontFamily: "'Fraunces', serif" }}
            className="max-w-xl text-[34px] leading-[1.12] sm:text-[42px]"
          >
            Ninety seconds now, and
            <span className="italic text-emerald-800"> you're done deciding.</span>
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="border-t-2 border-emerald-900 pt-5">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-emerald-800">
                  {s.n}
                </span>
                <h3 className="mt-3 font-medium">{s.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-stone-600">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <SignupForm />
        </section>

        <footer className="flex flex-col gap-3 border-t border-emerald-900/10 py-10 text-[13px] text-stone-500 sm:flex-row sm:justify-between">
          <span>NutriAI — made in Milan by one person</span>
          <span>Not medical advice. For that, talk to a doctor or a dietitian.</span>
        </footer>
      </div>
    </div>
  );
}