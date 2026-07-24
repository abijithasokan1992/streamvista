/**
 * Instagram Read-Only Integration Dashboard
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 * Founder & CEO: Abijith Asokan
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { instagramService } from '../../services/instagram/InstagramApiAdapter';
import {
  ConnectedAccount,
  InstagramMedia,
  InstagramInsight,
  InstagramComment,
  InstagramConnectionStatus,
  InstagramError,
} from '../../types/instagram';
import {
  Share2,
  RefreshCw,
  Unlink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Layers,
  BarChart2,
  MessageSquare,
  ExternalLink,
  Film,
  Lock,
  HelpCircle,
} from 'lucide-react';

const WORKSPACE_ID = 'ws_crayons_bridge_main';

export default function InstagramDashboard() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [status, setStatus] = useState<InstagramConnectionStatus>('not_connected');
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'insights' | 'comments' | 'status'>('overview');
  
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [insights, setInsights] = useState<InstagramInsight[]>([]);
  const [comments, setComments] = useState<InstagramComment[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<InstagramError | null>(null);

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await instagramService.getAccountStatus(WORKSPACE_ID);
      if (data) {
        setAccount(data);
        setStatus(data.connectionStatus);
        await fetchSubData(data);
      } else {
        setAccount(null);
        setStatus('not_connected');
      }
    } catch (err: unknown) {
      setError(err as InstagramError);
      setStatus('sync_failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubData = async (acc: ConnectedAccount) => {
    if (acc.connectionStatus !== 'connected') return;

    // Fetch Media
    try {
      const mediaData = await instagramService.getMedia(WORKSPACE_ID);
      setMedia(mediaData);
      if (mediaData.length > 0) {
        const commentData = await instagramService.getComments(WORKSPACE_ID, mediaData[0].id);
        setComments(commentData);
      }
    } catch (err: unknown) {
      console.warn('Failed to load media:', err);
    }

    // Fetch Insights
    try {
      const insightData = await instagramService.getInsights(WORKSPACE_ID);
      setInsights(insightData);
    } catch (err: unknown) {
      console.warn('Insights notice:', err);
    }
  };

  const handleConnect = async () => {
    setStatus('connecting');
    try {
      const { url } = await instagramService.getConnectUrl(WORKSPACE_ID);
      // For local prototype simulation, trigger simulated callback
      if (url.includes('facebook.com')) {
        const state = btoa(JSON.stringify({ workspaceId: WORKSPACE_ID, timestamp: Date.now() }));
        navigate(`/integrations/instagram/callback?code=mock_auth_code_12345&state=${encodeURIComponent(state)}`);
      } else {
        window.location.href = url;
      }
    } catch (err: unknown) {
      setError(err as InstagramError);
      setStatus('sync_failed');
    }
  };

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      const refreshed = await instagramService.refreshData(WORKSPACE_ID);
      setAccount(refreshed);
      setStatus(refreshed.connectionStatus);
      await fetchSubData(refreshed);
    } catch (err: unknown) {
      setError(err as InstagramError);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Instagram account? Server token credentials will be purged.')) {
      return;
    }
    setLoading(true);
    try {
      await instagramService.disconnect(WORKSPACE_ID);
      setAccount(null);
      setStatus('not_connected');
      setMedia([]);
      setInsights([]);
      setComments([]);
    } catch (err: unknown) {
      setError(err as InstagramError);
    } finally {
      setLoading(false);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (st: InstagramConnectionStatus) => {
    switch (st) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={14} /> Connected
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <RefreshCw size={14} className="animate-spin" /> Connecting...
          </span>
        );
      case 'permission_incomplete':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <AlertTriangle size={14} /> Permission Incomplete
          </span>
        );
      case 'token_expiring':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Clock size={14} /> Token Expiring Soon
          </span>
        );
      case 'authorization_revoked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle size={14} /> Authorization Revoked
          </span>
        );
      case 'sync_failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle size={14} /> Sync Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Lock size={14} /> Not Connected
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-brand-gold" size={32} />
        <p className="text-slate-400 text-sm">Synchronizing Crayons Bridge Instagram Integration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-brand-navy/60 border border-white/10 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-0.5 shadow-lg shadow-pink-500/10">
            <div className="w-full h-full bg-brand-black rounded-[10px] flex items-center justify-center">
              <Share2 className="text-pink-400" size={24} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Instagram Integration</h1>
              {renderStatusBadge(status)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Crayons Bridge Ecosystem Layer • STREAMVISTA (OPC) PRIVATE LIMITED • Founder: Abijith Asokan
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {account ? (
            <>
              <button
                onClick={handleRefresh}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                Refresh Data
              </button>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors"
              >
                <Unlink size={16} />
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg shadow-lg shadow-pink-500/25 transition-all"
            >
              <Share2 size={18} />
              Connect Instagram
            </button>
          )}
        </div>
      </div>

      {/* Error Alert display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-300">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-red-200">[{error.code}] {error.message}</p>
            {error.reasoning && <p><span className="text-slate-400">Reason:</span> {error.reasoning}</p>}
            {error.recommendation && <p><span className="text-slate-400">Fix:</span> {error.recommendation}</p>}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!account ? (
        <div className="p-12 text-center bg-brand-navy/30 border border-white/5 rounded-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-semibold text-white">No Connected Instagram Account</h2>
            <p className="text-sm text-slate-400">
              Connect your official Meta Instagram Professional account to ingest read-only social metrics, media posts, and reels into Crayons Bridge dashboards.
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-brand-gold text-brand-black font-bold rounded-lg shadow-lg shadow-amber-500/10 hover:bg-amber-400 transition-all"
          >
            <Share2 size={18} />
            Connect Account Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Account Summary Header Card */}
          <div className="p-6 bg-brand-navy/40 border border-white/10 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={account.profilePictureUrl}
                alt={account.username}
                className="w-16 h-16 rounded-full border-2 border-pink-500/40 object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {account.displayName}
                  <span className="text-xs font-normal text-slate-400">(@{account.username})</span>
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-pink-300">
                    {account.accountType}
                  </span>
                  <span>ID: {account.instagramAccountId}</span>
                  <span>Workspace: {account.workspaceId}</span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 space-y-1">
              <p>Connected: {new Date(account.connectedDate).toLocaleDateString()}</p>
              <p>Last Synced: {new Date(account.lastSyncedDate).toLocaleTimeString()}</p>
              <p className="text-emerald-400 font-mono">Read-Only Mode Active</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: Layers },
              { id: 'media', label: 'Media & Reels', icon: Film },
              { id: 'insights', label: 'Insights', icon: BarChart2 },
              { id: 'comments', label: 'Comments', icon: MessageSquare },
              { id: 'status', label: 'Connection Status', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-brand-navy/30 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs uppercase tracking-wider font-semibold">Total Posts Analyzed</span>
                  <Film size={18} className="text-pink-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">{media.length}</div>
                <p className="text-xs text-slate-400">Fetched via Meta Read-Only API</p>
              </div>

              <div className="p-6 bg-brand-navy/30 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs uppercase tracking-wider font-semibold">Account Type</span>
                  <Shield size={18} className="text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{account.accountType}</div>
                <p className="text-xs text-emerald-400">Eligible for Insights & Analytics</p>
              </div>

              <div className="p-6 bg-brand-navy/30 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs uppercase tracking-wider font-semibold">Granted Scopes</span>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">{account.grantedScopes.length} Scopes</div>
                <p className="text-xs text-slate-400">Zero write permissions requested</p>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {media.map((item) => (
                <div key={item.id} className="bg-brand-navy/40 border border-white/10 rounded-xl overflow-hidden group hover:border-pink-500/50 transition-all">
                  <div className="relative aspect-square bg-slate-900 overflow-hidden">
                    <img src={item.mediaUrl} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      {item.mediaType}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-slate-300 line-clamp-2">{item.caption || 'No caption'}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                      <span>❤️ {item.likeCount ?? 0}</span>
                      <span>💬 {item.commentCount ?? 0}</span>
                      <a href={item.permalink} target="_blank" rel="noreferrer" className="text-pink-400 hover:underline flex items-center gap-1">
                        View <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              {account.accountType === 'PERSONAL' ? (
                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <HelpCircle size={18} />
                    Insights Unavailable for Personal Accounts
                  </div>
                  <p className="text-xs text-slate-300">
                    Meta requires an Instagram Creator or Business account to expose engagement and metrics APIs.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((inMetric) => (
                    <div key={inMetric.metricName} className="p-5 bg-brand-navy/40 border border-white/10 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{inMetric.metricName}</p>
                        <p className="text-2xl font-bold text-white mt-1">{inMetric.metricValue.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Period: {inMetric.period}</p>
                      </div>
                      <BarChart2 className="text-brand-gold opacity-80" size={28} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-3">
              {comments.map((cmt) => (
                <div key={cmt.id} className="p-4 bg-brand-navy/30 border border-white/5 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-pink-400">
                    {cmt.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">@{cmt.username}</span>
                      <span className="text-slate-500">{new Date(cmt.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-300">{cmt.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="p-6 bg-brand-navy/30 border border-white/5 rounded-xl space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Connection Lifecycle & Granted Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-slate-400 font-semibold">Granted Scopes:</p>
                  <ul className="space-y-1">
                    {account.grantedScopes.map((sc) => (
                      <li key={sc} className="flex items-center gap-2 text-emerald-400 font-mono">
                        <CheckCircle2 size={14} /> {sc}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 text-slate-400">
                  <p><span className="font-semibold text-white">Token Encryption:</span> AES-256-GCM Server Encrypted</p>
                  <p><span className="font-semibold text-white">Token Storage:</span> Isolated Workspace Secret Store</p>
                  <p><span className="font-semibold text-white">Direct Messages:</span> Omitted / Deferred</p>
                  <p><span className="font-semibold text-white">Write Access:</span> Blocked (Read-Only Guardrail)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
