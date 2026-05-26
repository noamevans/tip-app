const fmtDate = (d) => d.slice(8) + '/' + d.slice(5, 7)

const TH = 'padding:12px;text-align:center;font-weight:600;'
const TD = 'padding:10px;text-align:center;border-bottom:1px solid #e5e7eb;'
const HEAD = 'background:#111827;color:white;'
const FOOT = 'background:#111827;color:white;font-weight:700;'
const TABLE = 'width:100%;border-collapse:collapse;font-size:14px;'

function mount(html) {
  const el = document.createElement('div')
  el.style.cssText = [
    'position:absolute', 'top:0', 'left:-9999px',
    'width:750px', 'padding:32px', 'background:white',
    "font-family:'Heebo',Arial,sans-serif", 'direction:rtl',
  ].join(';')
  el.innerHTML = html
  document.body.appendChild(el)
  return el
}

async function toPdf(el, filename) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])
  await document.fonts.ready
  const canvas = await html2canvas(el, { scale: 2, logging: false })
  document.body.removeChild(el)

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgW = pageW
  const imgH = (canvas.height * imgW) / canvas.width
  const img = canvas.toDataURL('image/png')

  let yOffset = 0
  let remaining = imgH
  while (remaining > 0) {
    pdf.addImage(img, 'PNG', 0, -yOffset, imgW, imgH)
    remaining -= pageH
    yOffset += pageH
    if (remaining > 0) pdf.addPage()
  }

  pdf.save(filename)
}

export async function downloadWorkerReportPdf(workerName, from, to, reportData) {
  const rows = reportData.rows.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f3f4f6'}">
      <td style="${TD}">${fmtDate(r.shift_date)}</td>
      <td style="${TD}">${r.hours.toFixed(2)}</td>
      <td style="${TD}">${r.rate.toFixed(2)}</td>
      <td style="${TD}">${r.total_paid.toFixed(2)}</td>
    </tr>`).join('')

  const el = mount(`
    <h2 style="font-size:20px;margin:0 0 6px;font-weight:700;">דוח טיפים — ${workerName}</h2>
    <p style="color:#6b7280;margin:0 0 20px;font-size:13px;">תקופה: ${from ?? 'כל הזמנים'} – ${to ?? 'כל הזמנים'}</p>
    <table style="${TABLE}">
      <thead><tr style="${HEAD}">
        <th style="${TH}">תאריך</th><th style="${TH}">שעות</th>
        <th style="${TH}">תעריף (₪/שעה)</th><th style="${TH}">סה"כ שולם (₪)</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="${FOOT}">
        <td colspan="3" style="${TH}">סה"כ</td>
        <td style="${TH}">${reportData.total_paid.toFixed(2)}</td>
      </tr></tfoot>
    </table>`)

  await toPdf(el, `report-${workerName.replace(/\s+/g, '_')}-${from ?? 'all'}.pdf`)
}

export async function downloadShiftReportPdf(shiftReport) {
  const periodMap = { morning: 'בוקר', evening: 'ערב' }
  const period = periodMap[shiftReport.period] ?? shiftReport.period

  const rows = shiftReport.workers.map((w, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f3f4f6'}">
      <td style="${TD}">${w.full_name}</td>
      <td style="${TD}">${w.hours_worked.toFixed(2)}</td>
      <td style="${TD}">${Math.round(w.tip_share)}</td>
    </tr>`).join('')

  const el = mount(`
    <h2 style="font-size:20px;margin:0 0 6px;font-weight:700;">דוח משמרת — ${fmtDate(shiftReport.shift_date)} (${period})</h2>
    <p style="color:#6b7280;margin:0 0 20px;font-size:13px;">סה"כ טיפים: ₪${shiftReport.total_tip_amount} &nbsp;&nbsp; סה"כ שעות: ${shiftReport.non_strict_hours ?? shiftReport.total_hours}</p>
    <table style="${TABLE}">
      <thead><tr style="${HEAD}">
        <th style="${TH}">עובד</th>
        <th style="${TH}">שעות</th><th style="${TH}">חלק בטיפ (₪)</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`)

  await toPdf(el, `shift-${shiftReport.shift_date}-${shiftReport.period}.pdf`)
}
