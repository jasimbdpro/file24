"use client";
import { useState, useEffect } from 'react';
import './globals.css';

export default function Home() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // const [zipURL, setZipURL] = useState("");
  const [zipList, setZipList] = useState([]);

  const fetchZips = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/zips`);
      const data = await response.json();
      setZipList(data || []);
    } catch (error) {
      console.error('Error fetching zips:', error);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !title) return alert("Please select a file and enter a title");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // setZipURL(data.data.url);
      alert("Upload Successful!");

      // Fetch the latest uploaded files from API
      fetchZips();

      // Reset input fields
      setFile(null);
      setTitle("");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // Fetch all uploaded zips
  useEffect(() => {
    fetchZips();
  }, []);


  return (
    <div>
      <h1>Upload and Download Zips</h1>
      <div style={{ display: "flex", flexDirection: "column", width: "90vw" }}>
        <label>
          File Title : &nbsp;
          <input
            type="text"
            placeholder="Write Title Here"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ color: "gray" }}
          />
          <p>(avoid &#47;, &#63;, &#58; in file name and don&apos;t use whitespace in the end)</p>
        </label>
        <br />
        <label>
          Choose Your File (Max 10MB): &nbsp;
          <input type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0])} />
        </label>
        <br />
        <button onClick={handleUpload} disabled={uploading} style={{ border: "1px solid gray" }}>
          {uploading ? "Uploading..." : "Upload Zip"}
        </button>
      </div>

      <h2 style={{ marginBottom: "5px" }}>Uploaded Zips:</h2>
      {zipList.length === 0 ? (
        <p>No zips uploaded yet.</p>
      ) : (
        <ul style={{ paddingLeft: '0px' }}>
          {zipList.slice().reverse().map((zip, index) => (
            <li key={index} style={{ listStyle: "none", marginBottom: "5px" }}>
              <h3>Title: <span style={{ color: "var(--foreground-secondary" }}>{zip.title}</span></h3>
              <a href={zip.url} download>⇓ Download Zip ⇓</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
