import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import fs from 'node:fs'
import { createHandler, escapeHtml, cleanValue } from '../api/_lib/handler.js'
import { sendMail, detectProvider } from '../api/_lib/mail.js'
import { FORMS, DEFAULT_TO } from '../api/_lib/forms.js'

const ORIGIN = 'https://aiadverts.co.za'

function makeReq({ method = 'POST', headers = {}, body, raw } = {}) {
  const payload = raw !== undefined ? raw : body === undefined ? '' : JSON.stringify(body)
  const req = Readable.from(payload ? [Buffer.from(payload)] : [])
  req.method = method
  req.headers = { 'content-type': 'application/json', origin: ORIGIN, referer: `${ORIGIN}/`, ...headers }
  return req
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value
    },
    end(data = '') {
      this.body = String(data)
    }
  }
}

async function call(handler, opts) {
  const res = makeRes()
  await handler(makeReq(opts), res)
  let json = null
  try {
    json = JSON.parse(res.body)
  } catch {
    json = null
  }
  return { status: res.statusCode, headers: res.headers, json, body: res.body }
}

function recorder(result = { ok: true, provider: 'test' }) {
  const calls = []
  const send = async (msg) => {
    calls.push(msg)
    if (typeof result === 'function') return result(msg)
    return result
  }
  return { send, calls }
}

// A valid set of values for any configured form, derived from its own config
function validFields(form) {
  const fields = {}
  for (const f of form.fields) {
    if (f.type === 'email') fields[f.name] = 'thandi@example.co.za'
    else if (f.multiline) fields[f.name] = 'Hello,\nWe would like two video adverts.'
    else if (f.name === form.senderField) fields[f.name] = 'Thandi Nkosi'
    else fields[f.name] = `Sample ${f.label}`.slice(0, f.maxLength)
  }
  fields[form.honeypot] = ''
  return fields
}

const firstFormId = Object.keys(FORMS)[0]
const firstForm = FORMS[firstFormId]

describe('valid submissions', () => {
  for (const [id, form] of Object.entries(FORMS)) {
    test(`form "${id}" is accepted and mailed with Reply-To set to the visitor`, async () => {
      const { send, calls } = recorder()
      const fields = validFields(form)
      const r = await call(createHandler({ send }), { body: { form: id, fields } })
      assert.equal(r.status, 200)
      assert.deepEqual(r.json, { ok: true })
      assert.equal(calls.length, 1)
      const msg = calls[0]
      assert.equal(msg.replyTo, fields[form.replyToField])
      assert.ok(msg.subject.includes(form.label), 'subject names the form')
      assert.ok(msg.subject.includes(fields[form.senderField]), 'subject names the sender')
      assert.ok(msg.subject.includes(form.page), 'subject names the page')
      for (const f of form.fields) assert.ok(msg.text.includes(f.label), `text body includes ${f.label}`)
      assert.ok(msg.html.startsWith('<!doctype html>'), 'has an HTML body')
      assert.ok(msg.text.length > 0, 'has a plain-text body')
    })
  }
})

