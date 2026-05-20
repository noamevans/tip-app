import { useState } from "react";

function CreateDoc({ onBack }) {
  const [worker, setWorker] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [untilDate, setUntilDate] = useState("");
  const [loading, setLoading] = useState(false);

  

  const workers = ["Daniel", "Noa", "Yossi", "Maya", "Omer"];

  const handleCreate = async () => {
    if (!worker || !fromDate || !untilDate) {
      alert("Please fill all fields");
      return;
    }

    if (new Date(fromDate) > new Date(untilDate)) {
      alert("From date cannot be after until date");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/create-doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          worker,
          fromDate,
          untilDate,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create document");
      }

      const data = await res.json();
      alert("Document created successfully!");
      console.log(data);
    } catch (err) {
      console.error(err);
      alert("Error creating document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
            <h1 style={styles.title}>Create Monthly Report</h1>

            <button onClick={onBack} style={styles.reportsButton}>
              ← Back
            </button>
        </div>
        {/* WORKER */}
        <label style={styles.label}>Worker:</label>
        <select
          value={worker}
          onChange={(e) => setWorker(e.target.value)}
          style={styles.input}
        >
          <option value="">Select worker</option>
          {workers.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>

        {/* FROM DATE */}
        <label style={styles.label}>From:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={styles.input}
        />

        {/* UNTIL DATE */}
        <label style={styles.label}>Until:</label>
        <input
          type="date"
          value={untilDate}
          onChange={(e) => setUntilDate(e.target.value)}
          style={styles.input}
        />

        {/* CREATE BUTTON */}
        <button
          onClick={handleCreate}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Document"}
        </button>

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
    alignItems: "left",
    padding: "20px",
    fontFamily: "Arial",
    textAlign: "left",
  },

  card: {
    justifyContent: "left",
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

   header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },

  reportsButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
  },

  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "20px",
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
};

export default CreateDoc;