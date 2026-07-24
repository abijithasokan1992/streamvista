/**
 * Instagram Integration Backend Security Module
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 * 
 * Cryptographic helpers for PKCE, OAuth state validation,
 * AES-256-GCM token encryption at rest, and workspace scoping.
 */

import * as crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Derives 32-byte encryption key from environment secret or secure fallback
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET || 'streamvista_crayons_bridge_secret_32bytes_key!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive string (e.g. access token) using AES-256-GCM
 */
export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts sensitive string using AES-256-GCM
 */
export function decryptToken(encryptedPayload: string): string {
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();
  
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generates cryptographically secure OAuth state parameter
 */
export function generateOAuthState(workspaceId: string): string {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const timestamp = Date.now().toString();
  const data = `${workspaceId}:${timestamp}:${randomBytes}`;
  const signature = crypto.createHmac('sha256', getEncryptionKey()).update(data).digest('hex');
  const statePayload = Buffer.from(JSON.stringify({ workspaceId, timestamp, randomBytes, signature })).toString('base64url');
  return statePayload;
}

/**
 * Validates OAuth state parameter and verifies workspace binding
 */
export function validateOAuthState(state: string, expectedWorkspaceId: string): boolean {
  try {
    const decodedStr = Buffer.from(state, 'base64url').toString('utf8');
    const { workspaceId, timestamp, randomBytes, signature } = JSON.parse(decodedStr);
    
    if (workspaceId !== expectedWorkspaceId) {
      return false;
    }

    // Check expiration (state valid for 15 minutes)
    const stateAgeMs = Date.now() - parseInt(timestamp, 10);
    if (isNaN(stateAgeMs) || stateAgeMs > 15 * 60 * 1000) {
      return false;
    }

    const data = `${workspaceId}:${timestamp}:${randomBytes}`;
    const expectedSignature = crypto.createHmac('sha256', getEncryptionKey()).update(data).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * PKCE Pair Generator
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}
