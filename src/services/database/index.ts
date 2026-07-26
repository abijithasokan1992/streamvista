import { firebaseDatabaseService } from "./firebaseDatabaseService";
import { supabaseDatabaseService } from "./supabaseDatabaseService";
import { isSupabaseConfigured } from "../../integrations/supabase/client";

export const databaseService = {
  // Delegate all standard database service calls
  getTitles: (...args: Parameters<typeof firebaseDatabaseService.getTitles>) => firebaseDatabaseService.getTitles(...args),
  getTitleById: (...args: Parameters<typeof firebaseDatabaseService.getTitleById>) => firebaseDatabaseService.getTitleById(...args),
  getTitlesByCreator: (...args: Parameters<typeof firebaseDatabaseService.getTitlesByCreator>) => firebaseDatabaseService.getTitlesByCreator(...args),
  getTitlesByBuyer: (...args: Parameters<typeof firebaseDatabaseService.getTitlesByBuyer>) => firebaseDatabaseService.getTitlesByBuyer(...args),
  getDraftsByCreator: (...args: Parameters<typeof firebaseDatabaseService.getDraftsByCreator>) => firebaseDatabaseService.getDraftsByCreator(...args),
  saveDraft: (...args: Parameters<typeof firebaseDatabaseService.saveDraft>) => firebaseDatabaseService.saveDraft(...args),
  submitDraftForReview: (...args: Parameters<typeof firebaseDatabaseService.submitDraftForReview>) => firebaseDatabaseService.submitDraftForReview(...args),
  updateQCStatus: (...args: Parameters<typeof firebaseDatabaseService.updateQCStatus>) => firebaseDatabaseService.updateQCStatus(...args),
  updateLegalStatus: (...args: Parameters<typeof firebaseDatabaseService.updateLegalStatus>) => firebaseDatabaseService.updateLegalStatus(...args),
  getUsers: (...args: Parameters<typeof firebaseDatabaseService.getUsers>) => firebaseDatabaseService.getUsers(...args),

  // Extended Supabase integration
  supabase: supabaseDatabaseService,
  isSupabase: isSupabaseConfigured
};

export { supabaseDatabaseService };
export type { DatabaseService } from "./database.types";
