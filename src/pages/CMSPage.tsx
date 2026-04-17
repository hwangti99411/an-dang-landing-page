import { useEffect, useRef, useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPage } from '@/pages/AdminPage';
import { UserPage } from '@/pages/UserPage';
import { useLanguage } from '@/contexts/LanguageContext';

type UserRole = 'admin' | 'user' | null;

function FullScreenLoading() {
  return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
}

export default function CMSPage() {
  const language = useLanguage();
  const locale = language?.locale ?? 'vi';

  const [sessionReady, setSessionReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const bootstrappedRef = useRef(false);
  const mountedRef = useRef(true);

  async function loadRole(userId: string) {
    if (!supabase) {
      setRole(null);
      return;
    }

    const sb = supabase!;

    const { data, error } = await sb.from('profiles').select('role').eq('id', userId).maybeSingle();

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
  }

  useEffect(() => {
    mountedRef.current = true;

    if (!supabase) {
      setSessionReady(true);
      return;
    }

    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const sb = supabase!;

    const safetyTimer = window.setTimeout(() => {
      if (mountedRef.current) {
        setSessionReady(true);
      }
    }, 3000);

    async function init() {
      try {
        const { data, error } = await sb.auth.getSession();

        if (error) {
          console.error('init auth error:', error);
          if (!mountedRef.current) return;
          setLoggedIn(false);
          setRole(null);
          return;
        }

        const session = data.session;

        if (!mountedRef.current) return;

        if (!session?.user) {
          setLoggedIn(false);
          setRole(null);
          return;
        }

        setLoggedIn(true);
        await loadRole(session.user.id);
      } catch (error) {
        console.error('init error:', error);
        if (!mountedRef.current) return;
        setLoggedIn(false);
        setRole(null);
      } finally {
        if (mountedRef.current) {
          setSessionReady(true);
        }
      }
    }

    void init();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (!mountedRef.current) return;

      try {
        if (!session?.user) {
          setLoggedIn(false);
          setRole(null);
          setSessionReady(true);
          return;
        }

        setLoggedIn(true);
        await loadRole(session.user.id);
      } catch (error) {
        console.error('auth state error:', error);
        if (!mountedRef.current) return;
        setLoggedIn(false);
        setRole(null);
      } finally {
        if (mountedRef.current) {
          setSessionReady(true);
        }
      }
    });

    return () => {
      mountedRef.current = false;
      window.clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      alert('Supabase chưa được cấu hình.');
      return;
    }

    const sb = supabase!;

    try {
      setBusy(true);
      setSessionReady(false);

      const { data, error } = await sb.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.user) {
        setLoggedIn(true);
        await loadRole(data.user.id);
      }
    } catch (error) {
      console.error('handleLogin error:', error);
      alert('Đăng nhập thất bại.');
    } finally {
      setBusy(false);
      setSessionReady(true);
    }
  }

  if (!sessionReady) {
    return <FullScreenLoading />;
  }

  if (!loggedIn) {
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

  if (loggedIn && role === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-white">
        <div>Không tải được quyền tài khoản.</div>
        <button
          className="btn-secondary"
          onClick={async () => {
            if (!supabase) {
              location.reload();
              return;
            }
            await supabase.auth.signOut();
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
