import { createHandler } from './_lib/handler.js'
import { sendMail } from './_lib/mail.js'

// Vercel serverless function: every form on the site posts here.
export default createHandler({ send: sendMail })
