import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, LogOut, Plus, RefreshCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fallbackSiteSettings } from '@/data/fallback';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadPublicFile, uploadJobFile, deleteJobFile } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Link,
  List,
  Heading,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  ImageUpload,
  ImageInsert,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

type CollectionTab = 'posts' | 'services' | 'testimonials' | 'faqs' | 'jobs';
type AdminTab = 'site' | CollectionTab;
type AdminRow = Record<string, string | number | boolean | null> & { id?: string | number };

const tabLabels: Record<AdminTab, { vi: string; en: string }> = {
  site: { vi: 'Site settings', en: 'Site settings' },
  posts: { vi: 'Bài viết', en: 'Posts' },
  services: { vi: 'Dịch vụ', en: 'Services' },
  testimonials: { vi: 'Feedback', en: 'Testimonials' },
  faqs: { vi: 'FAQ', en: 'FAQs' },
  jobs: { vi: 'Tuyển dụng', en: 'Jobs' },
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
  jobs: {
    title_vi: '',
    title_en: '',
    location_vi: '',
    location_en: '',
    type_vi: '',
    type_en: '',
    description_vi: '',
    description_en: '',
    sort: '',
    is_active: true,
    jd_file_url: '',
    jd_file_path: '',
    apply_url: '',
  },
};

const largeFieldHints = ['content', 'description', 'quote', 'answer', 'summary'];

function isLargeField(name: string) {
  return largeFieldHints.some((item) => name.includes(item));
}

