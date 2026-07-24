/**
 * Instagram Account Overview View
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 */

import { useState, useEffect } from 'react';
import { instagramService } from '../../services/instagram/InstagramApiAdapter';
import { ConnectedAccount, InstagramError } from '../../types/instagram';
import { Shield, RefreshCw, CheckCircle2, User, Key, Server } from 'lucide-react';

const WORKSPACE_ID = 'ws_crayons_bridge_main';

export default function InstagramAccount() {
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<InstagramError | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const acc = await instagramService.getAccountStatus(WORKSPACE_ID);
        setAccount(acc);
      } catch (err: unknown) {
        setError(err as InstagramError);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="animate-spin text-brand-gold mr-2" size={20} /> Loading Account Status...
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-8 text-center bg-brand-navy/30 border border-white/10 rounded-xl space-y-3">
        <User className="mx-auto text-slate-500" size={32} />
        <h3 className="text-white font-semibold">No Instagram Account Connected</h3>
        <p className="text-xs text-slate-400">Connect Instagram from the main integrations panel to view account security status.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-brand-navy/40 border border-white/10 rounded-xl space-y-6">
        <div className="flex items-center gap-4">
          <img src={account.profilePictureUrl} alt={account.username} className="w-16 h-16 rounded-full border-2 border-pink-500/40" />
          <div>
            <h2 className="text-xl font-bold text-white">{account.displayName}</h2>
            <p className="text-xs text-pink-400">@{account.username} • Account ID: {account.instagramAccountId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-brand-gold font-semibold">
              <Shield size={16} /> Account Security & Token Isolation
            </div>
            <p className="text-slate-300">Connection ID: <span className="font-mono text-white">{account.connectionId}</span></p>
            <p className="text-slate-300">Workspace Scoping: <span className="font-mono text-white">{account.workspaceId}</span></p>
            <p className="text-slate-300">Token Expiry: <span className="text-emerald-400">{new Date(account.tokenExpiry).toLocaleDateString()}</span></p>
          </div>

          <div className="p-4 bg-white/5 border border-white/5 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Key size={16} /> Approved Read-Only Scopes
            </div>
            <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
              {account.grantedScopes.map((scope) => (
                <li key={scope} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" /> {scope}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
