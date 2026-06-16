"use client";

import { useEffect, useState, useCallback } from "react";

interface User {
  username: string; name: string; email: string;
  phone: string; gender: string; role: string; created_at: string;
}

const ROLE_LABEL: Record<string, string> = { admin: "관리자", subscriber: "구독자", user: "일반" };
const ROLE_COLOR: Record<string, string> = { admin: "#dc2626", subscriber: "#2563a8", user: "#6b7280" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

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
    showToast(data.message ?? data.error);
    load();
  }

  async function deleteUser(username: string) {
    if (!confirm(`${username} 회원을 삭제하시겠습니까?`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    showToast(data.message ?? data.error);
    load();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = users.filter(u =>
    u.username.includes(search) || u.name.includes(search) || u.email.includes(search)
  );

  return (
    <div style={{ padding: "32px 36px" }}>
      <style>{`
        .admin-table { width:100%; border-collapse:collapse; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 1px 8px rgba(0,0,0,.07); }
        .admin-table th { background:#f8fafc; padding:12px 16px; text-align:left; font-size:.76rem; font-weight:700; color:#64748b; letter-spacing:.5px; text-transform:uppercase; border-bottom:1px solid #e2e8f0; }
        .admin-table td { padding:13px 16px; font-size:.87rem; color:#1e293b; border-bottom:1px solid #f1f5f9; }
        .admin-table tr:last-child td { border-bottom:none; }
        .admin-table tr:hover td { background:#f8fafc; }
        .role-badge { display:inline-block; padding:2px 9px; border-radius:20px; font-size:.72rem; font-weight:700; color:#fff; }
        .role-select { padding:4px 8px; border:1.5px solid #e2e8f0; border-radius:6px; font-size:.82rem; background:#f8fafc; cursor:pointer; font-family:inherit; }
        .del-btn { padding:4px 12px; border:1.5px solid #fca5a5; border-radius:6px; background:none; color:#dc2626; font-size:.8rem; cursor:pointer; font-family:inherit; transition:background .15s; }
        .del-btn:hover { background:#fef2f2; }
        .toast-admin { position:fixed; bottom:28px; right:28px; background:#1a2f5e; color:#fff; padding:12px 20px; border-radius:10px; font-size:.88rem; font-weight:600; box-shadow:0 4px 16px rgba(0,0,0,.18); opacity:0; transition:opacity .3s; pointer-events:none; }
        .toast-admin.show { opacity:1; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a2f5e", margin: 0 }}>회원 관리</h1>
          <p style={{ color: "#64748b", fontSize: ".85rem", marginTop: 4 }}>총 {users.length}명</p>
        </div>
        <input
          placeholder="이름·아이디·이메일 검색"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "9px 14px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: ".88rem", width: 240, outline: "none", fontFamily: "inherit" }}
        />
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: "60px 0" }}>불러오는 중...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>아이디</th><th>이름</th><th>이메일</th><th>연락처</th>
              <th>성별</th><th>역할</th><th>가입일</th><th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>회원이 없습니다.</td></tr>
            ) : filtered.map(u => (
              <tr key={u.username}>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td>{u.name}</td>
                <td style={{ color: "#475569" }}>{u.email}</td>
                <td style={{ color: "#475569" }}>{u.phone}</td>
                <td>{u.gender === "male" ? "남" : u.gender === "female" ? "여" : u.gender}</td>
                <td>
                  <span className="role-badge" style={{ background: ROLE_COLOR[u.role] ?? "#6b7280" }}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                </td>
                <td style={{ color: "#94a3b8" }}>{u.created_at?.slice(0, 10)}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      className="role-select"
                      value={u.role}
                      onChange={e => changeRole(u.username, e.target.value)}
                    >
                      <option value="user">일반</option>
                      <option value="subscriber">구독자</option>
                      <option value="admin">관리자</option>
                    </select>
                    <button className="del-btn" onClick={() => deleteUser(u.username)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={`toast-admin${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
