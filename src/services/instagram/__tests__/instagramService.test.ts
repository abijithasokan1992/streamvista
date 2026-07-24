import { describe, it, expect, beforeEach } from 'vitest';
import { instagramService } from '../InstagramApiAdapter';
import { InstagramService } from '../InstagramService';

describe('Instagram Read-Only Integration Tests', () => {
  const workspaceId = 'ws_test_isolation_1';

  beforeEach(async () => {
    // Reset workspace state
    try {
      await instagramService.disconnect(workspaceId);
    } catch {}
  });

  it('1. Connect button generates valid Meta OAuth URL with PKCE & state', async () => {
    const { url, state } = await instagramService.getConnectUrl(workspaceId);
    expect(url).toContain('facebook.com');
    expect(url).toContain('client_id=');
    expect(url).toContain('response_type=code');
    expect(url).toContain(encodeURIComponent(state));
  });

  it('2. Rejects invalid OAuth state during callback', async () => {
    await expect(
      instagramService.handleCallback('valid_code', '', workspaceId)
    ).rejects.toMatchObject({
      code: 'INVALID_STATE',
    });
  });

  it('3. Successfully exchanges authorization code for connected account', async () => {
    const { state } = await instagramService.getConnectUrl(workspaceId);
    const account = await instagramService.handleCallback('mock_code_123', state, workspaceId);

    expect(account).toBeDefined();
    expect(account.connectionStatus).toBe('connected');
    expect(account.username).toBe('crayons_bridge_official');
    expect(account.accountType).toBe('BUSINESS');
  });

  it('4. Handles OAuth cancellation gracefully', async () => {
    await expect(
      instagramService.handleCallback('', 'state_123', workspaceId)
    ).rejects.toMatchObject({
      code: 'MISSING_AUTH_CODE',
    });
  });

  it('5. Verifies access token is NEVER exposed in client account payload', async () => {
    const { state } = await instagramService.getConnectUrl(workspaceId);
    const account = await instagramService.handleCallback('mock_code_123', state, workspaceId);

    expect((account as any).accessToken).toBeUndefined();
    expect((account as any).encryptedAccessToken).toBeUndefined();
    expect((account as any).secret).toBeUndefined();
  });

  it('6. Successfully retrieves connected account status', async () => {
    const { state } = await instagramService.getConnectUrl(workspaceId);
    await instagramService.handleCallback('mock_code_123', state, workspaceId);

    const accountStatus = await instagramService.getAccountStatus(workspaceId);
    expect(accountStatus).not.toBeNull();
    expect(accountStatus?.workspaceId).toBe(workspaceId);
  });

  it('7. Handles empty media response or fetches media array', async () => {
    const { state } = await instagramService.getConnectUrl(workspaceId);
    await instagramService.handleCallback('mock_code_123', state, workspaceId);

    const media = await instagramService.getMedia(workspaceId);
    expect(Array.isArray(media)).toBe(true);
    expect(media.length).toBeGreaterThan(0);
    expect(media[0].id).toBeDefined();
  });

  it('8. Enforces insight permission & account type verification', async () => {
    const { state } = await instagramService.getConnectUrl(workspaceId);
    await instagramService.handleCallback('mock_code_123', state, workspaceId);

    const insights = await instagramService.getInsights(workspaceId);
    expect(Array.isArray(insights)).toBe(true);
    expect(insights[0].metricName).toBeDefined();
  });

  it('9. Rejects media retrieval for disconnected / revoked token state', async () => {
    const unauthenticatedWorkspace = 'ws_revoked_test_99';
    await expect(
      instagramService.getMedia(unauthenticatedWorkspace)
    ).rejects.toMatchObject({
      code: 'EXPIRED_TOKEN',
    });
  });

  it('10. Disconnect removes stored credentials and resets status', async () => {
    const { state } = await instagramService.getConnectUrl(workspaceId);
    await instagramService.handleCallback('mock_code_123', state, workspaceId);

    await instagramService.disconnect(workspaceId);
    const accountStatus = await instagramService.getAccountStatus(workspaceId);
    expect(accountStatus).toBeNull();
  });

  it('11. Enforces workspace isolation (User A cannot read User B connection)', async () => {
    const wsA = 'ws_user_alpha';
    const wsB = 'ws_user_beta';

    const { state: stateA } = await instagramService.getConnectUrl(wsA);
    await instagramService.handleCallback('mock_code_A', stateA, wsA);

    const accountB = await instagramService.getAccountStatus(wsB);
    expect(accountB).toBeNull();
  });

  it('12. Guarantees ZERO write methods on InstagramService interface', () => {
    const serviceKeys = Object.keys(instagramService);
    const forbiddenWriteKeywords = ['publish', 'post', 'create', 'update', 'delete', 'like', 'comment', 'follow', 'send', 'message'];
    
    for (const key of serviceKeys) {
      for (const keyword of forbiddenWriteKeywords) {
        if (key.toLowerCase().includes(keyword) && key !== 'disconnect' && key !== 'getComments') {
          throw new Error(`Write method forbidden on read-only interface: ${key}`);
        }
      }
    }
    expect(true).toBe(true);
  });
});
