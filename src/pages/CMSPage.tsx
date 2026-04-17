import { useEffect, useRef, useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPage } from '@/pages/AdminPage';
import { UserPage } from '@/pages/UserPage';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

type UserRole = 'admin' | 'user';
type ViewState = 'booting' | 'logged_out' | 'unauthorized' | 'admin' | 'user';

function FullScreenLoading() {
  return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
}

function isValidRole(role: unknown): role is UserRole {
  return role === 'admin' || role === 'user';
}

export default function CMSPage() {
  const language = useLanguage();
  const locale = language?.locale ?? 'vi';

  const [viewState, setViewState] = useState<ViewState>('booting');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);

  function safeSetViewState(next: ViewState) {
    if (!mountedRef.current) return;
    setViewState(next);
  }

  async function getRole(userId: string, requestId: number): Promise<UserRole | null | 'stale'> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return 'stale';
      }

      if (error) {
        console.error('getRole error:', error);
        return null;
      }

      if (!isValidRole(data?.role)) {
        return null;
      }

      return data.role;
    } catch (error) {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return 'stale';
      }

      console.error('getRole unexpected error:', error);
      return null;
    }
  }

  async function syncSession() {
    const requestId = ++requestIdRef.current;

    if (!supabase) {
      safeSetViewState('logged_out');
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();

      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      if (error) {
        console.error('getSession error:', error);
        safeSetViewState('logged_out');
        return;
      }

      const user = data.session?.user;

      if (!user) {
        safeSetViewState('logged_out');
        return;
      }

      const role = await getRole(user.id, requestId);

      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      if (role === 'stale') return;

      if (!role) {
        safeSetViewState('unauthorized');
        return;
      }

      safeSetViewState(role);
    } catch (error) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      console.error('syncSession error:', error);
      safeSetViewState('logged_out');
    }
  }

  async function applySignedInUser(userId: string) {
    const requestId = ++requestIdRef.current;

    safeSetViewState('booting');

    const role = await getRole(userId, requestId);

    if (!mountedRef.current || requestId !== requestIdRef.current) return;
    if (role === 'stale') return;

    if (!role) {
      safeSetViewState('unauthorized');
      return;
    }

    safeSetViewState(role);
  }

  useEffect(() => {
    mountedRef.current = true;

    if (!supabase) {
      safeSetViewState('logged_out');
      return () => {
        mountedRef.current = false;
      };
    }

    const sb = supabase;

    void syncSession();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      try {
        if (event === 'SIGNED_OUT' || !session?.user) {
          safeSetViewState('logged_out');
          return;
        }

        await applySignedInUser(session.user.id);
      } catch (error) {
        if (!mountedRef.current) return;
        console.error('onAuthStateChange error:', error);
        safeSetViewState('logged_out');
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      toast.error(locale === 'vi' ? 'Supabase chưa được cấu hình.' : 'Supabase is not configured.');
      return;
    }

    try {
      setBusy(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!data.user) {
        toast.error(
          locale === 'vi' ? 'Không lấy được thông tin người dùng.' : 'Unable to get user info.',
        );
        safeSetViewState('logged_out');
        return;
      }

      await applySignedInUser(data.user.id);
    } catch (error) {
      console.error('handleLogin error:', error);
      toast.error(locale === 'vi' ? 'Đăng nhập thất bại.' : 'Login failed.');
    } finally {
      if (mountedRef.current) {
        setBusy(false);
      }
    }
  }

  async function handleSignOut() {
    try {
      await supabase?.auth.signOut();

      if (!mountedRef.current) return;

      setPassword('');
      safeSetViewState('logged_out');
    } catch (error) {
      console.error('signOut error:', error);
      toast.error(locale === 'vi' ? 'Đăng xuất thất bại.' : 'Sign out failed.');
    }
  }

  if (viewState === 'booting') {
    return <FullScreenLoading />;
  }

  if (viewState === 'logged_out') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass w-full max-w-md rounded-[2rem] p-8">
          <div className="mb-6 flex items-center gap-3 text-brand-gold">
            <Shield size={22} />
            <div>
              <div className="text-sm uppercase tracking-[0.25em]">Admin</div>
              <div className="text-xl font-semibold text-white">An Đăng CMS</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              inputMode="email"
              required
            />
            <input
              className="input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
            <button className="btn-primary w-full justify-center" disabled={busy}>
              {busy ? '...' : locale === 'vi' ? 'Đăng nhập' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (viewState === 'unauthorized') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-white">
        <div>
          {locale === 'vi'
            ? 'Không tải được quyền tài khoản.'
            : 'Unable to load account permissions.'}
        </div>
        <button className="btn-secondary" onClick={handleSignOut}>
          {locale === 'vi' ? 'Quay về đăng nhập' : 'Back to login'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080304] text-white">
      {viewState === 'admin' ? <AdminPage /> : <UserPage />}
    </div>
  );
}
