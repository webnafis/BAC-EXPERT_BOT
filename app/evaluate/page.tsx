"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Standard, Criterion } from "@/data/bac-data";
import type { AnalysisResult } from "@/lib/ai-analyzer";
import { Loader } from "@/components/Loader";

type Step = "standard" | "criterion" | "upload" | "result";

export default function EvaluatePage() {
  const [step, setStep] = useState<Step>("standard");
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(
    null
  );
  const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(
    null
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingStandards, setLoadingStandards] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoadingStandards(true);
    fetch("/api/admin/standards")
      .then((r) => r.json())
      .then((d) => setStandards(d.standards || []))
      .finally(() => setLoadingStandards(false));
  }, []);

  const loadingStages = [
    "Extracting document content...",
    "Mapping files to BAC criteria...",
    "Running AI analysis agents...",
    "Scoring against benchmark documents...",
    "Generating expert feedback report...",
  ];

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingStage((s) => (s < loadingStages.length - 1 ? s + 1 : s));
    }, 2500);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFileAdd = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(
      (f) =>
        f.name.endsWith(".pdf") ||
        f.name.endsWith(".docx") ||
        f.name.endsWith(".doc")
    );
    if (valid.length > 0) {
      setUploadedFiles([valid[0]]);  // ← only keep the first/latest file
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedStandard || !selectedCriterion) return;
    setIsAnalyzing(true);
    setError(null);
    setLoadingStage(0);
    setStep("result");

    const formData = new FormData();
    formData.append("standardId", selectedStandard.id);
    formData.append("criterionId", selectedCriterion.id);
    uploadedFiles.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data.result);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = score / max;
    if (pct >= 0.90) return "#10b981";
    if (pct >= 0.75) return "#006A4E";
    if (pct >= 0.65) return "#A37210";
    if (pct >= 0.50) return "#f97316";
    return "#ef4444";
  };

  // const getScoreLabel = (score: number) => {
  //   if (score >= 90) return "Exemplary";
  //   if (score >= 75) return "Good";
  //   if (score >= 60) return "Satisfactory";
  //   if (score >= 45) return "Needs Improvement";
  //   return "Insufficient";
  // };
