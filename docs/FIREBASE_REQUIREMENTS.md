# Firebase Requirements

## Configuration
- An active Firebase Project.
- `.env.local` populated with valid Firebase SDK keys.

## Services Used
1. **Firebase Authentication**: For managing user accounts (Email/Password logic).
2. **Cloud Firestore**: For storing Titles, Drafts, Profiles, and related metadata.
3. **Cloud Storage**: For hosting master video files, posters, thumbnails, and documents.
4. **Firebase Hosting**: For serving the Vite React production bundle.

## Security Rules implementation
- Firestore must deploy strict, default-deny rules mapped to `roles` collection verification.
- Storage must deploy role-checked paths, utilizing Firebase Auth Custom Claims for verifying complex roles natively in rules.

## Setup Requirements (When Live)
- Disable `VITE_DATA_MODE=mock`.
- Ensure Custom Claims are set up via a secured Cloud Function when users are assigned roles, since Storage Rules cannot easily query Firestore directly without significant overhead.
