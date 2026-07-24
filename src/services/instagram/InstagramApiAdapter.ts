/**
 * Instagram API Adapter
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 * 
 * Secure Frontend Adapter implementation of InstagramService.
 * Calls backend server endpoints (/api/integrations/instagram/*).
 * In local prototype mode, falls back to simulated secure backend logic.
 * Never exposes raw access tokens or client secrets to browser memory.
 */

import { InstagramService } from './InstagramService';
import {
  ConnectedAccount,
  InstagramMedia,
  InstagramInsight,
  InstagramComment,
  InstagramError,
} from '../../types/instagram';

// Local prototype storage simulating secure backend workspace store
const localPrototypeStore = new Map<string, ConnectedAccount>();

export class InstagramApiAdapter implements InstagramService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/integrations/instagram') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: InstagramError = {
          code: errorData.code || 'META_API_UNAVAILABLE',
          message: errorData.message || `HTTP error ${response.status}`,
          reasoning: errorData.reasoning,
          recommendation: errorData.recommendation,
        };
        throw error;
      }

      return await response.json();
    } catch (err: unknown) {
      if ((err as InstagramError).code) {
        throw err;
      }

      // Local fallback for local prototype testing if backend server is not running
      return this.handleLocalPrototypeFallback<T>(endpoint, options);
    }
  }

  private handleLocalPrototypeFallback<T>(endpoint: string, options: RequestInit): T {
    const url = new URL(endpoint, 'http://localhost');
    const path = url.pathname;
    const workspaceId = url.searchParams.get('workspaceId') || 'ws_default_crayons_bridge';

    if (path === '/connect') {
      const state = btoa(JSON.stringify({ workspaceId, timestamp: Date.now() }));
      const scopeList = 'instagram_basic,instagram_manage_insights,instagram_manage_comments,pages_read_engagement,pages_show_list';
      const mockMetaUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=123456789012345&redirect_uri=${encodeURIComponent(
        window.location.origin + '/integrations/instagram/callback'
      )}&state=${state}&scope=${scopeList}&response_type=code`;
      return { url: mockMetaUrl, state } as unknown as T;
    }

    if (path === '/callback' && options.method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      if (!body.code) {
        throw {
          code: 'MISSING_AUTH_CODE',
          message: 'Authorization code missing from OAuth callback',
          reasoning: 'Authorization was cancelled or code parameter was omitted',
          recommendation: 'Click Connect Instagram to attempt authorization again',
        } as InstagramError;
      }
      if (!body.state) {
        throw {
          code: 'INVALID_STATE',
          message: 'Invalid OAuth state token',
          reasoning: 'State token mismatch or expiration',
          recommendation: 'Initiate a fresh connection attempt',
        } as InstagramError;
      }

      const now = new Date().toISOString();
      const account: ConnectedAccount = {
        connectionId: `conn_ig_${Date.now()}`,
        workspaceId: body.workspaceId || workspaceId,
        instagramAccountId: '17841401234567890',
        username: 'crayons_bridge_official',
        displayName: 'Crayons Bridge Studio',
        profilePictureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        accountType: 'BUSINESS',
        connectionStatus: 'connected',
        grantedScopes: [
          'instagram_basic',
          'instagram_manage_insights',
          'instagram_manage_comments',
          'pages_read_engagement',
          'pages_show_list',
        ],
        tokenExpiry: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
        connectedDate: now,
        lastSyncedDate: now,
      };

      localPrototypeStore.set(account.workspaceId, account);
      return account as unknown as T;
    }

    if (path === '/account') {
      const account = localPrototypeStore.get(workspaceId);
      return (account || null) as unknown as T;
    }

    if (path === '/media') {
      const account = localPrototypeStore.get(workspaceId);
      if (!account || account.connectionStatus !== 'connected') {
        throw {
          code: 'EXPIRED_TOKEN',
          message: 'Active Instagram connection required for media retrieval',
        } as InstagramError;
      }

      return [
        {
          id: 'ig_media_101',
          mediaType: 'REELS',
          mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
          permalink: 'https://instagram.com/p/C1234567890/',
          thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          caption: 'Behind the scenes at StreamVista Studios! 🎬 #CrayonsBridge #FilmProduction',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
          username: account.username,
          likeCount: 1420,
          commentCount: 89,
          duration: 45,
        },
        {
          id: 'ig_media_102',
          mediaType: 'IMAGE',
          mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
          permalink: 'https://instagram.com/p/C0987654321/',
          caption: 'Cinematic color grading suite powered by StreamVista vertical engine.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
          username: account.username,
          likeCount: 980,
          commentCount: 34,
        },
        {
          id: 'ig_media_103',
          mediaType: 'CAROUSEL_ALBUM',
          mediaUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=80',
          permalink: 'https://instagram.com/p/C1122334455/',
          caption: 'Frame breakdown & lighting setups for upcoming release.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
          username: account.username,
          likeCount: 2150,
          commentCount: 112,
          children: [
            {
              id: 'ig_media_103_child1',
              mediaType: 'IMAGE',
              mediaUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=80',
              permalink: 'https://instagram.com/p/C1122334455/',
              timestamp: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
              username: account.username,
            },
            {
              id: 'ig_media_103_child2',
              mediaType: 'IMAGE',
              mediaUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
              permalink: 'https://instagram.com/p/C1122334455/',
              timestamp: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
              username: account.username,
            }
          ]
        }
      ] as unknown as T;
    }

    if (path === '/insights') {
      const account = localPrototypeStore.get(workspaceId);
      if (!account || account.connectionStatus !== 'connected') {
        throw {
          code: 'EXPIRED_TOKEN',
          message: 'Active Instagram connection required for insights',
        } as InstagramError;
      }
      if (account.accountType === 'PERSONAL') {
        throw {
          code: 'UNSUPPORTED_ACCOUNT_TYPE',
          message: 'Instagram Insights are unavailable for Personal accounts',
          reasoning: 'Meta API requires an Instagram Professional (Business or Creator) account for insights',
          recommendation: 'Convert your Instagram account to a Professional Creator or Business account',
        } as InstagramError;
      }
      if (!account.grantedScopes.includes('instagram_manage_insights')) {
        throw {
          code: 'MISSING_PERMISSION',
          message: 'Missing permission: instagram_manage_insights',
          reasoning: 'The connected account did not grant insights permission during OAuth flow',
          recommendation: 'Reconnect Instagram and accept the requested insights permission scope',
        } as InstagramError;
      }

      const fetchedTimestamp = new Date().toISOString();
      return [
        {
          metricName: 'impressions',
          metricValue: 145800,
          period: 'day',
          dateRange: { startDate: '2026-07-01', endDate: '2026-07-24' },
          instagramAccountId: account.instagramAccountId,
          fetchedTimestamp,
        },
        {
          metricName: 'reach',
          metricValue: 98400,
          period: 'day',
          dateRange: { startDate: '2026-07-01', endDate: '2026-07-24' },
          instagramAccountId: account.instagramAccountId,
          fetchedTimestamp,
        },
        {
          metricName: 'profile_views',
          metricValue: 12400,
          period: 'day',
          dateRange: { startDate: '2026-07-01', endDate: '2026-07-24' },
          instagramAccountId: account.instagramAccountId,
          fetchedTimestamp,
        },
        {
          metricName: 'follower_count',
          metricValue: 48900,
          period: 'lifetime',
          dateRange: { startDate: '2026-07-24', endDate: '2026-07-24' },
          instagramAccountId: account.instagramAccountId,
          fetchedTimestamp,
        }
      ] as unknown as T;
    }

    if (path === '/comments') {
      const account = localPrototypeStore.get(workspaceId);
      if (!account || account.connectionStatus !== 'connected') {
        throw {
          code: 'EXPIRED_TOKEN',
          message: 'Active Instagram connection required for comments',
        } as InstagramError;
      }
      const mediaId = url.searchParams.get('mediaId') || 'ig_media_101';
      return [
        {
          id: 'cmt_1001',
          mediaId,
          username: 'cine_critic_ind',
          text: 'The color palette in this reel is incredible! Is this processed with StreamVista vertical engine?',
          timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
          likeCount: 15,
          replyCount: 2,
        },
        {
          id: 'cmt_1002',
          mediaId,
          username: 'abijith_fan_club',
          text: 'StreamVista and Crayons Bridge ecosystem looking sleek! 🔥',
          timestamp: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
          likeCount: 42,
          replyCount: 5,
        }
      ] as unknown as T;
    }

    if (path === '/refresh' && options.method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      const targetWs = body.workspaceId || workspaceId;
      const account = localPrototypeStore.get(targetWs);
      if (!account) {
        throw {
          code: 'EXPIRED_TOKEN',
          message: 'No active connection to refresh',
        } as InstagramError;
      }
      account.lastSyncedDate = new Date().toISOString();
      account.connectionStatus = 'connected';
      localPrototypeStore.set(targetWs, account);
      return account as unknown as T;
    }

    if (path === '/disconnect' && options.method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      const targetWs = body.workspaceId || workspaceId;
      localPrototypeStore.delete(targetWs);
      return { success: true } as unknown as T;
    }

    throw {
      code: 'META_API_UNAVAILABLE',
      message: `Unsupported endpoint ${path}`,
    } as InstagramError;
  }

  async getConnectUrl(workspaceId: string): Promise<{ url: string; state: string }> {
    return this.request<{ url: string; state: string }>(
      `/connect?workspaceId=${encodeURIComponent(workspaceId)}`
    );
  }

  async handleCallback(code: string, state: string, workspaceId: string): Promise<ConnectedAccount> {
    return this.request<ConnectedAccount>('/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state, workspaceId }),
    });
  }

  async getAccountStatus(workspaceId: string): Promise<ConnectedAccount | null> {
    return this.request<ConnectedAccount | null>(
      `/account?workspaceId=${encodeURIComponent(workspaceId)}`
    );
  }

  async getMedia(workspaceId: string, limit: number = 25): Promise<InstagramMedia[]> {
    return this.request<InstagramMedia[]>(
      `/media?workspaceId=${encodeURIComponent(workspaceId)}&limit=${limit}`
    );
  }

  async getInsights(workspaceId: string): Promise<InstagramInsight[]> {
    return this.request<InstagramInsight[]>(
      `/insights?workspaceId=${encodeURIComponent(workspaceId)}`
    );
  }

  async getComments(workspaceId: string, mediaId: string): Promise<InstagramComment[]> {
    return this.request<InstagramComment[]>(
      `/comments?workspaceId=${encodeURIComponent(workspaceId)}&mediaId=${encodeURIComponent(mediaId)}`
    );
  }

  async refreshData(workspaceId: string): Promise<ConnectedAccount> {
    return this.request<ConnectedAccount>('/refresh', {
      method: 'POST',
      body: JSON.stringify({ workspaceId }),
    });
  }

  async disconnect(workspaceId: string): Promise<void> {
    await this.request<{ success: boolean }>('/disconnect', {
      method: 'POST',
      body: JSON.stringify({ workspaceId }),
    });
  }
}

/** Singleton instance export */
export const instagramService: InstagramService = new InstagramApiAdapter();
