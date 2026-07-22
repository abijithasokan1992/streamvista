export type TitleStatus = "draft" | "published" | "archived";
export type QCStatus = "pending" | "approved" | "rejected";
export type LegalStatus = "pending" | "approved" | "rejected";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Title {
  id: string;
  title: string;
  alternateTitle?: string;
  synopsis: string;
  contentType: "movie" | "series" | "documentary" | "short";
  genres: string[];
  director: string;
  producer: string;
  cast: string[];
  runtimeMinutes: number;
  originalLanguage: string;
  additionalLanguages: string[];
  country: string;
  releaseDate: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  galleryUrls: string[];
  trailerUrl?: string;
  screenerUrl?: string;
  masterVideoUrl?: string;
  subtitleFiles: string[];
  captionFiles: string[];
  ageRating: string;
  budget?: string;
  rightsAvailable: string[];
  territories: string[];
  excludedTerritories: string[];
  licensingModel: "exclusive" | "non-exclusive" | "hybrid";
  rightsStartDate?: string;
  rightsEndDate?: string;
  creatorOwnerId: string;
  status: TitleStatus;
  qcStatus: QCStatus;
  legalStatus: LegalStatus;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export type TitleDraft = Partial<Title> & { id: string, creatorOwnerId: string, status: "draft" };
