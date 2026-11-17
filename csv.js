// CSV download built in the browser; nothing is uploaded.
'use strict';

function csvCell(v) {
  let s = v == null ? '' : String(v);
  // A cell starting with = + - @ would run as a formula in a spreadsheet: prefix it.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function downloadCsv(filename, keys, rows) {
  const lines = [keys.map(csvCell).join(',')];
  for (const r of rows) lines.push(keys.map((k) => csvCell(r[k])).join(','));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
