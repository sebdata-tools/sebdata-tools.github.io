// Shared helpers for the tool pages. No tracking, no cookies, nothing stored:
// every request goes from your browser straight to the public API named on the page.
'use strict';

const $ = (id) => document.getElementById(id);

function setStatus(text, isError) {
  const el = $('status');
  el.textContent = text || '';
  el.className = isError ? 'error' : '';
}

// Builds a table from an array of header names and an array of rows.
// A cell is a string, or { text, href } for a link (http/https only).
function renderTable(headers, rows) {
  const out = $('result');
  out.replaceChildren();
  if (!rows.length) return;
  const table = document.createElement('table');
  const thead = table.createTHead().insertRow();
  for (const h of headers) {
    const th = document.createElement('th');
    th.textContent = h;
    thead.appendChild(th);
  }
  const tbody = table.createTBody();
  for (const row of rows) {
    const tr = tbody.insertRow();
    for (const cell of row) {
      const td = tr.insertCell();
      if (cell && typeof cell === 'object' && cell.href && /^https?:\/\//i.test(cell.href)) {
        const a = document.createElement('a');
        a.href = cell.href;
        a.rel = 'noopener noreferrer nofollow';
        a.target = '_blank';
        a.textContent = cell.text || cell.href;
        td.appendChild(a);
      } else {
        td.textContent = cell && typeof cell === 'object' ? (cell.text ?? '') : (cell ?? '');
      }
    }
  }
  const wrap = document.createElement('div');
  wrap.className = 'tablewrap';
  wrap.appendChild(table);
  out.appendChild(wrap);
}

async function getJson(url, { timeoutMs = 15000, headers } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers, credentials: 'omit', referrerPolicy: 'no-referrer' });
    let body = null;
    try { body = await res.json(); } catch { /* not JSON */ }
    return { status: res.status, ok: res.ok, body };
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The request timed out.');
    throw new Error('The request was refused (network error, or the server does not allow requests from a browser).');
  } finally {
    clearTimeout(timer);
  }
}

// Reads a host name out of whatever was typed: "https://www.Example.com/path" -> "www.example.com".
function hostFromInput(raw) {
  let s = String(raw || '').trim().toLowerCase();
  if (!s) return '';
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, '').replace(/^[^@/]*@/, '');
  s = s.split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.$/, '');
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(s) ? s : '';
}

// Wires a form: runs `handler` on submit, shows errors, disables the button meanwhile.
function wire(handler) {
  const form = $('form');
  const button = form.querySelector('button');
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    button.disabled = true;
    $('result').replaceChildren();
    setStatus('Loading…');
    try {
      await handler();
    } catch (err) {
      setStatus(err.message || String(err), true);
    } finally {
      button.disabled = false;
    }
  });
  // A link such as rdap.html?q=example.com fills the form and runs it.
  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  if (q) {
    $('q').value = q;
    for (const id of ['type', 'ats']) {
      const el = $(id);
      const v = params.get(id);
      if (el && v && [...el.options].some((o) => o.value === v)) el.value = v;
    }
    form.requestSubmit();
  }
}
