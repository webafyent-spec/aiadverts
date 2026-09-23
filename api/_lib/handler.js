import { FORMS, SITE_ORIGINS, FALLBACK } from './forms.js'

const MAX_BODY_BYTES = 32 * 1024
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:".]+(\.[^\s@<>()[\]\\,;:".]+)+$/

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Only multiline fields keep line breaks; every other field loses all control
// characters (CR, LF, tabs, Unicode line separators) so nothing can reach a mail header.
export function cleanValue(raw, multiline = false) {
  let value = raw == null ? '' : String(raw)
  value = value.replace(/\r\n?/g, '\n')
  value = multiline
    ? value.replace(/[\u0000-\u0009\u000B-\u001F\u007F\u2028\u2029]/g, '')
    : value.replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, ' ')
  return value.trim()
}

export function validate(form, fields) {
  const values = {}
  for (const field of form.fields) {
    const value = cleanValue(fields[field.name], field.multiline)
    if (value.length > field.maxLength) {
      return { ok: false, error: 'validation', field: field.name, reason: 'too_long', label: field.label }
    }
    if (field.required && value === '') {
      return { ok: false, error: 'validation', field: field.name, reason: 'required', label: field.label }
    }
    if (field.type === 'email' && value !== '' && !EMAIL_RE.test(value)) {
      return { ok: false, error: 'validation', field: field.name, reason: 'invalid', label: field.label }
    }
    values[field.name] = value
  }
  return { ok: true, values }
}

export function buildMessage(formId, form, values, pageUrl) {
  const sender = values[form.senderField] || 'website visitor'
  const pageLabel = pageUrl && new URL(pageUrl).pathname !== '/' ? new URL(pageUrl).pathname : form.page
  const subject = `${form.label} (${pageLabel}): ${sender}`.slice(0, 200)

  const rows = form.fields.map((f) => ({ label: f.label, value: values[f.name], multiline: f.multiline }))
  const text = [
    `New ${form.label.toLowerCase()} submission from ${pageUrl || form.page}`,
    '',
    ...rows.flatMap((r) => (r.multiline ? ['', `${r.label}:`, r.value || '(not provided)'] : [`${r.label}: ${r.value || '(not provided)'}`])),
    '',
    `Reply to this email to answer ${sender} directly.`
  ].join('\n')

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#F8F8F8;font-family:Arial,Helvetica,sans-serif;color:#1A1A2E">
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;border-collapse:separate;overflow:hidden">
<tr><td style="background:#1A3A5C;padding:18px 24px;color:#ffffff;font-size:16px;font-weight:bold">${escapeHtml(form.label)}: ${escapeHtml(sender)}</td></tr>
<tr><td style="padding:20px 24px">
<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;line-height:1.5">
${rows
  .map(
    (r) => `<tr><td style="padding:8px 12px 8px 0;vertical-align:top;color:#1A3A5C;font-weight:bold;white-space:nowrap">${escapeHtml(r.label)}</td><td style="padding:8px 0;vertical-align:top">${
      r.value ? escapeHtml(r.value).replace(/\n/g, '<br>') : '<span style="color:#888">(not provided)</span>'
    }</td></tr>`
  )
  .join('\n')}
</table>
<p style="margin:20px 0 0;font-size:12px;color:#888">Sent from ${escapeHtml(pageUrl || form.page)}. Reply to this email to answer ${escapeHtml(sender)} directly.</p>
</td></tr></table></body></html>`

  return { formId, replyTo: values[form.replyToField], subject, text, html }
}

function readStream(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        resolve(null)
        req.destroy?.()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function readPayload(req) {
  const type = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
  if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) return { error: 'too_large' }

  let body
  try {
    body = req.body
  } catch {
    return { error: 'bad_request' }
  }
  if (body === undefined) {
    body = await readStream(req)
    if (body === null) return { error: 'too_large' }
  }
  if (Buffer.isBuffer(body)) body = body.toString('utf8')
  const size = typeof body === 'string' ? body.length : JSON.stringify(body ?? '').length
  if (size > MAX_BODY_BYTES) return { error: 'too_large' }

  if (type === 'application/json') {
    let data = body
    if (typeof body === 'string') {
      try {
        data = JSON.parse(body)
      } catch {
        return { error: 'bad_request' }
      }
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { error: 'bad_request' }
    const fields = data.fields && typeof data.fields === 'object' && !Array.isArray(data.fields) ? data.fields : null
    return { mode: 'json', formId: data.form, fields }
  }

  if (type === 'application/x-www-form-urlencoded') {
    const data = typeof body === 'string' ? Object.fromEntries(new URLSearchParams(body)) : { ...(body || {}) }
    const { _form: formId, ...fields } = data
    return { mode: 'html', formId, fields }
  }

  return { error: 'unsupported_type' }
}

function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(data))
}

// Used only when a browser without JavaScript submits the form natively.
function sendHtml(res, status, data) {
  const ok = data.ok
  const heading = ok ? 'Message sent' : "We couldn't send your message"
  const body = ok
    ? 'Thanks for getting in touch. We will reply to the email address you gave us.'
    : `Please go back and try again, or reach us directly on WhatsApp ${escapeHtml(FALLBACK.whatsappLabel)} or by email at ${escapeHtml(FALLBACK.email)}.`
  res.statusCode = status
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(`<!doctype html><html lang="en-ZA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${heading} | Aiadverts</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0A0A0A;color:#fff;font-family:Arial,Helvetica,sans-serif;padding:24px">
<main style="max-width:480px;text-align:center"><h1 style="font-size:28px;margin:0 0 12px">${heading}</h1><p style="color:rgba(255,255,255,.7);line-height:1.6">${body}</p>
<p style="margin-top:28px"><a href="/#contact" style="display:inline-block;background:#0066FF;color:#fff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">Back to Aiadverts</a></p></main></body></html>`)
}

export function allowedOriginsFor(env = process.env) {
  const origins = [...SITE_ORIGINS]
  if (env.VERCEL_ENV && env.VERCEL_ENV !== 'production' && env.VERCEL_URL) origins.push(`https://${env.VERCEL_URL}`)
  return origins
}

