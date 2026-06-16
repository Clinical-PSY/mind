"use client";

import { useEffect, useState, useCallback } from "react";

interface Appointment {
  id: string; name: string; phone: string; email: string;
  service_type: string; message: string; status: string;
  username: string | null; memo: string | null; created_at: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: "대기중", color: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
  confirmed: { label: "확정",   color: "#1e40af", bg: "#dbeafe", dot: "#3b82f6" },
  completed: { label: "완료",   color: "#065f46", bg: "#d1fae5", dot: "#10b981" },
  cancelled: { label: "취소",   color: "#991b1b", bg: "#fee2e2", dot: "#ef4444" },
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [memo, setMemo] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [savingMemo, setSavingMemo] = useState(false);

  const token = () => localStorage.getItem("auth_token") ?? "";

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/appointments?status=${filter}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    setAppointments(data.appointments ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ id, status }),
    });
    showToast("상태가 변경되었습니다.", "success");
    load();
    if (detail?.id === id) setDetail(prev => prev ? { ...prev, status } : null);
  }

  async function saveMemoFn(id: string) {
    setSavingMemo(true);
    await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ id, memo }),
    });
    setSavingMemo(false);
    showToast("메모가 저장되었습니다.", "success");
    load();
  }

  async function deleteAppt(id: string) {
    if (!confirm("이 예약을 삭제하시겠습니까?")) return;
    await fetch("/api/admin/appointments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ id }),
    });
    showToast("삭제되었습니다.", "success");
    setDetail(null);
    load();
  }

  function openDetail(a: Appointment) { setDetail(a); setMemo(a.memo ?? ""); }
  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const allAppointments = appointments;
  const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  allAppointments.forEach(a => { if (a.status in counts) (counts as Record<string, number>)[a.status]++; });

  return (
    <div style={{ padding: "36px 40px", minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        .appt-wrap { animation: fadeUp .35s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        .kpi-card { background:#fff; border-radius:16px; padding:20px 24px; border:1px solid #f1f5f9; box-shadow:0 1px 8px rgba(15,23,42,.06); transition:transform .2s,box-shadow .2s; cursor:pointer; }
        .kpi-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(15,23,42,.1); }
        .kpi-card.active { border-color:transparent; }
        .kpi-num { font-size:2rem; font-weight:900; line-height:1; margin-bottom:4px; }
        .kpi-lbl { font-size:.78rem; font-weight:600; color:#64748b; }
        .filter-bar { display:flex; gap:8px; background:#fff; padding:6px; border-radius:14px; border:1px solid #f1f5f9; width:fit-content; margin-bottom:20px; }
        .filter-tab { padding:7px 18px; border-radius:10px; border:none; background:none; font-size:.83rem; font-weight:600; color:#94a3b8; cursor:pointer; transition:all .2s; font-family:inherit; }
        .filter-tab.active { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 3px 10px rgba(99,102,241,.3); }
        .appt-table { width:100%; border-collapse:separate; border-spacing:0; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 1px 12px rgba(15,23,42,.07); }
        .appt-table th { padding:13px 18px; text-align:left; font-size:.72rem; font-weight:700; color:#94a3b8; letter-spacing:.8px; text-transform:uppercase; background:#f8fafc; border-bottom:1px solid #f1f5f9; }
        .appt-table td { padding:15px 18px; font-size:.87rem; color:#334155; border-bottom:1px solid #f8fafc; transition:background .15s; }
        .appt-table tbody tr:last-child td { border-bottom:none; }
        .appt-table tbody tr:hover td { background:#fafbff; cursor:pointer; }
        .status-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:.75rem; font-weight:700; }
        .status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .status-select { padding:6px 10px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:.82rem; background:#f8fafc; cursor:pointer; font-family:inherit; outline:none; transition:border-color .2s; color:#334155; }
        .status-select:focus { border-color:#6366f1; }
        .modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.6); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; animation:fadeIn .2s ease; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .modal-box { background:#fff; border-radius:20px; width:520px; max-width:95vw; max-height:88vh; overflow-y:auto; animation:slideUp .25s ease; box-shadow:0 24px 64px rgba(15,23,42,.25); }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        .modal-header { padding:24px 28px 20px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; }
        .modal-body { padding:24px 28px; }
        .info-row { display:flex; gap:14px; padding:10px 0; border-bottom:1px solid #f8fafc; }
        .info-row:last-of-type { border-bottom:none; }
        .info-row .lbl { font-size:.75rem; font-weight:700; color:#94a3b8; width:76px; flex-shrink:0; padding-top:1px; text-transform:uppercase; letter-spacing:.4px; }
        .info-row .val { font-size:.88rem; color:#334155; flex:1; line-height:1.6; }
        .memo-area { width:100%; padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:.87rem; font-family:inherit; resize:vertical; outline:none; color:#334155; transition:border-color .2s; min-height:80px; }
        .memo-area:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.1); }
        .modal-btn { padding:10px 20px; border-radius:10px; border:none; font-size:.85rem; font-weight:700; cursor:pointer; font-family:inherit; transition:all .2s; }
        .close-btn { width:32px; height:32px; border-radius:8px; border:none; background:#f1f5f9; color:#64748b; font-size:1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
        .close-btn:hover { background:#e2e8f0; }
        .toast { position:fixed; bottom:28px; right:28px; padding:13px 20px; border-radius:12px; font-size:.87rem; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,.18); z-index:9999; display:flex; align-items:center; gap:8px; animation:slideIn .3s ease; }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }
        .shimmer { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:6px; }
        @keyframes shimmer { to { background-position:-200% 0; } }
        .empty-state { text-align:center; padding:60px 20px; color:#94a3b8; }
      `}</style>

      <div className="appt-wrap">
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>예약 관리</h1>
            <p style={{ color: "#64748b", fontSize: ".88rem", margin: 0 }}>상담 신청 내역을 확인하고 상태를 관리합니다.</p>
          </div>
          <button onClick={load} style={{
            padding: "10px 18px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none", borderRadius: 12, color: "#fff", fontSize: ".85rem",
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 12px rgba(99,102,241,.35)",
          }}>↻ 새로고침</button>
        </div>

        {/* KPI 카드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { key: "pending",   label: "대기중", num: counts.pending,   grad: "linear-gradient(135deg,#fef3c7,#fde68a)", color: "#b45309" },
            { key: "confirmed", label: "확정",   num: counts.confirmed, grad: "linear-gradient(135deg,#dbeafe,#bfdbfe)", color: "#1d4ed8" },
            { key: "completed", label: "완료",   num: counts.completed, grad: "linear-gradient(135deg,#d1fae5,#a7f3d0)", color: "#065f46" },
            { key: "cancelled", label: "취소",   num: counts.cancelled, grad: "linear-gradient(135deg,#fee2e2,#fecaca)", color: "#b91c1c" },
          ].map(k => (
            <div key={k.key} className={`kpi-card${filter === k.key ? " active" : ""}`}
              style={filter === k.key ? { background: k.grad, borderColor: "transparent" } : {}}
              onClick={() => setFilter(filter === k.key ? "all" : k.key)}
            >
              <div className="kpi-num" style={{ color: k.color }}>{k.num}</div>
              <div className="kpi-lbl">{k.label}</div>
            </div>
          ))}
        </div>

        {/* 필터 탭 */}
        <div className="filter-bar">
          {[
            { key: "all", label: `전체 ${appointments.length}` },
            { key: "pending", label: "대기중" },
            { key: "confirmed", label: "확정" },
            { key: "completed", label: "완료" },
            { key: "cancelled", label: "취소" },
          ].map(f => (
            <button key={f.key} className={`filter-tab${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* 테이블 */}
        {loading ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 1px 12px rgba(15,23,42,.07)" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "15px 0", borderBottom: i < 4 ? "1px solid #f8fafc" : "none" }}>
                <div className="shimmer" style={{ width: 100, height: 14 }} />
                <div className="shimmer" style={{ width: 110, height: 14 }} />
                <div className="shimmer" style={{ width: 140, height: 14 }} />
                <div className="shimmer" style={{ width: 70, height: 22, borderRadius: 20 }} />
              </div>
            ))}
          </div>
        ) : (
          <table className="appt-table">
            <thead>
              <tr>
                <th>신청자</th><th>연락처</th><th>상담 유형</th>
                <th>상태</th><th>신청일</th><th>회원</th><th>상태 변경</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
                    예약 내역이 없습니다.
                  </div>
                </td></tr>
              ) : appointments.map(a => {
                const sm = STATUS_META[a.status] ?? STATUS_META.pending;
                return (
                  <tr key={a.id} onClick={() => openDetail(a)}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>{a.name}</div>
                      <div style={{ fontSize: ".75rem", color: "#94a3b8" }}>{a.email || "이메일 없음"}</div>
                    </td>
                    <td style={{ color: "#64748b" }}>{a.phone}</td>
                    <td>
                      <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: 8, fontSize: ".8rem", fontWeight: 600 }}>
                        {a.service_type}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: sm.bg, color: sm.color }}>
                        <span className="status-dot" style={{ background: sm.dot }} />
                        {sm.label}
                      </span>
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: ".82rem" }}>{a.created_at?.slice(0, 10)}</td>
                    <td>
                      {a.username
                        ? <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "3px 8px", borderRadius: 6, fontSize: ".75rem", fontWeight: 700 }}>@{a.username}</span>
                        : <span style={{ color: "#cbd5e1", fontSize: ".78rem" }}>비회원</span>
                      }
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select className="status-select" value={a.status} onChange={e => updateStatus(a.id, e.target.value)}>
                        <option value="pending">대기중</option>
                        <option value="confirmed">확정</option>
                        <option value="completed">완료</option>
                        <option value="cancelled">취소</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 상세 모달 */}
      {detail && (() => {
        const sm = STATUS_META[detail.status] ?? STATUS_META.pending;
        return (
          <div className="modal-overlay" onClick={() => setDetail(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>예약 상세</h3>
                  <span className="status-pill" style={{ background: sm.bg, color: sm.color }}>
                    <span className="status-dot" style={{ background: sm.dot }} />
                    {sm.label}
                  </span>
                </div>
                <button className="close-btn" onClick={() => setDetail(null)}>✕</button>
              </div>

              <div className="modal-body">
                {[
                  { lbl: "신청자", val: detail.name },
                  { lbl: "연락처", val: detail.phone },
                  { lbl: "이메일", val: detail.email || "—" },
                  { lbl: "회원 ID", val: detail.username || "비회원" },
                  { lbl: "상담 유형", val: detail.service_type },
                  { lbl: "신청 내용", val: detail.message || "—" },
                  { lbl: "신청일시", val: detail.created_at?.slice(0, 16).replace("T", " ") },
                ].map(r => (
                  <div key={r.lbl} className="info-row">
                    <span className="lbl">{r.lbl}</span>
                    <span className="val">{r.val}</span>
                  </div>
                ))}

                {/* 상태 변경 */}
                <div style={{ marginTop: 20, marginBottom: 16 }}>
                  <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".4px" }}>상태 변경</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["pending", "confirmed", "completed", "cancelled"].map(s => {
                      const m = STATUS_META[s];
                      return (
                        <button key={s} onClick={() => updateStatus(detail.id, s)} style={{
                          padding: "7px 14px", borderRadius: 9, border: "1.5px solid",
                          borderColor: detail.status === s ? m.dot : "#e2e8f0",
                          background: detail.status === s ? m.bg : "#fff",
                          color: detail.status === s ? m.color : "#94a3b8",
                          fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                          transition: "all .15s",
                        }}>{m.label}</button>
                      );
                    })}
                  </div>
                </div>

                {/* 메모 */}
                <div>
                  <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".4px" }}>관리자 메모</label>
                  <textarea className="memo-area" value={memo} onChange={e => setMemo(e.target.value)} placeholder="내부 메모를 작성하세요..." />
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="modal-btn" onClick={() => saveMemoFn(detail.id)} disabled={savingMemo}
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", flex: 1, boxShadow: "0 4px 12px rgba(99,102,241,.3)", opacity: savingMemo ? .7 : 1 }}>
                    {savingMemo ? "저장 중..." : "메모 저장"}
                  </button>
                  <button className="modal-btn" onClick={() => deleteAppt(detail.id)}
                    style={{ background: "#fef2f2", color: "#ef4444", border: "1.5px solid #fecaca" }}>
                    삭제
                  </button>
                  <button className="modal-btn" onClick={() => setDetail(null)}
                    style={{ background: "#f1f5f9", color: "#64748b" }}>
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {toast && (
        <div className="toast" style={{ background: toast.type === "success" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)" }}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          <span style={{ color: "#fff" }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
