"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, Analytics } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "#6c5ce7",
  "#a855f7",
  "#ec4899",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

const tooltipStyle = {
  backgroundColor: "rgba(17, 17, 40, 0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#f0f0f8",
};

export default function AnalyticsPage() {
  const params = useParams();
  const urlId = params.id as string;
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.analytics
      .get(urlId)
      .then(setAnalytics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [urlId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="alert alert-error">⚠️ {error}</div>
        <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: 16 }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!analytics) return null;

  const dailyData = analytics.byDay.map((d) => ({
    ...d,
    day: new Date(d.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <>
      <div className="analytics-header">
        <Link href="/dashboard" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          ← Back to Dashboard
        </Link>
        <h1>Analytics</h1>
        <p className="subtitle">
          Short Code: <strong style={{ color: "var(--text-accent)" }}>{analytics.shortCode}</strong>
        </p>
      </div>

      {/* Total Clicks Stat */}
      <div className="dashboard-stats">
        <div className="glass-card stat-card">
          <div className="stat-value">{analytics.totalClicks}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{analytics.byCountry.length}</div>
          <div className="stat-label">Countries Reached</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{analytics.byReferrer.length}</div>
          <div className="stat-label">Referral Sources</div>
        </div>
      </div>

      {analytics.totalClicks === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No clicks yet</h3>
          <p>Share your short link and come back to see analytics.</p>
        </div>
      ) : (
        <div className="analytics-grid">
          {/* Clicks Over Time */}
          <div className="glass-card chart-card full-width">
            <h3>📈 Clicks Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#6b6b90" fontSize={12} />
                <YAxis stroke="#6b6b90" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6c5ce7"
                  strokeWidth={2}
                  dot={{ fill: "#a855f7", r: 4 }}
                  activeDot={{ r: 6, fill: "#a855f7" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Browser Distribution */}
          <div className="glass-card chart-card">
            <h3>🌐 Browsers</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.byBrowser}
                  dataKey="count"
                  nameKey="browser"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ browser, percent }) =>
                    `${browser} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  fontSize={11}
                >
                  {analytics.byBrowser.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* OS Distribution */}
          <div className="glass-card chart-card">
            <h3>💻 Operating Systems</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.byOs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#6b6b90" fontSize={12} />
                <YAxis type="category" dataKey="os" stroke="#6b6b90" fontSize={12} width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#6c5ce7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Device Distribution */}
          <div className="glass-card chart-card">
            <h3>📱 Devices</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.byDevice}
                  dataKey="count"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ device, percent }) =>
                    `${device} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  fontSize={11}
                >
                  {analytics.byDevice.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Country Distribution */}
          <div className="glass-card chart-card">
            <h3>🌍 Countries</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.byCountry}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="country" stroke="#6b6b90" fontSize={12} />
                <YAxis stroke="#6b6b90" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Referrer Distribution */}
          <div className="glass-card chart-card">
            <h3>🔗 Referrers</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.byReferrer} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#6b6b90" fontSize={12} />
                <YAxis type="category" dataKey="referrer" stroke="#6b6b90" fontSize={11} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}
