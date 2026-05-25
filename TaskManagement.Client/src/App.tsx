import { useEffect, useState, type FormEvent } from 'react';

import api from './services/api';

const navigationItems = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Tasks', value: 'tasks' },
] as const;

const metricCards = [
  { label: 'Total Tasks', accent: 'from-emerald-500/20 to-emerald-400/10' },
  { label: 'Completed Tasks', accent: 'from-sky-500/20 to-sky-400/10' },
  { label: 'Pending Tasks', accent: 'from-violet-500/20 to-violet-400/10' },
];

type LoginFormState = {
  usernameOrEmail: string;
  password: string;
};

type RegisterFormState = {
  username: string;
  email: string;
  password: string;
};

type ViewState = (typeof navigationItems)[number]['value'];

type TaskItem = {
  id: number;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  Priority?: TaskPriority;
  isCompleted: boolean;
  createdAtUtc?: string;
  userId?: string;
  assignedUserId?: string;
};

type TaskPriority = 'High' | 'Medium' | 'Low';

type AuthMeResponse = {
  userId?: string;
  username?: string;
  role?: string;
};

type UserListItem = {
  id: string;
  username: string;
  role: string;
};

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    usernameOrEmail: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    username: '',
    email: '',
    password: '',
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token || userRole) {
      return;
    }

    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await api.get<AuthMeResponse>('/auth/me');
        if (isMounted) {
          setUserRole(response.data?.role ?? null);
          setCurrentUsername(response.data?.username ?? '');
          setCurrentUserId(response.data?.userId ?? '');
        }
      } catch {
        if (isMounted) {
          setUserRole(null);
          setCurrentUsername('');
          setCurrentUserId('');
        }
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token, userRole]);

  useEffect(() => {
    if (!token) {
      return;
    }

    void fetchTasks();
  }, [token]);

  useEffect(() => {
    if (!token || userRole !== 'Admin') {
      return;
    }

    let isMounted = true;

    const loadUsers = async () => {
      try {
        const response = await api.get<UserListItem[]>('/users');
        const loadedUsers = Array.isArray(response.data) ? response.data : [];

        if (isMounted) {
          setUsers(loadedUsers);
          setAssignedUserId((current) => current || loadedUsers[0]?.id || '');
        }
      } catch {
        if (isMounted) {
          setUsers([]);
          setAssignedUserId('');
        }
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [token, userRole]);

  useEffect(() => {
    if (!token || currentView !== 'tasks') {
      return;
    }

    void fetchTasks();
  }, [currentView, token]);

  const fetchTasks = async () => {
    setIsTasksLoading(true);

    try {
      const response = await api.get<TaskItem[]>('/tasks');
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch {
      setTasks([]);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newTitle.trim()) {
      return;
    }

    const taskOwnerId = userRole === 'Admin' ? assignedUserId : currentUserId;
    if (!taskOwnerId) {
      return;
    }

    setIsCreatingTask(true);

    try {
      await api.post('/tasks', {
        Title: newTitle.trim(),
        Description: newDescription.trim(),
        IsCompleted: false,
        AssignedUserId: taskOwnerId,
        Priority: newPriority,
      });

      setNewTitle('');
      setNewDescription('');
      await fetchTasks();
    } catch {
      // Keep the UI quiet for now; the task grid remains unchanged on failure.
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleComplete = async (task: TaskItem) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        Title: task.title,
        Description: task.description ?? '',
        IsCompleted: !task.isCompleted,
      });

      await fetchTasks();
    } catch {
      // Keep the UI quiet; authorization and ownership are enforced by the API.
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchTasks();
    } catch {
      // Keep the UI quiet; authorization and ownership are enforced by the API.
    }
  };

  const getPriorityMeta = (task: TaskItem) => {
    const rawPriority = task.priority ?? task.Priority;

    if (rawPriority === 'High') {
      return {
        label: 'High' as TaskPriority,
        className: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30',
      };
    }

    if (rawPriority === 'Low') {
      return {
        label: 'Low' as TaskPriority,
        className: 'bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/30',
      };
    }

    if (rawPriority === 'Medium') {
      return {
        label: 'Medium' as TaskPriority,
        className: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30',
      };
    }

    const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase();

    if (haystack.includes('high') || haystack.includes('urgent') || haystack.includes('critical')) {
      return {
        label: 'High' as TaskPriority,
        className: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30',
      };
    }

    if (haystack.includes('low') || haystack.includes('minor') || haystack.includes('later')) {
      return {
        label: 'Low' as TaskPriority,
        className: 'bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/30',
      };
    }

    return {
      label: 'Medium' as TaskPriority,
      className: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30',
    };
  };

  const getStatusMeta = (task: TaskItem) => {
    if (task.isCompleted) {
      return {
        label: 'Completed',
        className: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30',
      };
    }

    return {
      label: 'In Progress',
      className: 'bg-slate-700/60 text-slate-200 ring-1 ring-inset ring-slate-600/70',
    };
  };

  const getAssigneeLabel = (task: TaskItem) => {
    const assigneeId = task.userId ?? task.assignedUserId;

    if (!assigneeId) {
      return 'Unassigned';
    }

    const matchedUser = users.find((user) => user.id === assigneeId);
    if (matchedUser) {
      return matchedUser.username;
    }

    if (assigneeId === currentUserId && currentUsername) {
      return currentUsername;
    }

    return assigneeId;
  };

  const completedTaskCount = tasks.filter((task) => task.isCompleted).length;
  const pendingTaskCount = tasks.length - completedTaskCount;
  const dashboardMetrics = [
    { label: metricCards[0].label, value: tasks.length, accent: metricCards[0].accent },
    { label: metricCards[1].label, value: completedTaskCount, accent: metricCards[1].accent },
    { label: metricCards[2].label, value: pendingTaskCount, accent: metricCards[2].accent },
  ];

  const isAdmin = userRole === 'Admin';
  const createTaskForm = isAdmin ? (
    <form
      onSubmit={handleCreateTask}
      className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.25)]"
    >
      <div className="grid gap-3 xl:grid-cols-[1.1fr_1.2fr_1fr_1fr_auto] xl:items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">New task title</label>
          <input
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Enter task title"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
            required
          />
        </div>

        <div className="flex-[1.5]">
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Description</label>
          <input
            type="text"
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
            placeholder="Short task description"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Assign to</label>
          <select
            value={assignedUserId}
            onChange={(event) => setAssignedUserId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
            required
          >
            <option value="" disabled>
              Select a team member
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Priority</label>
          <select
            value={newPriority}
            onChange={(event) => setNewPriority(event.target.value as 'Low' | 'Medium' | 'High')}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isCreatingTask}
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 xl:min-w-36"
        >
          {isCreatingTask ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  ) : (
    <form
      onSubmit={handleCreateTask}
      className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.25)]"
    >
      <div className="grid gap-3 xl:grid-cols-[1.3fr_1.7fr_1fr_auto] xl:items-end">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">New task title</label>
          <input
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Enter task title"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Description</label>
          <input
            type="text"
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
            placeholder="Short task description"
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Priority</label>
          <select
            value={newPriority}
            onChange={(event) => setNewPriority(event.target.value as 'Low' | 'Medium' | 'High')}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isCreatingTask}
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 xl:min-w-36"
        >
          {isCreatingTask ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserRole(null);
    setCurrentUsername('');
    setCurrentUserId('');
    setUsers([]);
    setCurrentView('dashboard');
    setAuthMode('login');
    setTasks([]);
    setIsTasksLoading(false);
    setNewTitle('');
    setNewDescription('');
    setAssignedUserId('');
    setNewPriority('Medium');
    setIsCreatingTask(false);
    setLoginError(null);
    setRegisterError(null);
    setLoginForm({ usernameOrEmail: '', password: '' });
    setRegisterForm({ username: '', email: '', password: '' });
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
      setUserRole(response.data?.role ?? response.data?.Role ?? null);
      setCurrentUsername(response.data?.username ?? response.data?.Username ?? loginForm.usernameOrEmail);
      setCurrentUserId(response.data?.userId ?? response.data?.UserId ?? '');
      setCurrentView('dashboard');
      setAuthMode('login');
    } catch {
      setLoginError('Unable to sign in. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRegistering(true);
    setRegisterError(null);

    try {
      await api.post('/auth/register', {
        Username: registerForm.username,
        Email: registerForm.email,
        Password: registerForm.password,
      });

      setRegisterForm({ username: '', email: '', password: '' });
      setLoginForm({ usernameOrEmail: registerForm.username, password: '' });
      setAuthMode('login');
    } catch {
      setRegisterError('Unable to create your account. Please check the details and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/85 p-8 shadow-[0_30px_120px_rgba(2,6,23,0.65)] backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">TaskFlow</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              {authMode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {authMode === 'login'
                ? 'Access your dashboard and task workspace.'
                : 'Create an account to start managing your tasks.'}
            </p>
          </div>

          {authMode === 'login' ? (
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

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setLoginError(null);
                }}
                className="w-full text-sm text-slate-400 transition hover:text-emerald-300"
              >
                Don&apos;t have an account? Sign up
              </button>
            </form>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleRegister}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Username</span>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, username: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Email</span>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Password</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                />
              </label>

              {registerError ? <p className="text-sm text-rose-400">{registerError}</p> : null}

              <button
                type="submit"
                disabled={isRegistering}
                className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRegistering ? 'Creating account...' : 'Sign up'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setRegisterError(null);
                }}
                className="w-full text-sm text-slate-400 transition hover:text-emerald-300"
              >
                Already have an account? Sign in
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col md:h-screen md:overflow-hidden lg:flex-row">
        <aside className="border-b border-slate-800 bg-slate-900/80 px-4 py-5 backdrop-blur md:sticky md:top-0 md:h-screen md:shrink-0 lg:w-72 lg:border-b-0 lg:border-r">
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
            {navigationItems.map((item) => {
              const isActive = currentView === item.value;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setCurrentView(item.value)}
                  className={`flex min-w-36 items-center rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:h-screen md:overflow-y-auto lg:p-8">
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
                    <p className="text-sm font-medium text-white">
                      {currentUsername ? `${currentUsername} - ${userRole ?? 'Member'}` : `Signed In User - ${userRole ?? 'Member'}`}
                    </p>
                    <p className="text-xs text-slate-400">{currentUserId ? `ID: ${currentUserId}` : 'Profile loaded from auth state'}</p>
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

          <section className="mt-6 space-y-6">
            {currentView === 'dashboard' ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-white">Workspace Overview</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Snapshot metrics for the current task pipeline and team progress.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {dashboardMetrics.map((metric) => (
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
              </>
            ) : (
              <>
                {createTaskForm}

                {isTasksLoading || tasks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-300 shadow-[0_20px_60px_rgba(2,6,23,0.25)]">
                    <p className="text-lg font-semibold text-white">
                      {isTasksLoading ? 'Loading tasks...' : 'No tasks available yet.'}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {isTasksLoading
                        ? 'Fetching the latest tasks from the API.'
                        : 'Create a task to see it appear in this workspace.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {tasks.map((task) => {
                      const priority = getPriorityMeta(task);
                      const status = getStatusMeta(task);

                      return (
                        <article
                          key={task.id}
                          className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.25)] backdrop-blur transition hover:border-emerald-500/30"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <label className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 text-emerald-400 transition hover:border-emerald-500 hover:bg-emerald-500/10">
                                <input
                                  type="checkbox"
                                  checked={task.isCompleted}
                                  onChange={() => void handleToggleComplete(task)}
                                  className="sr-only"
                                />
                                <span
                                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-full transition ${
                                    task.isCompleted ? 'bg-emerald-400' : 'bg-slate-600'
                                  }`}
                                />
                              </label>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Task #{task.id}</p>
                                <h3 className="mt-2 text-xl font-semibold text-white">{task.title}</h3>
                                <p className="mt-2 text-xs text-slate-400">
                                  👤 Assignee: {getAssigneeLabel(task)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                                {status.label}
                              </span>
                              {isAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteTask(task.id)}
                                  className="rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-400/40 hover:bg-rose-500/20 hover:text-rose-200"
                                >
                                  Delete
                                </button>
                              ) : null}
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-6 text-slate-400">
                            {task.description?.trim() ? task.description : 'No description provided.'}
                          </p>

                          <div className="mt-6 flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priority.className}`}>
                              Priority: {priority.label}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                              Status: {status.label}
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;