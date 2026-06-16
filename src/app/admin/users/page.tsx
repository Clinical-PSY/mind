"use client";

import { useEffect, useState, useCallback } from "react";

interface User {
  username: string; name: string; email: string;
  phone: string; gender: string; role: string; created_at: string;
}

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  admin:      { label: "관리자",  color: "#fff",    bg: "linear-gradient(135deg,#ef4444,#dc2626)" },
  subscriber: { label: "구독자",  color: "#fff",    bg: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
  user:       { label: "일반회원", color: "#475569", bg: "#f1f5f9" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const token = () => localStorage.getItem("auth_token") ?? "";

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token()}` } });
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function changeRole(username: string, role: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ username, role }),
    });
    const data = await res.json();
    showToast(res.ok ? data.message : data.error, res.ok ? "success" : "error");
    load();
  }

  async function deleteUser(username: string, name: string) {
    if (!confirm(`"${name}" 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    showToast(res.ok ? data.message : data.error, res.ok ? "success" : "error");
    load();
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.username.includes(search) || u.name.includes(search) || u.email.includes(search);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = { all: users.length, admin: 0, subscriber: 0, user: 0 };
  users.forEach(u => { if (u.role in counts) (counts as Record<string, number>)[u.role]++; });

  const avatarBg = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6"];

  return (
    <div style={{ padding: "36px 40px", minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        .users-wrap { animation: fadeUp .35s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        .stat-pill { display:flex; align-items:center; gap:8px; padding:10px 18px; background:#fff; border-radius:12px; border:1px solid #e2e8f0; cursor:pointer; transition:all .2s; user-select:none; }
        .stat-pill:hover { border-color:#6366f1; }
        .stat-pill.active { background:linear-gradient(135deg,#6366f1,#8b5cf6); border-color:transparent; box-shadow:0 4px 14px rgba(99,102,241,.3); }
        .stat-pill .count { font-size:1rem; font-weight:800; color:#1e293b; }
        .stat-pill.active .count, .stat-pill.active .lbl { color:#fff; }
        .stat-pill .lbl { font-size:.78rem; font-weight:600; color:#64748b; }
        .search-box { position:relative; }
        .search-box input { width:260px; padding:10px 14px 10px 40px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:.88rem; outline:none; background:#fff; color:#1e293b; font-family:inherit; transition:border-color .2s; }
        .search-box input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.1); }
        .search-box .icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:.9rem; pointer-events:none; }
        .user-table { width:100%; border-collapse:separate; border-spacing:0; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 1px 12px rgba(15,23,42,.07); }
        .user-table th { padding:13px 18px; text-align:left; font-size:.72rem; font-weight:700; color:#94a3b8; letter-spacing:.8px; text-transform:uppercase; background:#f8fafc; border-bottom:1px solid #f1f5f9; }
        .user-table td { padding:14px 18px; font-size:.87rem; color:#334155; border-bottom:1px solid #f8fafc; transition:background .15s; }
        .user-table tbody tr:last-child td { border-bottom:none; }
        .user-table tbody tr:hover td { background:#fafbff; }
        .role-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; white-space:nowrap; }
        .role-select { padding:6px 10px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:.82rem; background:#f8fafc; cursor:pointer; font-family:inherit; color:#334155; outline:none; transition:border-color .2s; }
        .role-select:focus { border-color:#6366f1; }
        .del-btn { padding:6px 14px; border:1.5px solid #fecaca; border-radius:8px; background:none; color:#ef4444; font-size:.8rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; }
        .del-btn:hover { background:#fef2f2; border-color:#ef4444; }
        .avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:.85rem; font-weight:800; color:#fff; flex-shrink:0; }
        .toast { position:fixed; bottom:28px; right:28px; padding:13px 20px; border-radius:12px; font-size:.87rem; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,.18); z-index:9999; display:flex; align-items:center; gap:8px; animation:slideIn .3s ease; }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }
        .empty-state { text-align:center; padding:60px 20px; color:#94a3b8; }
        .empty-state .emoji { font-size:2.5rem; display:block; margin-bottom:12px; }
        .shimmer { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:6px; }
        @keyframes shimmer { to { background-position:-200% 0; } }
      `}</style>

      <div className="users-wrap">
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>회원 관리</h1>
            <p style={{ color: "#64748b", fontSize: ".88rem", margin: 0 }}>가입된 모든 회원을 조회하고 관리합니다.</p>
          </div>
          <button onClick={load} style={{
            padding: "10px 18px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none", borderRadius: 12, color: "#fff", fontSize: ".85rem",
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 12px rgba(99,102,241,.35)", transition: "opacity .2s",
          }}>↻ 새로고침</button>
        </div>

        {/* 필터 탭 */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "전체", count: counts.all },
            { key: "user", label: "일반회원", count: counts.user },
            { key: "subscriber", label: "구독자", count: counts.subscriber },
            { key: "admin", label: "관리자", count: counts.admin },
          ].map(f => (
            <div key={f.key} className={`stat-pill${roleFilter === f.key ? " active" : ""}`} onClick={() => setRoleFilter(f.key)}>
              <span className="count">{f.count}</span>
              <span className="lbl">{f.label}</span>
            </div>
          ))}
          <div className="search-box" style={{ marginLeft: "auto" }}>
            <span className="icon">🔍</span>
            <input
              placeholder="이름 · 아이디 · 이메일"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 1px 12px rgba(15,23,42,.07)" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: i < 4 ? "1px solid #f8fafc" : "none" }}>
                <div className="shimmer" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", gap: 12 }}>
                  <div className="shimmer" style={{ width: 80, height: 14 }} />
                  <div className="shimmer" style={{ width: 120, height: 14 }} />
                  <div className="shimmer" style={{ width: 160, height: 14 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>회원</th><th>이메일</th><th>연락처</th>
                <th>성별</th><th>역할</th><th>가입일</th><th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <span className="emoji">👤</span>
                    검색 결과가 없습니다.
                  </div>
                </td></tr>
              ) : filtered.map((u, i) => {
                const rm = ROLE_META[u.role] ?? ROLE_META.user;
                return (
                  <tr key={u.username}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar" style={{ background: avatarBg[i % avatarBg.length] }}>
                          {(u.name || u.username).charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#1e293b", fontSize: ".88rem" }}>{u.name}</div>
                          <div style={{ color: "#94a3b8", fontSize: ".75rem" }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#64748b" }}>{u.email}</td>
                    <td style={{ color: "#64748b" }}>{u.phone}</td>
                    <td>{u.gender === "male" ? "남성" : u.gender === "female" ? "여성" : u.gender}</td>
                    <td>
                      <span className="role-badge" style={{ background: rm.bg, color: rm.color }}>
                        {rm.label}
                      </span>
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: ".82rem" }}>{u.created_at?.slice(0, 10)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <select className="role-select" value={u.role} onChange={e => changeRole(u.username, e.target.value)}>
                          <option value="user">일반회원</option>
                          <option value="subscriber">구독자</option>
                          <option value="admin">관리자</option>
                        </select>
                        <button className="del-btn" onClick={() => deleteUser(u.username, u.name)}>삭제</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div className="toast" style={{ background: toast.type === "success" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)" }}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          <span style={{ color: "#fff" }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
