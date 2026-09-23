# Contact form setup

The homepage contact form (`/#contact-form`) sends submissions server-side to
**vip@webafy.co.za**. Visitors press Send once, see a confirmation on the page, and
nothing opens their mail app.

Until the environment variables below are set **and the site is redeployed**, the
form shows visitors a "We couldn't send your message" notice with your WhatsApp
number and email address, and keeps what they typed. Nothing is lost silently.

## How it works

| Piece | File |
|---|---|
| Serverless endpoint (Vercel function) | `api/contact.js` |
| Per-form config: fields, labels, required, length caps | `api/_lib/forms.js` |
| Validation, spam and security checks | `api/_lib/handler.js` |
| Email sending (Resend or SMTP, chosen by env vars) | `api/_lib/mail.js` |
| The form itself | `src/components/ContactForm.astro` |
| Browser behaviour (sending, confirmation, errors, offline) | `src/scripts/forms.ts` |
| Tests | `tests/forms.test.mjs` (`npm test`) |

## Step 1: choose how emails are sent

### Recommended: your Hostinger mailbox (SMTP)

The mail for **webafy.co.za** is hosted by **Hostinger** (MX records
`mx1.hostinger.com` and `mx2.hostinger.com`), and the domain's SPF record authorises
Hostinger's servers. Sending through Hostinger as vip@webafy.co.za therefore passes
your DMARC policy (`p=quarantine`), so the messages won't be sent to junk.

Enter these four variables:

| Name | Value |
|---|---|
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `vip@webafy.co.za` |
| `SMTP_PASS` | The password of the **vip@webafy.co.za mailbox** (enter it yourself in Vercel) |

`SMTP_PASS` is the email account's own password, the one you'd use to log in to
Hostinger webmail. It is **not** your Hostinger (hPanel) account password. If you
don't know it, reset it in hPanel under **Emails → Email Accounts**.

Port 465 uses an encrypted connection from the start. If 465 is ever blocked, use
`587` instead; the code switches to STARTTLS automatically.

### Alternative: Resend

Only if you'd rather use [Resend](https://resend.com):

| Name | Value |
|---|---|
| `RESEND_API_KEY` | Your Resend API key |
| `MAIL_FROM` | An address on a domain you've verified in Resend, e.g. `Aiadverts Website <forms@aiadverts.co.za>` |

Verifying **aiadverts.co.za** in Resend means adding the DNS records Resend gives you
at your DNS provider. aiadverts.co.za's DNS is hosted at GoDaddy. Until a domain is
verified, Resend only lets you send from `onboarding@resend.dev` to the email address
on your own Resend account.

If `RESEND_API_KEY` is set, Resend is used and the SMTP variables are ignored.
Switching provider is always just a change of environment variables.

### Optional overrides (both work with either provider)

| Name | Default if not set |
|---|---|
| `MAIL_TO` | `vip@webafy.co.za` |
| `MAIL_FROM` | `Aiadverts Website <SMTP_USER>` for SMTP. With Hostinger this must stay the vip@webafy.co.za mailbox. |

## Step 2: add them in Vercel

1. Go to [vercel.com](https://vercel.com), sign in and open the **aiadverts** project.
2. Click **Settings**, then **Environment Variables** in the left menu.
3. For each variable: type the **Key** (e.g. `SMTP_HOST`), paste the **Value**, and
   under **Environments** tick **Production**. Tick **Preview** as well if you want
   preview deployments to send real emails.
4. For `SMTP_PASS`, switch on **Sensitive** so the value can't be viewed again after saving.
5. Click **Save**. Repeat for every variable.

## Step 3: redeploy (required)

**Environment variables only apply to deployments made after you save them.** The
live site keeps running without them until you redeploy:

1. In the project, open **Deployments**.
2. Find the latest **Production** deployment, click the **⋯** menu and choose **Redeploy**.
3. Wait for it to show **Ready**.

(Pushing any new commit to `main` also creates a fresh deployment that picks them up.)

## Step 4: test it

1. Open <https://aiadverts.co.za/#contact-form> and send a message using your own details.
2. You should see **Message sent** on the page.
3. The email arrives at vip@webafy.co.za with a subject like
   **Contact form (Homepage): Your Name**. Pressing Reply answers the visitor directly.
4. Check the junk folder the first time, and mark it "not junk" if it landed there.

### If it says "We couldn't send your message"

In Vercel, open the project's **Logs** and look for a line starting `[forms]`:

| Log line | Meaning | Fix |
|---|---|---|
| `no mail provider configured` | The variables aren't reaching the function | Check the names are spelled exactly as above, **Production** is ticked, and you redeployed |
| `mail provider rejected the send (provider: smtp, status: 535)` | Wrong username or password | Re-enter `SMTP_USER` and `SMTP_PASS`, then redeploy |
| `mail provider rejected the send (provider: smtp)` with no status | Couldn't connect | Try `SMTP_PORT` = `587`, then redeploy |
| `mail provider rejected the send (provider: resend, status: 4xx)` | Resend refused it | Usually an unverified `MAIL_FROM` domain or an invalid key |

The logs never contain what visitors typed, or any passwords or keys.

## What the endpoint protects against

- **Spam bots:** a hidden "honeypot" field. Submissions that fill it are accepted and silently thrown away.
- **Other sites posting to your form:** only requests from aiadverts.co.za and www.aiadverts.co.za are accepted.
- **Bad data:** required fields, email format and maximum lengths are all checked on the server, not just in the browser.
- **Email header injection:** line breaks are removed from every field except the message.
- **Malicious HTML:** every value is escaped in the HTML version of the email.

Not included: rate limiting per visitor. If spam ever gets past the honeypot, that's the next thing to add.

## Adding another form later

1. Add an entry to `FORMS` in `api/_lib/forms.js` with its id, label, page and fields.
2. Build the form with `data-form="<id>"`, `action="/api/contact"`, a hidden
   `<input name="_form" value="<id>">`, the honeypot input named as in the config,
   a submit button and an element with `data-form-status`. Then add
   `<script>import '../scripts/forms'</script>`.
3. Run `npm run build` and then `npm test`. The markup test fails if any field name,
   required flag or length cap doesn't match the config.

## Testing locally

```bash
npm run build
```

```bash
npm test
```

```bash
node tests/serve-forms.mjs
```

The last command serves the built site at http://localhost:4400 with a fake mail
provider, so you can try the form without sending real email.
