import { assertSupabaseConfigured, supabase } from "./supabase";

const FILM_BUCKET = "sv-masters";

export interface StorageProvider {
  upload(file: File, path: string): Promise<string>;
  getUrl(path: string): string;
  delete(path: string): Promise<void>;
  getSignedUrl?(path: string, expiresIn?: number): Promise<string>;
}

export class SupabaseStorage implements StorageProvider {
  async upload(file: File, path: string) {
    assertSupabaseConfigured();
    const { error } = await supabase.storage.from(FILM_BUCKET).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw new Error(error.message);
    return path;
  }

  getUrl(path: string) {
    return path;
  }

  async getSignedUrl(path: string, expiresIn = 3600) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.storage.from(FILM_BUCKET).createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) throw new Error(error?.message || "Could not create secure screener URL");
    return data.signedUrl;
  }

  async delete(path: string) {
    assertSupabaseConfigured();
    const { error } = await supabase.storage.from(FILM_BUCKET).remove([path]);
    if (error) throw new Error(error.message);
  }
}

abstract class ServerManagedStorage implements StorageProvider {
  private readonly providerName: string;

  protected constructor(providerName: string) {
    this.providerName = providerName;
  }

  async upload(): Promise<string> {
    throw new Error(`${this.providerName} uploads require a server-side signed-upload adapter; browser cloud keys are intentionally unsupported.`);
  }

  getUrl(path: string) {
    return path;
  }

  async delete(): Promise<void> {
    throw new Error(`${this.providerName} deletes require a server-side adapter.`);
  }
}

export class S3Storage extends ServerManagedStorage { constructor() { super("S3"); } }
export class OracleStorage extends ServerManagedStorage { constructor() { super("Oracle Object Storage"); } }
export class GCSStorage extends ServerManagedStorage { constructor() { super("Google Cloud Storage"); } }

export function getStorageProvider(): StorageProvider {
  const provider = (import.meta.env.VITE_STORAGE || "supabase").toLowerCase();
  if (provider === "s3") return new S3Storage();
  if (provider === "oracle") return new OracleStorage();
  if (provider === "gcs") return new GCSStorage();
  return new SupabaseStorage();
}

export const storage = getStorageProvider();
