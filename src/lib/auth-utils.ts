import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

// ── 비밀번호 해싱 (SHA-256 + salt, 원본 server.py 방식과 동일) ──
export function hashPassword(password: string, salt?: string) {
  const s = salt ?? crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(s + password).digest('hex');
  return { hash, salt: s };
}

export function verifyPassword(password: string, storedHash: string, salt: string) {
  return hashPassword(password, salt).hash === storedHash;
}

// ── JWT ──
function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { username: string; role: string; name: string };
}

export async function getUserFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    return await verifyToken(auth.slice(7));
  } catch {
    return null;
  }
}
