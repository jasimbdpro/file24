"use client";
import { useState, useEffect } from 'react';
import './globals.css';

export default function Home() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // const [downloadURL, setDownloadURL] = useState("");
  const [downloadList, setDownloadList] = useState([]);

  const fetchDownloads = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/downloads`);
      const data = await response.json();
      setDownloadList(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
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

      // setDownloadURL(data.data.url);
      alert("Upload Successful!");

      // Fetch the latest uploaded files from API
      fetchDownloads();

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

  // Fetch all uploaded downloads
  useEffect(() => {
    fetchDownloads();
  }, []);


  return (
    <div
      style={{ marginLeft: "5px" }}
    >
      <h1>Upload and Download</h1>
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
          <input type="file" accept=".zip, .png, .mp4, .pdf, .jpg, .jpeg" onChange={(e) => setFile(e.target.files?.[0])} />
        </label>
        <br />
        <button onClick={handleUpload} disabled={uploading} style={{ border: "1px solid gray" }}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <h2 style={{ marginBottom: "5px" }}>Uploaded Files:</h2>
      {downloadList.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul style={{ paddingLeft: '0px' }}>
          {downloadList.slice().reverse().map((download, index) => (
            <li key={index} style={{ listStyle: "none", marginBottom: "5px" }}>
              <h3>Title: {download.title}</h3>
              <a target="_blank" style={{ color: "var(--foreground-secondary" }} href={download.url} download>⇓ Download⇓</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
