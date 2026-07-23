import { DatabaseService } from "./database.types";
import { firebaseDatabaseService } from "./firebaseDatabaseService";

export const databaseService: DatabaseService = firebaseDatabaseService;
