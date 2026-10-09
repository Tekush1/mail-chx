const crypto = require('crypto');
const { build } = require('../public/tpl.js');

const eq = (a, b) => {
  a = Buffer.from(String(a)); b = Buffer.from(String(b));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const ENV = process.env;

async function one(p, to, subject, html, att, inline) {
  const reply = ENV.REPLY_TO;
  const unsub = reply ? { 'List-Unsubscribe': `<mailto:${reply}?subject=unsubscribe>` } : {};
  let r;
  if (p === 'resend') {
    const attachments = att ? [{ filename: att.name, content: att.data, ...(inline ? { content_id: 'img1' } : {}) }] : undefined;
    r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ENV.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: ENV.FROM_RESEND, to: [to], subject, html, reply_to: reply, attachments, headers: unsub }),
    });
  } else {
    const m = /^(.*)<(.+)>$/.exec(ENV.FROM_BREVO || '');
    r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': ENV.BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: m ? { name: m[1].trim().replace(/"/g, ''), email: m[2] } : { email: ENV.FROM_BREVO },
        to: [{ email: to }], subject, htmlContent: html,
        replyTo: reply ? { email: reply } : undefined,
        attachment: att ? [{ name: att.name, content: att.data }] : undefined,
        headers: unsub,
      }),
    });
  }
  return r.ok ? { to, ok: true } : { to, ok: false, error: (await r.text()).slice(0, 200) };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  if (!ENV.ADMIN_PASSWORD || !eq(req.headers['x-admin-password'] || '', ENV.ADMIN_PASSWORD))
    return res.status(401).json({ error: 'Wrong password' });
  const b = req.body || {};
  if (b.ping) return res.json({ ok: true });

  const p = b.provider === 'brevo' ? 'brevo' : 'resend';
  const list = (b.to || []).filter((x) => RE.test(x)).slice(0, 50);
  if (!list.length || !b.subject || !b.tpl) return res.status(400).json({ error: 'Missing to/subject/template' });

  const att = b.attachment && b.attachment.data ? { name: String(b.attachment.name || 'file').slice(0, 100), data: b.attachment.data } : null;
  const inline = !!(b.inline && att && p === 'resend');
  const html = build({ ...b.tpl, imageUrl: inline ? 'cid:img1' : b.tpl.imageUrl });

  const results = [];
  for (let i = 0; i < list.length; i += 5) {
    const part = await Promise.all(list.slice(i, i + 5).map((t) =>
      one(p, t, String(b.subject).slice(0, 200), html, att, inline).catch((e) => ({ to: t, ok: false, error: String(e) }))));
    results.push(...part);
  }
  res.json({ results });
};
