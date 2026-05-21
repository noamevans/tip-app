function Reports({ shiftReport, onBack, onSave, saving, saved }) {
  const { shift_date, period, total_tip_amount, total_hours, workers } = shiftReport;
  const hourlyRate = total_hours ? total_tip_amount / total_hours : 0;

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {shift_date || "No Date"} — {period.charAt(0).toUpperCase() + period.slice(1)}
          </h1>
        </div>

        {/* SUMMARY */}
        <div style={styles.summary}>
          <div style={styles.summaryBox}>
            <h2>Total Hours</h2>
            <p>{total_hours.toFixed(2)}</p>
          </div>

          <div style={styles.summaryBox}>
            <h2>Hourly Rate</h2>
            <p>{hourlyRate.toFixed(2)}</p>
          </div>
        </div>

        {/* TABLE */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Start</th>
              <th style={styles.th}>End</th>
              <th style={styles.th}>Hours</th>
              <th style={styles.th}>Earnings</th>
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
                <td style={styles.td}>{w.check_in}</td>
                <td style={styles.td}>{w.check_out}</td>
                <td style={styles.td}>{(w.seconds_worked / 3600).toFixed(2)}</td>
                <td style={styles.td}>{w.tip_share.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <button onClick={onBack} style={styles.editButton}>
            ← Edit
          </button>

          <button
            onClick={onSave}
            style={styles.saveButton}
            disabled={saving || saved}
          >
            {saved ? "Saved ✓" : saving ? "Saving…" : "Save Shift"}
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
    padding: "30px",
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
    padding: "12px",
    backgroundColor: "#111827",
    color: "white",
    fontSize: "14px",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "center",
  },

  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },

  editButton: {
    flex: 1,
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "15px",
  },

  saveButton: {
    flex: 1,
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
  },
};