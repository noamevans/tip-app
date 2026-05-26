import { downloadShiftReportPdf } from "./utils/pdf";

const fmtDate = (d) => d.slice(8) + '/' + d.slice(5, 7)

function Reports({ shiftReport, onBack, onSave, saving, saved }) {
  const { shift_date, period, total_tip_amount, total_hours, tip_rate, workers } = shiftReport;
  const hourlyRate = tip_rate ?? 0;

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {shift_date ? fmtDate(shift_date) : "—"} — {period.charAt(0).toUpperCase() + period.slice(1)}
          </h1>
        </div>

        {/* SUMMARY */}
        <div style={styles.summary}>
          <div style={styles.summaryBox}>
            <h2>סה"כ שעות</h2>
            <p>{total_hours.toFixed(2)}</p>
          </div>

          <div style={styles.summaryBox}>
            <h2>תעריף לשעה</h2>
            <p>{Math.round(hourlyRate)}</p>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>שם</th>
              <th style={styles.th}>שעות</th>
              <th style={styles.th}>רווח</th>
            </tr>
          </thead>

          <tbody>
            {workers.map((w, i) => (
              <tr
                key={w.worker_id}
                style={{
                  backgroundColor: i % 2 === 0 ? "#ffffff" : "#f3f4f6",
                }}
              >
                <td style={styles.td}>{w.full_name}</td>
                <td style={styles.td}>{(w.hours_worked).toFixed(2)}</td>
                <td style={styles.td}>{Math.round(w.tip_share)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <button onClick={onBack} style={styles.editButton}>
            ערוך →
          </button>

          <button
            onClick={() => downloadShiftReportPdf(shiftReport)}
            style={styles.pdfButton}
          >
            הורד PDF
          </button>

          <button
            onClick={onSave}
            style={styles.saveButton}
            disabled={saving || saved}
          >
            {saved ? "נשמר ✓" : saving ? "שומר…" : "שמור משמרת"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Reports;

/* ✅ STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "Arial",
  },

  card: {
    width: "100%",
    maxWidth: "800px",
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

  backButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
  },

  summary: {
    display: "flex",
    gap: "12px",
    marginBottom: "25px",
  },

  summaryBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: "15px",
    borderRadius: "12px",
    textAlign: "center",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "clamp(8px, 2vw, 12px)",
    backgroundColor: "#111827",
    color: "white",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "clamp(8px, 2vw, 12px)",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center",
    whiteSpace: "nowrap",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "24px",
  },

  editButton: {
    flex: "1 1 100px",
    minWidth: "100px",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "15px",
  },

  pdfButton: {
    flex: "1 1 100px",
    minWidth: "100px",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #111827",
    backgroundColor: "white",
    color: "#111827",
    cursor: "pointer",
    fontSize: "15px",
  },

  saveButton: {
    flex: "1 1 100px",
    minWidth: "100px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
  },
};
