export interface StorageService {
  uploadFile(
    file: File, 
    userId: string, 
    titleId: string, 
    assetCategory: 'posters' | 'trailers' | 'subtitles' | 'documents' | 'masters',
    onProgress?: (progress: number) => void
  ): Promise<string>;
}
