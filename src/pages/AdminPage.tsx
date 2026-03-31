import { useEffect, useMemo, useState } from 'react';
import {
  ImagePlus,
  LoaderCircle,
  LogOut,
  Plus,
  RefreshCcw,
  Save,
  Shield,
  Trash2,
} from 'lucide-react';
import { fallbackSiteSettings } from '@/data/fallback';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadPublicFile } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { FaqItem, PostItem, ServiceItem, SiteSettings, TestimonialItem } from '@/types';

type CollectionTab = 'posts' | 'services' | 'testimonials' | 'faqs';
type AdminTab = 'site' | CollectionTab;
type AdminRow = Record<string, string | boolean | null> & { id?: string | number };

const tabLabels: Record<AdminTab, { vi: string; en: string }> = {
  site: { vi: 'Site settings', en: 'Site settings' },
  posts: { vi: 'Bài viết', en: 'Posts' },
  services: { vi: 'Dịch vụ', en: 'Services' },
  testimonials: { vi: 'Feedback', en: 'Testimonials' },
  faqs: { vi: 'FAQ', en: 'FAQs' },
};

const defaultRows: Record<CollectionTab, AdminRow> = {
  posts: {
    slug: '',
    title_vi: '',
    title_en: '',
    excerpt_vi: '',
    excerpt_en: '',
    content_vi: '',
    content_en: '',
    category_vi: 'Tin công ty',
    category_en: 'Company news',
    published_at: new Date().toISOString().slice(0, 16),
    is_featured: true,
    cover_url: '',
  },
  services: { icon: 'Code2', title_vi: '', title_en: '', description_vi: '', description_en: '' },
  testimonials: { name: '', role_vi: '', role_en: '', company: '', quote_vi: '', quote_en: '' },
  faqs: { question_vi: '', question_en: '', answer_vi: '', answer_en: '' },
};

const largeFieldHints = ['content', 'description', 'quote', 'answer', 'summary'];

function isLargeField(name: string) {
  return largeFieldHints.some((item) => name.includes(item));
}

