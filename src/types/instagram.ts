/**
 * Read-Only Instagram Integration Data Models
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 */

export type InstagramAccountType = 'BUSINESS' | 'MEDIA_CREATOR' | 'PERSONAL' | 'UNKNOWN';

export type InstagramConnectionStatus =
  | 'not_connected'
  | 'connecting'
  | 'connected'
  | 'permission_incomplete'
  | 'token_expiring'
  | 'authorization_revoked'
  | 'sync_failed';

export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS' | 'UNKNOWN';

export interface ConnectedAccount {
  /** Internal connection ID */
  connectionId: string;
  /** StreamVista or Bridge workspace ID */
  workspaceId: string;
  /** Instagram account ID */
  instagramAccountId: string;
  /** Instagram username handle */
  username: string;
  /** Display name */
  displayName: string;
  /** Profile image URL */
  profilePictureUrl: string;
  /** Account classification */
  accountType: InstagramAccountType;
  /** Current connection lifecycle status */
  connectionStatus: InstagramConnectionStatus;
  /** Scopes explicitly granted by user during OAuth */
  grantedScopes: string[];
  /** Token expiration ISO timestamp */
  tokenExpiry: string;
  /** Connection creation ISO timestamp */
  connectedDate: string;
  /** Last data synchronization ISO timestamp */
  lastSyncedDate: string;
}

export interface InstagramMedia {
  /** Instagram media ID */
  id: string;
  /** Media classification */
  mediaType: InstagramMediaType;
  /** Public asset media URL */
  mediaUrl: string;
  /** Permalink to Instagram post */
  permalink: string;
  /** Thumbnail image URL for video assets */
  thumbnailUrl?: string;
  /** Post caption text */
  caption?: string;
  /** ISO creation timestamp */
  timestamp: string;
  /** Author username */
  username: string;
  /** Total like count where available */
  likeCount?: number;
  /** Total comment count where available */
  commentCount?: number;
  /** Video/Reel duration in seconds where available */
  duration?: number;
  /** Carousel items if mediaType === 'CAROUSEL_ALBUM' */
  children?: InstagramMedia[];
}

export interface InstagramInsight {
  /** Metric identifier (e.g. impressions, reach, engagement) */
  metricName: string;
  /** Metric scalar value or aggregated metric object */
  metricValue: number | string;
  /** Metric interval (day, week, days_28, lifetime) */
  period: string;
  /** Metric evaluation window */
  dateRange: {
    startDate: string;
    endDate: string;
  };
  /** Target Instagram Account ID */
  instagramAccountId: string;
  /** Optional target media ID for post-level insights */
  mediaId?: string;
  /** ISO timestamp when metric was calculated/fetched */
  fetchedTimestamp: string;
}

export interface InstagramComment {
  /** Comment ID */
  id: string;
  /** Associated media ID */
  mediaId: string;
  /** Author username */
  username: string;
  /** Comment body text */
  text: string;
  /** ISO post timestamp */
  timestamp: string;
  /** Comment like count where available */
  likeCount?: number;
  /** Reply count where available */
  replyCount?: number;
}

export type InstagramErrorCode =
  | 'AUTH_CANCELLED'
  | 'INVALID_STATE'
  | 'CALLBACK_FAILURE'
  | 'MISSING_AUTH_CODE'
  | 'EXPIRED_TOKEN'
  | 'REVOKED_TOKEN'
  | 'MISSING_PERMISSION'
  | 'UNSUPPORTED_ACCOUNT_TYPE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'META_API_UNAVAILABLE'
  | 'WORKSPACE_ACCESS_DENIED'
  | 'NO_PROFESSIONAL_ACCOUNT'
  | 'INSIGHTS_UNAVAILABLE';

export interface InstagramError {
  code: InstagramErrorCode;
  message: string;
  reasoning?: string;
  recommendation?: string;
}
