"use client";

import { useEffect, useState, useCallback } from "react";

interface Appointment {
  id: string; name: string; phone: string; email: string;
  service_type: string; message: string; status: string;
  username: string | null; memo: string | null; created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "대기중", confirmed: "확정", completed: "완료", cancelled: "취소",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#2563a8", completed: "#16a34a", cancelled: "#dc2626",
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [memo, setMemo] = useState("");
  const [toast, setToast] = useState("");

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
    showToast("상태가 변경되었습니다.");
    load();
    if (detail?.id === id) setDetail(prev => prev ? { ...prev, status } : null);
  }

  async function saveMemo(id: string) {
    await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ id, memo }),
    });
    showToast("메모가 저장되었습니다.");
    load();
  }

  async function deleteAppt(id: string) {
    if (!confirm("이 예약을 삭제하시겠습니까?")) return;
    await fetch("/api/admin/appointments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ id }),
    });
    showToast("삭제되었습니다.");
    setDetail(null);
    load();
  }

  function openDetail(a: Appointment) { setDetail(a); setMemo(a.memo ?? ""); }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const counts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1; return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ padding: "32px 36px" }}>
      <style>{`
        .appt-table { width:100%; border-collapse:collapse; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 1px 8px rgba(0,0,0,.07); }
        .appt-table th { background:#f8fafc; padding:12px 16px; text-align:left; font-size:.76rem; font-weight:700; color:#64748b; letter-spacing:.5px; text-transform:uppercase; border-bottom:1px solid #e2e8f0; }
        .appt-table td { padding:13px 16px; font-size:.87rem; color:#1e293b; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
        .appt-table tr:last-child td { border-bottom:none; }
        .appt-table tr:hover td { background:#f8fafc; cursor:pointer; }
        .status-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; color:#fff; }
        .filter-btn { padding:7px 16px; border-radius:8px; border:1.5px solid #e2e8f0; background:#fff; font-size:.83rem; font-weight:600; cursor:pointer; transition:all .15s; font-family:inherit; }
        .filter-btn.active { background:#1a2f5e; color:#fff; border-color:#1a2f5e; }
        .stat-card { background:#fff; border-radius:12px; padding:16px 20px; border:1px solid #e2e8f0; min-width:100px; }
        .stat-card .num { font-size:1.6rem; font-weight:800; color:#1a2f5e; }
        .stat-card .lbl { font-size:.74rem; color:#94a3b8; font-weight:600; }
        .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:1000; display:flex; align-items:center; justify-content:center; }
        .modal { background:#fff; border-radius:18px; padding:32px; width:500px; max-width:95vw; max-height:90vh; overflow-y:auto; }
        .modal h3 { font-size:1.15rem; font-weight:800; color:#1a2f5e; margin:0 0 20px; }
        .info-row { display:flex; gap:12px; padding:9px 0; border-bottom:1px solid #f1f5f9; font-size:.87rem; }
        .info-row .lbl { color:#94a3b8; font-weight:600; width:80px; flex-shrink:0; }
        .modal-btn { padding:9px 20px; border-radius:8px; border:none; font-size:.85rem; font-weight:700; cursor:pointer; font-family:inherit; }
        .toast-admin { position:fixed; bottom:28px; right:28px; background:#1a2f5e; color:#fff; padding:12px 20px; border-radius:10px; font-size:.88rem; font-weight:600; box-shadow:0 4px 16px rgba(0,0,0,.18); opacity:0; transition:opacity .3s; pointer-events:none; z-index:2000; }
        .toast-admin.show { opacity:1; }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a2f5e", margin: "0 0 4px" }}>예약 관리</h1>
        <p style={{ color: "#64748b", fontSize: ".85rem", margin: 0 }}>상담 신청 내역을 확인하고 상태를 관리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { key: "all", label: "전체", count: appointments.length, color: "#1a2f5e" },
          { key: "pending", label: "대기중", count: counts.pending ?? 0, color: "#f59e0b" },
          { key: "confirmed", label: "확정", count: counts.confirmed ?? 0, color: "#2563a8" },
          { key: "completed", label: "완료", count: counts.completed ?? 0, color: "#16a34a" },
          { key: "cancelled", label: "취소", count: counts.cancelled ?? 0, color: "#dc2626" },
        ].map(s => (
          <div key={s.key} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="num" style={{ color: s.color }}>{s.count}</div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 필터 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "pending", "confirmed", "completed", "cancelled"].map(s => (
          <button key={s} className={`filter-btn${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>
            {s === "all" ? "전체" : STATUS_LABEL[s]}
          </button>
        ))}
        <button style={{ marginLeft: "auto" }} className="filter-btn" onClick={load}>↻ 새로고침</button>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: "60px 0" }}>불러오는 중...</p>
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
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>예약 내역이 없습니다.</td></tr>
            ) : appointments.map(a => (
              <tr key={a.id} onClick={() => openDetail(a)}>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td style={{ color: "#475569" }}>{a.phone}</td>
                <td>{a.service_type}</td>
                <td>
                  <span className="status-badge" style={{ background: STATUS_COLOR[a.status] ?? "#6b7280" }}>
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                </td>
                <td style={{ color: "#94a3b8" }}>{a.created_at?.slice(0, 10)}</td>
                <td style={{ color: a.username ? "#2563a8" : "#94a3b8", fontSize: ".8rem" }}>
                  {a.username ?? "비회원"}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <select
                    value={a.status}
                    onChange={e => updateStatus(a.id, e.target.value)}
                    style={{ padding: "4px 8px", border: "1.5px solid #e2e8f0", borderRadius: 6, fontSize: ".82rem", background: "#f8fafc", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <option value="pending">대기중</option>
                    <option value="confirmed">확정</option>
                    <option value="completed">완료</option>
                    <option value="cancelled">취소</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 상세 모달 */}
      {detail && (
        <div className="modal-bg" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>예약 상세</h3>
            {[
              { lbl: "신청자", val: detail.name },
              { lbl: "연락처", val: detail.phone },
              { lbl: "이메일", val: detail.email || "—" },
              { lbl: "회원ID", val: detail.username || "비회원" },
              { lbl: "상담 유형", val: detail.service_type },
              { lbl: "신청 내용", val: detail.message || "—" },
              { lbl: "신청일", val: detail.created_at?.slice(0, 16).replace("T", " ") },
            ].map(r => (
              <div key={r.lbl} className="info-row">
                <span className="lbl">{r.lbl}</span>
                <span style={{ flex: 1, whiteSpace: "pre-wrap" }}>{r.val}</span>
              </div>
            ))}

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: ".82rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>관리자 메모</label>
              <textarea
                value={memo} onChange={e => setMemo(e.target.value)}
                rows={3} placeholder="내부 메모 작성..."
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: ".87rem", fontFamily: "inherit", resize: "vertical", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <select
                value={detail.status}
                onChange={e => updateStatus(detail.id, e.target.value)}
                style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: ".85rem", fontFamily: "inherit", flex: 1 }}
              >
                <option value="pending">대기중</option>
                <option value="confirmed">확정</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
              <button className="modal-btn" onClick={() => saveMemo(detail.id)} style={{ background: "#1a2f5e", color: "#fff" }}>메모 저장</button>
              <button className="modal-btn" onClick={() => deleteAppt(detail.id)} style={{ background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fca5a5" }}>삭제</button>
              <button className="modal-btn" onClick={() => setDetail(null)} style={{ background: "#f1f5f9", color: "#475569" }}>닫기</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast-admin${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
