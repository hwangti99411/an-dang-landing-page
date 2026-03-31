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

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

async function saveToSupabase(
  env: Bindings,
  table: 'leads' | 'bookings',
  payload: Record<string, unknown>
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
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Telegram send failed: ${await response.text()}`);
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
      ].join('\n')
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
      ].join('\n')
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

app.notFound((c) => c.json({ message: 'Not Found' }, 404));

app.onError((error, c) => {
  console.error('Worker error:', error);
  return c.json({ success: false, message: error.message || 'Internal Server Error' }, 500);
});

export default app;