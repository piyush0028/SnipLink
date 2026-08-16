"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="navbar-brand-icon">⚡</span>
            Sniplink
          </Link>
          <div className="navbar-actions">
            <Link href="/login" className="btn btn-secondary btn-sm">
              Log In
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <h1>
          Shorten Links,
          <br />
          <span className="gradient-text">Track Everything.</span>
        </h1>
        <p>
          A distributed URL shortener with real-time click analytics,
          Redis caching, and async event processing. Built for scale.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="btn btn-primary btn-lg">
            Start Shortening →
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Log In
          </Link>
        </div>

        <div className="hero-features">
          <div className="feature-card">
            <div className="feature-icon-wrapper">⚡</div>
            <div>
              <h3>Lightning Fast Redirects</h3>
              <p>
                Redis-cached URL lookups with negative caching.
                Sub-millisecond redirect times under heavy load.
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">📊</div>
            <div>
              <h3>Rich Analytics</h3>
              <p>
                Track clicks by browser, OS, device, country, and
                referrer. View daily trends with beautiful charts.
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">🔒</div>
            <div>
              <h3>Enterprise Security</h3>
              <p>
                JWT token rotation with reuse detection, sliding-window
                rate limiting, and bcrypt password hashing.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '40px',
          marginTop: '100px',
          maxWidth: '700px',
          width: '100%',
          textAlign: 'center'
        }}>
          {[
            { value: '<1ms', label: 'Redirect Latency' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '∞', label: 'Links Created' },
            { value: '5+', label: 'Analytics Dimensions' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(180deg, #fff 30%, #71717a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#71717a',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                marginTop: '4px',
                fontWeight: 500,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
