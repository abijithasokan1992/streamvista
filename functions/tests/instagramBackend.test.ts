import { encryptToken, decryptToken, generateOAuthState, validateOAuthState, generatePKCE } from '../src/instagram/security';
import { InstagramController } from '../src/instagram/instagramController';

describe('Instagram Backend Security & Controller Tests', () => {
  const testWorkspace = 'ws_backend_test_01';

  it('Encrypts and decrypts access tokens securely using AES-256-GCM', () => {
    const rawToken = 'IGQVJ_LONG_LIVED_SECRET_TOKEN_987654321';
    const encrypted = encryptToken(rawToken);

    expect(encrypted).not.toBe(rawToken);
    expect(encrypted.split(':').length).toBe(3); // IV:AuthTag:Ciphertext

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(rawToken);
  });

  it('Generates and validates OAuth state tokens with workspace binding', () => {
    const state = generateOAuthState(testWorkspace);
    expect(validateOAuthState(state, testWorkspace)).toBe(true);
    expect(validateOAuthState(state, 'ws_malicious_other_workspace')).toBe(false);
  });

  it('Generates valid PKCE S256 verifier and challenge', () => {
    const { codeVerifier, codeChallenge } = generatePKCE();
    expect(codeVerifier.length).toBeGreaterThan(20);
    expect(codeChallenge.length).toBeGreaterThan(20);
    expect(codeVerifier).not.toBe(codeChallenge);
  });

  it('Backend handleConnect returns valid auth URL', async () => {
    const result = await InstagramController.handleConnect(testWorkspace);
    expect(result.url).toContain('dialog/oauth');
    expect(result.state).toBeDefined();
  });

  it('Backend handleCallback validates state and securely stores token', async () => {
    const { state } = await InstagramController.handleConnect(testWorkspace);
    const account = await InstagramController.handleCallback('valid_code', state, testWorkspace);

    expect(account.workspaceId).toBe(testWorkspace);
    expect(account.connectionStatus).toBe('connected');
    expect((account as any).encryptedAccessToken).toBeUndefined();
  });

  it('Backend handleDisconnect purges stored records', async () => {
    await InstagramController.handleDisconnect(testWorkspace);
    const account = await InstagramController.handleGetAccount(testWorkspace);
    expect(account).toBeNull();
  });
});
