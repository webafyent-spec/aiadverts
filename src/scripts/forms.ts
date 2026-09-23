// Progressive enhancement for every <form data-form>. The browser's own required-field
// validation still runs first (the submit event only fires once it passes); the
// submission is then sent as JSON and the page never navigates.

const TIMEOUT_MS = 15000

type Kind = 'success' | 'error' | 'offline'
type ServerReply = { ok?: boolean; error?: string; field?: string; reason?: string; label?: string }

function enhance(form: HTMLFormElement) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')
  const status = form.querySelector<HTMLElement>('[data-form-status]')
  if (!button || !status) return

  const idleLabel = button.textContent?.trim() || 'Send'
  button.dataset.state = 'idle'
  const fallback = {
    whatsappLabel: form.dataset.fallbackWhatsapp ?? '',
    whatsappUrl: form.dataset.fallbackWhatsappUrl ?? '',
    email: form.dataset.fallbackEmail ?? ''
  }

  const setButton = (state: 'idle' | 'sending' | 'sent') => {
    button.dataset.state = state
    button.disabled = state !== 'idle'
    button.textContent = state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent ✓' : idleLabel
  }

  const hideStatus = () => {
    status.hidden = true
    status.textContent = ''
    status.removeAttribute('data-kind')
    status.removeAttribute('role')
  }

  const show = (kind: Kind, heading: string, body: string, withFallback: boolean) => {
    status.textContent = ''
    status.dataset.kind = kind
    if (kind === 'success') status.removeAttribute('role')
    else status.setAttribute('role', 'alert')

    const title = document.createElement('p')
    title.className = 'form-status-title'
    title.textContent = heading
    const text = document.createElement('p')
    text.className = 'form-status-text'
    text.textContent = body
    status.append(title, text)

    if (withFallback && (fallback.whatsappUrl || fallback.email)) {
      const alt = document.createElement('p')
      alt.className = 'form-status-text'
      if (fallback.whatsappUrl) {
        const link = document.createElement('a')
        link.href = fallback.whatsappUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.textContent = `WhatsApp ${fallback.whatsappLabel}`
        alt.append(link)
      }
      if (fallback.email) {
        if (fallback.whatsappUrl) alt.append(' or email ')
        const email = document.createElement('span')
        email.className = 'form-status-email'
        email.textContent = fallback.email
        alt.append(email)
      }
      status.append(alt)
    }
    status.hidden = false
  }

  const clearFieldErrors = () => {
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.removeAttribute('aria-invalid'))
  }

  const showFailure = (body: string) =>
    show('error', "We couldn't send your message", body, true)

  form.addEventListener('input', (event) => {
    const target = event.target as HTMLElement
    target.removeAttribute?.('aria-invalid')
    if (button.dataset.state === 'sent') {
      setButton('idle')
      hideStatus()
    }
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (button.dataset.state === 'sending') return
    clearFieldErrors()

    if (!navigator.onLine) {
      show('offline', "You're offline", 'Check your connection and try again. Your message is still here, or reach us directly:', true)
      return
    }

    const data = new FormData(form)
    data.delete('_form')
    const fields: Record<string, string> = {}
    data.forEach((value, key) => {
      if (typeof value === 'string') fields[key] = value
    })

    setButton('sending')
    hideStatus()

    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ form: form.dataset.form, fields }),
        credentials: 'same-origin',
        signal: controller.signal
      })
      let reply: ServerReply | null = null
      try {
        reply = await response.json()
      } catch {
        reply = null
      }

      if (response.ok && reply?.ok) {
        form.reset()
        setButton('sent')
        show('success', 'Message sent', "Thanks for getting in touch. We'll reply to the email address you gave us.", false)
        return
      }

      setButton('idle')
      if (reply?.error === 'validation' && reply.field) {
        const input = form.querySelector<HTMLElement>(`[name="${CSS.escape(reply.field)}"]`)
        input?.setAttribute('aria-invalid', 'true')
        input?.focus()
        const label = reply.label ?? 'this field'
        const message =
          reply.reason === 'invalid'
            ? 'Please enter a valid email address.'
            : reply.reason === 'too_long'
              ? `Your ${label.toLowerCase()} is too long. Please shorten it and try again.`
              : `Please fill in your ${label.toLowerCase()}.`
        show('error', 'Please check the form', message, false)
        return
      }
      showFailure('Your message is still here. Please try again in a moment, or reach us directly:')
    } catch {
      setButton('idle')
      if (!navigator.onLine) {
        show('offline', "You're offline", 'Check your connection and try again. Your message is still here, or reach us directly:', true)
      } else {
        showFailure('The connection timed out. Your message is still here. Please try again, or reach us directly:')
      }
    } finally {
      window.clearTimeout(timer)
    }
  })
}

document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach(enhance)
