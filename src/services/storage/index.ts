import { StorageService } from "./storage.types";
import { firebaseStorageService } from "./firebaseStorageService";

export const storageService: StorageService = firebaseStorageService;
