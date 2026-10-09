(function (g) {
  var C = { announcement: '#2563eb', success: '#16a34a', alert: '#dc2626', dark: '#111827' };
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function u(s) { return /^(https?:\/\/|cid:img1$|data:image\/)/.test(s || '') ? s : ''; }
  function build(o) {
    var col = /^#[0-9a-f]{6}$/i.test(o.color || '') ? o.color : (C[o.style] || C.announcement);
    var img = u(o.imageUrl), link = u(o.btnUrl), btn = link && o.btnText;
    return '<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif">' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0"><tr><td align="center">' +
      '<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden">' +
      '<tr><td style="background:' + col + ';height:8px;font-size:0">&nbsp;</td></tr>' +
      (img ? '<tr><td><img src="' + e(img) + '" width="560" style="display:block;width:100%;height:auto" alt=""></td></tr>' : '') +
      '<tr><td style="padding:28px 32px;color:#111827"><h1 style="margin:0 0 14px;font-size:24px;color:' + col + '">' + e(o.title) + '</h1>' +
      '<div style="font-size:15px;line-height:1.6;white-space:pre-line">' + e(o.body) + '</div>' +
      (btn ? '<table cellpadding="0" cellspacing="0" style="margin-top:22px"><tr><td style="background:' + col + ';border-radius:8px">' +
        '<a href="' + e(link) + '" style="display:inline-block;padding:12px 26px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px">' + e(o.btnText) + '</a></td></tr></table>' : '') +
      '</td></tr><tr><td style="padding:16px 32px;background:#f9fafb;color:#6b7280;font-size:12px">' +
      e(o.footer || 'You are receiving this because you subscribed. Reply with "unsubscribe" to stop receiving emails.') +
      '</td></tr></table></td></tr></table></body></html>';
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { build: build, COLORS: C };
  else { g.buildTpl = build; g.TPL_COLORS = C; }
})(this);
