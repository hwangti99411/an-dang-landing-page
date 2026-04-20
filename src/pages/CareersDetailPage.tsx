import { motion } from 'framer-motion';
import { BriefcaseBusiness, ExternalLink, MapPin, Search, SearchX, X } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicContent } from '@/hooks/usePublicContent';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import '../styled/careers.css';
import toast from 'react-hot-toast';

type ApplicationFormState = {
  fullName: string;
  phone: string;
  expectedSalary: string;
  expectedSalaryRaw: string;
  referralSource: string;
  cvFile: File | null;
};

const initialFormState: ApplicationFormState = {
  fullName: '',
  phone: '',
  expectedSalary: '',
  expectedSalaryRaw: '',
  referralSource: '',
  cvFile: null,
};

const API_BASE_URL =
  import.meta.env.VITE_WORKER_API_BASE_URL ||
  'https://an-dang-landing-page.tranhoanghiep0411.workers.dev';

const OFFICE_VIEWER_BASE_URL = 'https://view.officeapps.live.com/op/embed.aspx?src=';

export function CareersDetailPage() {
  const location = useLocation();
  const { settings, jobs } = usePublicContent();
  const { locale } = useLanguage();
  const { id } = useParams();

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState<(typeof jobs)[number] | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [previewJob, setPreviewJob] = useState<(typeof jobs)[number] | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [jobs]);

  useEffect(() => {
    const shouldLockScroll = isApplyModalOpen || isPreviewModalOpen;
    const originalOverflow = document.body.style.overflow;

    if (shouldLockScroll) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isApplyModalOpen, isPreviewModalOpen]);

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
  };

  const isPdfFile = (url: string) => getFileExtension(url) === 'pdf';

  const isOfficeFile = (url: string) =>
    ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(getFileExtension(url));

  const canPreviewInline = (url?: string | null) => {
    if (!url) return false;
    return isPdfFile(url) || isOfficeFile(url);
  };

  const isMobileOrTablet = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  };

  const getDirectViewerUrl = (url: string) => {
    const encodedUrl = encodeURIComponent(url);

    if (isPdfFile(url)) {
      return `${url}${url.includes('?') ? '&' : '?'}#toolbar=1&navpanes=0&view=FitH`;
    }

    if (isOfficeFile(url)) {
      return `${OFFICE_VIEWER_BASE_URL}${encodedUrl}`;
    }

    return url;
  };

  const previewTitle = useMemo(() => {
    if (!previewJob) return '';
    return locale === 'vi' ? previewJob.title_vi : previewJob.title_en;
  }, [locale, previewJob]);

  const normalizeText = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[—–]/g, '-')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getTokens = (value: string) => {
    return normalizeText(value).split(' ').filter(Boolean);
  };

  const getInitials = (value: string) => {
    return getTokens(value)
      .map((word) => word[0])
      .join('');
  };

  const getSearchScore = (jobTitle: string, keyword: string) => {
    const normalizedTitle = normalizeText(jobTitle);
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedKeyword) return 1;

    const titleTokens = getTokens(jobTitle);
    const keywordTokens = getTokens(keyword);
    const initials = getInitials(jobTitle);

    let score = 0;

    if (normalizedTitle === normalizedKeyword) score += 1000;
    if (normalizedTitle.startsWith(normalizedKeyword)) score += 300;
    if (normalizedTitle.includes(normalizedKeyword)) score += 200;

    if (initials === normalizedKeyword) score += 260;
    if (initials.startsWith(normalizedKeyword)) score += 220;
    if (initials.includes(normalizedKeyword)) score += 180;

    const allKeywordTokensExist = keywordTokens.every((keywordToken) =>
      titleTokens.some((titleToken) => titleToken.includes(keywordToken)),
    );

    if (allKeywordTokensExist) score += 160;

    keywordTokens.forEach((keywordToken) => {
      titleTokens.forEach((titleToken) => {
        if (titleToken === keywordToken) {
          score += 80;
        } else if (titleToken.startsWith(keywordToken)) {
          score += 50;
        } else if (titleToken.includes(keywordToken)) {
          score += 30;
        }
      });
    });

    return score;
  };

  const formatSalaryInput = (value: string) => {
    const numeric = value.replace(/\D/g, '');

    if (!numeric) {
      return {
        formatted: '',
        raw: '',
      };
    }

    return {
      formatted: Number(numeric).toLocaleString('en-US'),
      raw: numeric,
    };
  };

  const openApplyModal = (job: (typeof jobs)[number]) => {
    setSelectedJob(job);
    setFormData(initialFormState);
    setIsApplyModalOpen(true);
  };

  const closeApplyModal = () => {
    if (isSubmitting) return;
    setIsApplyModalOpen(false);
    setSelectedJob(null);
    setFormData(initialFormState);
  };

  const openJDPreview = (job: (typeof jobs)[number]) => {
    if (!job.jd_file_url) return;

    const title = locale === 'vi' ? job.title_vi : job.title_en;
    const viewerUrl = getDirectViewerUrl(job.jd_file_url);

    if (!canPreviewInline(job.jd_file_url)) {
      window.open(job.jd_file_url, '_blank', 'noopener,noreferrer');
      toast.success(locale === 'vi' ? 'Đã mở JD ở tab mới.' : 'JD has been opened in a new tab.');
      return;
    }

    if (isMobileOrTablet() && isOfficeFile(job.jd_file_url)) {
      window.open(viewerUrl, '_blank', 'noopener,noreferrer');
      toast.success(
        locale === 'vi'
          ? 'Đã mở JD ở chế độ tối ưu cho thiết bị di động.'
          : 'JD opened in a mobile-optimized view.',
      );
      return;
    }

    setPreviewJob(job);
    setPreviewUrl(viewerUrl);
    setIsPreviewLoading(true);
    setIsPreviewModalOpen(true);

    toast.success(locale === 'vi' ? `Đang mở JD: ${title}` : `Opening JD: ${title}`);
  };

  const closeJDPreview = () => {
    setIsPreviewModalOpen(false);
    setPreviewJob(null);
    setPreviewUrl('');
    setIsPreviewLoading(false);
  };

  const openJDInNewTab = () => {
    if (!previewUrl) return;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === 'cvFile') {
      setFormData((prev) => ({
        ...prev,
        cvFile: files?.[0] || null,
      }));
      return;
    }

    if (name === 'expectedSalary') {
      const { formatted, raw } = formatSalaryInput(value);
      setFormData((prev) => ({
        ...prev,
        expectedSalary: formatted,
        expectedSalaryRaw: raw,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedJob) return;

    if (!formData.fullName.trim()) {
      toast.error(locale === 'vi' ? 'Vui lòng nhập họ và tên.' : 'Please enter your full name.');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error(
        locale === 'vi' ? 'Vui lòng nhập số liên lạc.' : 'Please enter your phone number.',
      );
      return;
    }

    if (!formData.expectedSalaryRaw.trim()) {
      toast.error(
        locale === 'vi' ? 'Vui lòng nhập mức lương mong muốn.' : 'Please enter expected salary.',
      );
      return;
    }

    if (!formData.cvFile) {
      toast.error(locale === 'vi' ? 'Vui lòng chọn file CV.' : 'Please upload your CV file.');
      return;
    }

    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExtension = formData.cvFile.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(
        locale === 'vi'
          ? 'Chỉ hỗ trợ file PDF, DOC, DOCX.'
          : 'Only PDF, DOC, DOCX files are allowed.',
      );
      return;
    }

    if (formData.cvFile.size > 5 * 1024 * 1024) {
      toast.error(
        locale === 'vi' ? 'File CV không được vượt quá 5MB.' : 'CV file must not exceed 5MB.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append('full_name', formData.fullName);
      payload.append('phone', formData.phone);
      payload.append('expected_salary', formData.expectedSalaryRaw);
      payload.append('job_id', String(selectedJob.id));
      payload.append('job_title', locale === 'vi' ? selectedJob.title_vi : selectedJob.title_en);
      payload.append('locale', locale);
      payload.append('referral_source', formData.referralSource || '');
      payload.append('cv_file', formData.cvFile);

      const response = await fetch(`${API_BASE_URL}/api/job-application`, {
        method: 'POST',
        body: payload,
      });

      const rawText = await response.text();
      let data: { success?: boolean; message?: string } | null = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        console.error('Response parse error:', parseError, rawText);
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            rawText ||
            (locale === 'vi' ? 'Gửi ứng tuyển thất bại.' : 'Submit application failed.'),
        );
      }

      toast.success(
        locale === 'vi'
          ? 'Ứng tuyển thành công. Chúng tôi sẽ liên hệ sớm.'
          : 'Application submitted successfully. We will contact you soon.',
      );

      closeApplyModal();
    } catch (error) {
      console.error('Submit application error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : locale === 'vi'
            ? 'Gửi ứng tuyển thất bại. Vui lòng thử lại.'
            : 'Failed to submit application. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const targetId = String(id || location.state?.scrollTo || '');

    if (!targetId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!jobs?.length) return;

    const el = document.getElementById(targetId);
    if (!el) return;

    const navbar = document.getElementById('navbar');
    const offset = navbar?.offsetHeight ?? 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset - 100;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });

    const highlightTimer = setTimeout(() => {
      setActiveJobId(targetId);

      setTimeout(() => {
        setActiveJobId(null);
      }, 2500);
    }, 500);

    return () => clearTimeout(highlightTimer);
  }, [id, location.state, jobs, isLoading]);

  const filteredJobs = useMemo(() => {
    const sortedJobs = [...jobs].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    const keyword = normalizeText(searchKeyword);

    if (!keyword) return sortedJobs;

    return sortedJobs
      .map((job, originalIndex) => {
        const jobTitle = locale === 'vi' ? job.title_vi : job.title_en;
        const score = getSearchScore(jobTitle, keyword);

        return {
          job,
          score,
          originalIndex,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.originalIndex - b.originalIndex;
      })
      .map((item) => item.job);
  }, [jobs, locale, searchKeyword]);

  return (
    <>
      <div>
        <Navbar settings={settings} />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="careers">
          <Link
            to="/careers"
            state={{ scrollTo: 'careers' }}
            className="mb-5 inline-flex text-sm text-brand-gold transition hover:opacity-80"
          >
            ← {locale === 'vi' ? 'Quay lại trang chủ' : 'Back to home'}
          </Link>

          <SectionHeading
            eyebrow={locale === 'vi' ? 'Tuyển dụng' : 'Careers'}
            title={
              locale === 'vi'
                ? 'Gia nhập đội ngũ công nghệ đang tăng tốc.'
                : 'Join a technology team that moves with ambition.'
            }
            subtitle={
              locale === 'vi'
                ? 'Tăng cơ hội hợp tác với các doanh nghiệp lớn.'
                : 'Increase opportunities for collaboration with large businesses.'
            }
            description=""
          />

          <div className="mt-8">
            <div className="relative max-w-md">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
                <Search size={18} />
              </span>

              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={
                  locale === 'vi'
                    ? 'Tìm kiếm vị trí: BA, tester, angular dev...'
                    : 'Search jobs: BA, tester, angular dev...'
                }
                className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-white outline-none placeholder:text-white/35 focus:border-brand-gold"
              />

              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-[260px] animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-6 w-40 rounded-full bg-white/10" />
                    <div className="h-6 w-24 rounded-full bg-white/10" />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <div className="h-4 w-28 rounded-full bg-white/10" />
                    <div className="h-4 w-24 rounded-full bg-white/10" />
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="h-4 w-full rounded-full bg-white/10" />
                    <div className="h-4 w-11/12 rounded-full bg-white/10" />
                    <div className="h-4 w-9/12 rounded-full bg-white/10" />
                    <div className="h-4 w-8/12 rounded-full bg-white/10" />
                  </div>

                  <div className="mt-6 h-10 w-36 rounded-full bg-white/10" />
                </div>
              ))
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => {
                const isActive = activeJobId === job.id;
                const hasJD = !!job.jd_file_url;

                return (
                  <div id={job.id} key={job.id}>
                    <motion.article
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={
                        isActive
                          ? { duration: 0.6, repeat: 1 }
                          : { duration: 0.4, delay: index * 0.08 }
                      }
                      animate={
                        isActive
                          ? {
                              boxShadow: [
                                '0 0 0 0 rgba(242,181,68,0)',
                                '0 0 0 2px rgba(242,181,68,0.55)',
                                '0 0 0 8px rgba(242,181,68,0.16)',
                                '0 0 0 2px rgba(242,181,68,0.55)',
                                '0 0 0 0 rgba(242,181,68,0)',
                              ],
                            }
                          : {
                              boxShadow: '0 0 0 0 rgba(242,181,68,0)',
                            }
                      }
                      className="group flex min-h-[300px] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-[0_12px_40px_rgba(242,181,68,0.12)] md:p-6"
                    >
                      <Link to={`/careers/list/${job.id}`} className="block min-h-0 flex-1">
                        <div className="flex flex-col gap-3 md:gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <h3 className="text-[18px] font-semibold leading-[1.35] text-white md:text-[22px] xl:text-xl">
                            {locale === 'vi' ? job.title_vi : job.title_en}
                          </h3>

                          <span className="w-fit shrink-0 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-brand-gold md:text-xs">
                            {locale === 'vi' ? job.type_vi : job.type_en}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-white/65 md:text-sm">
                          <span className="inline-flex items-center gap-2">
                            <MapPin size={16} />
                            {locale === 'vi' ? job.location_vi : job.location_en}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <BriefcaseBusiness size={16} />
                            {locale === 'vi' ? job.type_vi : job.type_en}
                          </span>
                        </div>

                        <div className="mt-4 overflow-hidden">
                          <p className="job-desc text-sm leading-7 text-white/70">
                            {locale === 'vi' ? job.description_vi : job.description_en}
                          </p>
                        </div>
                      </Link>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={!hasJD}
                          onClick={() => openJDPreview(job)}
                          className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                            hasJD
                              ? 'bg-brand-gold text-black hover:opacity-90'
                              : 'cursor-not-allowed bg-white/10 text-white/35'
                          }`}
                        >
                          <ExternalLink size={16} />
                          {locale === 'vi' ? 'Xem chi tiết JD' : 'View detail JD'}
                        </button>

                        <button
                          type="button"
                          onClick={() => openApplyModal(job)}
                          className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-gold/30 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-brand-gold hover:bg-brand-gold hover:text-black"
                        >
                          {locale === 'vi' ? 'Ứng tuyển' : 'Apply now'}
                        </button>
                      </div>
                    </motion.article>
                  </div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2"
              >
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-md">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
                    <SearchX size={28} />
                  </div>

                  <h3 className="text-xl font-semibold text-white">
                    {searchKeyword
                      ? locale === 'vi'
                        ? 'Không tìm thấy vị trí phù hợp'
                        : 'No matching jobs found'
                      : locale === 'vi'
                        ? 'Hiện chưa có vị trí tuyển dụng'
                        : 'No openings at the moment'}
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
                    {searchKeyword
                      ? locale === 'vi'
                        ? 'Không có công việc nào khớp với từ khóa bạn nhập. Vui lòng thử từ khóa khác như BA, tester, angular dev...'
                        : 'No jobs match your search keyword. Try another keyword such as BA, tester, angular dev...'
                      : locale === 'vi'
                        ? 'Hiện tại chúng tôi chưa có vị trí tuyển dụng đang mở. Vui lòng quay lại sau để cập nhật những cơ hội nghề nghiệp mới nhất.'
                        : 'There are currently no open positions. Please check back later for upcoming career opportunities.'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <Footer settings={settings} />
      </div>

      {isPreviewModalOpen && previewJob && (
        <div className="fixed inset-0 z-[1000] bg-black/85">
          <div className="flex h-[100dvh] w-full items-center justify-center p-0 sm:p-4">
            <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0f172a] sm:h-[92dvh] sm:max-w-6xl sm:rounded-[1.5rem] sm:border sm:border-white/10 sm:shadow-2xl">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-white sm:text-lg">
                    {previewTitle}
                  </h3>
                  <p className="mt-1 text-xs text-white/60 sm:text-sm">
                    {locale === 'vi'
                      ? 'Xem JD trực tiếp trên web'
                      : 'Preview JD directly on the web'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={openJDInNewTab}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-all duration-300 hover:border-brand-gold hover:bg-brand-gold hover:text-black sm:px-4 sm:text-sm"
                  >
                    <ExternalLink size={16} />
                    <span className="hidden sm:inline">
                      {locale === 'vi' ? 'Mở tab mới' : 'Open new tab'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={closeJDPreview}
                    className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 bg-slate-950">
                {isPreviewLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/90">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                    <p className="text-sm text-white/70">
                      {locale === 'vi' ? 'Đang tải JD...' : 'Loading JD...'}
                    </p>
                  </div>
                )}

                <iframe
                  title={previewTitle || 'Job Description Preview'}
                  src={previewUrl}
                  className="h-full w-full"
                  onLoad={() => setIsPreviewLoading(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="relative w-full max-w-lg rounded-[1.5rem] border border-white/10 bg-[#0f172a] p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={closeApplyModal}
              className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="pr-10 text-lg font-semibold text-white sm:text-xl">
              {locale === 'vi' ? 'Ứng tuyển vị trí' : 'Apply for position'}
            </h3>

            <p className="mt-2 text-sm text-white/70">
              {locale === 'vi' ? selectedJob.title_vi : selectedJob.title_en}
            </p>

            <form onSubmit={handleSubmitApplication} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/80">
                  {locale === 'vi' ? 'Họ và tên' : 'Full name'}{' '}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-brand-gold"
                  placeholder={locale === 'vi' ? 'Nhập họ và tên' : 'Enter your full name'}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  {locale === 'vi' ? 'Thông tin liên hệ' : 'Contact information'}{' '}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-brand-gold"
                  placeholder={
                    locale === 'vi' ? 'Nhập số điện thoại/email' : 'Enter your phone number/email'
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  {locale === 'vi' ? 'Mức lương mong muốn (GROSS)' : 'Expected salary (GROSS)'}{' '}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-brand-gold"
                  placeholder={locale === 'vi' ? 'Ví dụ: 25,000,000' : 'Example: 25,000,000'}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  {locale === 'vi'
                    ? 'Nguồn giới thiệu (không bắt buộc)'
                    : 'Referral source (optional)'}
                </label>
                <input
                  name="referralSource"
                  value={formData.referralSource}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-brand-gold"
                  placeholder={
                    locale === 'vi'
                      ? 'Ví dụ: Tên người giới thiệu, Facebook, bạn bè, LinkedIn...'
                      : `Examples: Referrer's name, Facebook, friends, LinkedIn...`
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  CV <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  name="cvFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleInputChange}
                  className="block w-full text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-brand-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:opacity-90"
                />
                <p className="mt-2 text-xs text-white/45">
                  {locale === 'vi'
                    ? 'Hỗ trợ PDF, DOC, DOCX. Tối đa 5MB.'
                    : 'Supported: PDF, DOC, DOCX. Max 5MB.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-brand-gold px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? locale === 'vi'
                    ? 'Đang gửi...'
                    : 'Submitting...'
                  : locale === 'vi'
                    ? 'Gửi ứng tuyển'
                    : 'Submit application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
