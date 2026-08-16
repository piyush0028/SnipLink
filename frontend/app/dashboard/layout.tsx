"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth
      .me()
      .then((data) => {
        setUserName(data.user.userId);
        setLoading(false);
      })
      .catch(async () => {
        try {
          await api.auth.refresh();
          const data = await api.auth.me();
          setUserName(data.user.userId);
          setLoading(false);
        } catch {
          router.push("/login");
        }
      });
  }, [router]);

  async function handleLogout() {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/dashboard" className="navbar-brand">
            <span className="navbar-brand-icon">⚡</span>
            Sniplink
          </Link>
          <div className="navbar-actions">
            <span className="navbar-user">
              {userName ? `👤 ${userName.slice(0, 8)}...` : ""}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="page-content">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
