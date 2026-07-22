import { DatabaseService } from "./database.types";
import { mockDatabaseService } from "./mockDatabaseService";

const isMockMode = import.meta.env.VITE_DATA_MODE !== "firebase";

export const databaseService: DatabaseService = isMockMode ? mockDatabaseService : mockDatabaseService; // Will replace later
