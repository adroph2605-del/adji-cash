// Sends through SMTP when SMTP_* env vars are set; otherwise just logs (messages are still saved in the db).
import nodemailer from 'nodemailer'

let transport
function get() {
  if (transport !== undefined) return transport
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  transport = SMTP_HOST
    ? nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT || 587), secure: Number(SMTP_PORT) === 465, auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined })
    : null
  return transport
}
export async function sendMail({ to, subject, text, replyTo }) {
  const t = get()
  if (!t) { console.log(`[mail:dev] to=${to} subject="${subject}"\n${text}\n`); return false }
  await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text, replyTo })
  return true
}
