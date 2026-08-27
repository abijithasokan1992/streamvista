import { google } from 'googleapis';
import stream from 'stream';
import path from 'path';

export class GoogleDriveService {
  private drive;

  constructor(keyFilePath?: string, apiKey?: string) {
    if (keyFilePath) {
      // Professional Service Account Auth (OAuth2)
      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
      });
      this.drive = google.drive({ version: 'v3', auth });
      console.log('[DataBox] Initialized with Service Account authentication.');
    } else {
      // Fallback to API Key
      this.drive = google.drive({ version: 'v3', auth: apiKey });
      console.log('[DataBox] Initialized with basic API Key authentication.');
    }
  }

  async uploadFile(fileName: string, mimeType: string, buffer: Buffer, folderId?: string) {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: folderId ? [folderId] : undefined,
        },
        media: {
          mimeType: mimeType,
          body: bufferStream,
        },
      });

      console.log(`[DataBox] File uploaded to Drive: ${fileName} (ID: ${response.data.id})`);
      return response.data;
    } catch (error: any) {
      console.error('[DataBox] Drive Upload Error:', error.message);
      throw new Error('Failed to securely transfer data to Drive repository.');
    }
  }

  async listFiles(folderId?: string) {
    try {
      const response = await this.drive.files.list({
        q: folderId ? `'${folderId}' in parents` : undefined,
        fields: 'files(id, name, mimeType, createdTime)',
      });
      return response.data.files;
    } catch (error: any) {
      console.error('[DataBox] Drive List Error:', error.message);
      throw new Error('Failed to retrieve Data Box index.');
    }
  }
}
