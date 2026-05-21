import { useState } from "react";
import { createWorker, deleteWorker } from "./api";

function ManageWorkers({ onBack, workers, setWorkers }) {
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const w = await createWorker(newName.trim());
      setWorkers((prev) =>
        [...prev, w].sort((a, b) => a.full_name.localeCompare(b.full_name))
      );
      setNewName("");
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

        <div style={styles.list}>
          {workers.length === 0 && (
            <p style={styles.empty}>אין עובדים עדיין.</p>
          )}
          {workers.map((w) => (
            <div key={w.id} style={styles.row}>
              <span style={styles.name}>{w.full_name}</span>
              <button
                style={styles.deleteButton}
                onClick={() => handleDelete(w.id)}
                disabled={saving}
              >
                מחק
              </button>
            </div>
          ))}
        </div>

        <div style={styles.addRow}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="שם מלא"
            style={styles.input}
            disabled={saving}
          />
          <button onClick={handleAdd} style={styles.addButton} disabled={saving || !newName.trim()}>
            {saving ? "…" : "הוסף"}
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
    maxWidth: "500px",
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
  title: {
    fontSize: "22px",
    fontWeight: "700",
    margin: 0,
  },
  backButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
  },
  list: {
    marginBottom: "20px",
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    padding: "20px 0",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  name: {
    fontSize: "15px",
  },
  deleteButton: {
    padding: "6px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
  },
  addRow: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  addButton: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ManageWorkers;