describe('hardening', () => {
  test('honeypot: filled hidden field is accepted silently and nothing is sent', async () => {
    const { send, calls } = recorder()
    const fields = { ...validFields(firstForm), [firstForm.honeypot]: 'http://spam.example' }
    const r = await call(createHandler({ send }), { body: { form: firstFormId, fields } })
    assert.equal(r.status, 200)
    assert.deepEqual(r.json, { ok: true })
    assert.equal(calls.length, 0)
  })

  test('missing required fields are rejected server-side, one field at a time', async () => {
    for (const f of firstForm.fields.filter((x) => x.required)) {
      const { send, calls } = recorder()
      const fields = validFields(firstForm)
      fields[f.name] = '   '
      const r = await call(createHandler({ send }), { body: { form: firstFormId, fields } })
      assert.equal(r.status, 400, f.name)
      assert.equal(r.json.error, 'validation')
      assert.equal(r.json.field, f.name)
      assert.equal(r.json.reason, 'required')
      assert.equal(calls.length, 0)
    }
  })

  test('malformed email addresses are rejected', async () => {
    for (const bad of ['not-an-email', 'a@b', 'x y@example.com', 'a@b.com\r\nBcc: victim@example.com', '<a@b.com>', 'a@b..com']) {
      const { send, calls } = recorder()
      const fields = { ...validFields(firstForm), email: bad }
      const r = await call(createHandler({ send }), { body: { form: firstFormId, fields } })
      assert.equal(r.status, 400, JSON.stringify(bad))
      assert.equal(r.json.reason, 'invalid', JSON.stringify(bad))
      assert.equal(calls.length, 0)
    }
  })

  test('unknown form ids are rejected, including prototype keys', async () => {
    for (const id of ['newsletter', '', '__proto__', 'constructor', 'toString']) {
      const { send, calls } = recorder()
      const r = await call(createHandler({ send }), { body: { form: id, fields: validFields(firstForm) } })
      assert.equal(r.status, 400, id)
      assert.equal(r.json.error, 'unknown_form', id)
      assert.equal(calls.length, 0)
    }
  })

  test('non-POST methods are rejected with Allow: POST', async () => {
    for (const method of ['GET', 'PUT', 'DELETE', 'OPTIONS']) {
      const r = await call(createHandler({ send: recorder().send }), { method })
      assert.equal(r.status, 405, method)
      assert.equal(r.headers.allow, 'POST')
    }
  })

  test('foreign or missing Origin is rejected', async () => {
    for (const origin of ['https://evil.example', 'http://aiadverts.co.za', 'https://aiadverts.co.za.evil.example', undefined]) {
      const { send, calls } = recorder()
      const r = await call(createHandler({ send }), {
        headers: { origin },
        body: { form: firstFormId, fields: validFields(firstForm) }
      })
      assert.equal(r.status, 403, String(origin))
      assert.equal(r.json.error, 'forbidden_origin')
      assert.equal(calls.length, 0)
    }
  })

  test('www subdomain is an accepted origin', async () => {
    const { send, calls } = recorder()
    const r = await call(createHandler({ send }), {
      headers: { origin: 'https://www.aiadverts.co.za', referer: 'https://www.aiadverts.co.za/' },
      body: { form: firstFormId, fields: validFields(firstForm) }
    })
    assert.equal(r.status, 200)
    assert.equal(calls.length, 1)
  })

  test('header injection: CR/LF in single-line fields is stripped, never reaching the subject', async () => {
    const { send, calls } = recorder()
    const fields = {
      ...validFields(firstForm),
      name: 'Evil\r\nBcc: victim@example.com\nX-Injected: 1',
      business: 'Line one\rLine two\u2028Line three'
    }
    const r = await call(createHandler({ send }), { body: { form: firstFormId, fields } })
    assert.equal(r.status, 200)
    const msg = calls[0]
    assert.doesNotMatch(msg.subject, /[\r\n]/)
    assert.equal(msg.replyTo, 'thandi@example.co.za')
    assert.ok(msg.text.includes('Name: Evil Bcc: victim@example.com X-Injected: 1'))
    assert.ok(msg.text.includes('Business name: Line one Line two Line three'))
    assert.equal(cleanValue('a\r\nb', false), 'a b')
  })

  test('line breaks are kept only in the multiline message field', async () => {
    const { send, calls } = recorder()
    const fields = { ...validFields(firstForm), message: 'First line\r\nSecond line\n\nThird' }
    await call(createHandler({ send }), { body: { form: firstFormId, fields } })
    assert.ok(calls[0].text.includes('First line\nSecond line\n\nThird'))
    assert.ok(calls[0].html.includes('First line<br>Second line<br><br>Third'))
  })

  test('over-length fields are rejected, and oversized bodies are refused', async () => {
    for (const f of firstForm.fields) {
      const { send, calls } = recorder()
      const fields = validFields(firstForm)
      fields[f.name] = f.type === 'email' ? `${'a'.repeat(f.maxLength)}@example.com` : 'x'.repeat(f.maxLength + 1)
      const r = await call(createHandler({ send }), { body: { form: firstFormId, fields } })
      assert.equal(r.status, 400, f.name)
      assert.equal(r.json.reason, 'too_long', f.name)
      assert.equal(calls.length, 0)
    }
    const huge = await call(createHandler({ send: recorder().send }), {
      body: { form: firstFormId, fields: { ...validFields(firstForm), message: 'x'.repeat(40000) } }
    })
    assert.equal(huge.status, 413)
  })

  test('every value is HTML-escaped in the HTML body', async () => {
    const { send, calls } = recorder()
    const fields = {
      ...validFields(firstForm),
      name: '<script>alert("x")</script>',
      business: 'Tom & Jerry\'s <b>Shop</b>',
      message: '<img src=x onerror=alert(1)>'
    }
    await call(createHandler({ send }), { body: { form: firstFormId, fields } })
    const { html } = calls[0]
    assert.ok(!html.includes('<script>'), 'no raw script tag')
    assert.ok(!html.includes('<img src=x'), 'no raw img tag')
    assert.ok(!html.includes('<b>Shop</b>'), 'no raw markup')
    assert.ok(html.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'))
    assert.ok(html.includes('Tom &amp; Jerry&#39;s &lt;b&gt;Shop&lt;/b&gt;'))
    assert.equal(escapeHtml('<a href="x">'), '&lt;a href=&quot;x&quot;&gt;')
  })

  test('invalid JSON and unsupported content types are rejected', async () => {
    const bad = await call(createHandler({ send: recorder().send }), { raw: '{not json' })
    assert.equal(bad.status, 400)
    assert.equal(bad.json.error, 'bad_request')
    const text = await call(createHandler({ send: recorder().send }), { headers: { 'content-type': 'text/plain' }, raw: 'hello' })
    assert.equal(text.status, 415)
  })
})

describe('failure behaviour', () => {
  test('provider rejects the send: 502 send_failed, nothing pretends to succeed', async () => {
    const { send, calls } = recorder({ ok: false, reason: 'send_failed', provider: 'smtp', status: 535 })
    const r = await call(createHandler({ send }), { body: { form: firstFormId, fields: validFields(firstForm) } })
    assert.equal(calls.length, 1)
    assert.equal(r.status, 502)
    assert.deepEqual(r.json, { ok: false, error: 'send_failed' })
  })

  test('provider throws: 502 send_failed', async () => {
    const send = async () => {
      throw new Error('socket hang up')
    }
    const r = await call(createHandler({ send }), { body: { form: firstFormId, fields: validFields(firstForm) } })
    assert.equal(r.status, 502)
    assert.equal(r.json.error, 'send_failed')
  })

  test('no provider configured: 503 not_configured (real sendMail, empty env)', async () => {
    const handler = createHandler({ send: (msg) => sendMail(msg, {}) })
    const r = await call(handler, { body: { form: firstFormId, fields: validFields(firstForm) } })
    assert.equal(r.status, 503)
    assert.deepEqual(r.json, { ok: false, error: 'not_configured' })
  })

  test('logs on failure never contain submitted values or credentials', async () => {
    const logged = []
    const original = console.error
    console.error = (...args) => logged.push(args.join(' '))
    try {
      const env = { SMTP_HOST: 'smtp.example.com', SMTP_PORT: '465', SMTP_USER: 'user@example.com', SMTP_PASS: 'hunter2-secret' }
      const deps = { createTransport: () => ({ sendMail: async () => { const e = new Error('Invalid login: hunter2-secret'); e.responseCode = 535; throw e } }) }
      const handler = createHandler({ send: (msg) => sendMail(msg, env, deps) })
      const fields = { ...validFields(firstForm), name: 'Unique Visitor Name', message: 'A very private message body' }
      const r = await call(handler, { body: { form: firstFormId, fields } })
      assert.equal(r.status, 502)
    } finally {
      console.error = original
    }
    const all = logged.join('\n')
    assert.ok(all.length > 0, 'something was logged')
    for (const secret of ['Unique Visitor Name', 'A very private message body', 'thandi@example.co.za', 'hunter2-secret', 'user@example.com']) {
      assert.ok(!all.includes(secret), `log must not contain ${secret}`)
    }
    assert.ok(all.includes('status: 535'))
  })

  test('native no-JavaScript form posts get an HTML confirmation page', async () => {
    const { send, calls } = recorder()
    const params = new URLSearchParams({ _form: firstFormId, ...validFields(firstForm) }).toString()
    const r = await call(createHandler({ send }), { headers: { 'content-type': 'application/x-www-form-urlencoded' }, raw: params })
    assert.equal(r.status, 200)
    assert.match(r.headers['content-type'], /text\/html/)
    assert.ok(r.body.includes('Message sent'))
    assert.equal(calls.length, 1)
  })
})

describe('mail provider selection', () => {
  const msg = { replyTo: 'visitor@example.com', subject: 'Contact form (Homepage): Visitor', text: 'hi', html: '<p>hi</p>' }

  test('nothing configured returns not_configured', async () => {
    assert.equal(detectProvider({}), 'none')
    assert.deepEqual(await sendMail(msg, {}), { ok: false, reason: 'not_configured', provider: 'none' })
  })

  test('Resend is used when RESEND_API_KEY is set, and wins over SMTP', async () => {
    const requests = []
    const fetch = async (url, init) => {
      requests.push({ url, init })
      return { ok: true, status: 200 }
    }
    const env = { RESEND_API_KEY: 're_test_key', SMTP_HOST: 'smtp.example.com', SMTP_USER: 'u', SMTP_PASS: 'p' }
    const result = await sendMail(msg, env, { fetch, createTransport: () => assert.fail('SMTP must not be used') })
    assert.deepEqual(result, { ok: true, provider: 'resend' })
    assert.equal(requests[0].url, 'https://api.resend.com/emails')
    assert.equal(requests[0].init.headers.Authorization, 'Bearer re_test_key')
    const body = JSON.parse(requests[0].init.body)
    assert.equal(body.reply_to, 'visitor@example.com')
    assert.deepEqual(body.to, [DEFAULT_TO])
    assert.equal(body.subject, msg.subject)
    assert.ok(body.text && body.html)
  })

  test('Resend rejection and network errors return send_failed', async () => {
    const rejected = await sendMail(msg, { RESEND_API_KEY: 'k' }, { fetch: async () => ({ ok: false, status: 422 }) })
    assert.deepEqual(rejected, { ok: false, reason: 'send_failed', provider: 'resend', status: 422 })
    const offline = await sendMail(msg, { RESEND_API_KEY: 'k' }, { fetch: async () => { throw new TypeError('fetch failed') } })
    assert.equal(offline.reason, 'send_failed')
  })

  test('SMTP port 465 uses implicit TLS; any other port requires STARTTLS', async () => {
    const seen = []
    const createTransport = (opts) => {
      seen.push(opts)
      return { sendMail: async (mail) => { seen.push(mail) } }
    }
    const base = { SMTP_HOST: 'smtp.hostinger.com', SMTP_USER: 'vip@webafy.co.za', SMTP_PASS: 'x' }
    assert.equal((await sendMail(msg, { ...base, SMTP_PORT: '465' }, { createTransport })).ok, true)
    assert.equal(seen[0].secure, true)
    assert.equal(seen[0].requireTLS, false)
    const mail = seen[1]
    assert.equal(mail.replyTo, 'visitor@example.com')
    assert.equal(mail.to, DEFAULT_TO)
    assert.equal(mail.from, 'Aiadverts Website <vip@webafy.co.za>')
    await sendMail(msg, { ...base, SMTP_PORT: '587' }, { createTransport })
    assert.equal(seen[2].secure, false)
    assert.equal(seen[2].requireTLS, true)
    await sendMail(msg, { ...base }, { createTransport })
    assert.equal(seen[4].port, 587, 'defaults to 587 with STARTTLS')
  })

  test('MAIL_TO and MAIL_FROM overrides are honoured', async () => {
    let sent
    const createTransport = () => ({ sendMail: async (mail) => { sent = mail } })
    await sendMail(msg, { SMTP_HOST: 'h', SMTP_USER: 'u@x.com', SMTP_PASS: 'p', MAIL_TO: 'other@example.com', MAIL_FROM: 'Site <noreply@example.com>' }, { createTransport })
    assert.equal(sent.to, 'other@example.com')
    assert.equal(sent.from, 'Site <noreply@example.com>')
  })
})

describe('markup matches endpoint config', () => {
  const built = new URL('../dist/index.html', import.meta.url)
  const html = fs.existsSync(built) ? fs.readFileSync(built, 'utf8') : null

  const attrs = (tag) => {
    const out = {}
    for (const m of tag.matchAll(/([a-zA-Z_:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? ''
    return out
  }

  for (const [id, form] of Object.entries(FORMS)) {
    test(`built page field names, required flags and length caps match the "${id}" config`, { skip: !html && 'run npm run build first' }, () => {
      const start = html.search(new RegExp(`<form[^>]*data-form=["']?${id}["']?`))
      assert.ok(start >= 0, `form data-form="${id}" exists on the page`)
      const chunk = html.slice(start, html.indexOf('</form>', start))
      const formTag = attrs(chunk.slice(0, chunk.indexOf('>') + 1))
      assert.equal(formTag.action, '/api/contact')
      const controls = [...chunk.matchAll(/<(input|textarea|select)\b[^>]*>/g)].map((m) => attrs(m[0]))
      const byName = Object.fromEntries(controls.map((c) => [c.name, c]))

      const expected = new Set([...form.fields.map((f) => f.name), form.honeypot, '_form'])
      assert.deepEqual(new Set(Object.keys(byName)), expected, 'field names match exactly')
      assert.equal(byName._form.value, id, 'hidden _form carries the form id')
      for (const f of form.fields) {
        assert.equal('required' in byName[f.name], f.required, `${f.name} required flag`)
        assert.equal(Number(byName[f.name].maxlength), f.maxLength, `${f.name} maxlength`)
      }
      assert.ok(!('required' in byName[form.honeypot]), 'honeypot is never required')
    })
  }
})
