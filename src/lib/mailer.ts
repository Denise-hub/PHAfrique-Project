import nodemailer from 'nodemailer'

// SMTP configuration from environment; used for application status emails (e.g. accepted/rejected).
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env

/** Create a Nodemailer transporter from env. Returns null if SMTP is not configured. */
export function getMailer(): nodemailer.Transporter | null {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null
  }
  const port = parseInt(SMTP_PORT, 10) || 587
  const secure = port === 465
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

/** Default "from" address for outgoing emails (optional env). */
export function getDefaultFrom(): string {
  return SMTP_FROM || SMTP_USER || 'noreply@phafrique.org'
}
