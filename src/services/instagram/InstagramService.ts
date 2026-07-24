/**
 * Read-Only Instagram Service Interface
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 * 
 * STRICT SECURITY REQUIREMENT:
 * This interface contains ONLY read-only operations.
 * Write operations (posting, editing, deleting, liking, commenting, messaging)
 * are explicitly prohibited and omitted.
 */

import {
  ConnectedAccount,
  InstagramMedia,
  InstagramInsight,
  InstagramComment,
} from '../../types/instagram';

export interface InstagramService {
  /**
   * Generates secure OAuth authorization URL with PKCE and state protection
   */
  getConnectUrl(workspaceId: string): Promise<{ url: string; state: string }>;

  /**
   * Handles OAuth callback parameters and exchanges authorization code for encrypted session
   */
  handleCallback(code: string, state: string, workspaceId: string): Promise<ConnectedAccount>;

  /**
   * Retrieves current connection status and profile for workspace
   */
  getAccountStatus(workspaceId: string): Promise<ConnectedAccount | null>;

  /**
   * Retrieves read-only media posts and reels
   */
  getMedia(workspaceId: string, limit?: number): Promise<InstagramMedia[]>;

  /**
   * Retrieves read-only analytics metrics for eligible professional accounts
   */
  getInsights(workspaceId: string): Promise<InstagramInsight[]>;

  /**
   * Retrieves read-only comments for a specified media asset
   */
  getComments(workspaceId: string, mediaId: string): Promise<InstagramComment[]>;

  /**
   * Forces fresh data synchronization and token health check
   */
  refreshData(workspaceId: string): Promise<ConnectedAccount>;

  /**
   * Revokes authorization and securely deletes stored connection credentials
   */
  disconnect(workspaceId: string): Promise<void>;
}