const fieldDescriptions: Record<string, { vi: string; en: string }> = {
  sort: {
    vi: 'Thứ tự hiển thị, số nhỏ hơn sẽ hiện trước',
    en: 'Display order, lower number appears first',
  },
  company_name_vi: {
    vi: 'Tên công ty bằng tiếng Việt',
    en: 'Company name in Vietnamese',
  },
  company_name_en: {
    vi: 'Tên công ty bằng tiếng Anh',
    en: 'Company name in English',
  },
  brand_name: {
    vi: 'Tên thương hiệu hiển thị trên website',
    en: 'Brand name shown on the website',
  },
  logo_url: {
    vi: 'Đường dẫn logo thương hiệu',
    en: 'Brand logo URL',
  },
  phone: {
    vi: 'Số điện thoại liên hệ',
    en: 'Contact phone number',
  },
  email: {
    vi: 'Email liên hệ chính',
    en: 'Main contact email',
  },
  address_vi: {
    vi: 'Địa chỉ tiếng Việt',
    en: 'Vietnamese address',
  },
  address_en: {
    vi: 'Địa chỉ tiếng Anh',
    en: 'English address',
  },
  hero_title_vi: {
    vi: 'Tiêu đề hero tiếng Việt',
    en: 'Hero title in Vietnamese',
  },
  hero_title_en: {
    vi: 'Tiêu đề hero tiếng Anh',
    en: 'Hero title in English',
  },
  hero_description_vi: {
    vi: 'Mô tả hero tiếng Việt',
    en: 'Hero description in Vietnamese',
  },
  hero_description_en: {
    vi: 'Mô tả hero tiếng Anh',
    en: 'Hero description in English',
  },
  footer_summary_vi: {
    vi: 'Tóm tắt footer tiếng Việt',
    en: 'Footer summary in Vietnamese',
  },
  footer_summary_en: {
    vi: 'Tóm tắt footer tiếng Anh',
    en: 'Footer summary in English',
  },
  about_title_vi: {
    vi: 'Tiêu đề phần giới thiệu tiếng Việt',
    en: 'About section title in Vietnamese',
  },
  about_title_en: {
    vi: 'Tiêu đề phần giới thiệu tiếng Anh',
    en: 'About section title in English',
  },
  about_description_vi: {
    vi: 'Nội dung phần giới thiệu tiếng Việt',
    en: 'About section content in Vietnamese',
  },
  about_description_en: {
    vi: 'Nội dung phần giới thiệu tiếng Anh',
    en: 'About section content in English',
  },
  mission_vi: {
    vi: 'Sứ mệnh tiếng Việt',
    en: 'Mission in Vietnamese',
  },
  mission_en: {
    vi: 'Sứ mệnh tiếng Anh',
    en: 'Mission in English',
  },
  vision_vi: {
    vi: 'Tầm nhìn tiếng Việt',
    en: 'Vision in Vietnamese',
  },
  vision_en: {
    vi: 'Tầm nhìn tiếng Anh',
    en: 'Vision in English',
  },
  meta_title: {
    vi: 'Tiêu đề SEO của website',
    en: 'Website SEO title',
  },
  meta_description: {
    vi: 'Mô tả SEO của website',
    en: 'Website SEO description',
  },
  slug: {
    vi: 'Đường dẫn thân thiện của bài viết',
    en: 'Post URL slug',
  },
  title_vi: {
    vi: 'Tiêu đề tiếng Việt',
    en: 'Vietnamese title',
  },
  title_en: {
    vi: 'Tiêu đề tiếng Anh',
    en: 'English title',
  },
  excerpt_vi: {
    vi: 'Mô tả ngắn tiếng Việt',
    en: 'Vietnamese short excerpt',
  },
  excerpt_en: {
    vi: 'Mô tả ngắn tiếng Anh',
    en: 'English short excerpt',
  },
  content_vi: {
    vi: 'Nội dung chi tiết tiếng Việt',
    en: 'Detailed content in Vietnamese',
  },
  content_en: {
    vi: 'Nội dung chi tiết tiếng Anh',
    en: 'Detailed content in English',
  },
  category_vi: {
    vi: 'Danh mục tiếng Việt',
    en: 'Category in Vietnamese',
  },
  category_en: {
    vi: 'Danh mục tiếng Anh',
    en: 'Category in English',
  },
  published_at: {
    vi: 'Ngày giờ xuất bản',
    en: 'Publish date and time',
  },
  is_featured: {
    vi: 'Đánh dấu bài viết nổi bật',
    en: 'Mark as featured',
  },
  cover_url: {
    vi: 'Đường dẫn ảnh bìa',
    en: 'Cover image URL',
  },
  icon: {
    vi: 'Tên icon sử dụng cho dịch vụ',
    en: 'Icon name for service',
  },
  description_vi: {
    vi: 'Mô tả tiếng Việt',
    en: 'Vietnamese description',
  },
  description_en: {
    vi: 'Mô tả tiếng Anh',
    en: 'English description',
  },
  name: {
    vi: 'Tên người đánh giá',
    en: 'Reviewer name',
  },
  role_vi: {
    vi: 'Chức vụ tiếng Việt',
    en: 'Role in Vietnamese',
  },
  role_en: {
    vi: 'Chức vụ tiếng Anh',
    en: 'Role in English',
  },
  company: {
    vi: 'Tên công ty',
    en: 'Company name',
  },
  quote_vi: {
    vi: 'Nội dung feedback tiếng Việt',
    en: 'Feedback content in Vietnamese',
  },
  quote_en: {
    vi: 'Nội dung feedback tiếng Anh',
    en: 'Feedback content in English',
  },
  question_vi: {
    vi: 'Câu hỏi tiếng Việt',
    en: 'Question in Vietnamese',
  },
  question_en: {
    vi: 'Câu hỏi tiếng Anh',
    en: 'Question in English',
  },
  answer_vi: {
    vi: 'Câu trả lời tiếng Việt',
    en: 'Answer in Vietnamese',
  },
  answer_en: {
    vi: 'Câu trả lời tiếng Anh',
    en: 'Answer in English',
  },
  location_vi: {
    vi: 'Địa điểm làm việc tiếng Việt',
    en: 'Work location in Vietnamese',
  },
  location_en: {
    vi: 'Địa điểm làm việc tiếng Anh',
    en: 'Work location in English',
  },
  type_vi: {
    vi: 'Loại hình công việc tiếng Việt',
    en: 'Job type in Vietnamese',
  },
  type_en: {
    vi: 'Loại hình công việc tiếng Anh',
    en: 'Job type in English',
  },
  is_active: {
    vi: 'Trạng thái đang tuyển',
    en: 'Hiring status',
  },
  jd_file_url: {
    vi: 'Đường dẫn file mô tả công việc',
    en: 'Job description file URL',
  },
  jd_file_path: {
    vi: 'Đường dẫn nội bộ file JD',
    en: 'Internal JD file path',
  },
  apply_url: {
    vi: 'Đường dẫn ứng tuyển',
    en: 'Application URL',
  },
};

