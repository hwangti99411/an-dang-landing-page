import { motion } from 'framer-motion';
import { BriefcaseBusiness, MapPin, SearchX, X } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import type { JobItem } from '@/types';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

export function CareersSection({ jobs }: { jobs: JobItem[] }) {
  const { locale } = useLanguage();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [jobs]);

  const isIOS = () => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  const isAndroid = () => {
    if (typeof navigator === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      if (isIOS()) {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 1000);
        return;
      }

      if (isAndroid()) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed', err);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (fallbackErr) {
        console.error('Fallback download failed', fallbackErr);
      }
    }
  };

  const normalizeFileName = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const getExtension = (url: string) => {
    return url.split('.').pop()?.split('?')[0] || 'file';
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

  const openApplyModal = (job: JobItem) => {
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
      payload.append('job_id', selectedJob.id);
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

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="careers">
        <SectionHeading
          eyebrow={locale === 'vi' ? 'Tuyển dụng' : 'Careers'}
          title={
            locale === 'vi'
              ? 'Gia nhập đội ngũ công nghệ đang tăng tốc.'
              : 'Join a technology team that moves with ambition.'
          }
          description=""
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md animate-pulse"
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
                  <div className="h-4 w-8/12 rounded-full bg-white/10" />
                </div>

                <div className="mt-6 h-5 w-32 rounded-full bg-white/10" />
              </div>
            ))
          ) : jobs.length > 0 ? (
            jobs
              .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
              .slice(0, 4)
              .map((job, index) => {
                const isDownloading = downloadingId === job.id;

                return (
                  <motion.article
                    key={job.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-[0_12px_40px_rgba(242,181,68,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-white leading-snug">
                        {locale === 'vi' ? job.title_vi : job.title_en}
                      </h3>

                      <span className="shrink-0 rounded-full bg-brand-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-gold border border-brand-gold/20">
                        {locale === 'vi' ? job.type_vi : job.type_en}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/65">
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={16} />
                        {locale === 'vi' ? job.location_vi : job.location_en}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <BriefcaseBusiness size={16} />
                        {locale === 'vi' ? job.type_vi : job.type_en}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-white/70">
                      {locale === 'vi' ? job.description_vi : job.description_en}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={!job.jd_file_url || isDownloading}
                        onClick={async () => {
                          if (!job.jd_file_url || isDownloading) return;

                          setDownloadingId(job.id);
                          try {
                            const title = locale === 'vi' ? job.title_vi : job.title_en;
                            const ext = getExtension(job.jd_file_url);
                            const fileName = `${normalizeFileName(title)}-job-AnDangTech.${ext}`;
                            await downloadFile(job.jd_file_url, fileName);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setDownloadingId(null);
                          }
                        }}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                          job.jd_file_url
                            ? 'bg-brand-gold text-black hover:opacity-90'
                            : 'cursor-not-allowed bg-white/10 text-white/35'
                        }`}
                      >
                        {isDownloading && (
                          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        )}

                        {isDownloading
                          ? locale === 'vi'
                            ? 'Đang tải...'
                            : 'Downloading...'
                          : locale === 'vi'
                            ? 'Xem chi tiết JD'
                            : 'View detail JD'}
                      </button>

                      <button
                        type="button"
                        onClick={() => openApplyModal(job)}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-brand-gold hover:bg-brand-gold hover:text-black"
                      >
                        {locale === 'vi' ? 'Ứng tuyển' : 'Apply now'}
                      </button>
                    </div>
                  </motion.article>
                );
              })
          ) : (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2"
            >
              <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-md">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
                  <SearchX size={28} />
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {locale === 'vi' ? 'Hiện chưa có vị trí tuyển dụng' : 'No openings at the moment'}
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
                  {locale === 'vi'
                    ? 'Hiện tại chúng tôi chưa có vị trí tuyển dụng đang mở. Vui lòng quay lại sau để cập nhật những cơ hội nghề nghiệp mới nhất.'
                    : 'There are currently no open positions. Please check back later for upcoming career opportunities.'}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {!isLoading && !!jobs.length && (
          <div className="mt-10 text-center">
            <Link
              to="/careers/details"
              state={{ scrollTo: null }}
              className="inline-flex rounded-full bg-[#f2b544] px-6 py-3 font-semibold text-black transition hover:opacity-90"
            >
              {locale === 'vi' ? 'Xem thêm' : 'See more'}
            </Link>
          </div>
        )}
      </section>

      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="relative w-full max-w-lg rounded-[1.5rem] border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeApplyModal}
              className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-semibold text-white">
              {locale === 'vi' ? 'Ứng tuyển vị trí' : 'Apply for position'}
            </h3>

            <p className="mt-2 text-sm text-white/70">
              {locale === 'vi' ? selectedJob.title_vi : selectedJob.title_en}
            </p>

            <form onSubmit={handleSubmitApplication} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/80">
                  {locale === 'vi' ? 'Họ và tên' : 'Full name'}
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
                  {locale === 'vi' ? 'Thông tin liên hệ' : 'Contact information'}
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
                  {locale === 'vi' ? 'Mức lương mong muốn (GROSS)' : 'Expected salary (GROSS)'}
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
                      ? 'Ví dụ: Facebook, bạn bè, LinkedIn...'
                      : 'Example: Facebook, friend, LinkedIn...'
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">CV</label>
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