export function createHandler({ send, allowedOrigins, env = process.env }) {
  return async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return sendJson(res, 405, { ok: false, error: 'method_not_allowed' })
    }

    const origins = allowedOrigins ?? allowedOriginsFor(env)
    const origin = req.headers.origin
    if (!origin || !origins.includes(origin)) return sendJson(res, 403, { ok: false, error: 'forbidden_origin' })

    const payload = await readPayload(req)
    if (payload.error) {
      const status = payload.error === 'too_large' ? 413 : payload.error === 'unsupported_type' ? 415 : 400
      return sendJson(res, status, { ok: false, error: payload.error })
    }
    const reply = (status, data) => (payload.mode === 'html' ? sendHtml(res, status, data) : sendJson(res, status, data))

    const formId = typeof payload.formId === 'string' ? payload.formId : ''
    const form = Object.hasOwn(FORMS, formId) ? FORMS[formId] : null
    if (!form || !payload.fields) return reply(400, { ok: false, error: 'unknown_form' })

    // Bots fill the hidden field; accept silently so they learn nothing, and send nothing.
    if (cleanValue(payload.fields[form.honeypot]) !== '') return reply(200, { ok: true })

    const checked = validate(form, payload.fields)
    if (!checked.ok) return reply(400, checked)

    let pageUrl = null
    try {
      const ref = new URL(req.headers.referer || '')
      if (ref.origin === origin) pageUrl = ref.origin + ref.pathname
    } catch {
      pageUrl = null
    }

    const message = buildMessage(formId, form, checked.values, pageUrl)
    let result
    try {
      result = await send(message, env)
    } catch {
      result = { ok: false, reason: 'send_failed', provider: 'unknown' }
    }

    if (!result?.ok) {
      const notConfigured = result?.reason === 'not_configured'
      // Log the outcome only: never the submitted values or any credentials.
      console.error(
        `[forms] ${notConfigured ? 'no mail provider configured' : 'mail provider rejected the send'}` +
          ` (form: ${formId}, provider: ${result?.provider ?? 'unknown'}${result?.status ? `, status: ${result.status}` : ''})`
      )
      return reply(notConfigured ? 503 : 502, { ok: false, error: notConfigured ? 'not_configured' : 'send_failed' })
    }

    return reply(200, { ok: true })
  }
}
