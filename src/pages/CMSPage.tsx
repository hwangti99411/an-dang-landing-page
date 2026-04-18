import { useEffect, useRef, useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPage } from '@/pages/AdminPage';
import { UserPage } from '@/pages/UserPage';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

type UserRole = 'admin' | 'user';
type ViewState = 'booting' | 'logged_out' | 'unauthorized' | 'admin' | 'user';

const BOOT_TIMEOUT_MS = 12000;
const PROFILE_TIMEOUT_MS = 10000;
const PROFILE_RETRY_COUNT = 1;

function FullScreenLoading() {
  return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
}

function isValidRole(role: unknown): role is UserRole {
  return role === 'admin' || role === 'user';
}

function timeoutAfter<T>(ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(fallback), ms);
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type RoleResult =
  | { status: 'success'; role: UserRole }
  | { status: 'unauthorized' }
  | { status: 'timeout' }
  | { status: 'error' }
  | { status: 'stale' };

export default function CMSPage() {
  const language = useLanguage();
  const locale = language?.locale ?? 'vi';

  const [viewState, setViewState] = useState<ViewState>('booting');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const currentViewRef = useRef<ViewState>('booting');
  const silentSyncInFlightRef = useRef(false);
  const bootTimerRef = useRef<number | null>(null);
  const lastRoleRef = useRef<UserRole | null>(null);

  function safeSetViewState(next: ViewState) {
    if (!mountedRef.current) return;
    currentViewRef.current = next;
    setViewState(next);

    if (next === 'admin' || next === 'user') {
      lastRoleRef.current = next;
    }

    if (next === 'logged_out') {
      lastRoleRef.current = null;
    }
  }

  function clearBootTimer() {
    if (bootTimerRef.current !== null) {
      window.clearTimeout(bootTimerRef.current);
      bootTimerRef.current = null;
    }
  }

  function showRoleLoadErrorToast() {
    toast.error(
      locale === 'vi'
        ? 'Không tải được quyền tài khoản. Vui lòng thử lại.'
        : 'Unable to load account permissions. Please try again.',
    );
  }

  async function fetchRoleOnce(
    userId: string,
    requestId: number,
    sb: NonNullable<typeof supabase>,
  ): Promise<RoleResult> {
    try {
      const result = await Promise.race([
        sb.from('profiles').select('role').eq('id', userId).maybeSingle(),
        timeoutAfter(PROFILE_TIMEOUT_MS, 'timeout' as const),
      ]);

      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return { status: 'stale' };
      }

      if (result === 'timeout') {
        console.error('fetchRoleOnce timeout');
        return { status: 'timeout' };
      }

      const { data, error } = result;

      if (error) {
        console.error('fetchRoleOnce error:', error);
        return { status: 'error' };
      }

      if (!data || !isValidRole(data.role)) {
        return { status: 'unauthorized' };
      }

      return { status: 'success', role: data.role };
    } catch (error) {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return { status: 'stale' };
      }

      console.error('fetchRoleOnce unexpected error:', error);
      return { status: 'error' };
    }
  }

  async function getRoleWithRetry(
    userId: string,
    requestId: number,
    sb: NonNullable<typeof supabase>,
  ): Promise<RoleResult> {
    let lastResult: RoleResult = { status: 'error' };

    for (let attempt = 0; attempt <= PROFILE_RETRY_COUNT; attempt += 1) {
      lastResult = await fetchRoleOnce(userId, requestId, sb);

      if (
        lastResult.status === 'success' ||
        lastResult.status === 'unauthorized' ||
        lastResult.status === 'stale'
      ) {
        return lastResult;
      }

      if (attempt < PROFILE_RETRY_COUNT) {
        await wait(400);
      }
    }

    return lastResult;
  }

  async function resolveAuth(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;
    const requestId = ++requestIdRef.current;

    if (!supabase) {
      safeSetViewState('logged_out');
      return;
    }

    const sb = supabase;

    try {
      const { data: sessionData, error: sessionError } = await sb.auth.getSession();

      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      if (sessionError) {
        console.error('getSession error:', sessionError);

        // Không logout khi silent sync bị lỗi tạm thời
        if (!silent && currentViewRef.current === 'booting') {
          safeSetViewState('logged_out');
        }

        return;
      }

      const sessionUser = sessionData.session?.user;

      // Chỉ khi thực sự không có session mới về logged_out
      if (!sessionUser) {
        safeSetViewState('logged_out');
        return;
      }

      const roleResult = await getRoleWithRetry(sessionUser.id, requestId, sb);

      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      if (roleResult.status === 'stale') return;

      if (roleResult.status === 'success') {
        safeSetViewState(roleResult.role);
        return;
      }

      if (roleResult.status === 'unauthorized') {
        safeSetViewState('unauthorized');
        return;
      }

      // Có session nhưng load role lỗi/timeout => giữ nguyên màn hình hiện tại
      console.error('resolveAuth role load failed:', roleResult.status);

      if (currentViewRef.current === 'booting') {
        // Nếu đang boot lần đầu mà vẫn lỗi, ưu tiên giữ người dùng ở trạng thái an toàn
        // Nếu đã từng biết role trước đó thì dùng lại role cũ
        if (lastRoleRef.current) {
          safeSetViewState(lastRoleRef.current);
        } else {
          safeSetViewState('logged_out');
        }
      } else if (!silent) {
        showRoleLoadErrorToast();
      }
    } catch (error) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      console.error('resolveAuth error:', error);

      if (currentViewRef.current === 'booting') {
        safeSetViewState('logged_out');
      } else if (!silent) {
        showRoleLoadErrorToast();
      }
    }
  }

  async function applySignedInUser(userId: string) {
    const requestId = ++requestIdRef.current;

    if (!supabase) {
      safeSetViewState('logged_out');
      return;
    }

    const sb = supabase;
    const roleResult = await getRoleWithRetry(userId, requestId, sb);

    if (!mountedRef.current || requestId !== requestIdRef.current) return;
    if (roleResult.status === 'stale') return;

    if (roleResult.status === 'success') {
      safeSetViewState(roleResult.role);
      return;
    }

    if (roleResult.status === 'unauthorized') {
      safeSetViewState('unauthorized');
      return;
    }

    // Không đá ra login khi chỉ lỗi load role
    console.error('applySignedInUser role load failed:', roleResult.status);
    showRoleLoadErrorToast();

    // Sau login mà lỗi role tạm thời, giữ nguyên giao diện hiện tại nếu có
    // Nếu chưa có giao diện nào ổn định thì quay về logged_out để user tự thử lại
    if (currentViewRef.current === 'booting') {
      safeSetViewState('logged_out');
    }
  }

  useEffect(() => {
    mountedRef.current = true;

    bootTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return;
      if (currentViewRef.current === 'booting') {
        console.warn('Boot timeout -> logged_out');
        safeSetViewState('logged_out');
      }
    }, BOOT_TIMEOUT_MS);

    if (!supabase) {
      safeSetViewState('logged_out');

      return () => {
        mountedRef.current = false;
        clearBootTimer();
      };
    }

    const sb = supabase;

    void resolveAuth({ silent: false });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;

      try {
        if (event === 'SIGNED_OUT') {
          setPassword('');
          safeSetViewState('logged_out');
          return;
        }

        // Các event như SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED
        // nếu còn session thì chỉ đồng bộ lại role
        if (session?.user) {
          void applySignedInUser(session.user.id);
        }
      } catch (error) {
        if (!mountedRef.current) return;
        console.error('onAuthStateChange error:', error);
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (silentSyncInFlightRef.current) return;
      if (currentViewRef.current === 'booting') return;

      silentSyncInFlightRef.current = true;

      void (async () => {
        try {
          await resolveAuth({ silent: true });
        } finally {
          silentSyncInFlightRef.current = false;
        }
      })();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearBootTimer();
    };
  }, []);

  useEffect(() => {
    if (viewState !== 'booting') {
      clearBootTimer();
    }
  }, [viewState]);

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
            ? 'Tài khoản không có quyền truy cập CMS.'
            : 'This account is not authorized to access CMS.'}
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
