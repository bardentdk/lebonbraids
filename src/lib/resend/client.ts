import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
  replyTo: process.env.RESEND_REPLY_TO,
} as const;