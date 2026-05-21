import { useState, useEffect } from "react";
import { getWorkers, getWorkerReport } from "./api";

function CreateDoc({ onBack }) {
  const [worker, setWorker] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [untilDate, setUntilDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(true);

  useEffect(() => {
    getWorkers()
      .then(setWorkers)
      .catch(() => {})
      .finally(() => setWorkersLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!worker || !fromDate || !untilDate) {
      alert("Please fill all fields");
      return;
    }
    if (new Date(fromDate) > new Date(untilDate)) {
      alert("From date cannot be after until date");
      return;
    }
    setLoading(true);
    setReportData(null);
    try {
      const data = await getWorkerReport(worker, fromDate, untilDate);
      setReportData(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasRows = reportData && reportData.rows.length > 0;

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: hasRows ? "700px" : "450px" }}>

        <div style={styles.header}>
          <h1 style={styles.title}>Monthly Report</h1>
          <button onClick={onBack} style={styles.backButton}>← Back</button>
        </div>

        <label style={styles.label}>Worker:</label>
        <select
          value={worker}
          onChange={(e) => setWorker(e.target.value)}
          style={styles.input}
          disabled={workersLoading}
        >
          <option value="">{workersLoading ? "Loading…" : "Select worker"}</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>{w.full_name}</option>
          ))}
        </select>

        <label style={styles.label}>From:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Until:</label>
        <input
          type="date"
          value={untilDate}
          onChange={(e) => setUntilDate(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleGenerate} style={styles.button} disabled={loading}>
          {loading ? "Generating…" : "Generate Report"}
        </button>

        {reportData && (
          <div style={styles.results}>
            {reportData.rows.length === 0 ? (
              <p style={styles.empty}>No shifts found for this worker in the selected range.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Hours</th>
                    <th style={styles.th}>Rate</th>
                    <th style={styles.th}>Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.rows.map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f3f4f6" }}>
                      <td style={styles.td}>{row.shift_date}</td>
                      <td style={styles.td}>{row.hours.toFixed(2)}</td>
                      <td style={styles.td}>{row.rate.toFixed(2)}</td>
                      <td style={styles.td}>{row.total_paid.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: "#111827", color: "white" }}>
                    <td style={styles.tfoot} colSpan={2}>Total</td>
                    <td style={styles.tfoot}></td>
                    <td style={styles.tfoot}>{reportData.total_paid.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

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
    backgroundColor: "white",
    padding: "30px",
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

  backButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
  },

  title: {
    fontSize: "22px",
    fontWeight: "700",
    margin: 0,
  },

  label: {
    display: "block",
    marginTop: "12px",
    marginBottom: "6px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  button: {
    width: "100%",
    marginTop: "20px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },

  results: {
    marginTop: "28px",
  },

  empty: {
    textAlign: "center",
    color: "#6b7280",
    padding: "20px 0",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "12px",
    backgroundColor: "#111827",
    color: "white",
    fontSize: "14px",
    textAlign: "center",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center",
  },

  tfoot: {
    padding: "12px",
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default CreateDoc;