function getFieldDescription(key: string, locale: 'vi' | 'en') {
  return fieldDescriptions[key]?.[locale] ?? (locale === 'vi' ? 'Mô tả ngắn' : 'Short description');
}

function getFieldLabel(key: string, locale: 'vi' | 'en') {
  return `${key.toUpperCase()} - ${getFieldDescription(key, locale)}`;
}

class Base64FileUploadAdapter {
  private loader: any;
  private reader?: FileReader;

  constructor(loader: any) {
    this.loader = loader;
  }

  async upload() {
    const file = await this.loader.file;

    return new Promise<{ default: string }>((resolve, reject) => {
      this.reader = new FileReader();

      this.reader.onload = () => {
        if (typeof this.reader?.result === 'string') {
          resolve({
            default: this.reader.result,
          });
        } else {
          reject(new Error('Không đọc được dữ liệu ảnh.'));
        }
      };

      this.reader.onerror = () => {
        reject(new Error('Không thể đọc file ảnh.'));
      };

      this.reader.onabort = () => {
        reject(new Error('Đã huỷ chèn ảnh.'));
      };

      this.reader.readAsDataURL(file);
    });
  }

  abort() {
    if (this.reader && this.reader.readyState === 1) {
      this.reader.abort();
    }
  }
}

function Base64FileUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new Base64FileUploadAdapter(loader);
  };
}

