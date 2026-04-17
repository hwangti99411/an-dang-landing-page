import { useEffect, useRef, useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPage } from '@/pages/AdminPage';
import { UserPage } from '@/pages/UserPage';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

type UserRole = 'admin' | 'user' | null;
type AuthState = 'loading' | 'logged_out' | 'logged_in';

function FullScreenLoading() {
  return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
}

export default function CMSPage() {
  const language = useLanguage();
  const locale = language?.locale ?? 'vi';

  const [authState, setAuthState] = useState<AuthState>('loading');
  const [role, setRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const mountedRef = useRef(true);
  const bootstrappedRef = useRef(false);
  const loadingTimeoutRef = useRef<number | null>(null);

  async function loadRole(userId: string) {
    if (!supabase) {
      setRole(null);
      return;
    }

    try {
      setRoleLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('loadRole error:', error);
        setRole(null);
        return;
      }

      if (!data?.role) {
        setRole(null);
        return;
      }

      setRole(data.role as UserRole);
    } catch (error) {
      console.error('loadRole unexpected error:', error);
      setRole(null);
    } finally {
      if (mountedRef.current) {
        setRoleLoading(false);
      }
    }
  }

  async function syncSession() {
    if (!supabase || !mountedRef.current) {
      setAuthState('logged_out');
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('getSession error:', error);
        setAuthState('logged_out');
        setRole(null);
        return;
      }

      const session = data.session;

      if (!session?.user) {
        setAuthState('logged_out');
        setRole(null);
        return;
      }

      setAuthState('logged_in');
      await loadRole(session.user.id);
    } catch (error) {
      console.error('syncSession error:', error);
      setAuthState('logged_out');
      setRole(null);
    }
  }

  useEffect(() => {
    mountedRef.current = true;

    if (!supabase) {
      setAuthState('logged_out');
      return;
    }

    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    loadingTimeoutRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      if (authState === 'loading') {
        setAuthState('logged_out');
      }
    }, 2500);

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mountedRef.current) return;

      try {
        if (!session?.user) {
          setAuthState('logged_out');
          setRole(null);
          return;
        }

        setAuthState('logged_in');
        await loadRole(session.user.id);
      } catch (error) {
        console.error('auth state error:', error);
        setAuthState('logged_out');
        setRole(null);
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncSession();
      }
    };

    const handleFocus = () => {
      void syncSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handleFocus);

      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      toast.error('Supabase chưa được cấu hình.');
      return;
    }

    try {
      setBusy(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        setAuthState('logged_in');
        await loadRole(data.user.id);
      }
    } catch (error) {
      console.error('handleLogin error:', error);
      toast.error('Đăng nhập thất bại.');
    } finally {
      setBusy(false);
    }
  }

  if (authState === 'loading') {
    return <FullScreenLoading />;
  }

  if (authState === 'logged_out') {
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
              required
            />
            <input
              className="input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
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

  if (roleLoading) {
    return <FullScreenLoading />;
  }

  if (role === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-white">
        <div>Không tải được quyền tài khoản.</div>
        <button
          className="btn-secondary"
          onClick={async () => {
            await supabase?.auth.signOut();
            location.reload();
          }}
        >
          Quay về đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080304] text-white">
      {role === 'admin' ? <AdminPage /> : <UserPage />}
    </div>
  );
}
