import { DEFAULT_TO } from './forms.js'

// Provider is chosen purely from environment variables, in this order:
// RESEND_API_KEY, then SMTP_HOST + SMTP_USER + SMTP_PASS. Switching provider is an
// env-var change in the host's settings, never a code change.

const oneLine = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim()

export function detectProvider(env = process.env) {
  if (env.RESEND_API_KEY) return 'resend'
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) return 'smtp'
  return 'none'
}

export async function sendMail(msg, env = process.env, deps = {}) {
  const to = oneLine(env.MAIL_TO) || DEFAULT_TO
  const provider = detectProvider(env)

  if (provider === 'resend') {
    const from = oneLine(env.MAIL_FROM) || 'Aiadverts Website <onboarding@resend.dev>'
    const doFetch = deps.fetch ?? fetch
    try {
      const response = await doFetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: msg.replyTo,
          subject: msg.subject,
          text: msg.text,
          html: msg.html
        }),
        signal: AbortSignal.timeout(10000)
      })
      if (response.ok) return { ok: true, provider }
      return { ok: false, reason: 'send_failed', provider, status: response.status }
    } catch {
      return { ok: false, reason: 'send_failed', provider }
    }
  }

  if (provider === 'smtp') {
    const port = Number(env.SMTP_PORT) || 587
    const createTransport = deps.createTransport ?? (await import('nodemailer')).default.createTransport
    const transporter = createTransport({
      host: oneLine(env.SMTP_HOST),
      port,
      // 465 is implicit TLS; every other port must upgrade with STARTTLS
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: oneLine(env.SMTP_USER), pass: env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    })
    const from = oneLine(env.MAIL_FROM) || `Aiadverts Website <${oneLine(env.SMTP_USER)}>`
    try {
      await transporter.sendMail({
        from,
        to,
        replyTo: msg.replyTo,
        subject: msg.subject,
        text: msg.text,
        html: msg.html
      })
      return { ok: true, provider }
    } catch (err) {
      return { ok: false, reason: 'send_failed', provider, status: err?.responseCode }
    }
  }

  return { ok: false, reason: 'not_configured', provider }
}