export function AdminPage() {
  const language = useLanguage();
  const locale = language?.locale ?? 'vi';
  const [activeTab, setActiveTab] = useState<AdminTab>('site');
  const [_message, setMessage] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Record<CollectionTab, AdminRow[]>>({
    posts: [],
    services: [],
    testimonials: [],
    faqs: [],
    jobs: [],
  });
  const [draft, setDraft] = useState<AdminRow>(defaultRows.posts);
  const [siteDraft, setSiteDraft] = useState<SiteSettings>(fallbackSiteSettings);

  const jobFileInputRef = useRef<HTMLInputElement | null>(null);

  const notifySuccess = (textVi: string, textEn: string) => {
    const text = locale === 'vi' ? textVi : textEn;
    setMessage(text);
    toast.success(text);
  };

  const notifyError = (error: unknown) => {
    const text = getErrorMessage(error);
    setMessage(text);
    toast.error(text);
  };

  const notifyInfo = (textVi: string, textEn: string) => {
    const text = locale === 'vi' ? textVi : textEn;
    setMessage(text);
    toast(text);
  };

  const collectionColumns = useMemo(() => {
    if (activeTab === 'site') return [];

    const columns = Object.keys(defaultRows[activeTab]);

    if (activeTab === 'jobs') {
      return columns.filter(
        (column) => column !== 'jd_file_url' && column !== 'jd_file_path' && column !== 'apply_url',
      );
    }

    return columns;
  }, [activeTab]);

  function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  }

  async function loadSiteSettings() {
    if (!supabase) return;
    const sb = supabase!;
    const { data, error } = await sb.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (error) {
      notifyError(error);
      return;
    }
    if (data) setSiteDraft(data as SiteSettings);
  }

  async function loadTable(tab: CollectionTab) {
    if (!supabase) return;
    const sb = supabase!;
    let query = sb.from(tab).select('*');
    if (tab === 'posts') {
      query = query.order('published_at', { ascending: false });
    } else if (tab === 'jobs') {
      query = query.order('sort', { ascending: true }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    const { data, error } = await query;
    if (error) {
      notifyError(error);
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
      loadTable('jobs'),
    ]);
  }

  useEffect(() => {
    void refreshAll();
  }, []);

  useEffect(() => {
    if (activeTab !== 'site') setDraft(defaultRows[activeTab]);
  }, [activeTab]);

  const handleLogout = async () => {
    if (!supabase) return;
    const sb = supabase!;
    await sb.auth.signOut();
    window.location.reload();
  };

  const saveCollectionDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || activeTab === 'site') return;

    const sb = supabase!;
    setBusy(true);
    const table = activeTab;
    const payload = { ...draft };

    const query = draft.id
      ? sb.from(table).update(payload).eq('id', draft.id)
      : sb.from(table).insert(payload);

    const { error } = await query;
    setBusy(false);

    if (error) {
      notifyError(error);
      return;
    }
    notifySuccess('Lưu thành công.', 'Saved successfully.');
    setDraft(defaultRows[table]);
    if (activeTab === 'jobs' && jobFileInputRef.current) {
      jobFileInputRef.current.value = '';
    }
    await loadTable(table);
  };

  const saveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const sb = supabase!;
    setBusy(true);
    const { error } = await sb
      .from('site_settings')
      .upsert({ ...siteDraft, id: 1 }, { onConflict: 'id' });
    setBusy(false);
    if (error) {
      notifyError(error);
      return;
    }
    notifySuccess('Đã cập nhật site settings.', 'Site settings updated.');
  };

  const editRow = (row: AdminRow) => {
    setDraft(row);
    notifyInfo('Đã nạp dữ liệu vào form để chỉnh sửa.', 'Loaded row into form for editing.');
  };

  const deleteRow = async (table: CollectionTab, id?: string | number) => {
    if (!supabase || !id) return;
    const sb = supabase!;
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) {
      notifyError(error);
      return;
    }
    notifySuccess('Đã xoá bản ghi.', 'Record deleted.');
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
      notifySuccess('Upload ảnh thành công.', 'Image uploaded successfully.');
    } catch (error) {
      notifyError(error);
    } finally {
      setBusy(false);
    }
  };

  const uploadJobAsset = async (file: File) => {
    try {
      notifyInfo('Đang upload JD...', 'Uploading JD...');
      const oldPath = String(draft.jd_file_path ?? '');
      if (oldPath) {
        try {
          await deleteJobFile(oldPath);
        } catch {
          // bỏ qua
        }
      }

      const uploaded = await uploadJobFile(file);

      setDraft((prev: any) => ({
        ...prev,
        jd_file_url: uploaded.publicUrl,
        jd_file_path: uploaded.path,
      }));
      notifySuccess('Upload JD thành công.', 'JD uploaded successfully.');
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const removeJobAsset = async () => {
    try {
      const path = String(draft.jd_file_path ?? '');

      if (!path) {
        notifyInfo('Không có file để xoá.', 'No file to delete.');
        if (jobFileInputRef.current) {
          jobFileInputRef.current.value = '';
        }
        return;
      }

      setBusy(true);
      await deleteJobFile(path);

      setDraft((prev: any) => ({
        ...prev,
        jd_file_url: '',
        jd_file_path: '',
      }));

      if (jobFileInputRef.current) {
        jobFileInputRef.current.value = '';
      }
      notifySuccess('Đã xoá file JD.', 'JD file deleted.');
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080304] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-brand-gold">Admin CMS</div>
            <h1 className="mt-2 text-3xl font-semibold">An Đăng - Content Manager</h1>
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
              className={`rounded-full px-4 py-2 text-sm ${
                activeTab === tab ? 'bg-brand-gold text-brand-dark' : 'bg-white/5 text-white/70'
              }`}
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
                        {getFieldLabel(key, locale)}
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
                      {getFieldLabel(column, locale)}
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
                    ) : column === 'sort' ? (
                      <input
                        type="number"
                        inputMode="numeric"
                        className="input"
                        value={
                          draft[column] === null || draft[column] === undefined
                            ? ''
                            : String(draft[column])
                        }
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            [column]: e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    ) : isLargeField(column) && activeTab === 'posts' ? (
                      <div className="ck-input-wrapper">
                        <CKEditor
                          key={`${String(draft.id ?? 'new')}-${column}`}
                          editor={ClassicEditor}
                          data={String(draft[column] ?? '')}
                          config={{
                            licenseKey: 'GPL',
                            extraPlugins: [Base64FileUploadAdapterPlugin],
                            plugins: [
                              Essentials,
                              Paragraph,
                              Bold,
                              Italic,
                              Link,
                              List,
                              Heading,
                              Image,
                              ImageToolbar,
                              ImageCaption,
                              ImageStyle,
                              ImageResize,
                              ImageUpload,
                              ImageInsert,
                            ],
                            toolbar: [
                              'undo',
                              'redo',
                              '|',
                              'heading',
                              '|',
                              'bold',
                              'italic',
                              '|',
                              'link',
                              '|',
                              'bulletedList',
                              'numberedList',
                              '|',
                              'insertImage',
                            ],
                            image: {
                              insert: {
                                integrations: ['upload', 'url'],
                              },
                              toolbar: [
                                'imageTextAlternative',
                                'toggleImageCaption',
                                '|',
                                'imageStyle:inline',
                                'imageStyle:block',
                                'imageStyle:side',
                              ],
                            },
                          }}
                          onChange={(_, editor) => {
                            const value = editor.getData();
                            setDraft((prev) => ({
                              ...prev,
                              [column]: value,
                            }));
                          }}
                        />
                      </div>
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

                {activeTab === 'jobs' && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-white/70">
                        {getFieldLabel('jd_file_url', locale)} (PDF/DOCX)
                      </label>
                      <input
                        ref={jobFileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadJobAsset(file);
                        }}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-white/70">
                        {getFieldLabel('jd_file_url', locale)}
                      </label>
                      <input
                        className="input"
                        disabled
                        value={String(draft.jd_file_url ?? '')}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-white/70">
                        {getFieldLabel('apply_url', locale)}
                      </label>
                      <input
                        className="input"
                        disabled
                        value={String(draft.apply_url ?? '')}
                        readOnly
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => void removeJobAsset()}
                        disabled={busy || !draft.jd_file_path}
                      >
                        {locale === 'vi' ? 'Xoá file JD' : 'Delete JD file'}
                      </button>
                    </div>
                  </div>
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
                    onClick={() => {
                      setDraft(defaultRows[activeTab]);
                      if (activeTab === 'jobs' && jobFileInputRef.current) {
                        jobFileInputRef.current.value = '';
                      }
                      notifyInfo('Đã làm mới form.', 'Form reset successfully.');
                    }}
                  >
                    {locale === 'vi' ? 'Làm mới form' : 'Reset form'}
                  </button>
                </div>
              </form>
            </div>

            <div className="glass overflow-hidden rounded-[2rem] p-5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-white/45">
                    <tr>
                      <th className="pb-3 pr-4">ID</th>
                      <th className="pb-3 pr-4">Sort</th>
                      <th className="pb-3 pr-4">Preview</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows[activeTab].map((row) => (
                      <tr key={String(row.id)} className="border-t border-white/8 align-top">
                        <td className="py-4 pr-4 text-white/40">{String(row.id).slice(0, 8)}</td>
                        <td className="py-4 pr-4 text-white/70">{String(row.sort ?? '')}</td>
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
