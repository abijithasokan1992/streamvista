/**
 * Instagram OAuth Callback Handler View
 * STREAMVISTA (OPC) PRIVATE LIMITED - Crayons Bridge Ecosystem
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { instagramService } from '../../services/instagram/InstagramApiAdapter';
import { InstagramError } from '../../types/instagram';
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

const WORKSPACE_ID = 'ws_crayons_bridge_main';

export default function InstagramCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<InstagramError | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Validating authorization response with Meta API...');

  useEffect(() => {
    processCallback();
  }, []);

  const processCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorReason = searchParams.get('error_reason') || searchParams.get('error_description');

    if (errorReason || searchParams.get('error')) {
      setError({
        code: 'AUTH_CANCELLED',
        message: 'Meta OAuth authorization was cancelled or denied by user',
        reasoning: errorReason || 'User clicked cancel on the Meta permissions prompt',
        recommendation: 'Click Connect Instagram again and approve the requested read-only permissions.',
      });
      return;
    }

    if (!code) {
      setError({
        code: 'MISSING_AUTH_CODE',
        message: 'Authorization code was omitted from callback parameter list',
        reasoning: 'Invalid callback parameters received from OAuth redirect',
        recommendation: 'Return to Integrations and restart the connection flow.',
      });
      return;
    }

    if (!state) {
      setError({
        code: 'INVALID_STATE',
        message: 'OAuth state parameter is missing',
        reasoning: 'CSRF security token missing from callback parameters',
        recommendation: 'Initiate authorization directly from Crayons Bridge dashboard.',
      });
      return;
    }

    try {
      setStatusMessage('Exchanging authorization code for long-lived access token...');
      await instagramService.handleCallback(code, state, WORKSPACE_ID);
      setStatusMessage('Connection established successfully! Redirecting...');
      setTimeout(() => {
        navigate('/integrations/instagram');
      }, 1000);
    } catch (err: unknown) {
      setError(err as InstagramError);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6 max-w-lg mx-auto text-center space-y-6">
      {error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl space-y-4 w-full text-left">
          <div className="flex items-center gap-3 text-red-400 font-bold text-base">
            <AlertTriangle size={24} />
            Authorization Error [{error.code}]
          </div>
          <div className="space-y-2 text-xs text-red-200">
            <p className="font-semibold">{error.message}</p>
            {error.reasoning && <p><span className="text-slate-400">Details:</span> {error.reasoning}</p>}
            {error.recommendation && <p><span className="text-slate-400">Action:</span> {error.recommendation}</p>}
          </div>
          <button
            onClick={() => navigate('/integrations/instagram')}
            className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-semibold transition-colors mt-2"
          >
            Back to Instagram Integration
          </button>
        </div>
      ) : (
        <div className="p-8 bg-brand-navy/40 border border-white/10 rounded-xl space-y-4 w-full">
          <RefreshCw className="animate-spin text-brand-gold mx-auto" size={36} />
          <h2 className="text-lg font-bold text-white">Completing Instagram Connection</h2>
          <p className="text-xs text-slate-400">{statusMessage}</p>
        </div>
      )}
    </div>
  );
}
