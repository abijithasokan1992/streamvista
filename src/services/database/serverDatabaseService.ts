import { DatabaseService } from "./database.types";
import { Title, TitleDraft } from "../../types/title";
import { UserProfile } from "../../types/auth";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers: { accept: "application/json", ...(init?.headers || {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

class ServerDatabaseService implements DatabaseService {
  async getTitles(): Promise<Title[]> {
    return (await request<{ titles: Title[] }>("/api/titles")).titles;
  }

  async getTitleById(id: string): Promise<Title | null> {
    return (await request<{ title: Title | null }>(`/api/titles/${encodeURIComponent(id)}`)).title;
  }

  async getTitlesByCreator(creatorId: string): Promise<Title[]> {
    return (await request<{ titles: Title[] }>(`/api/titles?creatorId=${encodeURIComponent(creatorId)}`)).titles;
  }

  async getTitlesByBuyer(_buyerId: string): Promise<Title[]> {
    return (await request<{ titles: Title[] }>("/api/titles")).titles;
  }

  async getDraftsByCreator(creatorId: string): Promise<TitleDraft[]> {
    return (await request<{ drafts: TitleDraft[] }>(`/api/drafts?creatorId=${encodeURIComponent(creatorId)}`)).drafts;
  }

  async saveDraft(draft: TitleDraft): Promise<TitleDraft> {
    return (await request<{ draft: TitleDraft }>("/api/drafts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    })).draft;
  }

  async getUsers(): Promise<UserProfile[]> {
    return (await request<{ users: UserProfile[] }>("/api/users")).users;
  }
}

export const serverDatabaseService = new ServerDatabaseService();
