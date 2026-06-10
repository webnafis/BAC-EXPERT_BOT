"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Standard, Criterion, DemoFile } from "@/data/bac-data";
import { Loader, LoaderOverlay } from "@/components/Loader";
import { Modal } from "@/components/Modal";

type AdminView = "standards" | "criteria" | "demo-files" | "settings";

export default function AdminPage() {
  const [view, setView] = useState<AdminView>("standards");
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingStandards, setLoadingStandards] = useState(true);
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Settings State
  const [ngrokUrl, setNgrokUrl] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Modals
  const [showAddStandard, setShowAddStandard] = useState(false);
  const [showEditStandard, setShowEditStandard] = useState<Standard | null>(
    null
  );
  const [showAddCriterion, setShowAddCriterion] = useState(false);
  const [showEditCriterion, setShowEditCriterion] = useState<Criterion | null>(
    null
  );
  const [showAddDemo, setShowAddDemo] = useState(false);
  const [showEditDemo, setShowEditDemo] = useState<DemoFile | null>(null);
  const [extracting, setExtracting] = useState(false);

  const fetchStandards = async () => {
    setLoadingStandards(true);
    try {
      const res = await fetch("/api/admin/standards");
      const data = await res.json();
      setStandards(data.standards || []);
      if (selectedStandard) {
        const updated = (data.standards || []).find(
          (s: Standard) => s.id === selectedStandard.id
        );
        setSelectedStandard(updated || null);
      }
    } finally {
      setLoadingStandards(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setNgrokUrl(data.ngrokUrl || "");
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  useEffect(() => {
    fetchStandards();
    fetchSettings();
  }, []);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // Standard CRUD
  const [sForm, setSForm] = useState({ code: "", title: "", description: "" });

  const addStandard = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/standards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sForm),
    });
    if (res.ok) {
      showMsg("Standard added!");
      setShowAddStandard(false);
      setSForm({ code: "", title: "", description: "" });
      fetchStandards();
    } else showMsg("Failed to add standard", "error");
    setLoading(false);
  };

  const updateStandard = async (std: Standard) => {
    setLoading(true);
    const res = await fetch(`/api/admin/standards/${std.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(std),
    });
    if (res.ok) {
      showMsg("Standard updated!");
      setShowEditStandard(null);
      fetchStandards();
    } else showMsg("Failed to update", "error");
    setLoading(false);
  };

  const deleteStandard = async (id: string) => {
    if (!confirm("Delete this standard and all its criteria?")) return;
    await fetch(`/api/admin/standards/${id}`, { method: "DELETE" });
    showMsg("Standard deleted");
    if (selectedStandard?.id === id) {
      setSelectedStandard(null);
      setView("standards");
    }
    fetchStandards();
  };

  // Criterion CRUD
  const [cForm, setCForm] = useState({
    code: "",
    title: "",
    description: "",
    requiredFiles: "",
    guidelines: "",
    weight: 7,
    checklistItems: "", 
  });

  const addCriterion = async () => {
    if (!selectedStandard) return;
    setLoading(true);
    const res = await fetch(`/api/admin/standards/${selectedStandard.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "add_criterion",
        ...cForm,
        requiredFiles: cForm.requiredFiles.split("\n").filter(Boolean),
        checklistItems: cForm.checklistItems.split("\n").filter(Boolean),
      }),
    });
    if (res.ok) {
      showMsg("Criterion added!");
      setShowAddCriterion(false);
      setCForm({
        code: "",
        title: "",
        description: "",
        requiredFiles: "",
        guidelines: "",
        weight: 7,
        checklistItems: "",
      });
      fetchStandards();
    } else showMsg("Failed to add criterion", "error");
    setLoading(false);
  };

  const updateCriterion = async (c: Criterion) => {
    if (!selectedStandard) return;
    setLoading(true);
    const res = await fetch(
      `/api/admin/criteria/${selectedStandard.id}/${c.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      }
    );
    if (res.ok) {
      showMsg("Criterion updated!");
      setShowEditCriterion(null);
      fetchStandards();
    } else showMsg("Failed to update", "error");
    setLoading(false);
  };

  const deleteCriterion = async (cId: string) => {
    if (!selectedStandard) return;
    if (!confirm("Delete this criterion?")) return;
    await fetch(`/api/admin/criteria/${selectedStandard.id}/${cId}`, {
      method: "DELETE",
    });
    showMsg("Criterion deleted");
    fetchStandards();
  };

  // Demo File CRUD
  const [dForm, setDForm] = useState({
    name: "",
    description: "",
    content: "",
    relatedCriteria: "",
  });

  const addDemoFile = async () => {
    if (!selectedStandard) return;
    setLoading(true);
    const res = await fetch(`/api/admin/standards/${selectedStandard.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "add_demo_file",
        ...dForm,
        relatedCriteria: dForm.relatedCriteria
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    if (res.ok) {
      showMsg("Demo file added!");
      setShowAddDemo(false);
      setDForm({ name: "", description: "", content: "", relatedCriteria: "" });
      fetchStandards();
    } else showMsg("Failed to add demo file", "error");
    setLoading(false);
  };

  const updateDemoFile = async (df: DemoFile) => {
    if (!selectedStandard) return;
    setLoading(true);
    const res = await fetch(
      `/api/admin/demo-files/${selectedStandard.id}/${df.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(df),
      }
    );
    if (res.ok) {
      showMsg("Demo file updated!");
      setShowEditDemo(null);
      fetchStandards();
    } else showMsg("Failed to update", "error");
    setLoading(false);
  };

  const deleteDemoFile = async (fId: string) => {
    if (!selectedStandard) return;
    if (!confirm("Delete this demo file?")) return;
    await fetch(`/api/admin/demo-files/${selectedStandard.id}/${fId}`, {
      method: "DELETE",
    });
    showMsg("Demo file deleted");
    fetchStandards();
  };

  const extractDemoFileContent = async (
    file: File,
    onExtracted: (text: string, fileName: string) => void
  ) => {
    if (!selectedStandard) return;
    setExtracting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(
        `/api/admin/demo-files/${selectedStandard.id}/extract`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (res.ok) {
        onExtracted(data.text, data.fileName);
        showMsg(`Text extracted from ${data.fileName}`);
      } else {
        showMsg(data.error || "Failed to extract text", "error");
      }
    } catch {
      showMsg("Failed to extract text from file", "error");
    }
    setExtracting(false);
  };

  const handleDemoFileUpload = (
    files: FileList | null,
    onExtracted: (text: string, fileName: string) => void
  ) => {
    const file = files?.[0];
    if (!file) return;
    extractDemoFileContent(file, onExtracted);
  };

  const labelStyle = {
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          padding: "24px 16px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg,#006A4E,#00956C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            🎓
          </div>
          <span className="font-display" style={{ fontSize: "16px" }}>
            BAC Expert Bot
          </span>
        </Link>

        <p
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            padding: "0 16px",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Admin Panel
        </p>

        <button
          className={`admin-nav-item ${
            view === "standards" && !selectedStandard ? "active" : ""
          }`}
          onClick={() => {
            setView("standards");
            setSelectedStandard(null);
          }}
        >
          <span>📚</span> Standards
          <span
            style={{
              marginLeft: "auto",
              background: "rgba(0,106,78,0.15)",
              color: "#006A4E",
              padding: "2px 8px",
              borderRadius: "20px",
              fontSize: "11px",
            }}
          >
            {standards.length}
          </span>
        </button>

        <button
          className={`admin-nav-item ${
            view === "settings" ? "active" : ""
          }`}
          onClick={() => {
            setView("settings");
            setSelectedStandard(null);
          }}
        >
          <span>⚙️</span> Settings
        </button>

        {standards.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                padding: "0 16px",
                marginBottom: "6px",
              }}
            >
              Standards
            </p>
            {standards.map((s) => (
              <button
                key={s.id}
                className={`admin-nav-item ${
                  selectedStandard?.id === s.id ? "active" : ""
                }`}
                style={{ fontSize: "12px", paddingLeft: "24px" }}
                onClick={() => {
                  setSelectedStandard(s);
                  setView("criteria");
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "currentColor",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.code}
                </span>
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: "auto" }}>
          <div className="divider" />
          <Link href="/evaluate">
            <button
              className="btn-primary"
              style={{ width: "100%", padding: "10px", fontSize: "13px" }}
            >
              Open Evaluator
            </button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "32px", overflow: "auto" }}>
        {/* Toast */}
        {msg && (
          <div
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              zIndex: 100,
              padding: "14px 20px",
              borderRadius: "12px",
              background:
                msg.type === "success"
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(239,68,68,0.15)",
              border: `1px solid ${
                msg.type === "success"
                  ? "rgba(16,185,129,0.3)"
                  : "rgba(239,68,68,0.3)"
              }`,
              color: msg.type === "success" ? "#34d399" : "#f87171",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            {msg.type === "success" ? "✓ " : "✕ "}
            {msg.text}
          </div>
        )}

        {/* Settings View */}
        {view === "settings" && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "32px",
              }}
            >
              <div>
                <h1
                  className="font-display"
                  style={{ fontSize: "32px", marginBottom: "6px" }}
                >
                  System Settings
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                  Configure global application settings
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: "24px", maxWidth: "600px" }}>
              <div className="form-group">
                <label style={labelStyle}>AI ngrok URL</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://your-ngrok-url.ngrok-free.dev"
                  value={ngrokUrl}
                  onChange={(e) => setNgrokUrl(e.target.value)}
                  style={{ width: "100%" }}
                />
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                  The base URL for the AI analyzer. Must include protocol (http/https) and no trailing slash.
                </p>
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    setSavingSettings(true);
                    try {
                      const res = await fetch("/api/admin/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ngrokUrl }),
                      });
                      if (res.ok) {
                        showMsg("Settings saved successfully!");
                      } else {
                        showMsg("Failed to save settings", "error");
                      }
                    } catch {
                      showMsg("Failed to save settings", "error");
                    }
                    setSavingSettings(false);
                  }}
                  disabled={savingSettings}
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Standards View */}
        {view === "standards" && !selectedStandard && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "32px",
              }}
            >
              <div>
                <h1
                  className="font-display"
                  style={{ fontSize: "32px", marginBottom: "6px" }}
                >
                  BAC Standards
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                  Manage the 10 BAC evaluation standards
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => setShowAddStandard(true)}
              >
                + Add Standard
              </button>
            </div>

            {loadingStandards ? (
              <Loader message="Loading BAC standards…" minHeight="280px" />
            ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {standards.map((s) => (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    padding: "20px 24px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        className="tag tag-blue"
                        style={{ fontSize: "11px" }}
                      >
                        {s.code}
                      </span>
                      <span style={{ fontWeight: 600 }}>{s.title}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button
                        className="btn-outline"
                        style={{ padding: "8px 14px", fontSize: "13px" }}
                        onClick={() => {
                          setSelectedStandard(s);
                          setView("criteria");
                        }}
                      >
                        Manage →
                      </button>
                      <button
                        className="btn-outline"
                        style={{ padding: "8px 14px", fontSize: "13px" }}
                        onClick={() => setShowEditStandard({ ...s })}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: "8px 14px" }}
                        onClick={() => deleteStandard(s.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div
                    className="standard-html"
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                    }}
                    dangerouslySetInnerHTML={{ __html: s.descriptionHtml || (s.description + "...") }}
                  />
                  <div
                    style={{ marginTop: "12px", display: "flex", gap: "8px" }}
                  >
                    <span
                      className="tag tag-purple"
                      style={{ fontSize: "11px" }}
                    >
                      {s.criteria.length} criteria
                    </span>
                    <span
                      className="tag tag-green"
                      style={{ fontSize: "11px" }}
                    >
                      {s.demoFiles.length} demo files
                    </span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Criteria / Demo Files View (when standard selected) */}
        {selectedStandard && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <button
                onClick={() => {
                  setSelectedStandard(null);
                  setView("standards");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans",
                  fontSize: "14px",
                }}
              >
                ← Standards
              </button>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span className="tag tag-blue">{selectedStandard.code}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {selectedStandard.title}
              </span>
            </div>

            {/* Sub tabs */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "28px",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "0",
              }}
            >
              {[
                ["criteria", "📋 Criteria"],
                ["demo-files", "📁 Demo Files"],
              ].map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setView(v as AdminView)}
                  style={{
                    padding: "10px 20px",
                    background: "none",
                    border: "none",
                    color: view === v ? "#006A4E" : "var(--text-muted)",
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    borderBottom:
                      view === v
                        ? "2px solid #006A4E"
                        : "2px solid transparent",
                    marginBottom: "-1px",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Criteria list */}
            {view === "criteria" && (
              loadingStandards ? (
                <Loader message="Loading criteria…" minHeight="280px" />
              ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h2 className="font-display" style={{ fontSize: "24px" }}>
                    Criteria ({selectedStandard.criteria.length})
                  </h2>
                  <button
                    className="btn-primary"
                    onClick={() => setShowAddCriterion(true)}
                  >
                    + Add Criterion
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {selectedStandard.criteria.map((c) => (
                    <div
                      key={c.id}
                      className="card"
                      style={{ padding: "20px 24px" }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <span
                              className="tag tag-amber"
                              style={{ fontSize: "11px" }}
                            >
                              Criterion {c.code}
                            </span>
                            <span style={{ fontWeight: 600 }}>{c.title}</span>
                            <span
                              className="tag"
                              style={{
                                fontSize: "10px",
                                background: "rgba(0,106,78,0.08)",
                                color: "#006A4E",
                                border: "1px solid rgba(0,106,78,0.18)",
                                padding: "2px 8px",
                              }}
                            >
                              Weight: {c.weight}
                            </span>
                          </div>
                          <div
                            style={{ display: "flex", gap: "8px", flexShrink: 0 }}
                          >
                            <button
                              className="btn-outline"
                              style={{ padding: "8px 14px", fontSize: "13px" }}
                              onClick={() => setShowEditCriterion({ ...c })}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-danger"
                              style={{ padding: "8px 14px" }}
                              onClick={() => deleteCriterion(c.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div
                          className="standard-html"
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "13px",
                            marginBottom: "10px",
                          }}
                          dangerouslySetInnerHTML={{ __html: c.descriptionHtml || c.description }}
                        />
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px 16px",
                            background: "var(--green-50)",
                            border: "1px solid rgba(0,106,78,0.1)",
                            borderRadius: "10px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--green-800)",
                              marginBottom: "8px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            Required Evidence Documents ({c.requiredFiles.length})
                          </div>
                          <ul
                            style={{
                              listStyle: "none",
                              padding: 0,
                              margin: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            {c.requiredFiles.map((f, i) => (
                              <li
                                key={i}
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-secondary)",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "8px",
                                  lineHeight: 1.4,
                                }}
                              >
                                <span style={{ color: "var(--green-700)", marginTop: "-1px" }}>•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {(c.guidelinesHtml || c.guidelines) && (
                          <div
                            style={{
                              marginTop: "16px",
                              padding: "16px",
                              background: "rgba(0,106,78,0.05)",
                              borderRadius: "10px",
                              border: "1px solid rgba(0,106,78,0.10)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#006A4E",
                                marginBottom: "12px",
                              }}
                            >
                              📌 Evaluation Guidelines:
                            </div>
                            <div
                              className="standard-html"
                              style={{
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                lineHeight: 1.6,
                              }}
                              dangerouslySetInnerHTML={{ __html: c.guidelinesHtml || c.guidelines }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedStandard.criteria.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <p style={{ fontSize: "48px", marginBottom: "12px" }}>
                        📋
                      </p>
                      <p>No criteria yet. Add the first one.</p>
                    </div>
                  )}
                </div>
              </div>
              )
            )}

            {/* Demo Files list */}
            {view === "demo-files" && (
              loadingStandards ? (
                <Loader message="Loading demo files…" minHeight="280px" />
              ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h2 className="font-display" style={{ fontSize: "24px" }}>
                      Demo Files
                    </h2>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      BAC-approved benchmark documents used as reference for AI
                      scoring
                    </p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => setShowAddDemo(true)}
                  >
                    + Add Demo File
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {selectedStandard.demoFiles.map((df) => (
                    <div
                      key={df.id}
                      className="card"
                      style={{ padding: "20px 24px" }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <span style={{ fontSize: "20px" }}>📁</span>
                            <span style={{ fontWeight: 600 }}>{df.name}</span>
                          </div>
                          <div
                            style={{ display: "flex", gap: "8px", flexShrink: 0 }}
                          >
                            <button
                              className="btn-outline"
                              style={{ padding: "8px 14px", fontSize: "13px" }}
                              onClick={() => setShowEditDemo({ ...df })}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-danger"
                              style={{ padding: "8px 14px" }}
                              onClick={() => deleteDemoFile(df.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div
                          className="standard-html"
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "13px",
                            marginBottom: "10px",
                          }}
                          dangerouslySetInnerHTML={{ __html: df.descriptionHtml || df.description }}
                        />
                        <div
                          style={{
                            padding: "12px",
                            background: "rgba(0,0,0,0.04)",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            fontFamily: "monospace",
                            maxHeight: "100px",
                            overflow: "hidden",
                          }}
                        >
                          {df.content}...
                        </div>
                        {df.relatedCriteria.length > 0 && (
                          <div style={{ marginTop: "12px" }}>
                            <span
                              style={{
                                fontSize: "12px",
                                color: "var(--text-muted)",
                              }}
                            >
                              Related criteria:{" "}
                            </span>
                            {df.relatedCriteria.map((rc, i) => (
                              <span
                                key={i}
                                className="tag tag-blue"
                                style={{
                                  fontSize: "11px",
                                  marginLeft: "4px",
                                }}
                              >
                                {rc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedStandard.demoFiles.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <p style={{ fontSize: "48px", marginBottom: "12px" }}>
                        📁
                      </p>
                      <p>
                        No demo files yet. Add BAC-approved benchmark documents.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              )
            )}
          </div>
        )}
      </main>

      {/* ===== MODALS ===== */}

      {/* Add Standard Modal */}
      {showAddStandard && (
        <Modal
          title="Add New Standard"
          onClose={() => setShowAddStandard(false)}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {loading && <LoaderOverlay message="Adding standard…" />}
            <div>
              <label style={labelStyle}>Standard Code *</label>
              <input
                placeholder="e.g. STD-11"
                value={sForm.code}
                onChange={(e) =>
                  setSForm((p) => ({ ...p, code: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Title *</label>
              <input
                placeholder="e.g. Graduate Outcomes"
                value={sForm.title}
                onChange={(e) =>
                  setSForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                rows={10}
                placeholder={`A good standard description should include 4 parts:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — OFFICIAL BAC DEFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Paste the exact BAC text for this standard from the 
official BAC accreditation document.

e.g. "Governance system must work in a manner that 
ensures better management of the program towards the 
achievement of mission and objectives of the HEI/POE 
in a way that effectively benefits the stakeholders."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — PLAIN LANGUAGE TRANSLATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Explain what this standard means in practice.
What is the department expected to demonstrate?
What does "compliance" look like in real terms?

e.g. "In practical terms, this standard asks: Does 
the department have a clear direction, structured 
plans, safe policies, and disciplined operations — 
and are these documented, approved, and implemented?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — CRITERIA SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
List ALL criteria under this standard with a 
one-line description of what each criterion covers.

e.g. "This standard covers 6 criteria:
- Criterion 1.1: Vision & Mission — ...
- Criterion 1.2: Strategic Plan — ...
- Criterion 1.3: Sexual Harassment Policy — ...
- Criterion 1.4: Academic Calendar — ...
- Criterion 1.5: Class Size Policy — ...
- Criterion 1.6: Student Database — ..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — AI EVALUATION INSTRUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tell the AI what overarching principle to apply 
when evaluating ALL criteria under this standard.
What is the common thread the AI must check for?

e.g. "When evaluating documents under this standard, 
assess whether evidence shows active implementation 
and real operational impact — not just document 
existence. The key principle is that governance must 
effectively benefit stakeholders."`}
                value={sForm.description}
                onChange={(e) =>
                  setSForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                className="btn-primary"
                onClick={addStandard}
                disabled={loading || !sForm.code || !sForm.title}
              >
                {loading ? "Adding..." : "Add Standard"}
              </button>
              <button
                className="btn-outline"
                onClick={() => setShowAddStandard(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Standard Modal */}
      {showEditStandard && (
        <Modal title="Edit Standard" onClose={() => setShowEditStandard(null)}>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {loading && <LoaderOverlay message="Saving changes…" />}
            <div>
              <label style={labelStyle}>Standard Code</label>
              <input
                value={showEditStandard.code}
                onChange={(e) =>
                  setShowEditStandard((p) =>
                    p ? { ...p, code: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Title</label>
              <input
                value={showEditStandard.title}
                onChange={(e) =>
                  setShowEditStandard((p) =>
                    p ? { ...p, title: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                rows={10}
                value={showEditStandard.description}
                onChange={(e) =>
                  setShowEditStandard((p) =>
                    p ? { ...p, description: e.target.value } : null
                  )
                }
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-primary"
                onClick={() =>
                  showEditStandard && updateStandard(showEditStandard)
                }
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="btn-outline"
                onClick={() => setShowEditStandard(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Criterion Modal */}
      {showAddCriterion && (
        <Modal
          title="Add New Criterion"
          onClose={() => setShowAddCriterion(false)}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {loading && <LoaderOverlay message="Adding criterion…" />}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label style={labelStyle}>Criterion Code *</label>
                <input
                  placeholder="e.g. 2.4"
                  value={cForm.code}
                  onChange={(e) =>
                    setCForm((p) => ({ ...p, code: e.target.value }))
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Weight *</label>
                <input
                  type="number"
                  min={1}
                  value={cForm.weight}
                  onChange={(e) =>
                    setCForm((p) => ({ ...p, weight: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Title *</label>
              <input
                placeholder="Criterion title: e.g. Strategic Plan and Program Educational Objectives (PEOs)"
                value={cForm.title}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                rows={10}
                placeholder={`Describe what this criterion requires in full detail. Include:
- What the PoE/department must have or demonstrate
- Who the stakeholders are (faculty, industry, alumni, students)
- What "evidence" means in this context (not just claims)
- Any BAC-specific terminology or definitions
- What differentiates a weak vs strong submission

Example: "The Program of Engineering (PoE) must have a formally documented 
Strategic Plan that establishes PEOs in alignment with the HEI vision/mission. 
PEOs must describe graduate achievements within 3–5 years of graduation, 
developed with stakeholder input, with a defined periodic review mechanism..."`}
                value={cForm.description}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Required Files (one per line) *</label>
              <textarea
                rows={6}
                placeholder={
                  `Strategic Plan Document (with goals, objectives, actions, timeline, budget, and achievement indicators)
Minutes of Meeting — Strategic Plan Approval
Stakeholder Input Collection Mechanism (survey form, feedback system, or equivalent)
Minutes of Meeting — Stakeholder Input Consideration (faculty, staff, and others)
Communication Link or Evidence showing how the Strategic Plan is communicated to stakeholders`
                }
                value={cForm.requiredFiles}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, requiredFiles: e.target.value }))
                }
              />
            </div>
            {/* In Add Criterion modal — after requiredFiles textarea */}
<div>
  <label style={labelStyle}>Evaluation Checklist Items (one per line) *</label>
  <textarea
    rows={10}
    placeholder={`One checkable item per line. These are the specific things the AI will verify.
Be precise — each item should be a yes/no verifiable statement.

Example for criterion 1.2:
Strategic plan document exists as a formally structured standalone document
Plan contains strategic goals aligned with HEI/POE vision and mission
Plan contains specific objectives with measurable indicators (KPIs)
Plan contains necessary actions with responsible persons identified
Plan contains a specific implementation timeline with dates
Plan contains budget allocation per goal or action
Minutes of meeting for strategic plan approval are present
A mechanism/system for collecting stakeholder input is documented
Minutes showing stakeholder inputs were considered are present
A communication link showing how the plan is communicated is provided`}
    value={cForm.checklistItems}
    onChange={(e) => setCForm((p) => ({ ...p, checklistItems: e.target.value }))}
  />
</div>
            <div>
              <label style={labelStyle}>Evaluation Guidelines</label>
              <textarea
                rows={10}
                placeholder={`Provide specific, checkable rules the AI must apply. Include:
- Minimum counts (e.g. "PEOs must be 3–5 in number")
- Timeframes (e.g. "achievable within 3–5 years post-graduation")
- What counts as evidence vs claim (e.g. "verbal approvals not acceptable")
- Format requirements (e.g. "must include budget breakdown by category")
- Red flags that should lower the score

Example: "The strategic plan must include: (1) goals aligned with HEI mission, 
(2) measurable objectives with KPIs, (3) responsible persons per action, 
(4) implementation timeline, (5) budget allocation. Approval must be evidenced 
by signed meeting minutes — informal approvals are not acceptable..."`}
                value={cForm.guidelines}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, guidelines: e.target.value }))
                }
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-primary"
                onClick={addCriterion}
                disabled={loading || !cForm.code || !cForm.title}
              >
                {loading ? "Adding..." : "Add Criterion"}
              </button>
              <button
                className="btn-outline"
                onClick={() => setShowAddCriterion(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Criterion Modal */}
      {showEditCriterion && (
        <Modal
          title="Edit Criterion"
          onClose={() => setShowEditCriterion(null)}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {loading && <LoaderOverlay message="Saving changes…" />}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label style={labelStyle}>Code</label>
                <input
                  value={showEditCriterion.code}
                  onChange={(e) =>
                    setShowEditCriterion((p) =>
                      p ? { ...p, code: e.target.value } : null
                    )
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Weight</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={showEditCriterion.weight}
                  onChange={(e) =>
                    setShowEditCriterion((p) =>
                      p ? { ...p, weight: Number(e.target.value) } : null
                    )
                  }
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Title</label>
              <input
                value={showEditCriterion.title}
                onChange={(e) =>
                  setShowEditCriterion((p) =>
                    p ? { ...p, title: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                rows={10}
                value={showEditCriterion.description}
                onChange={(e) =>
                  setShowEditCriterion((p) =>
                    p ? { ...p, description: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Required Files (one per line)</label>
              <textarea
                rows={6}
                value={showEditCriterion.requiredFiles.join("\n")}
                onChange={(e) =>
                  setShowEditCriterion((p) =>
                    p
                      ? {
                          ...p,
                          requiredFiles: e.target.value
                            .split("\n")
                            .filter(Boolean),
                        }
                      : null
                  )
                }
              />
            </div>
            <div>
  <label style={labelStyle}>Checklist Items (one per line)</label>
  <textarea
    rows={10}
    value={(showEditCriterion.checklistItems || []).join("\n")}
    onChange={(e) =>
      setShowEditCriterion((p) =>
        p ? { ...p, checklistItems: e.target.value.split("\n").filter(Boolean) } : null
      )
    }
  />
</div>
            <div>
              <label style={labelStyle}>Guidelines</label>
              <textarea
                rows={10}
                value={showEditCriterion.guidelines}
                onChange={(e) =>
                  setShowEditCriterion((p) =>
                    p ? { ...p, guidelines: e.target.value } : null
                  )
                }
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-primary"
                onClick={() =>
                  showEditCriterion && updateCriterion(showEditCriterion)
                }
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="btn-outline"
                onClick={() => setShowEditCriterion(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Demo File Modal */}
      {showAddDemo && (
        <Modal title="Add Demo File" onClose={() => setShowAddDemo(false)}>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {(extracting || loading) && (
              <LoaderOverlay
                message={
                  extracting
                    ? "Extracting text from your document. This may take a moment…"
                    : "Saving demo file…"
                }
              />
            )}
            <div>
              <label style={labelStyle}>File Name *</label>
              <input
                placeholder="e.g. Vision_Mission_Demo.pdf"
                value={dForm.name}
                onChange={(e) =>
                  setDForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
              rows={10}
                placeholder={`What a Good description Should Do
                The description field is what the AI reads to understand what this benchmark represents, what makes it strong, and what to look for when comparing the user's uploaded file against it. It should answer:
                
                1.What type of document is this?
                2.What BAC checkpoints does it satisfy?
                3.What specific strengths make it a good benchmark?
                4.What should the AI use it to check against?`}
                value={dForm.description}
                onChange={(e) =>
                  setDForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Upload Document (PDF or Word)</label>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                disabled={extracting}
                onChange={(e) => {
                  handleDemoFileUpload(e.target.files, (text, fileName) => {
                    setDForm((p) => ({
                      ...p,
                      content: text,
                      name: p.name || fileName,
                    }));
                  });
                  e.target.value = "";
                }}
              />
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  marginTop: "6px",
                }}
              >
                {extracting
                  ? "Extracting text from file..."
                  : "Upload a .pdf or .docx file to fill the content below. Review and edit before saving."}
              </p>
            </div>
            <div>
              <label style={labelStyle}>Document Content *</label>
              <textarea
                rows={10}
                placeholder="Upload a file above or paste text manually. This content is used by the AI for comparative scoring..."
                value={dForm.content}
                onChange={(e) =>
                  setDForm((p) => ({ ...p, content: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>
                Related Criterion IDs (comma-separated, optional)
              </label>
              <input
                placeholder="e.g. c1-1, c1-2"
                value={dForm.relatedCriteria}
                onChange={(e) =>
                  setDForm((p) => ({ ...p, relatedCriteria: e.target.value }))
                }
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-primary"
                onClick={addDemoFile}
                disabled={
                  loading || extracting || !dForm.name || !dForm.content
                }
              >
                {loading ? "Adding..." : "Add Demo File"}
              </button>
              <button
                className="btn-outline"
                onClick={() => setShowAddDemo(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Demo File Modal */}
      {showEditDemo && (
        <Modal title="Edit Demo File" onClose={() => setShowEditDemo(null)}>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {(extracting || loading) && (
              <LoaderOverlay
                message={
                  extracting
                    ? "Extracting text from your document. This may take a moment…"
                    : "Saving demo file…"
                }
              />
            )}
            <div>
              <label style={labelStyle}>File Name</label>
              <input
                value={showEditDemo.name}
                onChange={(e) =>
                  setShowEditDemo((p) =>
                    p ? { ...p, name: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
              rows={10}
                value={showEditDemo.description}
                onChange={(e) =>
                  setShowEditDemo((p) =>
                    p ? { ...p, description: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Upload Document (PDF or Word)</label>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                disabled={extracting}
                onChange={(e) => {
                  handleDemoFileUpload(e.target.files, (text, fileName) => {
                    setShowEditDemo((p) =>
                      p
                        ? {
                            ...p,
                            content: text,
                            name: p.name || fileName,
                          }
                        : null
                    );
                  });
                  e.target.value = "";
                }}
              />
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  marginTop: "6px",
                }}
              >
                {extracting
                  ? "Extracting text from file..."
                  : "Upload to replace content below. Review before saving."}
              </p>
            </div>
            <div>
              <label style={labelStyle}>Content</label>
              <textarea
                rows={10}
                value={showEditDemo.content}
                onChange={(e) =>
                  setShowEditDemo((p) =>
                    p ? { ...p, content: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <label style={labelStyle}>
                Related Criteria (comma-separated IDs)
              </label>
              <input
                value={showEditDemo.relatedCriteria.join(", ")}
                onChange={(e) =>
                  setShowEditDemo((p) =>
                    p
                      ? {
                          ...p,
                          relatedCriteria: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        }
                      : null
                  )
                }
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-primary"
                onClick={() => showEditDemo && updateDemoFile(showEditDemo)}
                disabled={loading || extracting}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="btn-outline"
                onClick={() => setShowEditDemo(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
