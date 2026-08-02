import { useState, useEffect } from "react";
import { useAuth } from "./auth.jsx";
import { SLOT_EN, SAT_BUDGET, FIBRE_TARGET, SALT_BUDGET, transformDay } from "./nutrition.js";

const API = `http://${window.location.hostname}:3000`;

function barraColore(v) {
  if (v >= 8) return "bg-emerald-700";
  if (v >= 6) return "bg-lime-600";
  return "bg-amber-600";
}

function Riassunto({ week }) {
  const media = week.reduce((s, d) => s + d.health, 0) / week.length;
  const tempo = Math.round(week.reduce((s, d) => s + (d.time || 0), 0) / week.length);
  const kcal = Math.round(week.reduce((s, d) => s + (d.kcal || 0), 0) / week.length);

  const voci = [
    { k: "Average health score", v: media.toFixed(1), suf: "/10" },
    { k: "Typical time to cook", v: tempo, suf: "min" },
    { k: "Average per main", v: kcal, suf: "kcal" },
  ];

  return (
    <div className="fade-up grid gap-px overflow-hidden rounded-2xl bg-emerald-900/10 sm:grid-cols-3" style={{ animationDelay: "0.1s" }}>
      {voci.map((v) => (
        <div key={v.k} className="bg-[#f7faf6] px-6 py-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-stone-400">{v.k}</p>
          <p className="mt-1.5 flex items-baseline gap-1">
            <span style={{ fontFamily: "'Fraunces', serif" }} className="text-[30px] leading-none tabular-nums">
              {v.v}
            </span>
            <span className="text-[13px] text-stone-400">{v.suf}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function Giorno({ d, open, onToggle, i }) {
  const rows = [
    { label: "Calories", value: `${d.kcal} kcal` },
    { label: "Saturated fat", value: `${d.saturi_g} g`, flag: d.saturi_g > SAT_BUDGET },
    { label: "Fibre", value: `${d.fibra_g} g`, flag: d.fibra_g < FIBRE_TARGET },
    { label: "Salt", value: `${d.sale_g} g`, flag: d.sale_g > SALT_BUDGET },
  ];

  return (
    <div className="fade-up border-b border-emerald-900/10 last:border-0" style={{ animationDelay: `${0.15 + i * 0.06}s` }}>
      <button
        onClick={onToggle}
        className="group flex w-full items-center gap-5 py-5 text-left transition-colors duration-300 hover:bg-white/50"
      >
        <span className="w-10 shrink-0 text-[11px] uppercase tracking-[0.16em] text-stone-400">
          {d.day}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[17px] leading-snug">{d.dish}</span>
          <span className="mt-1 flex items-center gap-2.5 text-[12px] text-stone-400">
            <span>{SLOT_EN[d.slot] || d.slot}</span>
            {d.time != null && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-stone-300" />
                <span className="tabular-nums">{d.time} min</span>
              </>
            )}
          </span>
        </span>

        <span className="hidden w-28 shrink-0 sm:block">
          <span className="block h-1 overflow-hidden rounded-full bg-stone-200/70">
            <span
              className={`fill-bar block h-full rounded-full ${barraColore(d.health)}`}
              style={{ "--fill": d.health / 10, width: "100%", animationDelay: `${0.4 + i * 0.06}s` }}
            />
          </span>
        </span>

        <span className="w-12 shrink-0 text-right text-[15px] font-semibold tabular-nums text-emerald-900">
          {d.health.toFixed(1)}
        </span>

        <span className={`shrink-0 text-stone-300 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "rotate-90" : ""}`}>
          ›
        </span>
      </button>

      <div
        className="grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="grid gap-8 pb-8 pl-15 pr-2 lg:grid-cols-[1fr_1.1fr]">

            <div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {rows.map((r) => (
                  <div key={r.label}>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">{r.label}</p>
                    <p className={`mt-0.5 text-[16px] font-medium tabular-nums ${r.flag ? "text-amber-700" : "text-stone-800"}`}>
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-l-2 border-amber-600/50 pl-4">
                <p className="text-[13px] leading-relaxed text-stone-600">{d.why}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-stone-400">
                  CREA / EFSA / WHO daily guidance
                </p>
              </div>
            </div>

            <div>
              {d.recipe && d.recipe.length > 0 ? (
                <>
                  {!d.translated && (
                    <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-amber-700">
                      Translation pending
                    </p>
                  )}
                  <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">Recipe</p>
                  <ol className="mt-3 space-y-3">
                    {d.recipe.map((step, n) => (
                      <li key={n} className="flex gap-3.5 text-[14px] leading-relaxed text-stone-600">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold tabular-nums text-emerald-900">
                          {n + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="text-[13px] italic text-stone-400">No recipe steps stored yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, token, logout } = useAuth();
  const [openDay, setOpenDay] = useState(null);
  const [week, setWeek] = useState(null);
  const [stato, setStato] = useState("carico");

  useEffect(() => {
    if (!token) return;
    let annullato = false;

    async function carica() {
      setStato("carico");
      const auth = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const r1 = await fetch(`${API}/piano-corrente`, auth);

        if (r1.status === 401) {
          if (!annullato) setStato("scaduto");
          return;
        }
        if (r1.status === 404) {
          if (!annullato) setStato("vuoto");
          return;
        }
        if (!r1.ok) throw new Error("lookup failed");

        const { plan_id } = await r1.json();

        const r2 = await fetch(`${API}/piano/${plan_id}`, auth);
        if (r2.status === 401) {
          if (!annullato) setStato("scaduto");
          return;
        }
        if (!r2.ok) throw new Error("plan not found");
        const data = await r2.json();

        if (annullato) return;
        setWeek(data.map(transformDay));
        setStato("pronto");
      } catch {
        if (!annullato) setStato("errore");
      }
    }

    carica();
    return () => { annullato = true; };
  }, [token]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f2f7f1] text-stone-900 selection:bg-emerald-200">

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(#16a34a 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed -left-56 -top-52 h-[38rem] w-[38rem] rounded-full bg-emerald-300/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none fixed -right-64 top-[26rem] h-[36rem] w-[36rem] rounded-full bg-lime-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6">

        <header className="flex items-center justify-between border-b border-emerald-900/10 py-6">
          <span className="text-[13px] font-semibold uppercase tracking-[0.22em]">NutriAI</span>
          <div className="flex items-center gap-5">
            <span className="hidden text-[13px] text-stone-400 sm:inline">{user?.email}</span>
            <button
              onClick={logout}
              className="rounded-full border border-emerald-900/15 bg-white/50 px-4 py-1.5 text-[13px] text-emerald-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-900/40 hover:bg-white active:translate-y-0"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="pb-16 pt-14">
          <div className="fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800">
              Your week
            </p>
            <h1
              style={{ fontFamily: "'Fraunces', serif" }}
              className="mt-4 text-[46px] leading-[1.04] tracking-tight sm:text-[56px]"
            >
              Dinner is
              <span className="italic text-emerald-800"> already decided.</span>
            </h1>
          </div>

          {stato === "pronto" && week && (
            <>
              <div className="mt-10">
                <Riassunto week={week} />
              </div>

              <div className="fade-up mt-10 overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-white/70 px-7 backdrop-blur-sm" style={{ animationDelay: "0.12s" }}>
                {week.map((d, i) => (
                  <Giorno
                    key={d.day}
                    d={d}
                    i={i}
                    open={openDay === d.day}
                    onToggle={() => setOpenDay(openDay === d.day ? null : d.day)}
                  />
                ))}
              </div>

              <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-stone-400">
                Health scores come from the real saturated fat, fibre and salt in each dish,
                measured against reference budgets derived from WHO / EFSA / CREA daily
                guidance. Your personal calorie target isn't part of the score yet.
              </p>
            </>
          )}

          {stato === "carico" && (
            <div className="mt-16 flex items-end gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className="auth-bar w-1.5 rounded-full bg-emerald-800/25"
                  style={{ height: `${14 + ((i * 7) % 18)}px`, animationDelay: `${i * 90}ms` }}
                />
              ))}
            </div>
          )}

          {stato === "vuoto" && (
            <div className="fade-up mt-12 rounded-[1.75rem] border border-emerald-900/10 bg-white/70 p-10 backdrop-blur-sm">
              <p style={{ fontFamily: "'Fraunces', serif" }} className="text-[26px] leading-snug">
                Nothing planned yet.
              </p>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone-500">
                Once a week is generated for this account, your seven dinners land here —
                with the recipe and the numbers behind each score.
              </p>
            </div>
          )}

          {stato === "scaduto" && (
            <div className="fade-up mt-12 rounded-[1.75rem] border border-emerald-900/10 bg-white/70 p-10 backdrop-blur-sm">
              <p style={{ fontFamily: "'Fraunces', serif" }} className="text-[26px] leading-snug">
                Your session ended.
              </p>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone-500">
                Sign in again to see your week.
              </p>
              <button
                onClick={logout}
                className="group mt-6 rounded-full bg-emerald-900 px-7 py-3.5 font-medium text-white shadow-[0_6px_20px_-8px_rgba(6,78,59,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 active:scale-[0.985]"
              >
                <span className="flex items-center gap-2">
                  Sign in again
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </button>
            </div>
          )}

          {stato === "errore" && (
            <div className="fade-up mt-12 rounded-[1.75rem] border border-amber-700/20 bg-amber-50/60 p-10">
              <p style={{ fontFamily: "'Fraunces', serif" }} className="text-[26px] leading-snug text-amber-950">
                The plan didn't load.
              </p>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-amber-900/70">
                The backend isn't answering. Start it with <code className="rounded bg-amber-100 px-1.5 py-0.5 text-[13px]">node server.js</code> and reload.
              </p>
            </div>
          )}
        </section>

        <footer className="border-t border-emerald-900/10 py-8 text-[12px] text-stone-400">
          Not medical advice. For that, talk to a doctor or a dietitian.
        </footer>
      </div>
    </div>
  );
}