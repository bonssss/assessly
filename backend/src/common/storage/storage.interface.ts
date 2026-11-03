export interface StoredFileResult {
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface IStorageProvider {
  uploadFile(
    file: Express.Multer.File,
    folder?: string
  ): Promise<StoredFileResult>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
}
