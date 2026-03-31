import { useEffect, useState } from 'react';
import { CalendarClock, Mail, MapPin, Phone } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO, isValid } from 'date-fns';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BookingPayload, LeadPayload, SiteSettings } from '@/types';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://an-dang-landing-page.tranhoanghiep0411.workers.dev/api';

export function ContactSection({ settings }: { settings: SiteSettings }) {
  const { locale } = useLanguage();

  const [lead, setLead] = useState<LeadPayload>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    service_interest: '',
    locale,
  });

  const [booking, setBooking] = useState<BookingPayload>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    service_interest: '',
    schedule_at: '',
    locale,
  });

  const [status, setStatus] = useState('');

  useEffect(() => {
    setLead((prev) => ({ ...prev, locale }));
    setBooking((prev) => ({ ...prev, locale }));
  }, [locale]);

  const postJson = async (url: string, payload: unknown) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: unknown = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      throw new Error(
        typeof data === 'object' && data && 'message' in data
          ? String((data as { message?: string }).message || 'Request failed')
          : `Request failed with status ${res.status}`,
      );
    }

    return data;
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(locale === 'vi' ? 'Đang gửi...' : 'Sending...');

    try {
      await postJson(`${API_BASE}/lead`, { ...lead, locale });
      setStatus(locale === 'vi' ? 'Gửi thông tin thành công.' : 'Lead sent successfully.');
      setLead({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        service_interest: '',
        locale,
      });
    } catch (error) {
      console.error('lead submit error', error);
      setStatus(
        error instanceof Error
          ? error.message
          : locale === 'vi'
            ? 'Gửi thất bại, vui lòng kiểm tra cấu hình API.'
            : 'Submission failed. Please verify API configuration.',
      );
    }
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(locale === 'vi' ? 'Đang tạo lịch...' : 'Booking...');

    try {
      await postJson(`${API_BASE}/booking`, { ...booking, locale });
      setStatus(
        locale === 'vi' ? 'Đặt lịch tư vấn thành công.' : 'Consultation booked successfully.',
      );
      setBooking({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        service_interest: '',
        schedule_at: '',
        locale,
      });
    } catch (error) {
      console.error('booking submit error', error);
      setStatus(
        error instanceof Error
          ? error.message
          : locale === 'vi'
            ? 'Đặt lịch thất bại, vui lòng kiểm tra cấu hình API.'
            : 'Booking failed. Please verify API configuration.',
      );
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="contact">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow={locale === 'vi' ? 'Liên hệ' : 'Contact'}
            title={
              locale === 'vi'
                ? 'Trao đổi nhu cầu, nhận đề xuất và lên lịch tư vấn.'
                : 'Share your needs, receive a proposal, and book a consultation.'
            }
            description={
              locale === 'vi'
                ? 'Form đã kết nối sẵn với Hono API để lưu lead, đặt lịch và mở rộng tích hợp với Formspree, Web3Forms hoặc API riêng.'
                : 'The forms are already connected to the Hono API for leads and bookings, and can be extended to Formspree, Web3Forms, or a custom API.'
            }
          />
          <div className="mt-8 space-y-4 text-sm text-white/72">
            <div className="glass flex items-start gap-3 rounded-3xl p-4">
              <Phone className="mt-1 text-brand-gold" size={18} />
              {settings.phone}
            </div>
            <div className="glass flex items-start gap-3 rounded-3xl p-4">
              <Mail className="mt-1 text-brand-gold" size={18} />
              {settings.email}
            </div>
            <div className="glass flex items-start gap-3 rounded-3xl p-4">
              <MapPin className="mt-1 text-brand-gold" size={18} />
              {locale === 'vi' ? settings.address_vi : settings.address_en}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={submitLead} className="glass rounded-[2rem] p-6">
            <h3 className="text-xl font-semibold text-white">
              {locale === 'vi' ? 'Để lại thông tin' : 'Leave your details'}
            </h3>
            <div className="mt-5 space-y-3">
              <input
                className="input"
                placeholder={locale === 'vi' ? 'Họ và tên' : 'Full name'}
                value={lead.name}
                onChange={(e) => setLead({ ...lead, name: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Email"
                type="email"
                value={lead.email}
                onChange={(e) => setLead({ ...lead, email: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder={locale === 'vi' ? 'Số điện thoại' : 'Phone number'}
                value={lead.phone}
                onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder={locale === 'vi' ? 'Tên công ty' : 'Company'}
                value={lead.company}
                onChange={(e) => setLead({ ...lead, company: e.target.value })}
              />
              <input
                className="input"
                placeholder={locale === 'vi' ? 'Dịch vụ quan tâm' : 'Interested service'}
                value={lead.service_interest}
                onChange={(e) => setLead({ ...lead, service_interest: e.target.value })}
              />
              <textarea
                className="input min-h-28"
                placeholder={
                  locale === 'vi' ? 'Mô tả ngắn nhu cầu của bạn' : 'Tell us about your needs'
                }
                value={lead.message}
                onChange={(e) => setLead({ ...lead, message: e.target.value })}
                required
              />
            </div>
            <button className="btn-primary mt-5 w-full">
              {locale === 'vi' ? 'Nhận báo giá / tư vấn' : 'Get proposal / consultation'}
            </button>
          </form>

          <form onSubmit={submitBooking} className="glass rounded-[2rem] p-6">
            <div className="flex items-center gap-3 text-white">
              <CalendarClock className="text-brand-gold" />
              <h3 className="text-xl font-semibold">
                {locale === 'vi' ? 'Đặt lịch tư vấn' : 'Book a consultation'}
              </h3>
            </div>
            <div className="mt-5 space-y-3">
              <input
                className="input"
                placeholder={locale === 'vi' ? 'Họ và tên' : 'Full name'}
                value={booking.name}
                onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Email"
                type="email"
                value={booking.email}
                onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder={locale === 'vi' ? 'Số điện thoại' : 'Phone number'}
                value={booking.phone}
                onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder={locale === 'vi' ? 'Tên công ty' : 'Company'}
                value={booking.company}
                onChange={(e) => setBooking({ ...booking, company: e.target.value })}
              />
              <input
                className="input"
                placeholder={locale === 'vi' ? 'Dịch vụ quan tâm' : 'Interested service'}
                value={booking.service_interest}
                onChange={(e) => setBooking({ ...booking, service_interest: e.target.value })}
              />
              <div className="datepicker-wrapper">
                <DatePicker
                  selected={
                    booking.schedule_at
                      ? (() => {
                          const parsed = parseISO(booking.schedule_at);
                          return isValid(parsed) ? parsed : null;
                        })()
                      : null
                  }
                  onChange={(date: any) =>
                    setBooking({
                      ...booking,
                      schedule_at: date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : '',
                    })
                  }
                  showTimeSelect
                  timeIntervals={30}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText={locale === 'vi' ? 'Chọn ngày giờ' : 'Select date and time'}
                  calendarClassName="booking-datepicker"
                  popperClassName="booking-datepicker-popper"
                  wrapperClassName="datepicker-full"
                  className="input w-full"
                  popperPlacement="bottom"
                  portalId="root"
                  required
                />
              </div>
              <textarea
                className="input min-h-28"
                placeholder={
                  locale === 'vi' ? 'Nội dung cần trao đổi' : 'What would you like to discuss?'
                }
                value={booking.message}
                onChange={(e) => setBooking({ ...booking, message: e.target.value })}
                required
              />
            </div>
            <button className="btn-secondary mt-5 w-full">
              {locale === 'vi' ? 'Xác nhận lịch hẹn' : 'Confirm booking'}
            </button>
          </form>

          {status && <div className="text-sm text-white/70 xl:col-span-2">{status}</div>}
        </div>
      </div>
    </section>
  );
}
