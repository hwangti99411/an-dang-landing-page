import { useEffect, useRef, useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPage } from '@/pages/AdminPage';
import { UserPage } from '@/pages/UserPage';
import { useLanguage } from '@/contexts/LanguageContext';

type AccessState = 'loading' | 'admin' | 'user' | 'no_profile' | 'forbidden' | 'error';

function FullScreenLoading() {
  return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
}

export default function CMSPage() {
  const language = useLanguage();
  const locale = language?.locale ?? 'vi';

  const [sessionReady, setSessionReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [access, setAccess] = useState<AccessState>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const bootstrappedRef = useRef(false);
  const mountedRef = useRef(true);

  async function loadRole(userId: string) {
    if (!supabase) {
      setAccess('error');
      return;
    }

    const { data, error, status } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('loadRole error:', error, status);
      setAccess('error');
      return;
    }

    if (!data) {
      setAccess('no_profile');
      return;
    }

    if (data.role === 'admin') {
      setAccess('admin');
      return;
    }

    if (data.role === 'user') {
      setAccess('user');
      return;
    }

    setAccess('forbidden');
  }

  useEffect(() => {
    mountedRef.current = true;

    if (!supabase) {
      setSessionReady(true);
      setAccess('error');
      return;
    }

    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const safetyTimer = window.setTimeout(() => {
      if (mountedRef.current) setSessionReady(true);
    }, 3000);

    async function init() {
      if (!supabase) {
        setAccess('error');
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('init auth error:', error);
          if (!mountedRef.current) return;
          setLoggedIn(false);
          setAccess('loading');
          return;
        }

        const session = data.session;

        if (!mountedRef.current) return;

        if (!session?.user) {
          setLoggedIn(false);
          setAccess('loading');
          return;
        }

        setLoggedIn(true);
        setAccess('loading');
        await loadRole(session.user.id);
      } catch (error) {
        console.error('init error:', error);
        if (!mountedRef.current) return;
        setLoggedIn(false);
        setAccess('error');
      } finally {
        if (mountedRef.current) setSessionReady(true);
      }
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mountedRef.current) return;

      try {
        if (!session?.user) {
          setLoggedIn(false);
          setAccess('loading');
          setSessionReady(true);
          return;
        }

        setLoggedIn(true);
        setAccess('loading');
        await loadRole(session.user.id);
      } catch (error) {
        console.error('auth state error:', error);
        if (!mountedRef.current) return;
        setLoggedIn(false);
        setAccess('error');
      } finally {
        if (mountedRef.current) setSessionReady(true);
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

    try {
      setBusy(true);
      setSessionReady(false);
      setAccess('loading');

      const { data, error } = await supabase.auth.signInWithPassword({
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
      setAccess('error');
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

  if (access === 'loading') {
    return <FullScreenLoading />;
  }

  if (access === 'no_profile') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-white">
        <div>Tài khoản chưa được cấp hồ sơ quyền.</div>
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

  if (access === 'forbidden') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-white">
        <div>Bạn không có quyền truy cập trang này.</div>
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

  if (access === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-white">
        <div>Không thể tải quyền tài khoản. Vui lòng thử lại.</div>
        <button className="btn-secondary" onClick={() => location.reload()}>
          Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080304] text-white">
      {access === 'admin' ? <AdminPage /> : <UserPage />}
    </div>
  );
}
