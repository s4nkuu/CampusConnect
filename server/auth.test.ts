import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSessionToken,
  hashPassword,
  resolveSafeExtension,
  verifyPassword,
} from './auth.ts';

test('hashPassword and verifyPassword verify matching passwords and reject wrong ones', () => {
  const hash = hashPassword('campus123');
  assert.ok(hash.includes(':'));
  assert.equal(verifyPassword('campus123', hash), true);
  assert.equal(verifyPassword('wrongpass', hash), false);
  assert.equal(verifyPassword('campus123', 'malformed'), false);
});

test('generateSessionToken produces unique 64-char hex tokens', () => {
  const t1 = generateSessionToken();
  const t2 = generateSessionToken();
  assert.equal(t1.length, 64);
  assert.notEqual(t1, t2);
});

test('resolveSafeExtension preserves image and PDF extensions safely', () => {
  assert.equal(resolveSafeExtension('laptop.jpeg', 'image/jpeg'), 'jpg');
  assert.equal(resolveSafeExtension('idcard.PNG', 'image/png'), 'png');
  assert.equal(resolveSafeExtension('badge.webp', 'image/webp'), 'webp');
  assert.equal(resolveSafeExtension('notes.pdf', 'application/pdf'), 'pdf');
});
