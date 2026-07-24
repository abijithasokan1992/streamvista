import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { InstagramController } from './functions/src/instagram/instagramController';

function instagramApiPlugin(): Plugin {
  return {
    name: 'instagram-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/integrations/instagram', async (req, res) => {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        const path = url.pathname;
        const searchParams = url.searchParams;
        const workspaceId = searchParams.get('workspaceId') || 'ws_crayons_bridge_main';

        res.setHeader('Content-Type', 'application/json');

        try {
          if (path === '/connect') {
            const result = await InstagramController.handleConnect(workspaceId);
            res.end(JSON.stringify(result));
            return;
          }

          if (path === '/callback' && req.method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                const result = await InstagramController.handleCallback(body.code, body.state, body.workspaceId || workspaceId);
                res.end(JSON.stringify(result));
              } catch (err: any) {
                res.statusCode = 400;
                res.end(JSON.stringify(err));
              }
            });
            return;
          }

          if (path === '/account') {
            const result = await InstagramController.handleGetAccount(workspaceId);
            res.end(JSON.stringify(result));
            return;
          }

          if (path === '/media') {
            const limit = parseInt(searchParams.get('limit') || '25', 10);
            const result = await InstagramController.handleGetMedia(workspaceId, limit);
            res.end(JSON.stringify(result));
            return;
          }

          if (path === '/insights') {
            const result = await InstagramController.handleGetInsights(workspaceId);
            res.end(JSON.stringify(result));
            return;
          }

          if (path === '/comments') {
            const mediaId = searchParams.get('mediaId') || 'ig_media_101';
            const result = await InstagramController.handleGetComments(workspaceId, mediaId);
            res.end(JSON.stringify(result));
            return;
          }

          if (path === '/refresh' && req.method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                const result = await InstagramController.handleRefresh(body.workspaceId || workspaceId);
                res.end(JSON.stringify(result));
              } catch (err: any) {
                res.statusCode = 400;
                res.end(JSON.stringify(err));
              }
            });
            return;
          }

          if (path === '/disconnect' && req.method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                const result = await InstagramController.handleDisconnect(body.workspaceId || workspaceId);
                res.end(JSON.stringify(result));
              } catch (err: any) {
                res.statusCode = 400;
                res.end(JSON.stringify(err));
              }
            });
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ code: 'NOT_FOUND', message: 'Endpoint not found' }));
        } catch (err: any) {
          res.statusCode = err.code ? 400 : 500;
          res.end(JSON.stringify(err));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    instagramApiPlugin(),
  ],
});