// Change score label helper to use maxPossibleScore:
const getScoreLabel = (score: number, max: number) => {
  const pct = score / max;
  if (pct >= 0.90) return "Exemplary";
  if (pct >= 0.75) return "Good";
  if (pct >= 0.65) return "Adequate";
  if (pct >= 0.50) return "Weak";
  if (pct >= 0.35) return "Poor";
  return "Critical";
};
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = result
  ? `${(result.overallScore / result.maxPossibleScore) * circumference} ${circumference}`
  : "0 283";

  const stepNumbers: Record<Step, number> = {
    standard: 1,
    criterion: 2,
    upload: 3,
    result: 4,
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
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
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg,#006A4E,#00956C)",
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
        </Link>
        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {[
            "Select Standard",
            "Select Criterion",
            "Upload Files",
            "Results",
          ].map((label, i) => {
            const num = i + 1;
            const currentNum = stepNumbers[step];
            const isActive = num === currentNum;
            const isDone = num < currentNum;
            return (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: isDone
                      ? "rgba(16,185,129,0.15)"
                      : isActive
                      ? "linear-gradient(135deg,#006A4E,#00956C)"
                      : "rgba(0,0,0,0.05)",
                    color: isDone
                      ? "#34d399"
                      : isActive
                      ? "white"
                      : "var(--text-muted)",
                    border: isDone
                      ? "1px solid rgba(16,185,129,0.3)"
                      : isActive
                      ? "none"
                      : "1px solid var(--border)",
                    boxShadow: isActive
                      ? "0 0 15px rgba(0,106,78,0.35)"
                      : "none",
                  }}
                >
                  {isDone ? "✓" : num}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                    display: "none",
                  }}
                  className="step-label"
                >
                  {label}
                </span>
                {i < 3 && (
                  <div
                    style={{
                      width: "24px",
                      height: "1px",
                      background: isDone
                        ? "rgba(16,185,129,0.4)"
                        : "var(--border)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div
        style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}
      >
        {/* STEP 1: Select Standard */}
        {step === "standard" && (
          <div className="animate-fade-up">
            <div style={{ marginBottom: "32px" }}>
              <div className="tag tag-blue" style={{ marginBottom: "12px" }}>
                Step 1 of 3
              </div>
              <h1
                className="font-display"
                style={{ fontSize: "36px", marginBottom: "8px" }}
              >
                Select a BAC Standard
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                Choose the standard area you want to evaluate your documents
                against.
              </p>
            </div>
            {loadingStandards ? (
              <Loader
                message="Loading BAC standards…"
                minHeight="320px"
              />
            ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {standards.map((std) => (
                <button
                  key={std.id}
                  onClick={() => {
                    setSelectedStandard(std);
                    setSelectedCriterion(null);
                    setStep("criterion");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "20px 24px",
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    color: "var(--text-primary)",
                    fontFamily: "Plus Jakarta Sans",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,106,78,0.35)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0,106,78,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        className="tag tag-blue"
                        style={{ fontSize: "11px" }}
                      >
                        {std.code}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: "16px" }}>
                        {std.title}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                        lineHeight: 1.5,
                      }}
                    >
                      {std.description}...
                    </p>
                    <div style={{ marginTop: "8px" }}>
                      <span
                        className="tag tag-purple"
                        style={{ fontSize: "11px" }}
                      >
                        {std.criteria.length} criteria
                      </span>
                      {std.demoFiles.length > 0 && (
                        <span
                          className="tag tag-green"
                          style={{ fontSize: "11px", marginLeft: "6px" }}
                        >
                          {std.demoFiles.length} demo files
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{ color: "var(--text-muted)", fontSize: "20px" }}
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Criterion */}
        {step === "criterion" && selectedStandard && (
          <div className="animate-fade-up">
            <div style={{ marginBottom: "32px" }}>
              <button
                onClick={() => setStep("standard")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  marginBottom: "16px",
                  fontSize: "14px",
                  fontFamily: "Plus Jakarta Sans",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ← Back to Standards
              </button>
              <div className="tag tag-blue" style={{ marginBottom: "12px" }}>
                Step 2 of 3
              </div>
              <h1
                className="font-display"
                style={{ fontSize: "36px", marginBottom: "8px" }}
              >
                Select a Criterion
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                Standard:{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {selectedStandard.code} — {selectedStandard.title}
                </strong>
              </p>
            </div>

            {loadingStandards ? (
              <Loader message="Loading criteria…" minHeight="320px" />
            ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {selectedStandard.criteria.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCriterion(c);
                    setStep("upload");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "20px 24px",
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    color: "var(--text-primary)",
                    fontFamily: "Plus Jakarta Sans",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,106,78,0.35)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0,106,78,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        className="tag tag-amber"
                        style={{ fontSize: "11px" }}
                      >
                        Criterion {c.code}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: "15px" }}>
                        {c.title}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        marginBottom: "10px",
                      }}
                    >
                      {c.description}
                    </p>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      <span
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                      >
                        Required files:
                      </span>
                      {c.requiredFiles.map((f, i) => (
                        <span
                          key={i}
                          className="tag"
                          style={{
                            fontSize: "10px",
                            background: "rgba(0,0,0,0.03)",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                            padding: "2px 8px",
                          }}
                        >
                          {f}
                        </span>
                      ))}
                      {/* {c.requiredFiles.length > 3 && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          +{c.requiredFiles.length - 3} more
                        </span>
                      )} */}
                    </div>
                  </div>
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
            )}
          </div>
        )}

        {/* STEP 3: Upload Files */}
        {step === "upload" && selectedStandard && selectedCriterion && (
          <div className="animate-fade-up">
            <button
              onClick={() => setStep("criterion")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                marginBottom: "16px",
                fontSize: "14px",
                fontFamily: "Plus Jakarta Sans",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ← Back to Criteria
            </button>

            <div className="tag tag-blue" style={{ marginBottom: "12px" }}>
              Step 3 of 3
            </div>
            <h1
              className="font-display"
              style={{ fontSize: "36px", marginBottom: "8px" }}
            >
              Upload Your Documents
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
              {selectedStandard.code} → Criterion {selectedCriterion.code}:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {selectedCriterion.title}
              </strong>
            </p>

            {/* Required files list */}
            <div
              className="card"
              style={{ padding: "24px", marginBottom: "24px" }}
            >
              <h3
                style={{
                  fontWeight: 600,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📋 Required Files for This Criterion
                <span className="tag tag-amber" style={{ fontSize: "11px" }}>
                  Upload what you have
                </span>
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {selectedCriterion.requiredFiles.map((f, i) => {
                  const isUploaded = uploadedFiles.some((uf) =>
                    uf.name.toLowerCase().includes(f.toLowerCase())
                  );
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        background: isUploaded
                          ? "rgba(16,185,129,0.05)"
                          : "rgba(0,0,0,0.02)",
                        borderRadius: "8px",
                        border: `1px solid ${
                          isUploaded ? "rgba(16,185,129,0.2)" : "var(--border)"
                        }`,
                      }}
                    >
                      <span
                        style={{
                          color: isUploaded ? "#34d399" : "var(--text-muted)",
                        }}
                      >
                        {isUploaded ? "✓" : "○"}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: isUploaded
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                          flex: 1,
                        }}
                      >
                        {f}
                      </span>
                      {!isUploaded && (
                        <span
                          className="tag"
                          style={{
                            fontSize: "10px",
                            background: "rgba(163,114,16,0.10)",
                            color: "#A37210",
                            border: "1px solid rgba(163,114,16,0.20)",
                            padding: "2px 8px",
                          }}
                        >
                          Optional
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Evaluation guidelines */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "14px",
                  background: "rgba(0,106,78,0.05)",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,106,78,0.10)",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: "#006A4E" }}>
                    📌 Evaluation Guidelines:{" "}
                  </strong>
                  {selectedCriterion.guidelines}
                </p>
              </div>
            </div>

            {/* Demo files info */}
            {selectedStandard.demoFiles.length > 0 && (
              <div
                className="card"
                style={{
                  padding: "20px",
                  marginBottom: "24px",
                  borderColor: "rgba(16,185,129,0.2)",
                }}
              >
                <h3
                  style={{
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#34d399",
                    fontSize: "14px",
                  }}
                >
                  📁 Benchmark Demo Files Available
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  This standard has {selectedStandard.demoFiles.length}{" "}
                  BAC-approved benchmark document(s) in the knowledge base. The
                  AI will compare your uploads against these benchmarks for
                  contextual scoring.
                </p>
              </div>
            )}

            {/* Drop zone */}
            <div
              className={`drop-zone ${isDragging ? "drag-over" : ""}`}
              style={{
                padding: "48px",
                textAlign: "center",
                marginBottom: "24px",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileAdd(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📤</div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Drop files here or click to browse
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Supports .docx and .pdf — one file at a time
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                style={{ display: "none" }}
                onChange={(e) => handleFileAdd(e.target.files)}
              />
            </div>

            {/* Uploaded files */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontWeight: 600, marginBottom: "12px" }}>
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {uploadedFiles.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        background: "rgba(0,106,78,0.05)",
                        borderRadius: "10px",
                        border: "1px solid rgba(0,106,78,0.12)",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>
                        {f.name.endsWith(".pdf") ? "📄" : "📝"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 500 }}>
                          {f.name}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {(f.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setUploadedFiles((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "18px",
                          fontFamily: "Plus Jakarta Sans",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={uploadedFiles.length === 0}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "16px",
                borderRadius: "12px",
              }}
            >
              {uploadedFiles.length === 0
                ? "Upload at least one file to analyze"
                : `🔍 Analyze ${uploadedFiles.length} File${
                    uploadedFiles.length > 1 ? "s" : ""
                  } with AI`}
            </button>
          </div>
        )}

        {/* STEP 4: Results */}
        {step === "result" && (
          <div className="animate-fade-up">
            {isAnalyzing ? (
              <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <div className="spinner" style={{ margin: "0 auto 32px" }} />
                <h2
                  className="font-display"
                  style={{ fontSize: "28px", marginBottom: "12px" }}
                >
                  Analyzing Your Documents
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "32px",
                  }}
                >
                  {loadingStages[loadingStage]}
                </p>
                <div
                  className="progress-bar"
                  style={{ maxWidth: "400px", margin: "0 auto" }}
                >
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((loadingStage + 1) / loadingStages.length) * 100
                      }%`,
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "12px",
                  }}
                >
                  This may take 30-60 seconds depending on file size
                </p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "60px 24px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                <h2
                  style={{
                    fontSize: "24px",
                    marginBottom: "12px",
                    color: "#f87171",
                  }}
                >
                  Analysis Failed
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "24px",
                  }}
                >
                  {error}
                </p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setStep("upload");
                    setError(null);
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : result ? (
              <div>
                {/* Header */}
                <div style={{ marginBottom: "32px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div className="tag tag-blue">{result.criterionCode}</div>
                    <div className="tag tag-green">Analysis Complete</div>
                  </div>
                  <h1
                    className="font-display"
                    style={{ fontSize: "32px", marginBottom: "6px" }}
                  >
                    Evaluation Report
                  </h1>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {result.standardTitle} → {result.criterionTitle}
                  </p>
                </div>

                {/* Overall Score Card */}
                <div
                  className="card"
                  style={{
                    padding: "40px",
                    marginBottom: "24px",
                    background:"linear-gradient(135deg, rgba(0,106,78,0.06) 0%, rgba(0,149,108,0.03) 100%)",
                    borderColor: `${getScoreColor(result.overallScore, result.maxPossibleScore)}30`,
                    display: "flex",
                    gap: "40px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Score Circle */}
                  <div style={{ flexShrink: 0 }}>
                    <svg width="140" height="140" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(0,0,0,0.06)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={getScoreColor(result.overallScore, result.maxPossibleScore)}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                        className="score-ring"
                        style={{
                          filter: `drop-shadow(0 0 6px ${getScoreColor(
                            result.overallScore, result.maxPossibleScore
                          )}60)`,
                        }}
                      />
                      <text
                        x="50"
                        y="48"
                        textAnchor="middle"
                        fill={getScoreColor(result.overallScore, result.maxPossibleScore)}
                        fontSize="22"
                        fontWeight="bold"
                        fontFamily="Playfair Display"
                      >
                        {result.overallScore}/{result.maxPossibleScore}
                      </text>
                      <text
                        x="50"
                        y="62"
                        textAnchor="middle"
                        fill="#7A9E92"
                        fontSize="8"
                        fontFamily="Plus Jakarta Sans"
                      >
                        Overall Score
                      </text>
                    </svg>
                  </div>

                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        className="font-display"
                        style={{
                          fontSize: "28px",
                          color: getScoreColor(result.overallScore, result.maxPossibleScore),
                        }}
                      >
                        {getScoreLabel(result.overallScore, result.maxPossibleScore)}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        lineHeight: 1.7,
                        fontSize: "15px",
                      }}
                    >
                      {result.overallFeedback}
                    </p>

                    {/* Score bar */}
                    <div style={{ marginTop: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Score Breakdown
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: getScoreColor(result.overallScore, result.maxPossibleScore),
                          }}
                        >
                          {result.overallScore}/{result.maxPossibleScore}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width:  `${(result.overallScore / result.maxPossibleScore) * 100}%`,
                            background: `linear-gradient(90deg, ${getScoreColor(
                              result.overallScore, result.maxPossibleScore
                            )}, ${getScoreColor(result.overallScore, result.maxPossibleScore)}aa)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Recommended Action Banner */}
{result.recommendedAction && (
  <div
    className="card"
    style={{
      padding: "20px 24px",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      borderColor: result.recommendedAction === "PASS"
        ? "rgba(16,185,129,0.3)"
        : result.recommendedAction === "MINOR_REVISION"
        ? "rgba(163,114,16,0.3)"
        : "rgba(239,68,68,0.3)",
      background: result.recommendedAction === "PASS"
        ? "rgba(16,185,129,0.05)"
        : result.recommendedAction === "MINOR_REVISION"
        ? "rgba(163,114,16,0.05)"
        : "rgba(239,68,68,0.05)",
    }}
  >
    <span style={{ fontSize: "28px" }}>
      {result.recommendedAction === "PASS" ? "✅"
        : result.recommendedAction === "MINOR_REVISION" ? "🔶"
        : result.recommendedAction === "MAJOR_REVISION" ? "🔴"
        : "❌"}
    </span>
    <div>
      <p style={{ fontWeight: 700, fontSize: "16px",
        color: result.recommendedAction === "PASS" ? "#34d399"
          : result.recommendedAction === "MINOR_REVISION" ? "#A37210"
          : "#f87171"
      }}>
        BAC Recommendation: {result.recommendedAction.replace(/_/g, " ")}
      </p>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
        {result.recommendedAction === "PASS"
          ? "This criterion meets BAC requirements and is ready for submission."
          : result.recommendedAction === "MINOR_REVISION"
          ? "Small targeted improvements needed before formal BAC submission."
          : result.recommendedAction === "MAJOR_REVISION"
          ? "Significant gaps must be addressed — major revision required."
          : "Submission does not meet BAC requirements. Rebuild recommended."}
      </p>
    </div>
  </div>
)}

{/* Evaluation Summary Card */}
{/* {result.evaluationSummary && (
  <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
    <h3 style={{ fontWeight: 600, marginBottom: "16px", fontSize: "15px" }}>
      📊 Evaluation Summary
    </h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
      {[
        { label: "Files Uploaded", value: result.evaluationSummary.filesUploaded },
        {
          label: "Evidence Covered",
          value: `${result.evaluationSummary.evidenceCoveredCount} / ${result.evaluationSummary.requiredEvidenceCount}`,
        },
        {
          label: "Document Type",
          value: result.evaluationSummary.consolidatedDocument ? "Consolidated" : "Separate Files",
        },
      ].map(({ label, value }) => (
        <div key={label} style={{
          padding: "16px",
          background: "rgba(0,0,0,0.02)",
          borderRadius: "10px",
          border: "1px solid var(--border)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>{value}</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{label}</p>
        </div>
      ))}
    </div>
    {result.evaluationSummary.missingCriticalElements.length > 0 && (
      <div style={{ marginTop: "16px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#f87171", marginBottom: "8px" }}>
          Critical Missing Elements:
        </p>
        {result.evaluationSummary.missingCriticalElements.map((el:string, i:number) => (
          <div key={i} style={{
            padding: "8px 12px",
            background: "rgba(239,68,68,0.04)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "var(--text-secondary)",
            marginBottom: "6px",
            border: "1px solid rgba(239,68,68,0.12)",
          }}>
            ✕ {el}
          </div>
        ))}
      </div>
    )}
  </div>
)} */}

                {/* Missing Files Alert */}
                {result.missingFiles.length > 0 && (
                  <div
                    className="card"
                    style={{
                      padding: "24px",
                      marginBottom: "24px",
                      borderColor: "rgba(239,68,68,0.3)",
                      background: "rgba(239,68,68,0.04)",
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: 600,
                        marginBottom: "14px",
                        color: "#f87171",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      ⚠️ Missing Required Files
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {result.missingFiles.map((f, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 14px",
                            background: "rgba(239,68,68,0.04)",
                            borderRadius: "8px",
                            border: "1px solid rgba(239,68,68,0.15)",
                          }}
                        >
                          <span style={{ color: "#f87171" }}>✕</span>
                          <span
                            style={{
                              fontSize: "13px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {f}
                          </span>
                          <span
                            className="tag tag-red"
                            style={{ fontSize: "10px", marginLeft: "auto" }}
                          >
                            Missing
                          </span>
                        </div>
                      ))}
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#f87171",
                        marginTop: "12px",
                      }}
                    >
                      Uploading these files in future evaluations will
                      significantly improve your score.
                    </p>
                  </div>
                )}

                {/* File Results */}
                {result.fileResults.length > 0 && (
                  <div>
                    <h2
                      className="font-display"
                      style={{ fontSize: "24px", marginBottom: "16px" }}
                    >
                      File Analysis
                    </h2>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {result.fileResults.map((fr, i) => (
                        <div
                          key={i}
                          className="card"
                          style={{ padding: "28px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              marginBottom: "16px",
                              gap: "16px",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  marginBottom: "6px",
                                }}
                              >
                                <span style={{ fontSize: "18px" }}>
                                  {fr.fileName.endsWith(".pdf") ? "📄" : "📝"}
                                </span>
                                <span
                                  style={{ fontWeight: 600, fontSize: "15px" }}
                                >
                                  {fr.fileName}
                                </span>
                              </div>
                              <p
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "13px",
                                  lineHeight: 1.6,
                                }}
                              >
                                {fr.feedback}
                              </p>
                            </div>
                            <div style={{ textAlign: "center", flexShrink: 0 }}>
                              <div
                                style={{
                                  width: "70px",
                                  height: "70px",
                                  borderRadius: "50%",
                                  background: `radial-gradient(circle, ${getScoreColor(
                                    fr.score, result.maxPossibleScore
                                  )}10, transparent)`,
                                  border: `3px solid ${getScoreColor(
                                    fr.score, result.maxPossibleScore
                                  )}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexDirection: "column",
                                  boxShadow: `0 2px 12px ${getScoreColor(
                                    fr.score, result.maxPossibleScore
                                  )}25`,
                                }}
                              >
                                <span
                                  className="font-display"
                                  style={{
                                    fontSize: "18px",
                                    color: getScoreColor(fr.score, result.maxPossibleScore),
                                  }}
                                >
                                  {fr.score}
                                </span>
                                <span
                                  style={{
                                    fontSize: "9px",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  /{result.maxPossibleScore}
                                </span>
                              </div>
                              <div
                                style={{
                                  marginTop: "6px",
                                  fontSize: "11px",
                                  color: getScoreColor(fr.score, result.maxPossibleScore),
                                }}
                              >
                                {getScoreLabel(fr.score, result.maxPossibleScore)}
                              </div>
                            </div>
                          </div>

                          <div
                            className="progress-bar"
                            style={{ marginBottom: "16px" }}
                          >
                            <div
                              className="progress-fill"
                              style={{
                                width: `${(fr.score / result.maxPossibleScore) * 100}%`,
                                background: `linear-gradient(90deg, ${getScoreColor(
                                  fr.score, result.maxPossibleScore
                                )}, ${getScoreColor(fr.score, result.maxPossibleScore)}aa)`,
                              }}
                            />
                          </div>
                          {/* Covers Requirements */}
{fr.coveredFiles.length > 0 && (
  <div style={{ marginBottom: "12px" }}>
    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
      Evidence covered by this file:
    </p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {fr.coveredFiles.map((req, j) => (
        <span key={j} style={{
          fontSize: "11px", padding: "3px 8px", borderRadius: "6px",
          background: "rgba(16,185,129,0.08)", color: "#34d399",
          border: "1px solid rgba(16,185,129,0.2)",
        }}>
          ✓ {req}
        </span>
      ))}
    </div>
  </div>
)}

{/* Checklist Results */}
{fr.checklistResults && Object.keys(fr.checklistResults).length > 0 && (
  <div style={{ marginBottom: "16px" }}>
    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
      Criterion Checklist:
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {Object.entries(fr.checklistResults).map(([key, met], j) => (
        <div key={j} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "6px 10px", borderRadius: "6px",
          background: met ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.04)",
          border: `1px solid ${met ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)"}`,
        }}>
          <span style={{ color: met ? "#34d399" : "#f87171", fontSize: "12px" }}>
            {met ? "✓" : "✕"}
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {key}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "16px",
                            }}
                          >
                            {fr.strengths.length > 0 && (
                              <div>
                                <h4
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#34d399",
                                    marginBottom: "8px",
                                  }}
                                >
                                  ✓ Strengths
                                </h4>
                                <ul style={{ listStyle: "none", padding: 0 }}>
                                  {fr.strengths.map((s, j) => (
                                    <li
                                      key={j}
                                      style={{
                                        fontSize: "12px",
                                        color: "var(--text-secondary)",
                                        marginBottom: "6px",
                                        paddingLeft: "12px",
                                        position: "relative",
                                      }}
                                    >
                                      <span
                                        style={{
                                          position: "absolute",
                                          left: 0,
                                          color: "#34d399",
                                        }}
                                      >
                                        ·
                                      </span>
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {fr.improvements.length > 0 && (
                              <div>
                                <h4
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#fbbf24",
                                    marginBottom: "8px",
                                  }}
                                >
                                  ↑ Improvements Needed
                                </h4>
                                <ul style={{ listStyle: "none", padding: 0 }}>
                                  {fr.improvements.map((imp, j) => (
                                    <li
                                      key={j}
                                      style={{
                                        fontSize: "12px",
                                        color: "var(--text-secondary)",
                                        marginBottom: "6px",
                                        paddingLeft: "12px",
                                        position: "relative",
                                      }}
                                    >
                                      <span
                                        style={{
                                          position: "absolute",
                                          left: 0,
                                          color: "#fbbf24",
                                        }}
                                      >
                                        ·
                                      </span>
                                      {imp}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "32px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setStep("upload");
                      setResult(null);
                      setError(null);
                    }}
                  >
                    📤 Upload More Files
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => {
                      setStep("standard");
                      setSelectedStandard(null);
                      setSelectedCriterion(null);
                      setUploadedFiles([]);
                      setResult(null);
                    }}
                  >
                    🔄 Start New Evaluation
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
