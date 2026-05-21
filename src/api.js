const BASE = `${import.meta.env.VITE_PUBLICSUPABASE_URL}/functions/v1`
const KEY  = import.meta.env.VITE_PUBLICSUPABASE_ANON_KEY

const h = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${KEY}`,
  'apikey': KEY,
})

export async function getWorkers() {
  const res = await fetch(`${BASE}/workers`, { headers: h() })
  if (!res.ok) throw new Error('שגיאה בטעינת עובדים')
  return res.json()
}

export async function previewShift(body) {
  const res = await fetch(`${BASE}/shifts/preview`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'שגיאה בתצוגה מקדימה של המשמרת')
  }
  return res.json()
}

export async function getWorkerReport(workerId, from, to) {
  const params = new URLSearchParams({ worker_id: workerId })
  if (from) params.set('from', from)
  if (to)   params.set('to', to)
  const res = await fetch(`${BASE}/shifts/report?${params}`, { headers: h() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'שגיאה בטעינת הדוח')
  }
  return res.json()
}

export async function createShift(body) {
  const res = await fetch(`${BASE}/shifts`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'שגיאה בשמירת המשמרת')
  }
  return res.json()
}
