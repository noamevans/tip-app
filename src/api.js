import { supabase } from './supabase'

const BASE = `${import.meta.env.VITE_PUBLICSUPABASE_URL}/functions/v1`

const h = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
    'apikey': import.meta.env.VITE_PUBLICSUPABASE_ANON_KEY,
  }
}

export async function getWorkers() {
  const res = await fetch(`${BASE}/workers`, { headers: await h() })
  if (!res.ok) throw new Error('שגיאה בטעינת עובדים')
  return res.json()
}

export async function previewShift(body) {
  const res = await fetch(`${BASE}/shifts/preview`, {
    method: 'POST',
    headers: await h(),
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
  const res = await fetch(`${BASE}/shifts/report?${params}`, { headers: await h() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'שגיאה בטעינת הדוח')
  }
  return res.json()
}

export async function createWorker(fullName, strictPay = null) {
  const res = await fetch(`${BASE}/workers`, {
    method: 'POST',
    headers: await h(),
    body: JSON.stringify({ full_name: fullName, strict_pay: strictPay }),
  })
  if (!res.ok) throw new Error('שגיאה בהוספת עובד')
  return res.json()
}

export async function updateWorker(id, fullName, strictPay = null) {
  const res = await fetch(`${BASE}/workers/${id}`, {
    method: 'PUT',
    headers: await h(),
    body: JSON.stringify({ full_name: fullName, strict_pay: strictPay }),
  })
  if (!res.ok) throw new Error('שגיאה בעדכון עובד')
  return res.json()
}

export async function deleteWorker(id) {
  const res = await fetch(`${BASE}/workers/${id}`, { method: 'DELETE', headers: await h() })
  if (!res.ok) throw new Error('שגיאה במחיקת עובד')
}

export async function getShifts() {
  const res = await fetch(`${BASE}/shifts`, { headers: await h() })
  if (!res.ok) throw new Error('שגיאה בטעינת משמרות')
  return res.json()
}

export async function getShift(id) {
  const res = await fetch(`${BASE}/shifts/${id}`, { headers: await h() })
  if (!res.ok) throw new Error('שגיאה בטעינת המשמרת')
  return res.json()
}

export async function updateShift(id, body) {
  const res = await fetch(`${BASE}/shifts/${id}`, {
    method: 'PUT',
    headers: await h(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'שגיאה בעדכון המשמרת')
  }
  return res.json()
}

export async function createShift(body) {
  const res = await fetch(`${BASE}/shifts`, {
    method: 'POST',
    headers: await h(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'שגיאה בשמירת המשמרת')
  }
  return res.json()
}

export async function getPendingUsers() {
  const res = await fetch(`${BASE}/workers/pending`, { headers: await h() })
  if (!res.ok) throw new Error('שגיאה בטעינת משתמשים ממתינים')
  return res.json()
}

export async function approveUser(userId, workerId) {
  const res = await fetch(`${BASE}/workers/approve`, {
    method: 'POST',
    headers: await h(),
    body: JSON.stringify({ user_id: userId, worker_id: workerId }),
  })
  if (!res.ok) throw new Error('שגיאה באישור המשתמש')
  return res.json()
}
