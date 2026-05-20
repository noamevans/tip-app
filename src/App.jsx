import { useState } from "react";
import Reports from "./Reports";
import CreateDoc from "./CreateDoc";

import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

function App() {
  const [page, setPage] = useState("home");

  const [shiftDate, setShiftDate] = useState("");
  const [shiftType, setShiftType] = useState("Morning");

  const [showModal, setShowModal] = useState(false);

  const [selectedWorker, setSelectedWorker] = useState("");
  const [startHour, setStartHour] = useState("");
  const [finishHour, setFinishHour] = useState("");

  const [workersList, setWorkersList] = useState([]);
  const [tipAmount, setTipAmount] = useState("");

  const [editIndex, setEditIndex] = useState(null);

  const workers = ["Daniel", "Noa", "Yossi", "Maya", "Omer"];

  const saveWorker = () => {
    if (!selectedWorker || !startHour || !finishHour) {
      alert("Please fill all fields");
      return;
    }

    const worker = {
      name: selectedWorker,
      start: startHour,
      finish: finishHour,
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
    setShowModal(false);
  };

  const goToReports = () => {
    if (!tipAmount || workersList.length === 0) {
      alert("Add workers and tip first");
      return;
    }
    setPage("reports");
  };

  if (page === "reports") {
    return (
      <Reports
        shiftDate={shiftDate}
        shiftType={shiftType}
        workersList={workersList}
        tipAmount={Number(tipAmount)}
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
          <h1 style={styles.title}>TipApp</h1>

          <button
            style={styles.reportsButton}
            onClick={() => setPage("createDoc")}
          >
            Create Doc
          </button>
        </div>

        {/* SHIFT */}
        <div style={styles.section}>
          <label style={styles.label}>Date:</label>

          <div style={styles.chipContainer}>
            {["Morning", "Evening"].map((type) => (
              <div
                key={type}
                onClick={() => setShiftType(type)}
                style={{
                  ...styles.chip,
                  backgroundColor:
                    shiftType === type ? "#111827" : "#e5e7eb",
                  color: shiftType === type ? "white" : "black",
                }}
              >
                {type}
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
          <label style={styles.label}>Staff:</label>

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
          >
            <option value="">Select Employee</option>

            {workers
              .filter((worker) =>
                !workersList.some((w) => w.name === worker)
              )
              .map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
          </select>

          <div style={styles.tagsContainer}>
            {workersList.map((w, i) => (
              <div
                key={i}
                style={styles.tag}
                onClick={() => {
                  setSelectedWorker(w.name);
                  setStartHour(w.start);
                  setFinishHour(w.finish);
                  setEditIndex(i);
                  setShowModal(true);
                }}
              >
                {w.name}
              </div>
            ))}
          </div>
        </div>

        {/* TIPS */}
        <div style={styles.section}>
          <label style={styles.label}>Total Tips:</label>

          <input
            type="number"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
            style={styles.input}
          />
        </div>

        <button style={styles.button} onClick={goToReports}>
          Calculate Tips
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            <h2>
              {editIndex !== null ? "Edit Worker" : "Add Worker"}
            </h2>

            <label style={styles.label}>Start</label>
            <div style={styles.timePicker}>
              <TimePicker
                onChange={setStartHour}
                value={startHour}
                format="HH:mm"
                disableClock={true}
              />
            </div>

            <label style={styles.label}>Finish</label>
            <div style={styles.timePicker}>
              <TimePicker
                onChange={setFinishHour}
                value={finishHour}
                format="HH:mm"
                disableClock={true}
              />
            </div>

            <button style={styles.button} onClick={saveWorker}>
              Save
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
                }}
              >
                Delete Worker
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
              }}
            >
              Cancel
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
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "left",
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
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
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
    padding: "6px 12px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
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
    padding: "20px",
    borderRadius: "12px",
    width: "90%",
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

  timePicker: {
    marginBottom: "10px",
  },
};

export default App;