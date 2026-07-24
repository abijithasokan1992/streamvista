/**
 * Instagram Media Feed View
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 */

import { useState, useEffect } from 'react';
import { instagramService } from '../../services/instagram/InstagramApiAdapter';
import { InstagramMedia, InstagramError } from '../../types/instagram';
import { Film, ExternalLink, RefreshCw, Layers } from 'lucide-react';

const WORKSPACE_ID = 'ws_crayons_bridge_main';

export default function InstagramMediaView() {
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<InstagramError | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await instagramService.getMedia(WORKSPACE_ID);
        setMedia(data);
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
        <RefreshCw className="animate-spin text-brand-gold mr-2" size={20} /> Fetching Instagram Media Feed...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Film className="text-pink-400" size={22} /> Ingested Posts & Reels
        </h2>
        <span className="text-xs text-slate-400">{media.length} items loaded</span>
      </div>

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
                  Permalink <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
