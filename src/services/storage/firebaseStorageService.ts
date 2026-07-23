import { StorageService } from "./storage.types";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { logger } from "../../utils/logger";

class FirebaseStorageService implements StorageService {
  
  async uploadFile(
    file: File, 
    userId: string, 
    titleId: string, 
    assetCategory: 'posters' | 'trailers' | 'subtitles' | 'documents' | 'masters',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    
    // Deterministic path: users/{uid}/titles/{titleId}/{category}/{assetId}
    const assetId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    let path = `users/${userId}/titles/${titleId}/${assetCategory}/${assetId}`;
    
    // As per master charter, masters go to titles/{titleId}/masters/{assetId}
    if (assetCategory === 'masters') {
      path = `titles/${titleId}/masters/${assetId}`;
    }

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          logger.error(`Storage upload failed for ${path}`, error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            logger.trackEvent('asset_uploaded', { userId, titleId, assetCategory, path });
            resolve(downloadURL);
          } catch (error) {
            logger.error(`Failed to resolve download URL for ${path}`, error as Error);
            reject(error);
          }
        }
      );
    });
  }
}

export const firebaseStorageService = new FirebaseStorageService();
