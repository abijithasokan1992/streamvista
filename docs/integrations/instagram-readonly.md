# Read-Only Instagram Integration Documentation

**Company:** STREAMVISTA (OPC) PRIVATE LIMITED  
**Founder, Owner, App Builder & CEO:** Abijith Asokan  
**Layer:** Crayons Bridge Ecosystem Entry Layer  
**Status:** Read-Only Prototype (Meta Configuration Required)

---

## 1. Current Prototype Scope
This integration provides a secure, read-only connection to Meta's official Instagram API for **Crayons Bridge**.
- **Supported Read Capabilities:** Connected profile discovery, posts/reels feed metadata, carousel item breakdown, professional account engagement metrics/insights, and read-only post comments.
- **Strict Prohibition:** This integration explicitly contains **ZERO write methods**. It cannot publish, edit, delete, comment, like, follow, or send direct messages (DMs).

---

## 2. Meta Developer Account Prerequisites
Before configuring the integration in production or staging, the administrator must possess:
1. An active [Meta for Developers](https://developers.facebook.com/) account verified with business details.
2. A Facebook Page linked to an Instagram Professional (Business or Creator) Account.
3. Administrator rights on the target Facebook Page and Meta App Console.

---

## 3. Supported Instagram Account Types
| Instagram Account Type | Profile & Media Retrieval | Insights & Analytics | Comments Retrieval |
| :--- | :---: | :---: | :---: |
| **Instagram Business Account** | ✅ Supported | ✅ Supported | ✅ Supported |
| **Instagram Creator Account** | ✅ Supported | ✅ Supported | ✅ Supported |
| **Instagram Personal Account** | ✅ Supported (Basic Display) | ❌ Unsupported by Meta API | ❌ Unsupported by Meta API |

*Note: For full Crayons Bridge analytics capabilities, connecting a Business or Creator account is required.*

---

## 4. Meta App Creation Steps
1. Navigate to [Meta App Dashboard](https://developers.facebook.com/apps/).
2. Click **Create App**.
3. Select **Other** -> **Business** app type (or **Consumer** depending on preferred Meta graph flow).
4. Assign App Name: `Crayons Bridge Instagram Integration (Prototype)`.
5. Associate with your Business Account.

---

## 5. Product and API Configuration
1. In the Meta App Dashboard, navigate to **Add Products**.
2. Add **Instagram Graph API** (and **Facebook Login for Business**).
3. Ensure the Meta API version is set to `v19.0` or higher.

---

## 6. OAuth Redirect URL Configuration
In **Facebook Login for Business** -> **Settings**:
- Add Valid OAuth Redirect URIs:
  - Local Dev: `http://localhost:5173/integrations/instagram/callback`
  - Server Callback: `https://<your-domain>/api/integrations/instagram/callback`
- Enable **Enforce HTTPS** and **Use Strict Mode for Redirect URIs**.

---

## 7. Required Read-Only Permissions
The integration requests ONLY the following read-only permission scopes:
- `instagram_basic`: Retrieve profile details and media posts.
- `instagram_manage_insights`: Retrieve media and account analytics.
- `instagram_manage_comments`: Read comments on media posts.
- `pages_read_engagement`: Access Facebook page engagement details linked to Instagram.
- `pages_show_list`: Discover Facebook pages managed by the authorized user.

*Deliberately Excluded Scopes:* `instagram_content_publish`, `instagram_manage_messages`, `pages_manage_posts`, and all write/deletion scopes.

---

## 8. Development-Mode Test-User Setup
While the Meta App is in **Development Mode**:
1. Go to **Roles** -> **Test Users** or **Roles** -> **Roles**.
2. Add the Instagram handle of your test accounts as an **Instagram Tester** or **Developer**.
3. Accept the tester invitation inside Instagram app (`Settings` -> `Website Permissions` -> `Tester Invites`).

---

## 9. Token Lifecycle
1. **Authorization Code**: Obtained via OAuth dialog with PKCE (`code_challenge` S256) and state token.
2. **Short-Lived Access Token**: Exchanged server-side via `/oauth/access_token` (valid for 1 hour).
3. **Long-Lived Access Token**: Immediately exchanged server-side for a long-lived user token (valid for 60 days).
4. **Token Refresh**: Refreshed automatically prior to expiration via `/refresh_access_token`.

---

## 10. Security Model
- **Token Encrypted at Rest**: Access tokens are encrypted using **AES-256-GCM** before storage in Firestore/Database.
- **Zero Client Exposure**: Access tokens are NEVER returned in API responses to the frontend browser or logged in stdout.
- **Workspace Isolation**: Token records are strictly bound to `workspaceId`. A user in Workspace A cannot access Workspace B credentials.
- **CSRF Protection**: OAuth `state` parameter is cryptographically generated using HMAC-SHA256 and verified upon callback.

---

## 11. Local Setup & Environment Configuration
Set the following environment variables in backend `.env` file (do NOT commit secrets to git):
```env
META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"
OAUTH_REDIRECT_URI="http://localhost:5173/integrations/instagram/callback"
FRONTEND_RETURN_URL="http://localhost:5173/integrations/instagram"
TOKEN_ENCRYPTION_SECRET="your_32_byte_aes_gcm_secret_key"
META_API_VERSION="v19.0"
```

---

## 12. Testing Procedure
Execute automated unit and integration tests:
```bash
# Frontend Service & Unit Tests
npx vitest run src/services/instagram/__tests__/instagramService.test.ts

# Backend Controller & Security Tests
cd functions && npx jest tests/instagramBackend.test.ts
```

---

## 13. Known Limitations
1. Personal Instagram accounts cannot access Insights or Comments endpoints.
2. Direct Messages (DMs) are intentionally out of scope for this prototype phase.
3. Real Meta API calls require adding test accounts in Meta Developer Console while in Development Mode.

---

## 14. App-Review Requirements
Before switching Meta App mode from **Development** to **Live**:
1. Submit `instagram_basic`, `instagram_manage_insights`, and `instagram_manage_comments` for Meta App Review.
2. Provide a screen recording showing the read-only dashboard and Crayons Bridge workspace utility.
3. Provide Privacy Policy and Terms of Service URLs.

---

## 15. Production Steps Intentionally Deferred
- Production Meta App Review submission.
- Production deployment to Firebase Live Hosting.
- Live modification of existing production Firebase/Meta databases.

---

## 16. Disconnect and Data-Deletion Process
Clicking **Disconnect** in the Crayons Bridge dashboard triggers:
1. Backend call to `/api/integrations/instagram/disconnect`.
2. Permanent deletion of encrypted access tokens and connection metadata from server storage.
3. Complete reset of frontend integration card state to `Not Connected`.
