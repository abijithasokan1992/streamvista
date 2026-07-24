"use strict";
/**
 * Instagram Integration Backend Security Module
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 *
 * Cryptographic helpers for PKCE, OAuth state validation,
 * AES-256-GCM token encryption at rest, and workspace scoping.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptToken = encryptToken;
exports.decryptToken = decryptToken;
exports.generateOAuthState = generateOAuthState;
exports.validateOAuthState = validateOAuthState;
exports.generatePKCE = generatePKCE;
const crypto = __importStar(require("crypto"));
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16;
/**
 * Derives 32-byte encryption key from environment secret or secure fallback
 */
function getEncryptionKey() {
    const secret = process.env.TOKEN_ENCRYPTION_SECRET || 'streamvista_crayons_bridge_secret_32bytes_key!';
    return crypto.createHash('sha256').update(secret).digest();
}
/**
 * Encrypts sensitive string (e.g. access token) using AES-256-GCM
 */
function encryptToken(token) {
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
function decryptToken(encryptedPayload) {
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
function generateOAuthState(workspaceId) {
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
function validateOAuthState(state, expectedWorkspaceId) {
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
    }
    catch {
        return false;
    }
}
/**
 * PKCE Pair Generator
 */
function generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return { codeVerifier, codeChallenge };
}
//# sourceMappingURL=security.js.map