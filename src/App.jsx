import { useState, useEffect, lazy, Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { supabase } from "./supabase";
import LoginScreen from "./LoginScreen";
import PendingScreen from "./PendingScreen";
import Reports from "./Reports";
import { getWorkers, getShifts, getShift, previewShift, createShift, updateShift } from "./api";

const CreateDoc = lazy(() => import("./CreateDoc"));
const ManageWorkers = lazy(() => import("./ManageWorkers"));

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

function App() {
  // ── Auth state ─────────────────────────────────────────────
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (!session) setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("profiles")
      .select("role, worker_id")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  // ── App state ──────────────────────────────────────────────
  const [page, setPage] = useState("home");

  const [shiftDate, setShiftDate] = useState(getYesterday);
  const [shiftType, setShiftType] = useState("Morning");

  const [showModal, setShowModal] = useState(false);

  const [selectedWorker, setSelectedWorker] = useState("");
  const [hoursInput, setHoursInput] = useState("");

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

  const [shifts, setShifts] = useState([]);
  const [editingShiftId, setEditingShiftId] = useState(null);

  const isManager = profile?.role === "manager";

  useEffect(() => {
    if (!profile) return;
    getWorkers()
      .then(setWorkers)
      .catch((err) => setWorkersError(err.message))
      .finally(() => setWorkersLoading(false));
    getShifts()
      .then(setShifts)
      .catch(() => {});
  }, [profile]);

  useEffect(() => {
    if (!shiftDate || shifts.length === 0) return;
    const match = shifts.find(
      (s) => s.shift_date === shiftDate && s.period === shiftType.toLowerCase()
    );
    if (match) {
      getShift(match.id)
        .then((detail) => {
          setEditingShiftId(match.id);
          setTipAmount(String(detail.total_tip_amount));
          setWorkersList(detail.workers.map((w) => ({
            worker_id: w.worker_id,
            name: w.full_name,
            total_hours: w.hours_worked,
            strict_pay: workers.find((wr) => wr.id === w.worker_id)?.strict_pay ?? null,
          })));
        })
        .catch(() => {});
    } else {
      setEditingShiftId(null);
      setWorkersList([]);
      setTipAmount("");
    }
  }, [shiftDate, shiftType, shifts]);

  const saveWorker = () => {
    if (!selectedWorker) {
      alert("נא למלא את כל השדות");
      return;
    }

    const total_hours = parseFloat(hoursInput);
    if (!total_hours || total_hours <= 0) {
      alert("שעות עבודה חייבות להיות גדולות מ-0");
      return;
    }
    const workerObj = workers.find((w) => w.id === selectedWorker);
    const worker = {
      worker_id: selectedWorker,
      name: workerObj?.full_name ?? selectedWorker,
      total_hours,
      strict_pay: workerObj?.strict_pay ?? null,
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
    setHoursInput("");
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
        hours_worked: w.total_hours,
        strict_pay: w.strict_pay ?? null,
        full_name: w.name,
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
      if (editingShiftId) {
        await updateShift(editingShiftId, shiftBody);
        setShifts((prev) => prev.map((s) =>
          s.id === editingShiftId
            ? { ...s, shift_date: shiftBody.shift_date, period: shiftBody.period, total_tip_amount: shiftBody.total_tip_amount }
            : s
        ));
        setEditingShiftId(null);
      } else {
        const result = await createShift(shiftBody);
        setShifts((prev) => [
          { id: result.id, shift_date: shiftBody.shift_date, period: shiftBody.period, total_tip_amount: shiftBody.total_tip_amount },
          ...prev,
        ]);
      }
      setShiftDate(getYesterday());
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

  // ── Auth gates ─────────────────────────────────────────────
  if (authLoading) return null;
  if (!session) return <LoginScreen />;
  if (!profile || profile.role === "pending") return <PendingScreen session={session} />;

  // ── Pages ──────────────────────────────────────────────────
  if (page === "reports") {
    return (
      <>
        <Reports
          shiftReport={shiftReport}
          onSave={handleSave}
          saving={saving}
          saved={saved}
          onBack={() => setPage("home")}
        />
        <SpeedInsights />
      </>
    );
  }

  if (page === "createDoc") {
    return (
      <>
        <Suspense fallback={null}>
          <CreateDoc
            onBack={() => setPage("home")}
            workers={workers}
            workersLoading={workersLoading}
            profile={profile}
          />
        </Suspense>
        <SpeedInsights />
      </>
    );
  }

  if (page === "manageWorkers") {
    return (
      <>
        <Suspense fallback={null}>
          <ManageWorkers
            onBack={() => setPage("home")}
            workers={workers}
            setWorkers={setWorkers}
            profile={profile}
          />
        </Suspense>
        <SpeedInsights />
      </>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>מחשב טיפים</h1>

          <div style={styles.headerActions}>
            <button
              style={styles.reportsButton}
              onClick={() => setPage("createDoc")}
            >
              דוח לענת
            </button>
            <button
              style={styles.signOutButton}
              onClick={() => supabase.auth.signOut()}
            >
              התנתק
            </button>
          </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <label style={{ ...styles.label, marginBottom: 0 }}>צוות:</label>
            {isManager && (
              <button style={styles.pencilChip} onClick={() => setPage("manageWorkers")}>✏️</button>
            )}
          </div>

          <select
            value=""
            onChange={(e) => {
              setSelectedWorker(e.target.value);
              setEditIndex(null);
              setHoursInput("");
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
                  setHoursInput(String(w.total_hours || ""));
                  setEditIndex(i);
                  setShowModal(true);
                }}
              >
                {w.name}{w.strict_pay != null ? ` (₪${w.strict_pay}/ש)` : ""}
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

            <label style={styles.label}>שעות עבודה</label>
            <input
              type="text"
              inputMode="decimal"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              placeholder="0"
              style={{ ...styles.input, fontSize: "2rem", textAlign: "center", height: "80px" }}
              autoFocus
            />

            <button style={styles.button} onClick={saveWorker}>
              שמור
            </button>

            {editIndex !== null && (
              <button
                style={styles.deleteButton}
                onClick={() => {
                  setWorkersList(workersList.filter((_, i) => i !== editIndex));
                  setShowModal(false);
                  setEditIndex(null);
                  setSelectedWorker("");
                  setHoursInput("");
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
                setHoursInput("");
              }}
            >
              ביטול
            </button>
          </div>
        </div>
      )}
      <SpeedInsights />
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
    alignItems: "center",
    marginBottom: "20px",
  },

  title: {
    fontSize: "22px",
    fontWeight: "700",
  },

  headerActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
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

  signOutButton: {
    padding: "10px 12px",
    minHeight: "44px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    color: "#374151",
    cursor: "pointer",
    fontSize: "13px",
  },

  pencilChip: {
    padding: "2px 8px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: "1.4",
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
