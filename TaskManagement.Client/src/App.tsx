import { useEffect, useState, type FormEvent } from 'react';

import api from './services/api';

const navigationItems = [
  { label: 'Dashboard', href: '#dashboard', active: true },
  { label: 'Tasks', href: '#tasks', active: false },
];

const metrics = [
  { label: 'Total Tasks', value: '128', accent: 'from-emerald-500/20 to-emerald-400/10' },
  { label: 'In Progress', value: '36', accent: 'from-sky-500/20 to-sky-400/10' },
  { label: 'Completed', value: '82', accent: 'from-violet-500/20 to-violet-400/10' },
];

type LoginFormState = {
  usernameOrEmail: string;
  password: string;
};

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    usernameOrEmail: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setLoginError(null);
    setLoginForm({ usernameOrEmail: '', password: '' });
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const response = await api.post(
        '/auth/login',
        {
          UsernameOrEmail: loginForm.usernameOrEmail,
          Password: loginForm.password,
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      const nextToken = response.data?.token ?? response.data?.Token;

      if (!nextToken) {
        throw new Error('Login response did not include a token.');
      }

      localStorage.setItem('token', nextToken);
      setToken(nextToken);
    } catch {
      setLoginError('Unable to sign in. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/85 p-8 shadow-[0_30px_120px_rgba(2,6,23,0.65)] backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">TaskFlow</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Sign in</h1>
            <p className="mt-2 text-sm text-slate-400">Access your dashboard and task workspace.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleLoginSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Username or Email</span>
              <input
                type="text"
                name="usernameOrEmail"
                value={loginForm.usernameOrEmail}
                onChange={(event) => setLoginForm((current) => ({ ...current, usernameOrEmail: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                placeholder="you@company.com"
                autoComplete="username"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Password</span>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>

            {loginError ? <p className="text-sm text-rose-400">{loginError}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col lg:flex-row">
        <aside className="border-b border-slate-800 bg-slate-900/80 px-4 py-5 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-stretch">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">TaskFlow</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-400">Operations overview</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-right lg:mt-6">
              <p className="text-sm font-medium text-white">Imran Tahir</p>
              <p className="text-xs text-slate-400">Product Manager</p>
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible lg:pb-0">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex min-w-36 items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                  item.active
                    ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 px-5 py-4 shadow-[0_20px_80px_rgba(2,6,23,0.35)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">Welcome back</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Main Dashboard</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 font-semibold text-slate-950">
                  IT
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Imran Tahir</p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-500/40 hover:bg-slate-700 hover:text-white"
              >
                Logout
              </button>
            </div>
          </header>

          <section id="dashboard" className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Workspace Overview</h3>
              <p className="mt-1 text-sm text-slate-400">
                Snapshot metrics for the current task pipeline and team progress.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className={`rounded-3xl border border-slate-800 bg-gradient-to-br ${metric.accent} p-5 shadow-[0_20px_60px_rgba(2,6,23,0.25)]`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-300">{metric.label}</p>
                      <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{metric.value}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
                      Live
                    </span>
                  </div>
                  <div className="mt-6 h-2 rounded-full bg-slate-800/80">
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400" />
                  </div>
                </article>
              ))}
            </div>

            <div
              id="tasks"
              className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-slate-400"
            >
              Placeholder workspace area for task boards, charts, or tables.
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;