import { supabase } from './supabase'

function PendingScreen({ session }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>⏳</div>
        <h1 style={styles.title}>ממתין לאישור</h1>
        <p style={styles.message}>הבקשה שלך ממתינה לאישור המנהל.</p>
        <p style={styles.email}>{session?.user?.email}</p>
        <button style={styles.button} onClick={() => supabase.auth.signOut()}>
          התנתק
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#6b6d70',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: 'white',
    padding: 'clamp(32px, 8vw, 48px)',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 12px',
  },
  message: {
    fontSize: '15px',
    color: '#374151',
    margin: '0 0 8px',
  },
  email: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 28px',
  },
  button: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '14px',
    cursor: 'pointer',
  },
}

export default PendingScreen
