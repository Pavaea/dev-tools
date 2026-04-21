export const CORRECT_HASH = "2303fa2edf99b3b59185e110726c921675156a924ed0dd82f2d903dba45f433c";

export async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function decryptBin(arrayBuffer, password) {
  const bytes = new Uint8Array(arrayBuffer);
  let off = 0;
  const nameLen = new DataView(arrayBuffer).getUint16(0, false); off += 2;
  const origName = new TextDecoder().decode(bytes.slice(off, off + nameLen)); off += nameLen;
  const salt = bytes.slice(off, off + 16); off += 16;
  const iv   = bytes.slice(off, off + 12); off += 12;
  const enc  = bytes.slice(off);

  const keyMat = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMat, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, enc);
  return { decrypted, origName };
}
