import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  VITE_COMPANY_NAME?: string;
  FORMSPREE_ENDPOINT?: string;
  WEB3FORMS_ACCESS_KEY?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

type Bindings = Env;

type LeadPayload = {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  service_interest?: string;
  message?: string;
  locale?: string;
};

type BookingPayload = {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  service_interest?: string;
  schedule_at?: string;
  message?: string;
  locale?: string;
};

type JobApplicationPayload = {
  full_name?: string;
  phone?: string;
  expected_salary?: string;
  job_id?: string;
  job_title?: string;
  locale?: string;
  referral_source?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/api/*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://tech.andanggroup.com',
      'https://andanggroup.com',
      'https://www.andanggroup.com',
    ],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

async function saveToSupabase(
  env: Bindings,
  table: 'leads' | 'bookings' | 'job_applications',
  payload: Record<string, unknown>,
) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Supabase insert failed: ${await response.text()}`);
  }
}

async function sendToExternal(env: Bindings, payload: Record<string, unknown>) {
  if (env.FORMSPREE_ENDPOINT) {
    const response = await fetch(env.FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Formspree send failed: ${await response.text()}`);
    }
  }

  if (env.WEB3FORMS_ACCESS_KEY) {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: env.WEB3FORMS_ACCESS_KEY,
        ...payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`Web3Forms send failed: ${await response.text()}`);
    }
  }
}

async function sendTelegram(env: Bindings, message: string) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn('Telegram env missing, skip sendMessage');
    return;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: message,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Telegram send failed: ${await response.text()}`);
  }
}

async function sendTelegramDocument(
  env: Bindings,
  options: {
    caption: string;
    file: File;
  },
) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn('Telegram env missing, skip sendDocument');
    return;
  }

  const formData = new FormData();
  formData.append('chat_id', env.TELEGRAM_CHAT_ID);
  formData.append('caption', options.caption);
  formData.append('document', options.file, options.file.name);

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`Telegram sendDocument failed: ${await response.text()}`);
  }
}

app.get('/api/health', (c) => {
  return c.json({
    ok: true,
    company: c.env.VITE_COMPANY_NAME ?? 'An Dang',
  });
});

app.post('/api/lead', async (c) => {
  const body = (await c.req.json()) as LeadPayload;

  const payload = {
    name: body.name ?? '',
    phone: body.phone ?? '',
    email: body.email ?? '',
    company: body.company ?? '',
    service_interest: body.service_interest ?? '',
    message: body.message ?? '',
    locale: body.locale ?? 'vi',
    source: 'landing-page',
    created_at: new Date().toISOString(),
  };

  await saveToSupabase(c.env, 'leads', payload);

  try {
    await sendTelegram(
      c.env,
      [
        '📩 Lead mới từ landing page An Đăng',
        `Họ tên: ${body.name ?? ''}`,
        `SĐT: ${body.phone ?? ''}`,
        `Email: ${body.email ?? ''}`,
        `Công ty: ${body.company ?? ''}`,
        `Dịch vụ quan tâm: ${body.service_interest ?? ''}`,
        `Nội dung: ${body.message ?? ''}`,
      ].join('\n'),
    );
  } catch (error) {
    console.error('Telegram error:', error);
  }

  try {
    await sendToExternal(c.env, {
      subject: 'New lead from An Dang landing page',
      ...payload,
    });
  } catch (error) {
    console.error('External notify error:', error);
  }

  return c.json({ success: true });
});

app.post('/api/booking', async (c) => {
  const body = (await c.req.json()) as BookingPayload;

  const payload = {
    name: body.name ?? '',
    phone: body.phone ?? '',
    email: body.email ?? '',
    company: body.company ?? '',
    service_interest: body.service_interest ?? '',
    schedule_at: body.schedule_at ?? '',
    message: body.message ?? '',
    locale: body.locale ?? 'vi',
    source: 'landing-page',
    created_at: new Date().toISOString(),
  };

  await saveToSupabase(c.env, 'bookings', payload);

  try {
    await sendTelegram(
      c.env,
      [
        '📅 Lịch tư vấn mới từ landing page An Đăng',
        `Họ tên: ${body.name ?? ''}`,
        `SĐT: ${body.phone ?? ''}`,
        `Email: ${body.email ?? ''}`,
        `Công ty: ${body.company ?? ''}`,
        `Dịch vụ quan tâm: ${body.service_interest ?? ''}`,
        `Thời gian mong muốn: ${body.schedule_at ?? ''}`,
        `Nội dung: ${body.message ?? ''}`,
      ].join('\n'),
    );
  } catch (error) {
    console.error('Telegram error:', error);
  }

  try {
    await sendToExternal(c.env, {
      subject: 'New consultation booking from An Dang landing page',
      ...payload,
    });
  } catch (error) {
    console.error('External notify error:', error);
  }

  return c.json({ success: true });
});

app.post('/api/job-application', async (c) => {
  try {
    const formData = await c.req.formData();

    const body: JobApplicationPayload = {
      full_name: String(formData.get('full_name') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      expected_salary: String(formData.get('expected_salary') ?? ''),
      job_id: String(formData.get('job_id') ?? ''),
      job_title: String(formData.get('job_title') ?? ''),
      locale: String(formData.get('locale') ?? 'vi'),
      referral_source: String(formData.get('referral_source') ?? ''),
    };

    const cvFile = formData.get('cv_file');

    if (
      !body.full_name?.trim() ||
      !body.phone?.trim() ||
      !body.expected_salary?.trim() ||
      !body.job_title?.trim()
    ) {
      return c.json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' }, 400);
    }

    if (!(cvFile instanceof File)) {
      return c.json({ success: false, message: 'Vui lòng tải lên file CV.' }, 400);
    }

    if (cvFile.size === 0) {
      return c.json(
        {
          success: false,
          message: 'File CV không hợp lệ. Vui lòng chọn lại file có nội dung.',
        },
        400,
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(cvFile.type)) {
      return c.json(
        {
          success: false,
          message: 'Chỉ hỗ trợ file PDF, DOC hoặc DOCX.',
        },
        400,
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (cvFile.size > maxSize) {
      return c.json(
        {
          success: false,
          message: 'File CV không được vượt quá 5MB.',
        },
        400,
      );
    }

    const payload = {
      full_name: body.full_name,
      phone: body.phone,
      expected_salary: body.expected_salary,
      job_id: body.job_id,
      job_title: body.job_title,
      locale: body.locale,
      referral_source: body.referral_source || null,
      cv_file_name: cvFile.name,
      cv_file_type: cvFile.type,
      source: 'careers-page',
      created_at: new Date().toISOString(),
    };

    await saveToSupabase(c.env, 'job_applications', payload);

    try {
      await sendTelegramDocument(c.env, {
        file: cvFile,
        caption: [
          '📥 ỨNG TUYỂN MỚI',
          `Vị trí ứng tuyển: ${body.job_title}`,
          `Job ID: ${body.job_id || ''}`,
          `Tên ứng viên: ${body.full_name}`,
          `Số liên lạc: ${body.phone}`,
          `Mức lương mong muốn: ${body.expected_salary}`,
          body.referral_source ? `Nguồn: ${body.referral_source}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      });
    } catch (error) {
      console.error('Telegram document error:', error);
      // Không trả lỗi kỹ thuật về cho người dùng
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Job application route error:', error);

    return c.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại sau.',
      },
      500,
    );
  }
});

app.notFound((c) => c.json({ success: false, message: 'Not Found' }, 404));

app.onError((error, c) => {
  console.error('Worker error:', error);

  return c.json(
    {
      success: false,
      message: 'Có lỗi hệ thống xảy ra. Vui lòng thử lại sau.',
    },
    500,
  );
});

export default app;
