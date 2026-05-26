import { useState, useEffect } from "react";
import { createWorker, updateWorker, deleteWorker, getPendingUsers, approveUser } from "./api";

function ManageWorkers({ onBack, workers, setWorkers, profile }) {
  const isManager = profile?.role === 'manager'

  // ── Pending approvals (manager only) ──────────────────────
  const [pending, setPending] = useState([]);
  const [pendingWorkerSel, setPendingWorkerSel] = useState({});
  const [approving, setApproving] = useState(new Set());

  useEffect(() => {
    if (!isManager) return;
    getPendingUsers().then(setPending).catch(() => {});
  }, [isManager]);

  const handleApprove = async (userId) => {
    const workerId = pendingWorkerSel[userId];
    if (!workerId) { alert('נא לבחור עובד לשיוך'); return; }
    setApproving((prev) => new Set(prev).add(userId));
    try {
      await approveUser(userId, workerId);
      setPending((prev) => prev.filter((p) => p.id !== userId));
    } catch (err) {
      alert(err.message);
    } finally {
      setApproving((prev) => { const s = new Set(prev); s.delete(userId); return s; });
    }
  };

  // ── Worker CRUD ────────────────────────────────────────────
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRate, setEditRate] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const w = await createWorker(newName.trim(), newRate !== "" ? Number(newRate) : null);
      setWorkers((prev) =>
        [...prev, w].sort((a, b) => a.full_name.localeCompare(b.full_name))
      );
      setNewName("");
      setNewRate("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (w) => {
    setEditId(w.id);
    setEditName(w.full_name);
    setEditRate(w.strict_pay != null ? String(w.strict_pay) : "");
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updated = await updateWorker(editId, editName.trim(), editRate !== "" ? Number(editRate) : null);
      setWorkers((prev) =>
        prev.map((w) => (w.id === editId ? updated : w))
          .sort((a, b) => a.full_name.localeCompare(b.full_name))
      );
      setEditId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await deleteWorker(id);
      setWorkers((prev) => prev.filter((w) => w.id !== id));
      if (editId === id) setEditId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <h1 style={styles.title}>עובדים</h1>
          <button onClick={onBack} style={styles.backButton}>חזור →</button>
        </div>

        {/* PENDING APPROVALS */}
        {isManager && pending.length > 0 && (
          <div style={styles.pendingSection}>
            <h2 style={styles.pendingTitle}>ממתינים לאישור</h2>
            {pending.map((p) => (
              <div key={p.id} style={styles.pendingRow}>
                <div style={styles.pendingInfo}>
                  <span style={styles.pendingEmail}>{p.email}</span>
                </div>
                <div style={styles.pendingActions}>
                  <select
                    value={pendingWorkerSel[p.id] ?? ''}
                    onChange={(e) => setPendingWorkerSel((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    style={styles.pendingSelect}
                    disabled={approving.has(p.id)}
                  >
                    <option value="">שייך עובד</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.full_name}</option>
                    ))}
                  </select>
                  <button
                    style={styles.approveButton}
                    onClick={() => handleApprove(p.id)}
                    disabled={approving.has(p.id) || !pendingWorkerSel[p.id]}
                  >
                    {approving.has(p.id) ? '…' : 'אשר'}
                  </button>
                </div>
              </div>
            ))}
            <div style={styles.divider} />
          </div>
        )}

        {/* WORKERS LIST */}
        <div style={styles.list}>
          {workers.length === 0 && (
            <p style={styles.empty}>אין עובדים עדיין.</p>
          )}
          {workers.map((w) =>
            editId === w.id ? (
              <div key={w.id} style={styles.editRow}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ ...styles.input, flex: 2 }}
                  disabled={saving}
                />
                <input
                  type="number"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  placeholder="₪/שעה"
                  style={{ ...styles.input, flex: 1 }}
                  disabled={saving}
                />
                <button onClick={handleSaveEdit} style={styles.saveButton} disabled={saving || !editName.trim()}>
                  שמור
                </button>
                <button onClick={() => setEditId(null)} style={styles.cancelButton} disabled={saving}>
                  ✕
                </button>
              </div>
            ) : (
              <div key={w.id} style={styles.row}>
                <div style={styles.workerInfo}>
                  <span style={styles.name}>{w.full_name}</span>
                  <span style={styles.rate}>
                    {w.strict_pay != null ? `₪${w.strict_pay}/ש` : "יחסי"}
                  </span>
                </div>
                <div style={styles.actions}>
                  <button onClick={() => openEdit(w)} style={styles.editButton} disabled={saving}>
                    עריכה
                  </button>
                  <button onClick={() => handleDelete(w.id)} style={styles.deleteButton} disabled={saving}>
                    מחק
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* ADD WORKER */}
        <div style={styles.addSection}>
          <div style={styles.addRow}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="שם מלא"
              style={{ ...styles.input, flex: 2 }}
              disabled={saving}
            />
            <input
              type="number"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="₪/שעה (אופציונלי)"
              style={{ ...styles.input, flex: 1 }}
              disabled={saving}
            />
          </div>
          <button onClick={handleAdd} style={styles.addButton} disabled={saving || !newName.trim()}>
            {saving ? "…" : "הוסף עובד"}
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#6b6d70",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "20px",
    fontFamily: "Arial",
  },
  card: {
    width: "100%",
    maxWidth: "550px",
    backgroundColor: "white",
    padding: "clamp(16px, 5vw, 30px)",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginTop: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { fontSize: "22px", fontWeight: "700", margin: 0 },
  backButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
  },
  pendingSection: {
    marginBottom: "8px",
  },
  pendingTitle: {
    fontSize: "15px",
    fontWeight: "700",
    margin: "0 0 12px",
    color: "#111827",
  },
  pendingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    gap: "10px",
    borderBottom: "1px solid #f3f4f6",
  },
  pendingInfo: {
    flex: 1,
    minWidth: 0,
  },
  pendingEmail: {
    fontSize: "13px",
    color: "#374151",
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pendingActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  pendingSelect: {
    padding: "6px 8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "13px",
    maxWidth: "130px",
  },
  approveButton: {
    padding: "6px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  divider: {
    borderTop: "2px solid #e5e7eb",
    margin: "16px 0",
  },
  list: { marginBottom: "24px" },
  empty: { textAlign: "center", color: "#6b7280", padding: "20px 0" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  workerInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  name: { fontSize: "15px" },
  rate: { fontSize: "12px", color: "#6b7280" },
  actions: { display: "flex", gap: "8px" },
  editRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  editButton: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "13px",
  },
  saveButton: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
  },
  cancelButton: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "13px",
  },
  deleteButton: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
  },
  addSection: { display: "flex", flexDirection: "column", gap: "10px" },
  addRow: { display: "flex", gap: "8px" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    minWidth: 0,
  },
  addButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ManageWorkers;
