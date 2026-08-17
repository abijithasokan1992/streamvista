import { DatabaseService } from "./database.types";
import { serverDatabaseService } from "./serverDatabaseService";

export const databaseService: DatabaseService = serverDatabaseService;
