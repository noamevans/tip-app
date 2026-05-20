function Reports({ shiftDate, shiftType, workersList, tipAmount, onBack }) {
  const getHours = (start, end) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh + em / 60) - (sh + sm / 60);
  };

  const totalHours = workersList.reduce((sum, w) => {
    return sum + getHours(w.start, w.finish);
  }, 0);

  const hourlyRate = totalHours ? Number(tipAmount) / totalHours : 0;

  const enriched = workersList.map((w) => {
    const hours = getHours(w.start, w.finish);
    return {
      ...w,
      hours,
      earned: hours * hourlyRate,
    };
  });

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {shiftDate || "No Date"} — {shiftType}
          </h1>

          <button onClick={onBack} style={styles.backButton}>
            Back
          </button>
        </div>

        {/* SUMMARY */}
        <div style={styles.summary}>
          <div style={styles.summaryBox}>
            <h2>Total Hours</h2>
            <p>{totalHours.toFixed(2)}</p>
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
            {enriched.map((w, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: i % 2 === 0 ? "#ffffff" : "#f3f4f6",
                }}
              >
                <td style={styles.td}>{w.name}</td>
                <td style={styles.td}>{w.start}</td>
                <td style={styles.td}>{w.finish}</td>
                <td style={styles.td}>{w.hours.toFixed(2)}</td>
                <td style={styles.td}>{w.earned.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
  },
};