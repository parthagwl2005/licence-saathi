// Downloads that work without a server: a one-page summary image and calendar reminders.

export function downloadBlob(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Calendar reminder (.ics) — opens in the phone's calendar app
export function downloadIcs({ title, date, time = '09:00', minutes = 60, place = '', note = '' }) {
  const [h, m] = time.split(':').map(Number);
  const start = date.replace(/-/g, '') + 'T' + String(h).padStart(2, '0') + String(m).padStart(2, '0') + '00';
  const endD = new Date(`${date}T${time}:00`);
  endD.setMinutes(endD.getMinutes() + minutes);
  const p = (n) => String(n).padStart(2, '0');
  const end = `${endD.getFullYear()}${p(endD.getMonth() + 1)}${p(endD.getDate())}T${p(endD.getHours())}${p(endD.getMinutes())}00`;
  const esc = (s) => String(s).replace(/[,;\\]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Licence Saathi//EN', 'BEGIN:VEVENT',
    `UID:${Date.now()}@licence-saathi`, `DTSTAMP:${start}`, `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${esc(title)}`, `LOCATION:${esc(place)}`, `DESCRIPTION:${esc(note)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  downloadBlob('licence-saathi-reminder.ics', new Blob([ics], { type: 'text/calendar' }));
}

// One-page summary card as a PNG: name, applications, next step, checklist.
// rows: [{ label, value }]; list: [string]
export async function downloadSummary({ heading, name, rows, nextLabel, next, listTitle, list, footer }) {
  if (document.fonts?.ready) await document.fonts.ready;
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d');
  const F = (w, s) => `${w} ${s}px "Hanken Grotesk", "Mukta", system-ui, sans-serif`;
  x.fillStyle = '#F6F3EE';
  x.fillRect(0, 0, W, H);
  x.fillStyle = '#1E4D3F';
  x.fillRect(0, 0, W, 210);
  x.fillStyle = '#ffffff';
  x.font = `400 64px "Instrument Serif", Georgia, serif`;
  x.fillText('Licence Saathi', 72, 120);
  x.font = F(500, 30);
  x.fillText(heading, 72, 170);

  let y = 300;
  x.fillStyle = '#1B1916';
  x.font = F(700, 52);
  x.fillText(name || '—', 72, y);
  y += 60;

  const card = (top, h) => {
    x.fillStyle = '#FFFEFB';
    x.strokeStyle = '#E0D9CE';
    x.lineWidth = 2;
    x.beginPath();
    if (x.roundRect) x.roundRect(56, top, W - 112, h, 32);
    else x.rect(56, top, W - 112, h);
    x.fill();
    x.stroke();
  };
  const rowsH = 40 + rows.length * 92;
  card(y, rowsH);
  let ry = y + 70;
  for (const r of rows) {
    x.fillStyle = '#5B554E';
    x.font = F(500, 26);
    x.fillText(r.label, 96, ry);
    x.fillStyle = '#1B1916';
    x.font = F(700, 32);
    x.fillText(String(r.value).slice(0, 48), 96, ry + 40);
    ry += 92;
  }
  y += rowsH + 36;

  card(y, 150);
  x.fillStyle = '#1E4D3F';
  x.font = F(700, 26);
  x.fillText(nextLabel, 96, y + 58);
  x.fillStyle = '#1B1916';
  x.font = F(600, 34);
  x.fillText(String(next).slice(0, 52), 96, y + 108);
  y += 186;

  if (list?.length) {
    const h = 92 + list.length * 56;
    card(y, h);
    x.fillStyle = '#5B554E';
    x.font = F(700, 26);
    x.fillText(listTitle, 96, y + 56);
    x.font = F(500, 30);
    list.forEach((it, i) => {
      x.fillStyle = '#1E4D3F';
      x.fillText('○', 96, y + 112 + i * 56);
      x.fillStyle = '#1B1916';
      x.fillText(String(it).slice(0, 50), 140, y + 112 + i * 56);
    });
  }

  x.fillStyle = '#5B554E';
  x.font = F(500, 24);
  x.fillText(footer, 72, H - 56);
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  downloadBlob('licence-saathi-summary.png', blob);
}
