"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Standard, Criterion, DemoFile } from "@/data/bac-data";

type AdminView = "standards" | "criteria" | "demo-files";

export default function AdminPage() {
  const [view, setView] = useState<AdminView>("standards");
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

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

  const fetchStandards = async () => {
    const res = await fetch("/api/admin/standards");
    const data = await res.json();
    setStandards(data.standards || []);
    if (selectedStandard) {
      const updated = (data.standards || []).find(
        (s: Standard) => s.id === selectedStandard.id
      );
      setSelectedStandard(updated || null);
    }
  };

  useEffect(() => {
    fetchStandards();
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

            <div style={{ display: "grid", gap: "12px" }}>
              {standards.map((s) => (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
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
                      <span
                        className="tag tag-blue"
                        style={{ fontSize: "11px" }}
                      >
                        {s.code}
                      </span>
                      <span style={{ fontWeight: 600 }}>{s.title}</span>
                    </div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                        lineHeight: 1.5,
                      }}
                    >
                      {s.description}...
                    </p>
                    <div
                      style={{ marginTop: "8px", display: "flex", gap: "8px" }}
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
                  <div style={{ display: "flex", gap: "8px" }}>
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
              ))}
            </div>
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "16px",
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
                              Weight: {c.weight}/10
                            </span>
                          </div>
                          <p
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "13px",
                              marginBottom: "10px",
                            }}
                          >
                            {c.description}
                          </p>
                          <div>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "var(--text-muted)",
                                marginBottom: "6px",
                              }}
                            >
                              Required Files ({c.requiredFiles.length}):
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                              }}
                            >
                              {c.requiredFiles.map((f, i) => (
                                <span
                                  key={i}
                                  className="tag"
                                  style={{
                                    fontSize: "11px",
                                    background: "rgba(0,0,0,0.03)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-secondary)",
                                    padding: "3px 8px",
                                  }}
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                          {c.guidelines && (
                            <div
                              style={{
                                marginTop: "10px",
                                padding: "10px 12px",
                                background: "rgba(0,106,78,0.05)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                              }}
                            >
                              📌 {c.guidelines}
                            </div>
                          )}
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
            )}

            {/* Demo Files list */}
            {view === "demo-files" && (
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "16px",
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
                            <span style={{ fontSize: "20px" }}>📁</span>
                            <span style={{ fontWeight: 600 }}>{df.name}</span>
                          </div>
                          <p
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "13px",
                              marginBottom: "10px",
                            }}
                          >
                            {df.description}
                          </p>
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
                            <div style={{ marginTop: "8px" }}>
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
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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
                rows={3}
                placeholder="Describe what this standard covers..."
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
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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
                rows={3}
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
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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
                <label style={labelStyle}>Weight (1-10) *</label>
                <input
                  type="number"
                  min={1}
                  max={10}
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
                placeholder="Criterion title"
                value={cForm.title}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                rows={2}
                placeholder="What does this criterion require?"
                value={cForm.description}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Required Files (one per line) *</label>
              <textarea
                rows={5}
                placeholder={
                  "Vision Statement Document\nMission Document\nApproval Minutes"
                }
                value={cForm.requiredFiles}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, requiredFiles: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Evaluation Guidelines</label>
              <textarea
                rows={2}
                placeholder="Key guidelines for evaluation..."
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
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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
                <label style={labelStyle}>Weight (1-10)</label>
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
                rows={2}
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
                rows={5}
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
              <label style={labelStyle}>Guidelines</label>
              <textarea
                rows={2}
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
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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
              <input
                placeholder="Brief description of this benchmark document"
                value={dForm.description}
                onChange={(e) =>
                  setDForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>
                Document Content (paste text content of the BAC-approved
                document) *
              </label>
              <textarea
                rows={8}
                placeholder="Paste the full text content of the benchmark document here. This will be used by the AI for comparative scoring..."
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
                disabled={loading || !dForm.name || !dForm.content}
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
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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
              <input
                value={showEditDemo.description}
                onChange={(e) =>
                  setShowEditDemo((p) =>
                    p ? { ...p, description: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Content</label>
              <textarea
                rows={8}
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
                disabled={loading}
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

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(0,106,78,0.18)",
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 className="font-display" style={{ fontSize: "22px" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "24px",
              fontFamily: "Plus Jakarta Sans",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
