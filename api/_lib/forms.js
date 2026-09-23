// One entry per form on the site. Each field `name` must match the input's name
// attribute in the form markup exactly; tests/forms.test.mjs checks this against
// the built pages. Adding a form is a new entry here, not new endpoint code.

export const SITE_ORIGINS = ['https://aiadverts.co.za', 'https://www.aiadverts.co.za']

export const DEFAULT_TO = 'vip@webafy.co.za'

export const FALLBACK = {
  whatsappLabel: '069 560 0708',
  whatsappUrl: 'https://wa.me/27695600708',
  email: 'vip@webafy.co.za'
}

export const FORMS = {
  contact: {
    label: 'Contact form',
    page: 'Homepage',
    honeypot: 'website',
    replyToField: 'email',
    senderField: 'name',
    fields: [
      { name: 'name', label: 'Name', required: true, maxLength: 100 },
      { name: 'email', label: 'Email', required: true, maxLength: 254, type: 'email' },
      { name: 'phone', label: 'Phone or WhatsApp', required: false, maxLength: 30 },
      { name: 'business', label: 'Business name', required: false, maxLength: 120 },
      { name: 'message', label: 'Message', required: true, maxLength: 5000, multiline: true }
    ]
  }
}
