import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://tinylink-qyr2.vercel.app";

export default function App() {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLinks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/links`);
      setLinks(res.data);
    } catch (err) {
      console.error("Failed to fetch links", err);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/links`, {
        originalUrl: url.trim(),
      });

      setUrl("");
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>TinyLink</h1>
      <p className="subtitle">
        Shorten your links and track clicks in real time.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit} className="form-row">
          <input
            type="text"
            placeholder="Paste a long URL (e.g. https://example.com/very/long/path)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Shortening..." : "Shorten"}
          </button>
        </form>

        {error && <div className="error">{error}</div>}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Your Links</h3>

        {links.length === 0 && (
          <div className="empty-state">
            No links yet. Create one above.
          </div>
        )}

        {links.map((link) => (
          <div className="link-item" key={link._id}>
            <div>
              <a
                className="link-short"
                href={`${API_BASE}/${link.shortCode}`}
                target="_blank"
                rel="noreferrer"
              >
                {API_BASE.replace(/^https?:\/\//, "")}/{link.shortCode}
              </a>

              <div className="link-original">{link.originalUrl}</div>
            </div>

            <span className="click-badge">
              {link.clicks.length} clicks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}