export function AdminPage() {
  const language = useLanguage();
  const locale = language?.locale ?? 'vi';
  const [activeTab, setActiveTab] = useState<AdminTab>('site');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Record<CollectionTab, AdminRow[]>>({
    posts: [],
    services: [],
    testimonials: [],
    faqs: [],
  });
  const [draft, setDraft] = useState<AdminRow>(defaultRows.posts);
  const [siteDraft, setSiteDraft] = useState<SiteSettings>(fallbackSiteSettings);
  const collectionColumns = useMemo(
    () => (activeTab === 'site' ? [] : Object.keys(defaultRows[activeTab])),
    [activeTab],
  );

  function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  }

  useEffect(() => {
    if (!supabase) {
      setSessionReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session));
      setSessionReady(true);
    });
  }, []);

  async function loadSiteSettings() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) {
      setMessage(getErrorMessage(error));
      return;
    }
    if (data) setSiteDraft(data as SiteSettings);
  }

  async function loadTable(tab: CollectionTab) {
    if (!supabase) return;
    const orderColumn = tab === 'posts' ? 'published_at' : 'created_at';
    const { data, error } = await supabase
      .from(tab)
      .select('*')
      .order(orderColumn, { ascending: false });
    if (error) {
      setMessage(getErrorMessage(error));
      return;
    }
    setRows((prev) => ({ ...prev, [tab]: (data ?? []) as AdminRow[] }));
  }

  async function refreshAll() {
    await Promise.all([
      loadSiteSettings(),
      loadTable('posts'),
      loadTable('services'),
      loadTable('testimonials'),
      loadTable('faqs'),
    ]);
  }

  useEffect(() => {
    if (loggedIn) {
      void refreshAll();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (activeTab !== 'site') setDraft(defaultRows[activeTab]);
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setMessage('Missing Supabase environment variables.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setMessage(getErrorMessage(error));
      return;
    }
    setLoggedIn(true);
    setMessage(locale === 'vi' ? 'Đăng nhập thành công.' : 'Logged in successfully.');
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setLoggedIn(false);
  };

  const saveCollectionDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || activeTab === 'site') return;

    setBusy(true);
    const table = activeTab;
    const payload = { ...draft };

    const query = draft.id
      ? supabase.from(table).update(payload).eq('id', draft.id)
      : supabase.from(table).insert(payload);

    const { error } = await query;
    setBusy(false);

    if (error) {
      setMessage(getErrorMessage(error));
      return;
    }

    setMessage(locale === 'vi' ? 'Lưu thành công.' : 'Saved successfully.');
    setDraft(defaultRows[table]);
    await loadTable(table);
  };

  const saveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ ...siteDraft, id: 1 }, { onConflict: 'id' });
    setBusy(false);
    setMessage(
      error
        ? getErrorMessage(error)
        : locale === 'vi'
          ? 'Đã cập nhật site settings.'
          : 'Site settings updated.',
    );
  };

  const editRow = (row: AdminRow) => setDraft(row);

  const deleteRow = async (table: CollectionTab, id?: string | number) => {
    if (!supabase || !id) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    setMessage(error ? error.message : locale === 'vi' ? 'Đã xoá bản ghi.' : 'Record deleted.');
    await loadTable(table);
  };

  const uploadAsset = async (file: File, type: 'logo' | 'post-cover') => {
    try {
      setBusy(true);
      const url = await uploadPublicFile(file, type === 'logo' ? 'branding' : 'posts');
      if (type === 'logo') {
        setSiteDraft((prev) => ({ ...prev, logo_url: url }));
      } else {
        setDraft((prev: any) => ({ ...prev, cover_url: url }));
      }
      setMessage(locale === 'vi' ? 'Upload ảnh thành công.' : 'Image uploaded successfully.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>
    );
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
            {message && <div className="text-sm text-white/70">{message}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080304] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-brand-gold">Admin CMS</div>
            <h1 className="mt-2 text-3xl font-semibold">An Đăng content manager</h1>
            <p className="mt-2 text-sm text-white/60">
              {locale === 'vi'
                ? 'Quản trị Hero, About, Footer, logo doanh nghiệp, bài viết, dịch vụ, feedback và FAQ.'
                : 'Manage Hero, About, Footer, company logo, posts, services, testimonials, and FAQ.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary gap-2" onClick={() => void refreshAll()}>
              <RefreshCcw size={16} />
              Reload
            </button>
            <button className="btn-secondary gap-2" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(tabLabels) as AdminTab[]).map((tab) => (
            <button
              key={tab}
              className={`rounded-full px-4 py-2 text-sm ${activeTab === tab ? 'bg-brand-gold text-brand-dark' : 'bg-white/5 text-white/70'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tabLabels[tab][locale]}
            </button>
          ))}
        </div>

        {activeTab === 'site' ? (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <form onSubmit={saveSiteSettings} className="glass rounded-[2rem] p-5">
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(siteDraft).map(([key, value]) => {
                  if (key === 'id') return null;
                  return (
                    <div key={key} className={isLargeField(key) ? 'md:col-span-2' : ''}>
                      <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/45">
                        {key}
                      </label>
                      {isLargeField(key) ? (
                        <textarea
                          className="input min-h-28"
                          value={String(value ?? '')}
                          onChange={(e) =>
                            setSiteDraft(
                              (prev) =>
                                ({
                                  ...(prev as SiteSettings),
                                  [key]: e.target.value,
                                }) as SiteSettings,
                            )
                          }
                        />
                      ) : (
                        <input
                          className="input"
                          value={String(value ?? '')}
                          onChange={(e) =>
                            setSiteDraft(
                              (prev) =>
                                ({
                                  ...(prev as SiteSettings),
                                  [key]: e.target.value,
                                }) as SiteSettings,
                            )
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <label className="btn-secondary cursor-pointer gap-2">
                  <ImagePlus size={16} />
                  {locale === 'vi' ? 'Upload logo' : 'Upload logo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && void uploadAsset(e.target.files[0], 'logo')
                    }
                  />
                </label>
                <button className="btn-primary gap-2" disabled={busy}>
                  <Save size={16} />
                  {locale === 'vi' ? 'Lưu site settings' : 'Save site settings'}
                </button>
              </div>
              {message && <div className="mt-3 text-sm text-white/70">{message}</div>}
            </form>

            <div className="glass rounded-[2rem] p-5">
              <div className="text-sm uppercase tracking-[0.2em] text-brand-gold">Preview</div>
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                {siteDraft.logo_url ? (
                  <img
                    src={siteDraft.logo_url}
                    alt={siteDraft.brand_name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gold to-brand-accent font-black text-brand-dark">
                    AD
                  </div>
                )}
                <div className="mt-4 text-xs uppercase tracking-[0.3em] text-brand-gold">
                  {siteDraft.brand_name}
                </div>
                <div className="mt-3 text-2xl font-semibold">
                  {locale === 'vi' ? siteDraft.hero_title_vi : siteDraft.hero_title_en}
                </div>
                <div className="mt-3 text-sm leading-7 text-white/70">
                  {locale === 'vi' ? siteDraft.hero_description_vi : siteDraft.hero_description_en}
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 p-4 text-sm text-white/65">
                  {locale === 'vi' ? siteDraft.footer_summary_vi : siteDraft.footer_summary_en}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass rounded-[2rem] p-5">
              <form onSubmit={saveCollectionDraft} className="space-y-3">
                {collectionColumns.map((column) => (
                  <div key={column}>
                    <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/45">
                      {column}
                    </label>
                    {typeof defaultRows[activeTab][column] === 'boolean' ? (
                      <select
                        className="input"
                        value={String(Boolean(draft[column]))}
                        onChange={(e) =>
                          setDraft({ ...draft, [column]: e.target.value === 'true' })
                        }
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : isLargeField(column) ? (
                      <textarea
                        className="input min-h-28"
                        value={String(draft[column] ?? '')}
                        onChange={(e) => setDraft({ ...draft, [column]: e.target.value })}
                      />
                    ) : (
                      <input
                        className="input"
                        value={String(draft[column] ?? '')}
                        onChange={(e) => setDraft({ ...draft, [column]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
                {activeTab === 'posts' && (
                  <label className="btn-secondary inline-flex cursor-pointer gap-2">
                    <ImagePlus size={16} />
                    {locale === 'vi' ? 'Upload ảnh cover bài viết' : 'Upload post cover image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && void uploadAsset(e.target.files[0], 'post-cover')
                      }
                    />
                  </label>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button className="btn-primary gap-2" disabled={busy}>
                    {busy ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    {draft.id
                      ? locale === 'vi'
                        ? 'Cập nhật'
                        : 'Update'
                      : locale === 'vi'
                        ? 'Tạo mới'
                        : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setDraft(defaultRows[activeTab])}
                  >
                    {locale === 'vi' ? 'Làm mới form' : 'Reset form'}
                  </button>
                </div>
                {message && <div className="text-sm text-white/70">{message}</div>}
              </form>
            </div>

            <div className="glass overflow-hidden rounded-[2rem] p-5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-white/45">
                    <tr>
                      <th className="pb-3 pr-4">ID</th>
                      <th className="pb-3 pr-4">Preview</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows[activeTab].map((row) => (
                      <tr key={String(row.id)} className="border-t border-white/8 align-top">
                        <td className="py-4 pr-4 text-white/40">{String(row.id).slice(0, 8)}</td>
                        <td className="py-4 pr-4 text-white/75">
                          <div className="font-medium text-white">
                            {String(
                              'title_vi' in row
                                ? row.title_vi
                                : 'name' in row
                                  ? row.name
                                  : 'question_vi' in row
                                    ? row.question_vi
                                    : '',
                            )}
                          </div>
                          {'cover_url' in row &&
                            typeof row.cover_url === 'string' &&
                            row.cover_url && (
                              <img
                                src={row.cover_url}
                                alt="cover"
                                className="mt-3 h-20 w-28 rounded-xl object-cover"
                              />
                            )}
                          <div className="mt-1 max-w-xl text-xs leading-6 text-white/45">
                            {String(
                              'excerpt_vi' in row
                                ? row.excerpt_vi
                                : 'description_vi' in row
                                  ? row.description_vi
                                  : 'quote_vi' in row
                                    ? row.quote_vi
                                    : 'answer_vi' in row
                                      ? row.answer_vi
                                      : '',
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button
                              className="rounded-full bg-white/5 px-3 py-1 text-xs"
                              onClick={() => editRow(row)}
                            >
                              {locale === 'vi' ? 'Sửa' : 'Edit'}
                            </button>
                            <button
                              className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-200"
                              onClick={() => void deleteRow(activeTab, row.id)}
                            >
                              <span className="inline-flex items-center gap-1">
                                <Trash2 size={12} />
                                {locale === 'vi' ? 'Xoá' : 'Delete'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
