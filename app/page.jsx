"use client";
import { useState, useEffect } from 'react';
import './globals.css';
import ConditionInputWindow from './condition-text-box';

export default function Home() {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [actionHandler, setActionHandler] = useState(() => () => { }); // dynamic action
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [downloadList, setDownloadList] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null); // for delete action

  // Fetch all uploaded downloads
  const fetchDownloads = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/downloads`);
      const data = await response.json();
      setDownloadList(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  // Handle file upload
  const handleUpload = async (password) => {
    if (!file || !title) return alert("Please select a file and enter a title");
    if (password !== process.env.NEXT_PUBLIC_CONDITION_TEXT) return alert("Incorrect password for upload!"); // simple password check

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

      alert("Upload Successful!");
      fetchDownloads();
      setFile(null);
      setTitle("");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle file delete
  const handleDelete = async (password) => {
    if (!selectedFileId) return alert("File ID is missing!");
    if (password !== process.env.NEXT_PUBLIC_CONDITION_TEXT) return alert("Incorrect password for delete!"); // simple password check

    const confirmDelete = confirm("Are you sure you want to delete this file?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/delete-file?id=${selectedFileId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Delete failed:", data.error);
        alert(`Delete failed: ${data.error}`);
        return;
      }

      alert("File deleted successfully!");
      fetchDownloads();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong while deleting the file.");
    }
  };

  // Open modal with the dynamic handler
  const openModalWithHandler = (handler, fileId = null) => {
    setActionHandler(() => handler); // set function dynamically
    setSelectedFileId(fileId);       // store file id for delete
    setModalOpen(true);
  };

  return (
    <div style={{ marginLeft: "5px" }}>
      {/* Modal */}

      {modalOpen && (
        <div
          style={
            {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "gray",
              padding: "20px",
              border: "1px solid black"
            }
          }
        >
          <ConditionInputWindow

            onClose={() => setModalOpen(false)}
            onAction={(password) => {
              actionHandler(password);
              setModalOpen(false);
            }}
          />
        </div>
      )}


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
          <p>(avoid &#47;, &#63;, &#58; in file name and don&apos;t use whitespace at the end)</p>
        </label>
        <br />
        <label>
          Choose Your File (Max 10MB): &nbsp;
          <input type="file" accept=".zip, .png, .mp4, .pdf, .jpg, .jpeg" onChange={(e) => setFile(e.target.files?.[0])} />
        </label>
        <br />
        <button onClick={() => {
          if (file && title) {
            openModalWithHandler(handleUpload)
          }
        }}>
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
              <div>
                <a target="_blank" style={{ padding: "1px 4px", color: "var(--foreground-secondary)" }} href={download.url} download>⇓ Download⇓</a>
                <button
                  onClick={() => openModalWithHandler(handleDelete, download._id)} // open modal for delete
                  style={{ marginLeft: "10px", padding: "1px 4px", color: "var(--foreground-secondary)" }}
                >
                  Del
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
