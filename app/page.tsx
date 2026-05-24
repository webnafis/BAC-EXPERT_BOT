"use client";
import Link from "next/link";

const features = [
  {
    icon: "🤖",
    title: "Multi-Agent AI Analysis",
    desc: "Specialized AI agents evaluate each BAC criterion with domain expertise and RAG-grounded knowledge.",
  },
  {
    icon: "📊",
    title: "Detailed Scoring Reports",
    desc: "Per-file scoring with percentage breakdowns, identified strengths, and actionable improvement paths.",
  },
  {
    icon: "📄",
    title: "Word & PDF Support",
    desc: "Accepts Word (.docx) and PDF files. Upload what you have — nothing is forced or mandatory.",
  },
  {
    icon: "🎯",
    title: "63 BAC Criteria",
    desc: "Full coverage of all 10 standards and 63 criteria as defined by Bangladesh Accreditation Council.",
  },
  {
    icon: "📚",
    title: "Benchmark-Grounded",
    desc: "Scoring grounded in curated BAC-approved document benchmarks for contextually accurate feedback.",
  },
  {
    icon: "🔒",
    title: "Fully Confidential",
    desc: "Processed on private infrastructure. Your institutional documents never leave the secure environment.",
  },
];

const steps = [
  {
    n: "01",
    icon: "🎯",
    title: "Select Standard & Criterion",
    desc: "Browse all 10 BAC standards and pick the specific criterion you want to evaluate against.",
  },
  {
    n: "02",
    icon: "📤",
    title: "Upload Your Documents",
    desc: "Upload available Word or PDF files from the required list. Submit what you have.",
  },
  {
    n: "03",
    icon: "📊",
    title: "Receive Expert Report",
    desc: "Get a comprehensive evaluation: overall score, per-file analysis, missing files, and improvement guidance.",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <nav
        className="navbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🎓
          </div>
          <span className="font-display" style={{ fontSize: "20px" }}>
            BAC Expert Bot
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/evaluate">
            <button
              className="btn-primary"
              style={{ padding: "8px 20px", fontSize: "14px" }}
            >
              Start Evaluation
            </button>
          </Link>
          <Link href="/admin">
            <button
              className="btn-outline"
              style={{ padding: "8px 20px", fontSize: "14px" }}
            >
              Admin Panel
            </button>
          </Link>
        </div>
      </nav>

      <section
        style={{
          padding: "100px 32px 80px",
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          className="tag tag-blue"
          style={{ margin: "0 auto 24px", display: "inline-flex" }}
        >
          ✦ Bangladesh Accreditation Council
        </div>
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(40px,6vw,70px)",
            lineHeight: 1.1,
            marginBottom: "24px",
            background:
              "linear-gradient(135deg,#e8f4ff 0%,#60a5fa 40%,#06b6d4 70%,#e8f4ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Evaluate Your BAC
          <br />
          Accreditation Documents
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "var(--text-secondary)",
            maxWidth: "650px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          AI-powered pre-evaluation platform for university departments. Upload
          your documents, get expert scoring against all 63 BAC criteria, and
          receive actionable improvement guidance before official submission.
        </p>
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/evaluate">
            <button
              className="btn-primary"
              style={{
                padding: "16px 36px",
                fontSize: "16px",
                borderRadius: "12px",
              }}
            >
              🚀 Start Free Evaluation
            </button>
          </Link>
          <a href="#how-it-works">
            <button
              className="btn-outline"
              style={{
                padding: "16px 36px",
                fontSize: "16px",
                borderRadius: "12px",
              }}
            >
              How It Works
            </button>
          </a>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "20px",
            marginTop: "80px",
            maxWidth: "700px",
            margin: "80px auto 0",
          }}
        >
          {[
            ["10", "BAC Standards"],
            ["63", "Criteria"],
            ["AI", "Analysis"],
            ["100%", "Confidential"],
          ].map(([v, l], i) => (
            <div
              key={i}
              className="card"
              style={{ padding: "24px 16px", textAlign: "center" }}
            >
              <div
                className="font-display"
                style={{
                  fontSize: "32px",
                  background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "6px",
                }}
              >
                {v}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        style={{ padding: "80px 32px", maxWidth: "1100px", margin: "0 auto" }}
      >
        <h2
          className="font-display"
          style={{
            fontSize: "40px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          How It Works
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginBottom: "60px",
          }}
        >
          Three simple steps to expert accreditation feedback
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "24px",
          }}
        >
          {steps.map((s, i) => (
            <div key={i} className="card" style={{ padding: "32px" }}>
              <div
                style={{
                  fontSize: "48px",
                  fontFamily: "Playfair Display",
                  fontWeight: 900,
                  color: "rgba(59,130,246,0.15)",
                  marginBottom: "12px",
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>
                {s.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  fontSize: "14px",
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{ padding: "80px 32px", maxWidth: "1100px", margin: "0 auto" }}
      >
        <h2
          className="font-display"
          style={{
            fontSize: "40px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Platform Features
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginBottom: "60px",
          }}
        >
          Enterprise-grade accreditation intelligence
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "20px",
          }}
        >
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: "28px" }}>
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "60px 32px",
          maxWidth: "800px",
          margin: "0 auto 80px",
        }}
      >
        <div
          className="card"
          style={{
            padding: "60px",
            textAlign: "center",
            background:
              "linear-gradient(135deg,rgba(59,130,246,0.15) 0%,rgba(6,182,212,0.1) 100%)",
            borderColor: "rgba(59,130,246,0.3)",
          }}
        >
          <h2
            className="font-display"
            style={{ fontSize: "36px", marginBottom: "16px" }}
          >
            Ready to Evaluate?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "32px",
              fontSize: "16px",
            }}
          >
            Start your free AI-powered BAC accreditation pre-evaluation today.
            No registration required.
          </p>
          <Link href="/evaluate">
            <button
              className="btn-primary"
              style={{
                padding: "16px 48px",
                fontSize: "16px",
                borderRadius: "12px",
              }}
            >
              Begin Evaluation →
            </button>
          </Link>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "13px",
        }}
      >
        <p>
          BAC Expert Bot — AI-powered accreditation intelligence for Bangladesh
          universities
        </p>
        <p style={{ marginTop: "8px" }}>
          Built for quality education · Secure · Private · Expert-aligned
        </p>
      </footer>
    </div>
  );
}
