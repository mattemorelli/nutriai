import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Landing from './Landing.jsx';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [pannello, setPannello] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCaricamento(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const valore = {
    session,
    user: session?.user ?? null,
    userId: session?.user?.id ?? null,
    token: session?.access_token ?? null,
    logout: () => supabase.auth.signOut(),
  };

  if (caricamento) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2f7f1]">
        <div className="flex items-end gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className="auth-bar w-1.5 rounded-full bg-emerald-800/30"
              style={{ height: `${14 + ((i * 7) % 18)}px`, animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Landing onSignIn={() => setPannello(true)} />
        {pannello && <PannelloAccesso onClose={() => setPannello(false)} />}
      </>
    );
  }

  return <AuthContext.Provider value={valore}>{children}</AuthContext.Provider>;
}

function Campo({ label, type, value, onChange, onEnter, placeholder, coda }) {
  return (
    <div className="group">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400 transition-colors group-focus-within:text-emerald-800">
          {label}
        </label>
        {coda}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        placeholder={placeholder}
        className="mt-1.5 w-full border-b-2 border-stone-200 bg-transparent pb-2 text-[17px] text-stone-900 outline-none transition-colors duration-300 placeholder:text-stone-300 focus:border-emerald-800"
      />
    </div>
  );
}

function PannelloAccesso({ onClose }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostraPwd, setMostraPwd] = useState(false);
  const [consenso, setConsenso] = useState(false);
  const [errore, setErrore] = useState('');
  const [attesa, setAttesa] = useState(false);

  const registrazione = modo === 'signup';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function invia() {
    setErrore('');
    if (!email || !password) return setErrore('Enter your email and password.');
    if (registrazione && password.length < 8) return setErrore('Password must be at least 8 characters.');
    if (registrazione && !consenso) return setErrore('Accept the health data notice to continue.');

    setAttesa(true);
    try {
      if (registrazione) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session && data.user) {
          await supabase
            .from('users')
            .update({ consent_health: true, consent_at: new Date().toISOString() })
            .eq('id', data.user.id);
        } else {
          setErrore('Check your inbox to confirm your address.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setErrore(e.message || 'Something went wrong. Try again.');
    } finally {
      setAttesa(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10">
      <div
        className="absolute inset-0 bg-emerald-950/25 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="auth-rise relative w-full max-w-[400px] rounded-[1.75rem] border border-emerald-900/10 bg-[#f7faf6] p-9 shadow-[0_30px_80px_-30px_rgba(6,78,59,0.5)]">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-stone-300 transition-colors hover:text-stone-600"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-6 flex items-end gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={`${modo}-${i}`}
              className="auth-bar w-1.5 rounded-full bg-emerald-800"
              style={{
                height: `${registrazione ? 10 + i * 3 : 14 + ((i * 7) % 16)}px`,
                opacity: 0.25 + i * 0.1,
                animationDelay: `${80 + i * 60}ms`,
              }}
            />
          ))}
        </div>

        <h2
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-[30px] leading-[1.1] tracking-tight"
        >
          {registrazione ? (
            <>Seven dinners,<span className="block italic text-emerald-800">already decided.</span></>
          ) : (
            <>Your week is<span className="block italic text-emerald-800">still waiting.</span></>
          )}
        </h2>

        <div className="mt-7 space-y-6">
          <Campo
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            onEnter={invia}
            placeholder="you@example.com"
          />
          <Campo
            label="Password"
            type={mostraPwd ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            onEnter={invia}
            placeholder={registrazione ? 'At least 8 characters' : '••••••••'}
            coda={
              <button
                type="button"
                onClick={() => setMostraPwd(!mostraPwd)}
                className="text-[11px] font-medium uppercase tracking-[0.1em] text-stone-400 transition-colors hover:text-emerald-800"
              >
                {mostraPwd ? 'Hide' : 'Show'}
              </button>
            }
          />
        </div>

        {registrazione && (
          <label className="mt-6 flex cursor-pointer gap-3 text-[13px] leading-relaxed text-stone-500">
            <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={consenso}
                onChange={(e) => setConsenso(e.target.checked)}
                className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[5px] border-2 border-stone-300 transition-colors checked:border-emerald-800 checked:bg-emerald-800"
              />
              <svg
                className="pointer-events-none absolute h-3 w-3 scale-0 text-white transition-transform duration-200 peer-checked:scale-100"
                viewBox="0 0 12 12" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M2 6.5L4.5 9L10 3" />
              </svg>
            </span>
            <span>NutriAI can use the height, weight and goals I enter to build my plans.</span>
          </label>
        )}

        {errore && (
          <p key={errore} className="auth-error mt-6 border-l-2 border-amber-700 bg-amber-50/80 py-2.5 pl-3 pr-3 text-[13px] leading-relaxed text-amber-900">
            {errore}
          </p>
        )}

        <button
          onClick={invia}
          disabled={attesa}
          className="group mt-8 w-full rounded-full bg-emerald-900 px-7 py-4 text-[15px] font-medium text-white shadow-[0_6px_20px_-8px_rgba(6,78,59,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-[0_12px_28px_-10px_rgba(6,78,59,0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 active:translate-y-0 active:scale-[0.985] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
        >
          <span className="flex items-center justify-center gap-2.5">
            {attesa && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            {attesa
              ? registrazione ? 'Creating your account' : 'Signing you in'
              : registrazione ? 'Create account' : 'Sign in'}
            {!attesa && <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
          </span>
        </button>

        <p className="mt-6 text-center text-[14px] text-stone-500">
          {registrazione ? 'Already have an account?' : 'New here?'}{' '}
          <button
            onClick={() => { setModo(registrazione ? 'login' : 'signup'); setErrore(''); }}
            className="font-medium text-emerald-800 underline decoration-emerald-800/40 decoration-2 underline-offset-4 transition-colors hover:text-emerald-950 hover:decoration-emerald-950"
          >
            {registrazione ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
}