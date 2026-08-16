"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api, UrlItem, PaginatedUrls } from "@/lib/api";

export default function DashboardPage() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  // Create URL form
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchUrls = useCallback(async (page = 1) => {
    try {
      const data: PaginatedUrls = await api.urls.list(page);
      setUrls(data.urls);
      setPagination(data.pagination);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  async function handleCreateUrl(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setCreating(true);

    try {
      const newUrl = await api.urls.create({
        originalUrl,
        customAlias: customAlias || undefined,
        expiresAt: expiresAt || undefined,
      });
      setCreateSuccess(`Created: ${newUrl.shortUrl}`);
      setOriginalUrl("");
      setCustomAlias("");
      setExpiresAt("");
      fetchUrls(1);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create URL");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this URL?")) return;
    try {
      await api.urls.delete(id);
      fetchUrls(pagination.page);
    } catch {
      // handle silently
    }
  }

  function handleCopy(shortUrl: string, id: string) {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="glass-card stat-card">
          <div className="stat-value">{pagination.total}</div>
          <div className="stat-label">Total URLs</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">
            {urls.reduce((acc, u) => acc + u.totalClicks, 0)}
          </div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">
            {urls.filter((u) => u.expiresAt && new Date(u.expiresAt) > new Date()).length}
          </div>
          <div className="stat-label">Active with Expiry</div>
        </div>
      </div>

      {/* Create URL */}
      <div className="glass-card url-form-section">
        <h2>🔗 Shorten a URL</h2>
        {createError && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {createError}</div>}
        {createSuccess && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ {createSuccess}</div>}
        <form onSubmit={handleCreateUrl}>
          <div className="url-form">
            <div className="form-group">
              <label className="form-label" htmlFor="originalUrl">Long URL</label>
              <input
                id="originalUrl"
                type="url"
                className="form-input"
                placeholder="https://example.com/very/long/url/to/shorten"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating} style={{ marginBottom: 0 }}>
              {creating ? "Creating..." : "Shorten"}
            </button>
          </div>
          <div className="url-form-extras">
            <div className="form-group">
              <label className="form-label" htmlFor="customAlias">Custom Alias (optional)</label>
              <input
                id="customAlias"
                type="text"
                className="form-input"
                placeholder="my-custom-link"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="expiresAt">Expires At (optional)</label>
              <input
                id="expiresAt"
                type="datetime-local"
                className="form-input"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
        </form>
      </div>

      {/* URL List */}
      <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 16 }}>Your URLs</h2>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : urls.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">🔗</div>
          <h3>No URLs yet</h3>
          <p>Paste a long URL above to create your first short link.</p>
        </div>
      ) : (
        <>
          <div className="url-list">
            {urls.map((url) => (
              <div key={url.id} className="glass-card url-card">
                <div className="url-card-info">
                  <div className="url-card-short">
                    <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                      {url.shortUrl}
                    </a>
                    <button
                      className={`copy-btn ${copiedId === url.id ? "copied" : ""}`}
                      onClick={() => handleCopy(url.shortUrl, url.id)}
                      title="Copy to clipboard"
                    >
                      {copiedId === url.id ? "✓ Copied" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="url-card-original">{url.originalUrl}</div>
                  <div className="url-card-meta">
                    <span>Created {new Date(url.createdAt).toLocaleDateString()}</span>
                    {url.expiresAt && (
                      <span>
                        Expires {new Date(url.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="url-card-clicks">
                  <div className="count">{url.totalClicks}</div>
                  <div className="label">clicks</div>
                </div>
                <div className="url-card-actions">
                  <Link href={`/dashboard/${url.id}/analytics`} className="btn btn-secondary btn-sm">
                    📊 Analytics
                  </Link>
                  <button onClick={() => handleDelete(url.id)} className="btn btn-danger btn-sm">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => fetchUrls(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                ← Prev
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => fetchUrls(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
