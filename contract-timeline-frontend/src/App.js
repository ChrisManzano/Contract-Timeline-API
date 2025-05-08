import React, { useState } from "react";
import "./App.css";

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);
    const formData = new FormData();
    formData.append("contract", file);

    setLoading(true);
    try {
      const response = await fetch("https://contract-timeline-api.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      const lines = result.timeline.split("\n").filter((line) => line.includes(":"));
      const parsedDates = lines.map((line) => {
        const [label, dateStr] = line.split(":");
        const date = new Date(dateStr.trim());
        return { label: label.trim(), date };
      });
      setDates(parsedDates);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>📄 Upload Real Estate Contract</h2>
      <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileUpload} />
      {uploadedFile && <p>Uploaded: {uploadedFile.name}</p>}
      {loading && <p>⏳ Processing file, please wait...</p>}

      {dates.length > 0 && (
        <>
          <h3>🗓️ Timeline Summary</h3>
          <ul>
            {dates.map((item, idx) => (
              <li key={idx}>
                <strong>{item.label}</strong>: {item.date.toLocaleDateString()}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
