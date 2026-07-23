export interface LegacyUser {
  id: number;
  email: string;
  password?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  profile_type?: 'creator' | 'buyer' | 'admin';
}

export interface LegacyFilm {
  id: number;
  title: string;
  description: string;
  runtime_minutes: number;
  created_at: string;
  status: string;
  poster_url?: string;
  trailer_url?: string;
  owner_id: number;
}

export interface LegacyDraft {
  id: number;
  film_id: number;
  draft_data: string; // JSON string
  updated_at: string;
}

export interface LegacyBuyerMapping {
  id: number;
  user_id: number;
  film_id: number;
  granted_at: string;
  can_download: boolean;
  status: string;
}

export interface LegacyPayment {
  id: number;
  user_id: number;
  film_id: number;
  amount: number;
  currency: string;
  status: string;
  payment_signature?: string;
  created_at: string;
}

export interface MigrationReport {
  totalProcessed: number;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}
