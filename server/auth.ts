import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import path from 'node:path';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  try {
    const keyBuf = Buffer.from(keyHex, 'hex');
    const derivedBuf = scryptSync(password, salt, 64);
    if (keyBuf.length !== derivedBuf.length) return false;
    return timingSafeEqual(keyBuf, derivedBuf);
  } catch {
    return false;
  }
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};

export function resolveSafeExtension(originalName: string, mimeType: string): string {
  const byMime = MIME_TO_EXT[mimeType.toLowerCase()];
  if (byMime) return byMime;
  const rawExt = path.extname(originalName).toLowerCase().replace('.', '');
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'].includes(rawExt)) {
    return rawExt === 'jpeg' ? 'jpg' : rawExt;
  }
  return 'bin';
}
