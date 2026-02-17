// ============================================================================
// TASKIFY - Email Configuration & Utilities
// Nodemailer setup za slanje email obaveštenja
// ============================================================================

import nodemailer from 'nodemailer';
import { env } from './env.js';

// ============================================================================
// TRANSPORTER SETUP
// ============================================================================

let transporter = null;

if (env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
} else {
  console.warn('[EMAIL] SMTP_HOST is not configured. Email sending is disabled.');
}

// ============================================================================
// SEND EMAIL - Generička funkcija za slanje emaila
// ============================================================================
export async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.warn('[EMAIL] SMTP not configured, skipping email to:', to);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log('[EMAIL] Sent to:', to, '| Subject:', subject);
  } catch (e) {
    console.error('[EMAIL] Failed to send email to:', to, e.message);
  }
}

// ============================================================================
// SEND TASK ASSIGNED EMAIL
// ============================================================================
export async function sendTaskAssignedEmail({ to, taskTitle, projectName, assignedBy, boardLink }) {
  if (!transporter) {
    console.warn('[EMAIL] SMTP not configured, skipping task assigned email to:', to);
    return;
  }

  const subject = `Taskify - Dodeljen vam je task: ${taskTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #6366f1; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">Taskify</h1>
      </div>
      <div style="padding: 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">Novi task vam je dodeljen</h2>
        <p style="color: #4b5563;">
          <strong>${assignedBy}</strong> vam je dodelio/la task u projektu <strong>${projectName}</strong>.
        </p>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">${taskTitle}</p>
        </div>
        ${boardLink ? `
        <a href="${boardLink}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          Pogledaj na board-u
        </a>
        ` : ''}
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Ovo je automatsko obaveštenje iz Taskify aplikacije.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to, subject, html });
}

// ============================================================================
// SEND MEMBER ADDED EMAIL
// ============================================================================
export async function sendMemberAddedEmail({ to, projectName, addedBy, projectLink }) {
  if (!transporter) {
    console.warn('[EMAIL] SMTP not configured, skipping member added email to:', to);
    return;
  }

  const subject = `Taskify - Dodati ste u projekat: ${projectName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #6366f1; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">Taskify</h1>
      </div>
      <div style="padding: 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">Dodati ste u projekat</h2>
        <p style="color: #4b5563;">
          <strong>${addedBy}</strong> vas je dodao/la u projekat <strong>${projectName}</strong>.
        </p>
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">${projectName}</p>
        </div>
        ${projectLink ? `
        <a href="${projectLink}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          Otvori projekat
        </a>
        ` : ''}
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Ovo je automatsko obaveštenje iz Taskify aplikacije.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to, subject, html });
}
