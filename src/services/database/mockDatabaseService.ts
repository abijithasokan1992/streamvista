import { DatabaseService } from "./database.types";
import { Title, TitleDraft } from "../../types/title";
import { UserProfile } from "../../types/auth";

const MOCK_TITLES: Title[] = [
  {
    id: "title-1",
    title: "Jananam 1947 Pranayam Thudarunnu",
    synopsis: "A heartwarming story about love and life, spanning generations starting from 1947.",
    contentType: "movie",
    genres: ["Drama", "Romance"],
    director: "Abijith Asokan",
    producer: "Demo Productions",
    cast: ["Actor A", "Actor B"],
    runtimeMinutes: 124,
    originalLanguage: "Malayalam",
    additionalLanguages: ["English"],
    country: "India",
    releaseDate: "2024-03-15",
    posterUrl: "",
    galleryUrls: [],
    subtitleFiles: [],
    captionFiles: [],
    ageRating: "U",
    rightsAvailable: ["Theatrical", "VOD", "Broadcast"],
    territories: ["Global"],
    excludedTerritories: [],
    licensingModel: "exclusive",
    creatorOwnerId: "mock-creator-1",
    status: "published",
    qcStatus: "approved",
    legalStatus: "approved",
    approvalStatus: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "title-2",
    title: "Bahumukham – Good, Bad & The Actor",
    synopsis: "A psychological thriller exploring the multifaceted nature of human psychology and the dark side of ambition.",
    contentType: "movie",
    genres: ["Thriller", "Drama"],
    director: "Demo Director",
    producer: "Demo Productions",
    cast: ["Actor C", "Actor D"],
    runtimeMinutes: 110,
    originalLanguage: "Malayalam",
    additionalLanguages: [],
    country: "India",
    releaseDate: "2024-04-05",
    posterUrl: "",
    galleryUrls: [],
    subtitleFiles: [],
    captionFiles: [],
    ageRating: "U/A",
    rightsAvailable: ["VOD"],
    territories: ["Global"],
    excludedTerritories: ["Middle East"],
    licensingModel: "non-exclusive",
    creatorOwnerId: "mock-creator-1",
    status: "published",
    qcStatus: "approved",
    legalStatus: "approved",
    approvalStatus: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "title-3",
    title: "Civilian",
    synopsis: "An ordinary man gets caught up in an extraordinary conspiracy.",
    contentType: "movie",
    genres: ["Action", "Thriller"],
    director: "Demo Director",
    producer: "Demo Productions",
    cast: ["Actor E", "Actor F"],
    runtimeMinutes: 135,
    originalLanguage: "English",
    additionalLanguages: [],
    country: "USA",
    releaseDate: "2023-11-20",
    posterUrl: "",
    galleryUrls: [],
    subtitleFiles: [],
    captionFiles: [],
    ageRating: "A",
    rightsAvailable: ["Theatrical", "VOD"],
    territories: ["North America", "Europe"],
    excludedTerritories: [],
    licensingModel: "exclusive",
    creatorOwnerId: "mock-creator-2",
    status: "published",
    qcStatus: "approved",
    legalStatus: "approved",
    approvalStatus: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "title-4",
    title: "Ali’s Nature",
    synopsis: "A documentary about a man's quest to reconnect with nature.",
    contentType: "documentary",
    genres: ["Nature", "Biography"],
    director: "Demo Director",
    producer: "Demo Productions",
    cast: ["Ali"],
    runtimeMinutes: 85,
    originalLanguage: "English",
    additionalLanguages: ["Spanish", "French"],
    country: "UK",
    releaseDate: "2022-06-10",
    posterUrl: "",
    galleryUrls: [],
    subtitleFiles: [],
    captionFiles: [],
    ageRating: "U",
    rightsAvailable: ["Educational", "VOD"],
    territories: ["Global"],
    excludedTerritories: [],
    licensingModel: "non-exclusive",
    creatorOwnerId: "mock-creator-1",
    status: "published",
    qcStatus: "approved",
    legalStatus: "approved",
    approvalStatus: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class MockDatabaseService implements DatabaseService {
  async getTitles(): Promise<Title[]> {
    await new Promise(r => setTimeout(r, 600));
    return MOCK_TITLES;
  }
  
  async getTitleById(id: string): Promise<Title | null> {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_TITLES.find(t => t.id === id) || null;
  }

  async getTitlesByCreator(creatorId: string): Promise<Title[]> {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_TITLES.filter(t => t.creatorOwnerId === creatorId);
  }

  async getTitlesByBuyer(buyerId: string): Promise<Title[]> {
    // For demo, just return first two titles for any buyer
    await new Promise(r => setTimeout(r, 500));
    return MOCK_TITLES.slice(0, 2); 
  }

  async getDraftsByCreator(creatorId: string): Promise<TitleDraft[]> {
    await new Promise(r => setTimeout(r, 400));
    return []; // Return empty drafts for demo
  }

  async saveDraft(draft: TitleDraft): Promise<TitleDraft> {
    await new Promise(r => setTimeout(r, 700));
    return { ...draft, id: draft.id || `draft-${Date.now()}` };
  }

  async getUsers(): Promise<UserProfile[]> {
    await new Promise(r => setTimeout(r, 600));
    return [];
  }
}

export const mockDatabaseService = new MockDatabaseService();
