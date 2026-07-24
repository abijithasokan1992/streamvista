"use strict";
/**
 * Instagram Integration Backend Controller
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 *
 * Server-side Meta API handler & secure token manager.
 * Never logs access tokens. Never returns access tokens to client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramController = void 0;
const security_1 = require("./security");
// In-memory / Firestore mock store per workspace for isolated prototype execution
const workspaceStore = new Map();
const META_APP_ID = process.env.META_APP_ID || '123456789012345';
const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'http://localhost:5173/integrations/instagram/callback';
const META_API_VERSION = process.env.META_API_VERSION || 'v19.0';
class InstagramController {
    /**
     * GET /api/integrations/instagram/connect
     */
    static async handleConnect(workspaceId) {
        if (!workspaceId) {
            throw {
                code: 'WORKSPACE_ACCESS_DENIED',
                message: 'Workspace ID parameter is required',
            };
        }
        const state = (0, security_1.generateOAuthState)(workspaceId);
        const { codeChallenge } = (0, security_1.generatePKCE)();
        const scopeList = [
            'instagram_basic',
            'instagram_manage_insights',
            'instagram_manage_comments',
            'pages_read_engagement',
            'pages_show_list',
        ].join(',');
        const authUrl = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT_URI)}&state=${state}&scope=${scopeList}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        return {
            url: authUrl,
            state,
        };
    }
    /**
     * POST /api/integrations/instagram/callback
     */
    static async handleCallback(code, state, workspaceId) {
        if (!code) {
            throw {
                code: 'MISSING_AUTH_CODE',
                message: 'Authorization code was not returned by Meta OAuth server',
                reasoning: 'User cancelled flow or Meta OAuth endpoint returned an empty code',
                recommendation: 'Retry the Instagram authorization workflow',
            };
        }
        if (!state || !(0, security_1.validateOAuthState)(state, workspaceId)) {
            throw {
                code: 'INVALID_STATE',
                message: 'OAuth state validation failed',
                reasoning: 'Possible CSRF attempt or expired authorization state token',
                recommendation: 'Initiate a fresh Instagram authorization attempt from Crayons Bridge',
            };
        }
        // Prototype Mode Code Exchange simulation / Meta API call
        const simulatedAccessToken = `IGQVJ_PROTOTYPE_SECRET_TOKEN_${Date.now()}`;
        const encryptedAccessToken = (0, security_1.encryptToken)(simulatedAccessToken);
        const now = new Date().toISOString();
        const expiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days
        const record = {
            connectionId: `conn_ig_${Date.now()}`,
            workspaceId,
            instagramAccountId: '17841401234567890',
            username: 'crayons_bridge_demo',
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
            encryptedAccessToken,
            tokenExpiry: expiry,
            connectedDate: now,
            lastSyncedDate: now,
        };
        workspaceStore.set(workspaceId, record);
        // Return sanitized account object without encryptedAccessToken!
        const { encryptedAccessToken: _, ...sanitizedAccount } = record;
        return sanitizedAccount;
    }
    /**
     * GET /api/integrations/instagram/account
     */
    static async handleGetAccount(workspaceId) {
        const record = workspaceStore.get(workspaceId);
        if (!record) {
            return null;
        }
        const { encryptedAccessToken: _, ...sanitizedAccount } = record;
        return sanitizedAccount;
    }
    /**
     * GET /api/integrations/instagram/media
     */
    static async handleGetMedia(workspaceId, limit = 25) {
        const record = workspaceStore.get(workspaceId);
        if (!record || record.connectionStatus !== 'connected') {
            throw {
                code: 'EXPIRED_TOKEN',
                message: 'No active Instagram connection found for workspace',
                recommendation: 'Connect your Instagram account to view media',
            };
        }
        // Decrypt token server side if making live request
        (0, security_1.decryptToken)(record.encryptedAccessToken);
        // Return read-only media items
        return [
            {
                id: 'ig_media_101',
                mediaType: 'REELS',
                mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
                permalink: 'https://instagram.com/p/C1234567890/',
                thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                caption: 'Behind the scenes at StreamVista Studios! 🎬 #CrayonsBridge #FilmProduction',
                timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
                username: record.username,
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
                username: record.username,
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
                username: record.username,
                likeCount: 2150,
                commentCount: 112,
                children: [
                    {
                        id: 'ig_media_103_child1',
                        mediaType: 'IMAGE',
                        mediaUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=80',
                        permalink: 'https://instagram.com/p/C1122334455/',
                        timestamp: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
                        username: record.username,
                    },
                    {
                        id: 'ig_media_103_child2',
                        mediaType: 'IMAGE',
                        mediaUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80',
                        permalink: 'https://instagram.com/p/C1122334455/',
                        timestamp: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
                        username: record.username,
                    }
                ]
            }
        ].slice(0, limit);
    }
    /**
     * GET /api/integrations/instagram/insights
     */
    static async handleGetInsights(workspaceId) {
        const record = workspaceStore.get(workspaceId);
        if (!record || record.connectionStatus !== 'connected') {
            throw {
                code: 'EXPIRED_TOKEN',
                message: 'Active Instagram connection required for insights',
            };
        }
        if (record.accountType === 'PERSONAL') {
            throw {
                code: 'UNSUPPORTED_ACCOUNT_TYPE',
                message: 'Instagram Insights are unavailable for Personal accounts',
                reasoning: 'Meta API requires an Instagram Professional (Business or Creator) account for insights',
                recommendation: 'Convert your Instagram account to a Professional Creator or Business account',
            };
        }
        if (!record.grantedScopes.includes('instagram_manage_insights')) {
            throw {
                code: 'MISSING_PERMISSION',
                message: 'Missing permission: instagram_manage_insights',
                reasoning: 'The connected account did not grant insights permission during OAuth flow',
                recommendation: 'Reconnect Instagram and accept the requested insights permission scope',
            };
        }
        const fetchedTimestamp = new Date().toISOString();
        return [
            {
                metricName: 'impressions',
                metricValue: 145800,
                period: 'day',
                dateRange: { startDate: '2026-07-01', endDate: '2026-07-24' },
                instagramAccountId: record.instagramAccountId,
                fetchedTimestamp,
            },
            {
                metricName: 'reach',
                metricValue: 98400,
                period: 'day',
                dateRange: { startDate: '2026-07-01', endDate: '2026-07-24' },
                instagramAccountId: record.instagramAccountId,
                fetchedTimestamp,
            },
            {
                metricName: 'profile_views',
                metricValue: 12400,
                period: 'day',
                dateRange: { startDate: '2026-07-01', endDate: '2026-07-24' },
                instagramAccountId: record.instagramAccountId,
                fetchedTimestamp,
            },
            {
                metricName: 'follower_count',
                metricValue: 48900,
                period: 'lifetime',
                dateRange: { startDate: '2026-07-24', endDate: '2026-07-24' },
                instagramAccountId: record.instagramAccountId,
                fetchedTimestamp,
            }
        ];
    }
    /**
     * GET /api/integrations/instagram/comments
     */
    static async handleGetComments(workspaceId, mediaId) {
        const record = workspaceStore.get(workspaceId);
        if (!record || record.connectionStatus !== 'connected') {
            throw {
                code: 'EXPIRED_TOKEN',
                message: 'Active Instagram connection required for comments',
            };
        }
        if (!record.grantedScopes.includes('instagram_manage_comments')) {
            throw {
                code: 'MISSING_PERMISSION',
                message: 'Missing permission: instagram_manage_comments',
                reasoning: 'Comment reading requires instagram_manage_comments permission',
                recommendation: 'Reconnect Instagram and approve comment reading access',
            };
        }
        return [
            {
                id: 'cmt_1001',
                mediaId: mediaId || 'ig_media_101',
                username: 'cine_critic_ind',
                text: 'The color palette in this reel is incredible! Is this processed with StreamVista vertical engine?',
                timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
                likeCount: 15,
                replyCount: 2,
            },
            {
                id: 'cmt_1002',
                mediaId: mediaId || 'ig_media_101',
                username: 'abijith_fan_club',
                text: 'StreamVista and Crayons Bridge ecosystem looking sleek! 🔥',
                timestamp: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
                likeCount: 42,
                replyCount: 5,
            }
        ];
    }
    /**
     * POST /api/integrations/instagram/refresh
     */
    static async handleRefresh(workspaceId) {
        const record = workspaceStore.get(workspaceId);
        if (!record) {
            throw {
                code: 'EXPIRED_TOKEN',
                message: 'No existing integration found to refresh',
            };
        }
        const now = new Date().toISOString();
        record.lastSyncedDate = now;
        record.connectionStatus = 'connected';
        workspaceStore.set(workspaceId, record);
        const { encryptedAccessToken: _, ...sanitizedAccount } = record;
        return sanitizedAccount;
    }
    /**
     * POST /api/integrations/instagram/disconnect
     */
    static async handleDisconnect(workspaceId) {
        workspaceStore.delete(workspaceId);
        return { success: true };
    }
}
exports.InstagramController = InstagramController;
//# sourceMappingURL=instagramController.js.map