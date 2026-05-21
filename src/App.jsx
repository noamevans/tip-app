import { useState, useEffect } from "react";
import Reports from "./Reports";
import CreateDoc from "./CreateDoc";
import { getWorkers, previewShift, createShift } from "./api";


function App() {
  const [page, setPage] = useState("home");

  const [shiftDate, setShiftDate] = useState("");
  const [shiftType, setShiftType] = useState("Morning");

  const [showModal, setShowModal] = useState(false);

  const [selectedWorker, setSelectedWorker] = useState("");
  const [startHour, setStartHour] = useState("");
  const [finishHour, setFinishHour] = useState("");
  const [strictPay, setStrictPay] = useState("");

  const [workersList, setWorkersList] = useState([]);
  const [tipAmount, setTipAmount] = useState("");

  const [editIndex, setEditIndex] = useState(null);
  const [shiftReport, setShiftReport] = useState(null);
  const [shiftBody, setShiftBody] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [workersError, setWorkersError] = useState(null);

  useEffect(() => {
    getWorkers()
      .then(setWorkers)
      .catch((err) => setWorkersError(err.message))
      .finally(() => setWorkersLoading(false));
  }, []);

  const saveWorker = () => {
    if (!selectedWorker || !startHour || !finishHour) {
      alert("נא למלא את כל השדות");
      return;
    }

    const workerObj = workers.find((w) => w.id === selectedWorker);
    const worker = {
      worker_id: selectedWorker,
      name: workerObj?.full_name ?? selectedWorker,
      start: startHour,
      finish: finishHour,
      strict_pay: strictPay !== "" ? Number(strictPay) : null,
    };

    if (editIndex !== null) {
      const updated = [...workersList];
      updated[editIndex] = worker;
      setWorkersList(updated);
      setEditIndex(null);
    } else {
      setWorkersList((prev) => [...prev, worker]);
    }

    setSelectedWorker("");
    setStartHour("");
    setFinishHour("");
    setStrictPay("");
    setShowModal(false);
  };

  const handlePreview = async () => {
    if (!tipAmount || workersList.length === 0) {
      alert("יש להוסיף עובדים וסכום טיפ תחילה");
      return;
    }
    if (!shiftDate) {
      alert("נא לבחור תאריך");
      return;
    }
    const body = {
      shift_date: shiftDate,
      period: shiftType.toLowerCase(),
      total_tip_amount: Number(tipAmount),
      workers: workersList.map((w) => ({
        worker_id: w.worker_id,
        check_in: w.start,
        check_out: w.finish,
        strict_pay: w.strict_pay ?? null,
      })),
    };
    setPreviewing(true);
    try {
      const report = await previewShift(body);
      setShiftBody(body);
      setShiftReport(report);
      setSaved(false);
      setPage("reports");
    } catch (err) {
      alert(err.message);
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await createShift(shiftBody);
      setShiftDate("");
      setShiftType("Morning");
      setWorkersList([]);
      setTipAmount("");
      setShiftBody(null);
      setSaved(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (page === "reports") {
    return (
      <Reports
        shiftReport={shiftReport}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "createDoc") {
    return <CreateDoc onBack={() => setPage("home")} />;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>מחשב טיפים</h1>

          <button
            style={styles.reportsButton}
            onClick={() => setPage("createDoc")}
          >
            דוח לענת
          </button>
        </div>

        {/* SHIFT */}
        <div style={styles.section}>
          <label style={styles.label}>תאריך:</label>

          <div style={styles.chipContainer}>
            {[{ value: "Morning", label: "בוקר" }, { value: "Evening", label: "ערב" }].map(({ value, label }) => (
              <div
                key={value}
                onClick={() => setShiftType(value)}
                style={{
                  ...styles.chip,
                  backgroundColor:
                    shiftType === value ? "#111827" : "#e5e7eb",
                  color: shiftType === value ? "white" : "black",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <input
            type="date"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* WORKERS */}
        <div style={styles.section}>
          <label style={styles.label}>צוות:</label>

          <select
            value=""
            onChange={(e) => {
              setSelectedWorker(e.target.value);
              setEditIndex(null);
              setStartHour("");
              setFinishHour("");
              setShowModal(true);
            }}
            style={styles.input}
            disabled={workersLoading}
          >
            <option value="">
              {workersLoading ? "טוען…" : workersError ? "שגיאה בטעינת עובדים" : "בחר עובד"}
            </option>

            {workers
              .filter((worker) =>
                !workersList.some((w) => w.worker_id === worker.id)
              )
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.full_name}
                </option>
              ))}
          </select>

          <div style={styles.tagsContainer}>
            {workersList.map((w, i) => (
              <div
                key={i}
                style={styles.tag}
                onClick={() => {
                  setSelectedWorker(w.worker_id);
                  setStartHour(w.start);
                  setFinishHour(w.finish);
                  setStrictPay(w.strict_pay != null ? String(w.strict_pay) : "");
                  setEditIndex(i);
                  setShowModal(true);
                }}
              >
                {w.name}{w.strict_pay != null ? ` (₪${w.strict_pay})` : ""}
              </div>
            ))}
          </div>
        </div>

        {/* TIPS */}
        <div style={styles.section}>
          <label style={styles.label}>סה"כ טיפים:</label>

          <input
            type="number"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
            style={styles.input}
          />
        </div>

        <button style={styles.button} onClick={handlePreview} disabled={previewing}>
          {previewing ? "מחשב…" : "חשב טיפים"}
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            <h2>
              {workers.find((w) => w.id === selectedWorker)?.full_name ?? selectedWorker}
            </h2>

            <label style={styles.label}>כניסה</label>
            <input
              type="time"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>יציאה</label>
            <input
              type="time"
              value={finishHour}
              onChange={(e) => setFinishHour(e.target.value)}
              style={styles.input}
            />

            <label style={styles.label}>תשלום קבוע ₪ (אופציונלי)</label>
            <input
              type="number"
              value={strictPay}
              onChange={(e) => setStrictPay(e.target.value)}
              style={styles.input}
              placeholder="השאר ריק לחלוקה יחסית"
            />

            <button style={styles.button} onClick={saveWorker}>
              שמור
            </button>

            {editIndex !== null && (
              <button
                style={styles.deleteButton}
                onClick={() => {
                  const updated = workersList.filter(
                    (_, i) => i !== editIndex
                  );
                  setWorkersList(updated);

                  setShowModal(false);
                  setEditIndex(null);
                  setSelectedWorker("");
                  setStartHour("");
                  setFinishHour("");
                  setStrictPay("");
                }}
              >
                מחק עובד
              </button>
            )}

            <button
              style={styles.cancelButton}
              onClick={() => {
                setShowModal(false);
                setEditIndex(null);
                setSelectedWorker("");
                setStartHour("");
                setFinishHour("");
                setStrictPay("");
              }}
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#6b6d70",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial",
  },

  card: {
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "white",
    padding: "clamp(16px, 5vw, 30px)",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },

  title: {
    fontSize: "22px",
    fontWeight: "700",
  },

  reportsButton: {
    padding: "10px 14px",
    minHeight: "44px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
  },

  section: { marginBottom: "25px" },

  label: {
    fontWeight: "bold",
    display: "block",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  button: {
    width: "100%",
    marginTop: "20px",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
  },

  chipContainer: {
    padding: "10px 0",
    display: "flex",
    gap: "8px",
  },

  chip: {
    padding: "8px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "15px",
  },

  tag: {
    backgroundColor: "#e5e7eb",
    padding: "10px 14px",
    borderRadius: "999px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "12px",
    width: "92%",
    maxWidth: "400px",
  },

  cancelButton: {
    width: "100%",
    marginTop: "10px",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#e5e7eb",
    border: "none",
    cursor: "pointer",
  },

  deleteButton: {
    width: "100%",
    marginTop: "10px",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    cursor: "pointer",
  },

};

export default App;